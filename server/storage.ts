import { 
  type IntegrationProject, 
  type InsertIntegrationProject,
  type UploadedFile,
  type InsertUploadedFile,
  type FieldMapping,
  type InsertFieldMapping,
  type User,
  type InsertUser,
  users,
  integrationProjects,
  uploadedFiles,
  fieldMappings,
} from "@shared/schema";
import { randomUUID } from "crypto";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db } from "./db";
import { eq } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserSubscription(id: string, subscriptionStatus: string, subscriptionTier?: string): Promise<User>;
  updateUserDownloads(id: string, downloadsUsed: number, downloadsResetAt: Date): Promise<User>;
  
  // Admin user operations
  getAllUsers(): Promise<User[]>;
  updateUserAdmin(id: string, isAdmin: boolean): Promise<User>;
  
  // Session storage
  sessionStore: any;

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
  private users: Map<string, User>;
  private projects: Map<string, IntegrationProject>;
  private files: Map<string, UploadedFile>;
  private mappings: Map<string, FieldMapping>;
  public sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.files = new Map();
    this.mappings = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    
    const user: User = {
      id,
      username: userData.username,
      password: userData.password,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      subscriptionStatus: userData.subscriptionStatus || "free",
      subscriptionTier: userData.subscriptionTier || null,
      subscriptionExpiresAt: userData.subscriptionExpiresAt || null,
      downloadsUsed: 0,
      downloadsResetAt: null,
      isAdmin: userData.isAdmin || false,
      createdAt: now,
      updatedAt: now,
    };
    
    this.users.set(user.id, user);
    return user;
  }

  async updateUserSubscription(id: string, subscriptionStatus: string, subscriptionTier?: string): Promise<User> {
    const existing = this.users.get(id);
    if (!existing) {
      throw new Error("User not found");
    }
    
    const updated: User = {
      ...existing,
      subscriptionStatus,
      subscriptionTier: subscriptionTier || existing.subscriptionTier,
      updatedAt: new Date(),
    };
    
    this.users.set(id, updated);
    return updated;
  }

  async updateUserDownloads(id: string, downloadsUsed: number, downloadsResetAt: Date): Promise<User> {
    const existing = this.users.get(id);
    if (!existing) {
      throw new Error("User not found");
    }
    
    const updated: User = {
      ...existing,
      downloadsUsed,
      downloadsResetAt,
      updatedAt: new Date(),
    };
    
    this.users.set(id, updated);
    return updated;
  }

  // Admin user operations
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values()).sort((a, b) => 
      b.createdAt!.getTime() - a.createdAt!.getTime()
    );
  }

  async updateUserAdmin(id: string, isAdmin: boolean): Promise<User> {
    const existing = this.users.get(id);
    if (!existing) {
      throw new Error("User not found");
    }
    
    const updated: User = {
      ...existing,
      isAdmin,
      updatedAt: new Date(),
    };
    
    this.users.set(id, updated);
    return updated;
  }

  // Integration Projects
  async createProject(insertProject: InsertIntegrationProject): Promise<IntegrationProject> {
    const id = randomUUID();
    const now = new Date();
    const project: IntegrationProject = { 
      ...insertProject,
      userId: insertProject.userId || null,
      description: insertProject.description || null,
      status: insertProject.status || "draft",
      sourceSchema: insertProject.sourceSchema || null,
      targetSchema: insertProject.targetSchema || null,
      fieldMappings: insertProject.fieldMappings || null,
      transformationLogic: insertProject.transformationLogic || null,
      integrationCode: insertProject.integrationCode || null,
      xsltValidation: insertProject.xsltValidation || null,
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
      detectedSchema: insertFile.detectedSchema || null,
      schemaConfidence: insertFile.schemaConfidence || null,
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
      targetField: insertMapping.targetField || null,
      confidence: insertMapping.confidence || null,
      transformation: insertMapping.transformation || null,
      isValidated: insertMapping.isValidated || null,
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

// Database storage implementation using PostgreSQL
export class DbStorage implements IStorage {
  public sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(userData: InsertUser): Promise<User> {
    const result = await db.insert(users).values({
      id: randomUUID(),
      username: userData.username,
      password: userData.password,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      subscriptionStatus: userData.subscriptionStatus || "free",
      subscriptionTier: userData.subscriptionTier || null,
      subscriptionExpiresAt: userData.subscriptionExpiresAt || null,
      downloadsUsed: 0,
      downloadsResetAt: null,
      isAdmin: userData.isAdmin || false,
    }).returning();
    
    return result[0];
  }

  async updateUserSubscription(id: string, subscriptionStatus: string, subscriptionTier?: string): Promise<User> {
    const result = await db.update(users)
      .set({
        subscriptionStatus,
        subscriptionTier: subscriptionTier || null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    
    if (!result[0]) {
      throw new Error("User not found");
    }
    
    return result[0];
  }

  async updateUserDownloads(id: string, downloadsUsed: number, downloadsResetAt: Date): Promise<User> {
    const result = await db.update(users)
      .set({
        downloadsUsed,
        downloadsResetAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    
    if (!result[0]) {
      throw new Error("User not found");
    }
    
    return result[0];
  }

  // Admin user operations
  async getAllUsers(): Promise<User[]> {
    const result = await db.select().from(users);
    return result.sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async updateUserAdmin(id: string, isAdmin: boolean): Promise<User> {
    const result = await db.update(users)
      .set({
        isAdmin,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    
    if (!result[0]) {
      throw new Error("User not found");
    }
    
    return result[0];
  }

  // Integration Projects
  async createProject(insertProject: InsertIntegrationProject): Promise<IntegrationProject> {
    const result = await db.insert(integrationProjects).values({
      id: randomUUID(),
      userId: insertProject.userId || null,
      name: insertProject.name,
      description: insertProject.description || null,
      status: insertProject.status || "draft",
      sourceSchema: insertProject.sourceSchema || null,
      targetSchema: insertProject.targetSchema || null,
      fieldMappings: insertProject.fieldMappings || null,
      transformationLogic: insertProject.transformationLogic || null,
      integrationCode: insertProject.integrationCode || null,
      xsltValidation: insertProject.xsltValidation || null,
    }).returning();
    
    return result[0];
  }

  async getProject(id: string): Promise<IntegrationProject | undefined> {
    const result = await db.select().from(integrationProjects).where(eq(integrationProjects.id, id)).limit(1);
    return result[0];
  }

  async getProjects(): Promise<IntegrationProject[]> {
    const result = await db.select().from(integrationProjects);
    return result.sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async updateProject(id: string, updates: Partial<IntegrationProject>): Promise<IntegrationProject> {
    const result = await db.update(integrationProjects)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(integrationProjects.id, id))
      .returning();
    
    if (!result[0]) {
      throw new Error("Project not found");
    }
    
    return result[0];
  }

  // Uploaded Files
  async createFile(insertFile: InsertUploadedFile): Promise<UploadedFile> {
    const result = await db.insert(uploadedFiles).values({
      id: randomUUID(),
      projectId: insertFile.projectId,
      fileName: insertFile.fileName,
      fileType: insertFile.fileType,
      fileSize: insertFile.fileSize,
      systemType: insertFile.systemType,
      detectedSchema: insertFile.detectedSchema || null,
      schemaConfidence: insertFile.schemaConfidence || null,
    }).returning();
    
    return result[0];
  }

  async getFile(id: string): Promise<UploadedFile | undefined> {
    const result = await db.select().from(uploadedFiles).where(eq(uploadedFiles.id, id)).limit(1);
    return result[0];
  }

  async getFilesByProject(projectId: string): Promise<UploadedFile[]> {
    const result = await db.select().from(uploadedFiles).where(eq(uploadedFiles.projectId, projectId));
    return result.sort((a, b) => 
      b.uploadedAt.getTime() - a.uploadedAt.getTime()
    );
  }

  async deleteFile(id: string): Promise<void> {
    await db.delete(uploadedFiles).where(eq(uploadedFiles.id, id));
  }

  // Field Mappings
  async createMapping(insertMapping: InsertFieldMapping): Promise<FieldMapping> {
    const result = await db.insert(fieldMappings).values({
      id: randomUUID(),
      projectId: insertMapping.projectId,
      sourceField: insertMapping.sourceField,
      targetField: insertMapping.targetField || null,
      mappingType: insertMapping.mappingType,
      confidence: insertMapping.confidence || null,
      transformation: insertMapping.transformation || null,
      isValidated: insertMapping.isValidated || false,
    }).returning();
    
    return result[0];
  }

  async getMapping(id: string): Promise<FieldMapping | undefined> {
    const result = await db.select().from(fieldMappings).where(eq(fieldMappings.id, id)).limit(1);
    return result[0];
  }

  async getMappingsByProject(projectId: string): Promise<FieldMapping[]> {
    const result = await db.select().from(fieldMappings).where(eq(fieldMappings.projectId, projectId));
    return result.sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async updateMapping(id: string, updates: Partial<FieldMapping>): Promise<FieldMapping> {
    const result = await db.update(fieldMappings)
      .set(updates)
      .where(eq(fieldMappings.id, id))
      .returning();
    
    if (!result[0]) {
      throw new Error("Mapping not found");
    }
    
    return result[0];
  }

  async deleteMappingsByProject(projectId: string): Promise<void> {
    await db.delete(fieldMappings).where(eq(fieldMappings.projectId, projectId));
  }
}

// Use database storage in production, memory storage for testing
export const storage = process.env.USE_MEMORY_STORAGE === 'true' 
  ? new MemStorage() 
  : new DbStorage();
