import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { FileProcessor } from "./services/fileProcessor";
import { AIMappingService } from "./services/aiMapping";
import { 
  insertIntegrationProjectSchema,
  fileUploadSchema,
  generateMappingSchema,
  updateMappingSchema,
  insertFieldMappingSchema
} from "@shared/schema";

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Create new integration project
  app.post("/api/projects", async (req, res) => {
    try {
      const validatedData = insertIntegrationProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.json(project);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get all projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get specific project
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Upload file for project
  app.post("/api/projects/:id/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { systemType } = fileUploadSchema.parse({
        projectId: req.params.id,
        systemType: req.body.systemType
      });

      // Process the uploaded file
      const detectedSchema = await FileProcessor.processFile(req.file.path, req.file.originalname);
      
      // Calculate schema confidence based on data quality
      const schemaConfidence = Math.min(100, Math.max(60, 
        80 + (detectedSchema.fields.length > 5 ? 10 : 0) + 
        (detectedSchema.recordCount && detectedSchema.recordCount > 100 ? 10 : 0)
      ));

      // Save file record
      const uploadedFile = await storage.createFile({
        projectId: req.params.id,
        fileName: req.file.originalname,
        fileType: path.extname(req.file.originalname).substring(1).toLowerCase(),
        fileSize: req.file.size,
        systemType,
        detectedSchema,
        schemaConfidence,
      });

      // Clean up the temporary file
      fs.unlinkSync(req.file.path);

      res.json(uploadedFile);
    } catch (error) {
      // Clean up file on error
      if (req.file?.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch {}
      }
      res.status(400).json({ message: error.message });
    }
  });

  // Get files for project
  app.get("/api/projects/:id/files", async (req, res) => {
    try {
      const files = await storage.getFilesByProject(req.params.id);
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete uploaded file
  app.delete("/api/files/:id", async (req, res) => {
    try {
      await storage.deleteFile(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Generate AI field mappings
  app.post("/api/projects/:id/generate-mappings", async (req, res) => {
    try {
      const { projectId } = generateMappingSchema.parse({ projectId: req.params.id });
      
      // Get source and target files
      const files = await storage.getFilesByProject(projectId);
      const sourceFile = files.find(f => f.systemType === "source");
      const targetFile = files.find(f => f.systemType === "target");

      if (!sourceFile || !targetFile) {
        return res.status(400).json({ 
          message: "Both source and target files are required" 
        });
      }

      if (!sourceFile.detectedSchema || !targetFile.detectedSchema) {
        return res.status(400).json({ 
          message: "File schemas could not be detected" 
        });
      }

      // Generate AI mappings
      const mappingAnalysis = await AIMappingService.generateFieldMappings(
        sourceFile.detectedSchema,
        targetFile.detectedSchema
      );

      // Clear existing mappings
      await storage.deleteMappingsByProject(projectId);

      // Save new mappings
      const savedMappings = await Promise.all(
        mappingAnalysis.mappings.map(mapping => 
          storage.createMapping({
            projectId,
            sourceField: mapping.sourceField,
            targetField: mapping.targetField,
            mappingType: mapping.mappingType,
            confidence: mapping.confidence,
            transformation: mapping.transformation || null,
            isValidated: mapping.mappingType === "auto",
          })
        )
      );

      // Update project with mapping results
      await storage.updateProject(projectId, {
        status: "mapping",
        fieldMappings: {
          analysis: mappingAnalysis,
          mappings: savedMappings,
        }
      });

      res.json({
        analysis: mappingAnalysis,
        mappings: savedMappings,
      });

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get field mappings for project
  app.get("/api/projects/:id/mappings", async (req, res) => {
    try {
      const mappings = await storage.getMappingsByProject(req.params.id);
      res.json(mappings);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update field mapping
  app.patch("/api/mappings/:id", async (req, res) => {
    try {
      const { mappingId, ...updates } = updateMappingSchema.parse({
        mappingId: req.params.id,
        ...req.body
      });

      const updatedMapping = await storage.updateMapping(mappingId, {
        ...updates,
        isValidated: true,
      });

      res.json(updatedMapping);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Generate transformation code
  app.post("/api/projects/:id/generate-code", async (req, res) => {
    try {
      const mappings = await storage.getMappingsByProject(req.params.id);
      
      if (mappings.length === 0) {
        return res.status(400).json({ 
          message: "No field mappings found. Generate mappings first." 
        });
      }

      // Convert storage mappings to AI service format
      const mappingSuggestions = mappings.map(mapping => ({
        sourceField: mapping.sourceField,
        targetField: mapping.targetField,
        confidence: mapping.confidence || 0,
        mappingType: mapping.mappingType as "auto" | "suggested" | "manual" | "unmapped",
        transformation: mapping.transformation || undefined,
      }));

      const integrationCode = await AIMappingService.generateTransformationCode(mappingSuggestions);

      // Update project with generated code
      await storage.updateProject(req.params.id, {
        status: "ready",
        integrationCode,
      });

      res.json(integrationCode);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Test transformation with sample data
  app.post("/api/projects/:id/test-transformation", async (req, res) => {
    try {
      const { sampleData } = req.body;
      const project = await storage.getProject(req.params.id);
      
      if (!project?.integrationCode) {
        return res.status(400).json({ 
          message: "Integration code not generated yet" 
        });
      }

      // For now, return a mock transformation result
      // In a real implementation, this would execute the generated Python code
      const transformedData = {
        input: sampleData,
        output: {
          // Mock transformation based on the sample data
          message: "Transformation test successful",
          processedRecords: Array.isArray(sampleData) ? sampleData.length : 1,
        },
        errors: [],
        warnings: [],
      };

      res.json(transformedData);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
