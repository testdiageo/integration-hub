import express, { type Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { FileProcessor } from "./services/fileProcessor";
import { AIMappingService } from "./services/aiMapping";
import { XSLTValidatorService } from "./services/xsltValidator";
import { 
  insertIntegrationProjectSchema,
  fileUploadSchema,
  generateMappingSchema,
  updateMappingSchema,
  insertFieldMappingSchema,
  xsltValidationSchema
} from "@shared/schema";

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Helper function to generate DataWeave content
function generateDataWeaveContent(mappings: any[]): string {
  const sanitizeFieldName = (fieldName: string): string => {
    // DataWeave supports quoted field names, but prefer valid identifiers when possible
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(fieldName)) {
      return fieldName;
    }
    return `"${fieldName.replace(/"/g, '\\"')}"`;
  };

  const generateTransformation = (sourceField: string, mapping: any): string => {
    const quotedSource = `r."${sourceField}"`;
    
    if (!mapping.transformation) {
      return quotedSource;
    }

    const transform = mapping.transformation as any;
    let expression = quotedSource;

    // Comprehensive type conversion handling
    if (transform.typeConversion) {
      switch (transform.typeConversion) {
        case 'string_to_integer':
        case 'string_to_number':
          expression = `${quotedSource} as Number`;
          break;
        case 'number_to_string':
        case 'number_to_string_with_two_decimal':
          expression = `${quotedSource} as String`;
          break;
        case 'number_to_date':
          // Convert number date format (YYYYMMDD) to ISO date string (YYYY-MM-DD)
          expression = `(${quotedSource} as String) replace /(.{4})(.{2})(.{2})/ with "$1-$2-$3"`;
          break;
      }
    }

    // Comprehensive format change handling
    if (transform.formatChange) {
      const formatStr = transform.formatChange.toLowerCase();
      
      if (formatStr.includes('leading zeros') || formatStr.includes('prepend_zeros') || formatStr.includes('add leading zeros') || formatStr.includes('zero_padding') || formatStr.includes('zero padding') || formatStr.includes('padding zeros') || formatStr.includes('pad left') || formatStr.includes('left pad') || formatStr.includes('zeros to the left') || formatStr.includes('prepend_zeroes') || formatStr.includes('zeroes')) {
        // Extract target length if specified, default to 10
        const match = formatStr.match(/(?:length is |length )(\d+)/) || formatStr.match(/(\d+)/);
        const length = match ? match[1] : '10';
        const baseExpr = transform.typeConversion === 'number_to_string' ? `${quotedSource} as String` : `${quotedSource} as String`;
        const zeros = '0'.repeat(parseInt(length));
        expression = `(${baseExpr} as Number) as String { format: "${zeros}" }`;
      } else if (formatStr.includes('two decimal') || formatStr.includes('decimal places') || formatStr.includes('decimal_formatting') || formatStr.includes('decimal formatting') || formatStr.includes('changing decimal') || formatStr.includes('format_number_as_decimal') || transform.typeConversion === 'number_to_string_with_two_decimal') {
        // Format with exactly 2 decimal places
        const baseExpr = transform.typeConversion?.includes('string') ? `${quotedSource} as Number` : `${quotedSource} as Number`;
        expression = `${baseExpr} as String { format: "#.00" }`;
      } else if (formatStr.includes('iso') || formatStr.includes('yyyy-mm-dd') || formatStr.includes('yyyymmdd_to_yyyy-mm-dd') || formatStr.includes('yyyymmdd to yyyy-mm-dd')) {
        // Handle date formatting that wasn't caught in type conversion
        if (!transform.typeConversion?.includes('date')) {
          expression = `(${quotedSource} as String) replace /(.{4})(.{2})(.{2})/ with "$1-$2-$3"`;
        }
      }
    }

    return expression;
  };

  return `%dw 2.0
output application/json
---
{
  root: payload..record map (r) -> {
    transformedRecord: {
${mappings.filter(m => m.targetField).map(mapping => {
  const targetFieldSafe = sanitizeFieldName(mapping.targetField!);
  const transformation = generateTransformation(mapping.sourceField, mapping);
  return `      ${targetFieldSafe}: ${transformation}`;
}).join(',\n')}
    }
  }
}`;
}

