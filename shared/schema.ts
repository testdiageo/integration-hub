import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const integrationProjects = pgTable("integration_projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("draft"), // draft, xslt_validation, mapping, ready, deployed
  sourceSchema: jsonb("source_schema"),
  targetSchema: jsonb("target_schema"),
  fieldMappings: jsonb("field_mappings"),
  transformationLogic: jsonb("transformation_logic"),
  integrationCode: jsonb("integration_code"),
  xsltValidation: jsonb("xslt_validation"), // XSLT validation results
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const uploadedFiles = pgTable("uploaded_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => integrationProjects.id),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(), // csv, json, xml, xlsx, xsl, xslt
  fileSize: integer("file_size").notNull(),
  systemType: text("system_type").notNull(), // source, target, xslt_source, xslt_generated, xslt_file
  detectedSchema: jsonb("detected_schema"),
  schemaConfidence: integer("schema_confidence"), // 0-100
  uploadedAt: timestamp("uploaded_at").notNull().default(sql`now()`),
});

export const fieldMappings = pgTable("field_mappings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => integrationProjects.id),
  sourceField: text("source_field").notNull(),
  targetField: text("target_field"),
  mappingType: text("mapping_type").notNull(), // auto, suggested, manual, unmapped
  confidence: integer("confidence"), // 0-100
  transformation: jsonb("transformation"), // type conversion, format changes, etc.
  isValidated: boolean("is_validated").default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Insert schemas
export const insertIntegrationProjectSchema = createInsertSchema(integrationProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUploadedFileSchema = createInsertSchema(uploadedFiles).omit({
  id: true,
  uploadedAt: true,
});

export const insertFieldMappingSchema = createInsertSchema(fieldMappings).omit({
  id: true,
  createdAt: true,
});

// Types
export type IntegrationProject = typeof integrationProjects.$inferSelect;
export type InsertIntegrationProject = z.infer<typeof insertIntegrationProjectSchema>;
export type UploadedFile = typeof uploadedFiles.$inferSelect;
export type InsertUploadedFile = z.infer<typeof insertUploadedFileSchema>;
export type FieldMapping = typeof fieldMappings.$inferSelect;
export type InsertFieldMapping = z.infer<typeof insertFieldMappingSchema>;

// Additional schemas for API validation
export const fileUploadSchema = z.object({
  projectId: z.string(),
  systemType: z.enum(["source", "target", "xslt_source", "xslt_generated", "xslt_file"]),
});

export const generateMappingSchema = z.object({
  projectId: z.string(),
});

export const updateMappingSchema = z.object({
  mappingId: z.string(),
  targetField: z.string().optional(),
  mappingType: z.enum(["auto", "suggested", "manual", "unmapped"]).optional(),
  confidence: z.number().int().min(0).max(100).optional(),
  transformation: z.record(z.any()).optional(),
});

export const xsltValidationSchema = z.object({
  projectId: z.string(),
});
