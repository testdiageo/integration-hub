import { 
  type IntegrationProject, 
  type InsertIntegrationProject,
  type UploadedFile,
  type InsertUploadedFile,
  type FieldMapping,
  type InsertFieldMapping
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Integration Projects
  createProject(project: InsertIntegrationProject): Promise<IntegrationProject>;
  getProject(id: string): Promise<IntegrationProject | undefined>;
  getProjects(): Promise<IntegrationProject[]>;
  updateProject(id: string, updates: Partial<IntegrationProject>): Promise<IntegrationProject>;

  // Uploaded Files
  createFile(file: InsertUploadedFile): Promise<UploadedFile>;
  getFile(id: string): Promise<UploadedFile | undefined>;
  getFilesByProject(projectId: string): Promise<UploadedFile[]>;
  deleteFile(id: string): Promise<void>;

  // Field Mappings
  createMapping(mapping: InsertFieldMapping): Promise<FieldMapping>;
  getMapping(id: string): Promise<FieldMapping | undefined>;
  getMappingsByProject(projectId: string): Promise<FieldMapping[]>;
  updateMapping(id: string, updates: Partial<FieldMapping>): Promise<FieldMapping>;
  deleteMappingsByProject(projectId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private projects: Map<string, IntegrationProject>;
  private files: Map<string, UploadedFile>;
  private mappings: Map<string, FieldMapping>;

  constructor() {
    this.projects = new Map();
    this.files = new Map();
    this.mappings = new Map();
  }

  // Integration Projects
  async createProject(insertProject: InsertIntegrationProject): Promise<IntegrationProject> {
    const id = randomUUID();
    const now = new Date();
    const project: IntegrationProject = { 
      ...insertProject, 
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.projects.set(id, project);
    return project;
  }

  async getProject(id: string): Promise<IntegrationProject | undefined> {
    return this.projects.get(id);
  }

  async getProjects(): Promise<IntegrationProject[]> {
    return Array.from(this.projects.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async updateProject(id: string, updates: Partial<IntegrationProject>): Promise<IntegrationProject> {
    const existing = this.projects.get(id);
    if (!existing) {
      throw new Error("Project not found");
    }
    
    const updated: IntegrationProject = {
      ...existing,
      ...updates,
      id, // Ensure ID cannot be changed
      updatedAt: new Date(),
    };
    
    this.projects.set(id, updated);
    return updated;
  }

  // Uploaded Files
  async createFile(insertFile: InsertUploadedFile): Promise<UploadedFile> {
    const id = randomUUID();
    const file: UploadedFile = { 
      ...insertFile, 
      id,
      uploadedAt: new Date(),
    };
    this.files.set(id, file);
    return file;
  }

  async getFile(id: string): Promise<UploadedFile | undefined> {
    return this.files.get(id);
  }

  async getFilesByProject(projectId: string): Promise<UploadedFile[]> {
    return Array.from(this.files.values())
      .filter(file => file.projectId === projectId)
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  }

  async deleteFile(id: string): Promise<void> {
    this.files.delete(id);
  }

  // Field Mappings
  async createMapping(insertMapping: InsertFieldMapping): Promise<FieldMapping> {
    const id = randomUUID();
    const mapping: FieldMapping = { 
      ...insertMapping, 
      id,
      createdAt: new Date(),
    };
    this.mappings.set(id, mapping);
    return mapping;
  }

  async getMapping(id: string): Promise<FieldMapping | undefined> {
    return this.mappings.get(id);
  }

  async getMappingsByProject(projectId: string): Promise<FieldMapping[]> {
    return Array.from(this.mappings.values())
      .filter(mapping => mapping.projectId === projectId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateMapping(id: string, updates: Partial<FieldMapping>): Promise<FieldMapping> {
    const existing = this.mappings.get(id);
    if (!existing) {
      throw new Error("Mapping not found");
    }
    
    const updated: FieldMapping = {
      ...existing,
      ...updates,
      id, // Ensure ID cannot be changed
    };
    
    this.mappings.set(id, updated);
    return updated;
  }

  async deleteMappingsByProject(projectId: string): Promise<void> {
    const mappingsToDelete = Array.from(this.mappings.values())
      .filter(mapping => mapping.projectId === projectId);
    
    mappingsToDelete.forEach(mapping => {
      this.mappings.delete(mapping.id);
    });
  }
}

export const storage = new MemStorage();