// Helper function to generate XSLT content
function generateXSLTContent(mappings: any[]): string {
  const sanitizeFieldName = (fieldName: string): string => {
    return fieldName
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/^[^a-zA-Z_]/, '_')
      .replace(/^$/, '_empty_');
  };

  const escapeXPathString = (str: string): string => {
    if (!str.includes("'")) {
      return `'${str}'`;
    } else if (!str.includes('"')) {
      return `"${str}"`;
    } else {
      const parts = str.split("'").map(part => `'${part}'`);
      return `concat(${parts.join(", \"'\", ")})`;
    }
  };

  return `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>
  
  <!-- Root template -->
  <xsl:template match="/">
    <root>
      <xsl:apply-templates select="//record"/>
    </root>
  </xsl:template>
  
  <!-- Record transformation template -->
  <xsl:template match="record">
    <transformedRecord>
${mappings.filter(m => m.targetField).map(mapping => {
  const sourceFieldSafe = sanitizeFieldName(mapping.sourceField);
  const targetFieldSafe = sanitizeFieldName(mapping.targetField!);
  const sourceFieldEscaped = escapeXPathString(mapping.sourceField);
  
  if (mapping.transformation) {
    const transform = mapping.transformation as any;
    const sourceExpr = `*[local-name()=${sourceFieldEscaped}]`;
    
    // Handle type conversions and format changes
    if (transform.typeConversion === 'string_to_integer' || transform.typeConversion === 'string_to_number') {
      return `      <xsl:element name="${targetFieldSafe}"><xsl:value-of select="number(${sourceExpr})"/></xsl:element>`;
    } else if (transform.typeConversion === 'number_to_date' || (transform.formatChange && (transform.formatChange.toLowerCase().includes('yyyy-mm-dd') || transform.formatChange.toLowerCase().includes('yyyymmdd_to_yyyy-mm-dd')))) {
      // Convert YYYYMMDD to YYYY-MM-DD  
      return `      <xsl:element name="${targetFieldSafe}"><xsl:value-of select="concat(substring(${sourceExpr}, 1, 4), '-', substring(${sourceExpr}, 5, 2), '-', substring(${sourceExpr}, 7, 2))"/></xsl:element>`;
    } else if (transform.formatChange) {
      const formatStr = transform.formatChange.toLowerCase();
      
      if (formatStr.includes('leading zeros') || formatStr.includes('prepend_zeros') || formatStr.includes('add leading zeros') || formatStr.includes('zero_padding') || formatStr.includes('zero padding') || formatStr.includes('padding zeros') || formatStr.includes('pad left') || formatStr.includes('left pad') || formatStr.includes('zeros to the left')) {
        // Zero-padding transformation - extract length, default to 10
        const match = formatStr.match(/(?:length is |length )(\d+)/) || formatStr.match(/(\d+)/);
        const length = match ? match[1] : '10';
        return `      <xsl:element name="${targetFieldSafe}"><xsl:value-of select="format-number(${sourceExpr}, '${'0'.repeat(parseInt(length))}')"/></xsl:element>`;
      } else if (formatStr.includes('two decimal') || formatStr.includes('decimal places') || formatStr.includes('decimal_formatting') || formatStr.includes('decimal formatting') || formatStr.includes('changing decimal') || formatStr.includes('format_number_as_decimal') || transform.typeConversion === 'number_to_string_with_two_decimal') {
        // Two decimal places formatting
        return `      <xsl:element name="${targetFieldSafe}"><xsl:value-of select="format-number(${sourceExpr}, '#.00')"/></xsl:element>`;
      } else if (formatStr.includes('iso')) {
        return `      <xsl:element name="${targetFieldSafe}"><xsl:value-of select="translate(${sourceExpr}, ' ', 'T')"/></xsl:element>`;
      }
    }
    
    // Handle simple type conversions without format changes
    if (transform.typeConversion === 'number_to_string' || transform.typeConversion === 'number_to_string_with_two_decimal') {
      if (transform.typeConversion === 'number_to_string_with_two_decimal') {
        return `      <xsl:element name="${targetFieldSafe}"><xsl:value-of select="format-number(${sourceExpr}, '#.00')"/></xsl:element>`;
      }
      return `      <xsl:element name="${targetFieldSafe}"><xsl:value-of select="string(${sourceExpr})"/></xsl:element>`;
    }
  }
  
  return `      <xsl:element name="${targetFieldSafe}"><xsl:value-of select="*[local-name()=${sourceFieldEscaped}]"/></xsl:element>`;
}).join('\n')}
    </transformedRecord>
  </xsl:template>
</xsl:stylesheet>`;
}

// Helper function to generate mapping CSV
function generateMappingCSV(mappings: any[]): string {
  const header = "Source Field,Target Field,Mapping Type,Confidence,Transformation";
  const rows = mappings.map(m => 
    `"${m.sourceField}","${m.targetField || ''}","${m.mappingType}","${m.confidence || 0}%","${m.transformation ? JSON.stringify(m.transformation).replace(/"/g, '""') : ''}"`
  );
  return [header, ...rows].join('\n');
}

// Helper function to generate mapping document
function generateMappingDocument(mappings: any[], files: any[]): string {
  const sourceFile = files.find((f: any) => f.systemType === "source");
  const targetFile = files.find((f: any) => f.systemType === "target");
  
  return `# Field Mapping Documentation

## Project Overview
Generated on: ${new Date().toISOString()}

## Source System
File: ${sourceFile?.fileName || 'Unknown'}
Type: ${sourceFile?.fileType || 'Unknown'}
Records: ~${(sourceFile?.detectedSchema as any)?.recordCount || 0}

## Target System  
File: ${targetFile?.fileName || 'Unknown'}
Type: ${targetFile?.fileType || 'Unknown'}
Records: ~${(targetFile?.detectedSchema as any)?.recordCount || 0}

## Field Mappings

${mappings.map((m, index) => `
### ${index + 1}. ${m.sourceField} → ${m.targetField || 'Unmapped'}
- **Mapping Type**: ${m.mappingType}
- **Confidence**: ${m.confidence || 0}%
- **Transformation**: ${m.transformation ? JSON.stringify(m.transformation, null, 2) : 'None'}
`).join('\n')}

## Summary
- Total mappings: ${mappings.length}
- Auto-mapped: ${mappings.filter(m => m.mappingType === 'auto').length}
- Suggested: ${mappings.filter(m => m.mappingType === 'suggested').length}
- Manual: ${mappings.filter(m => m.mappingType === 'manual').length}
- Unmapped: ${mappings.filter(m => m.mappingType === 'unmapped').length}

## Usage Instructions
1. Apply the generated XSLT transformation to your source XML data
2. Validate the output against your target schema
3. Adjust mappings as needed for your specific use case
`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files statically
  app.use('/uploads', express.static(path.resolve('uploads')));
  
  // Create new integration project
  app.post("/api/projects", async (req, res) => {
    try {
      const validatedData = insertIntegrationProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.json(project);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get all projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
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
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
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

      let detectedSchema = null;
      let schemaConfidence = null;

      // Only process schema for data files, not XSLT files
      if (!systemType.includes('xslt') || systemType === 'xslt_source' || systemType === 'xslt_generated') {
        // Process the uploaded file
        detectedSchema = await FileProcessor.processFile(req.file.path, req.file.originalname);
        
        // Calculate schema confidence based on data quality
        schemaConfidence = Math.min(100, Math.max(60, 
          80 + (detectedSchema.fields.length > 5 ? 10 : 0) + 
          (detectedSchema.recordCount && detectedSchema.recordCount > 100 ? 10 : 0)
        ));
      }

      // Preserve files for validation - source, target, and XSLT files
      let persistentPath: string | undefined;
      
      if (systemType.startsWith('xslt_')) {
        // Create a directory to store XSLT validation files for this project
        const xsltDir = path.join('uploads', 'xslt', req.params.id);
        if (!fs.existsSync(xsltDir)) {
          fs.mkdirSync(xsltDir, { recursive: true });
        }

        if (systemType === 'xslt_file') {
          persistentPath = path.join(xsltDir, 'transformation.xsl');
        } else if (systemType === 'xslt_source') {
          persistentPath = path.join(xsltDir, 'source.xml');
        } else if (systemType === 'xslt_generated') {
          persistentPath = path.join(xsltDir, 'expected.json');
        }
      } else if (systemType === 'source' || systemType === 'target') {
        // Create a directory to store source/target files for validation
        const dataDir = path.join('uploads', 'data', req.params.id);
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
        // Use original filename but ensure it's safe
        const safeFileName = req.file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        persistentPath = path.join(dataDir, safeFileName);
      }
      
      if (persistentPath) {
        fs.copyFileSync(req.file.path, persistentPath);
      }

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
      res.status(400).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get files for project
  app.get("/api/projects/:id/files", async (req, res) => {
    try {
      const files = await storage.getFilesByProject(req.params.id);
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Delete uploaded file
  app.delete("/api/files/:id", async (req, res) => {
    try {
      await storage.deleteFile(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
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
        sourceFile.detectedSchema as any,
        targetFile.detectedSchema as any
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
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get field mappings for project
  app.get("/api/projects/:id/mappings", async (req, res) => {
    try {
      const mappings = await storage.getMappingsByProject(req.params.id);
      res.json(mappings);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
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
      res.status(400).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Generate transformation code
  app.post("/api/projects/:id/generate-code", async (req, res) => {
    try {
      const mappings = await storage.getMappingsByProject(req.params.id);
      const files = await storage.getFilesByProject(req.params.id);
      
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

      // Generate and save XSLT file
      const xsltContent = await generateXSLTContent(mappings);
      const xsltDir = path.join('uploads', 'generated', req.params.id);
      if (!fs.existsSync(xsltDir)) {
        fs.mkdirSync(xsltDir, { recursive: true });
      }
      fs.writeFileSync(path.join(xsltDir, 'transformation.xsl'), xsltContent);

      // Generate and save DataWeave file
      const dataWeaveContent = generateDataWeaveContent(mappings);
      fs.writeFileSync(path.join(xsltDir, 'transformation.dwl'), dataWeaveContent);

      // Generate and save mapping file (CSV format)
      const mappingCSV = generateMappingCSV(mappings);
      fs.writeFileSync(path.join(xsltDir, 'field-mappings.csv'), mappingCSV);

      // Generate and save mapping document (human-readable)
      const mappingDocument = generateMappingDocument(mappings, files);
      fs.writeFileSync(path.join(xsltDir, 'mapping-documentation.txt'), mappingDocument);

      // Update project with generated code and file generation status
      await storage.updateProject(req.params.id, {
        status: "generated",
        integrationCode,
      });

      res.json({ 
        ...integrationCode,
        filesGenerated: {
          xslt: 'transformation.xsl',
          dataweave: 'transformation.dwl',
          mappingFile: 'field-mappings.csv',
          mappingDocument: 'mapping-documentation.txt'
        }
      });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
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
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Download mapping table as CSV
  app.get("/api/projects/:id/download/mapping-table", async (req, res) => {
    try {
      const mappings = await storage.getMappingsByProject(req.params.id);
      
      if (mappings.length === 0) {
        return res.status(400).json({ 
          message: "No field mappings found. Generate mappings first." 
        });
      }

      // Generate CSV content
      const csvHeader = "Source Field,Target Field,Mapping Type,Confidence,Transformation\n";
      const csvRows = mappings.map(mapping => {
        const transformation = mapping.transformation 
          ? JSON.stringify(mapping.transformation).replace(/"/g, '""')
          : "";
        return `"${mapping.sourceField}","${mapping.targetField || ""}","${mapping.mappingType}",${mapping.confidence || 0},"${transformation}"`;
      }).join('\n');

      const csvContent = csvHeader + csvRows;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="field-mappings.csv"');
      res.send(csvContent);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Download mapping documentation as PDF
  app.get("/api/projects/:id/download/documentation", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      const mappings = await storage.getMappingsByProject(req.params.id);
      const files = await storage.getFilesByProject(req.params.id);
      
      if (mappings.length === 0) {
        return res.status(400).json({ 
          message: "No field mappings found. Generate mappings first." 
        });
      }

      const sourceFile = files.find(f => f.systemType === "source");
      const targetFile = files.find(f => f.systemType === "target");

      // Generate simple text documentation (in a real implementation, this would be a PDF)
      const documentation = `
FIELD MAPPING DOCUMENTATION
==========================

Project: ${project?.name || 'Untitled Project'}
Generated: ${new Date().toISOString()}

SOURCE SYSTEM
-------------
File: ${sourceFile?.fileName || 'Unknown'}
Format: ${(sourceFile?.detectedSchema as any)?.format || 'Unknown'}
Fields: ${(sourceFile?.detectedSchema as any)?.fields?.length || 0}
Records: ${(sourceFile?.detectedSchema as any)?.recordCount || 0}

TARGET SYSTEM
-------------
File: ${targetFile?.fileName || 'Unknown'}
Format: ${(targetFile?.detectedSchema as any)?.format || 'Unknown'}
Fields: ${(targetFile?.detectedSchema as any)?.fields?.length || 0}
Records: ${(targetFile?.detectedSchema as any)?.recordCount || 0}

FIELD MAPPINGS
--------------
${mappings.map(mapping => `
${mapping.sourceField} → ${mapping.targetField || '[UNMAPPED]'}
  Type: ${mapping.mappingType}
  Confidence: ${mapping.confidence || 0}%
  ${mapping.transformation ? `Transformation: ${JSON.stringify(mapping.transformation)}` : 'No transformation required'}
`).join('\n')}

SUMMARY
-------
Total Mappings: ${mappings.length}
Automatic Matches: ${mappings.filter(m => m.mappingType === 'auto').length}
Suggested Matches: ${mappings.filter(m => m.mappingType === 'suggested').length}
Manual Review Needed: ${mappings.filter(m => m.mappingType === 'unmapped').length}
`;

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename="mapping-documentation.txt"');
      res.send(documentation);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Validate XSLT transformation
  app.post("/api/projects/:id/validate-xslt", async (req, res) => {
    try {
      const { projectId } = xsltValidationSchema.parse({ projectId: req.params.id });
      
      // Get all XSLT validation files
      const files = await storage.getFilesByProject(projectId);
      const xsltSourceFile = files.find(f => f.systemType === "xslt_source");
      const xsltGeneratedFile = files.find(f => f.systemType === "xslt_generated");
      const xsltFile = files.find(f => f.systemType === "xslt_file");

      if (!xsltSourceFile || !xsltGeneratedFile || !xsltFile) {
        return res.status(400).json({ 
          message: "All three files are required: source XML, generated JSON, and XSLT file" 
        });
      }

      // Create temp files for validation since files are not persisted in uploads
      const tempDir = path.join('uploads', 'temp', projectId);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Use the actual uploaded files for validation
      const sourceXmlPath = path.join('uploads', 'xslt', projectId, 'source.xml');
      const generatedJsonPath = path.join('uploads', 'xslt', projectId, 'expected.json');
      const xsltFilePath = path.join('uploads', 'xslt', projectId, 'transformation.xsl');

      // Check if all required files exist
      if (!fs.existsSync(sourceXmlPath)) {
        return res.status(400).json({ 
          message: "Source XML file not found. Please upload the source XML file again." 
        });
      }
      
      if (!fs.existsSync(generatedJsonPath)) {
        return res.status(400).json({ 
          message: "Generated JSON file not found. Please upload the generated JSON file again." 
        });
      }
      
      if (!fs.existsSync(xsltFilePath)) {
        return res.status(400).json({ 
          message: "XSLT file not found. Please upload the XSLT file again." 
        });
      }

      // Perform XSLT validation
      const validationResult = await XSLTValidatorService.validateXSLT(
        sourceXmlPath,
        generatedJsonPath,
        xsltFilePath
      );

      // Update project with validation results
      await storage.updateProject(projectId, {
        status: validationResult.isValid ? "mapping" : "xslt_validation",
        xsltValidation: validationResult,
      });

      // Files are preserved for potential re-validation
      // Clean up is handled by project deletion or periodic cleanup

      res.json(validationResult);

    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Enhanced XSLT validation (compares target, mapping, and XSLT files)
  app.post("/api/projects/:id/validate-generated", async (req, res) => {
    try {
      console.log(`[VALIDATION] Starting validation for project ${req.params.id}`);
      
      const files = await storage.getFilesByProject(req.params.id);
      const targetFile = files.find(f => f.systemType === "target");
      
      console.log(`[VALIDATION] Found ${files.length} files, targetFile:`, targetFile?.fileName);
      
      if (!targetFile) {
        console.log(`[VALIDATION] No target file found`);
        return res.status(400).json({ 
          message: "Target file not found. Please upload target file first." 
        });
      }

      // Paths to generated files
      const generatedDir = path.join('uploads', 'generated', req.params.id);
      const xsltPath = path.join(generatedDir, 'transformation.xsl');
      const mappingPath = path.join(generatedDir, 'field-mappings.csv');
      
      console.log(`[VALIDATION] Checking paths:`, { generatedDir, xsltPath, mappingPath });
      console.log(`[VALIDATION] Files exist:`, { 
        xslt: fs.existsSync(xsltPath), 
        mapping: fs.existsSync(mappingPath) 
      });
      
      // Check if generated files exist
      if (!fs.existsSync(xsltPath) || !fs.existsSync(mappingPath)) {
        console.log(`[VALIDATION] Generated files missing`);
        return res.status(400).json({ 
          message: "Generated files not found. Please generate transformation files first." 
        });
      }

      // Find the target file - check multiple locations for backwards compatibility
      const safeTargetFileName = targetFile.fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      let targetFilePath: string;
      
      // Check new location first (uploads/data/projectId/)
      const newLocation = path.join('uploads', 'data', req.params.id, safeTargetFileName);
      // Check old location (uploads/ direct)
      const oldLocation = path.join('uploads', targetFile.fileName);
      // Check uploads root with safe filename
      const safeLocation = path.join('uploads', safeTargetFileName);
      
      if (fs.existsSync(newLocation)) {
        targetFilePath = newLocation;
      } else if (fs.existsSync(oldLocation)) {
        targetFilePath = oldLocation;
      } else if (fs.existsSync(safeLocation)) {
        targetFilePath = safeLocation;
      } else {
        return res.status(400).json({ 
          message: `Target file not found. Please re-upload your target file: ${targetFile.fileName}` 
        });
      }

      console.log(`[VALIDATION] Found target file at: ${targetFilePath}`);
      console.log(`[VALIDATION] Calling validateGeneratedFiles with:`, {
        targetPath: targetFilePath,
        mappingPath,
        xsltPath
      });

      const result = await XSLTValidatorService.validateGeneratedFiles(
        targetFilePath,
        mappingPath,
        xsltPath
      );
      
      console.log(`[VALIDATION] Validation result:`, {
        isValid: result.isValid,
        errorsCount: result.errors.length,
        warningsCount: result.warnings.length,
        confidence: result.confidenceScore
      });

      // Update project status to validated
      await storage.updateProject(req.params.id, {
        status: result.isValid ? "validated" : "validation_failed"
      });

      res.json({
        projectId: req.params.id,
        isValid: result.isValid,
        errors: result.errors,
        warnings: result.warnings,
        confidenceScore: result.confidenceScore,
        matchesExpected: result.matchesExpected,
        transformedData: result.transformedData
      });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Download generated XSLT file
  app.get("/api/projects/:id/download/xslt", async (req, res) => {
    try {
      const xsltPath = path.join('uploads', 'generated', req.params.id, 'transformation.xsl');
      
      if (!fs.existsSync(xsltPath)) {
        return res.status(404).json({ 
          message: "XSLT file not found. Generate transformation files first." 
        });
      }

      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Content-Disposition', 'attachment; filename="transformation.xsl"');
      res.sendFile(path.resolve(xsltPath));
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Download generated DataWeave file
  app.get("/api/projects/:id/download/dataweave", async (req, res) => {
    try {
      const dataWeavePath = path.join('uploads', 'generated', req.params.id, 'transformation.dwl');
      
      if (!fs.existsSync(dataWeavePath)) {
        return res.status(404).json({ 
          message: "DataWeave file not found. Generate transformation files first." 
        });
      }

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename="transformation.dwl"');
      res.sendFile(path.resolve(dataWeavePath));
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Download generated mapping file (CSV)
  app.get("/api/projects/:id/download/mapping-file", async (req, res) => {
    try {
      const mappingPath = path.join('uploads', 'generated', req.params.id, 'field-mappings.csv');
      
      if (!fs.existsSync(mappingPath)) {
        return res.status(404).json({ 
          message: "Mapping file not found. Generate transformation files first." 
        });
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="field-mappings.csv"');
      res.sendFile(path.resolve(mappingPath));
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Download generated mapping document
  app.get("/api/projects/:id/download/mapping-document", async (req, res) => {
    try {
      const documentPath = path.join('uploads', 'generated', req.params.id, 'mapping-documentation.txt');
      
      if (!fs.existsSync(documentPath)) {
        return res.status(404).json({ 
          message: "Mapping document not found. Generate transformation files first." 
        });
      }

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename="mapping-documentation.txt"');
      res.sendFile(path.resolve(documentPath));
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Legacy download endpoints (keeping for compatibility)
  app.get("/api/projects/:id/download/mapping-table", async (req, res) => {
    try {
      const mappingPath = path.join('uploads', 'generated', req.params.id, 'field-mappings.csv');
      
      if (!fs.existsSync(mappingPath)) {
        return res.status(404).json({ 
          message: "Mapping file not found. Generate transformation files first." 
        });
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="field-mappings.csv"');
      res.sendFile(path.resolve(mappingPath));
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/projects/:id/download/documentation", async (req, res) => {
    try {
      const documentPath = path.join('uploads', 'generated', req.params.id, 'mapping-documentation.txt');
      
      if (!fs.existsSync(documentPath)) {
        return res.status(404).json({ 
          message: "Documentation not found. Generate transformation files first." 
        });
      }

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename="mapping-documentation.txt"');
      res.sendFile(path.resolve(documentPath));
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Streamlined API endpoint for direct transformation generation (XSLT and DataWeave)
  app.post("/api/v1/transform", upload.fields([
    { name: 'source', maxCount: 1 },
    { name: 'target', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const format = req.query.format as string || 'xslt'; // Default to XSLT
      
      // Validate format parameter
      if (format !== 'xslt' && format !== 'dataweave') {
        return res.status(400).json({
          error: "Invalid format parameter. Supported formats: 'xslt', 'dataweave'",
          usage: "POST /api/v1/transform?format=xslt|dataweave with multipart form data containing 'source' and 'target' files"
        });
      }
      
      if (!files?.source?.[0] || !files?.target?.[0]) {
        return res.status(400).json({
          error: "Both source and target files are required",
          usage: "POST /api/v1/transform?format=xslt|dataweave with multipart form data containing 'source' and 'target' files"
        });
      }

      const sourceFile = files.source[0];
      const targetFile = files.target[0];

      console.log(`[API Transform] Processing files: ${sourceFile.originalname} -> ${targetFile.originalname} (format: ${format})`);

      // Process source file to detect schema
      const sourceSchema = await FileProcessor.processFile(sourceFile.path, sourceFile.originalname || 'source');
      
      // Process target file to detect schema
      const targetSchema = await FileProcessor.processFile(targetFile.path, targetFile.originalname || 'target');

      console.log(`[API Transform] Source schema: ${sourceSchema.fields.length} fields, Target schema: ${targetSchema.fields.length} fields`);

      // Generate AI-powered field mappings
      const mappingAnalysis = await AIMappingService.generateFieldMappings(sourceSchema, targetSchema);
      
      console.log(`[API Transform] Generated ${mappingAnalysis.mappings.length} mappings with ${mappingAnalysis.overallConfidence}% confidence`);

      // Generate transformation content based on format
      const transformationContent = format === 'dataweave' ? 
        generateDataWeaveContent(mappingAnalysis.mappings) : 
        generateXSLTContent(mappingAnalysis.mappings);

      // Generate mapping CSV content for reference
      const csvHeader = 'Source Field,Target Field,Mapping Type,Confidence,Transformation\n';
      const csvRows = mappingAnalysis.mappings.map(mapping => {
        const transformationDesc = mapping.transformation ? 
          `"${mapping.transformation.typeConversion || 'None'} | ${mapping.transformation.formatChange || 'None'}"` : 
          '""';
        return `"${mapping.sourceField}","${mapping.targetField || ''}","${mapping.mappingType}","${mapping.confidence}%",${transformationDesc}`;
      }).join('\n');
      const csvContent = csvHeader + csvRows;

      // Clean up temporary files
      fs.unlink(sourceFile.path, (err) => {
        if (err) console.warn(`Failed to cleanup source file: ${err.message}`);
      });
      fs.unlink(targetFile.path, (err) => {
        if (err) console.warn(`Failed to cleanup target file: ${err.message}`);
      });

      // Return comprehensive response with format-specific content
      const response: any = {
        success: true,
        mappings: mappingAnalysis.mappings,
        analysis: {
          overallConfidence: mappingAnalysis.overallConfidence,
          autoMatches: mappingAnalysis.autoMatches,
          suggestedMatches: mappingAnalysis.suggestedMatches,
          manualReviewNeeded: mappingAnalysis.manualReviewNeeded,
          sourceFields: sourceSchema.fields.length,
          targetFields: targetSchema.fields.length,
          mappedFields: mappingAnalysis.mappings.filter(m => m.targetField).length
        },
        schemas: {
          source: {
            format: sourceSchema.format,
            fields: sourceSchema.fields,
            recordCount: sourceSchema.recordCount
          },
          target: {
            format: targetSchema.format,
            fields: targetSchema.fields,
            recordCount: targetSchema.recordCount
          }
        },
        csv: csvContent,
        metadata: {
          processedAt: new Date().toISOString(),
          sourceFile: sourceFile.originalname,
          targetFile: targetFile.originalname,
          format: format,
          version: "1.0"
        }
      };

      // Add format-specific transformation content
      if (format === 'dataweave') {
        response.dataweave = transformationContent;
      } else {
        response.xslt = transformationContent;
      }

      res.json(response);

    } catch (error) {
      console.error(`[API Transform] Error:`, error);
      res.status(500).json({ 
        error: "Failed to process transformation",
        message: error instanceof Error ? error.message : 'Unknown error',
        usage: "POST /api/v1/transform?format=xslt|dataweave with multipart form data containing 'source' and 'target' files"
      });
    }
  });

  return createServer(app);
}
