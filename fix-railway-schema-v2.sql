-- =====================================================================
-- Railway Database Schema Fix V2
-- =====================================================================
-- This script safely recreates the entire database schema by:
-- 1. Dropping all tables in the correct order (child tables first)
-- 2. Recreating all tables in the correct order (parent tables first)
-- 3. Adding foreign key constraints at the end
--
-- ⚠️  WARNING: This will DELETE ALL DATA in the affected tables!
-- Make sure to backup your data before running this script.
--
-- Run this in your Railway PostgreSQL database using Beekeeper Studio
-- =====================================================================

-- =====================================================================
-- STEP 1: Drop all tables in reverse dependency order
-- =====================================================================
-- Drop child tables first to avoid foreign key constraint violations

-- Drop field_mappings (depends on integration_projects)
DROP TABLE IF EXISTS "field_mappings" CASCADE;

-- Drop uploaded_files (depends on integration_projects)
DROP TABLE IF EXISTS "uploaded_files" CASCADE;

-- Drop integration_projects (depends on users)
DROP TABLE IF EXISTS "integration_projects" CASCADE;

-- Drop parent tables last
-- Drop users (parent table)
DROP TABLE IF EXISTS "users" CASCADE;

-- Sessions table is independent, we'll keep it if it exists
-- If you want to recreate it, uncomment the line below:
-- DROP TABLE IF EXISTS "sessions" CASCADE;

-- =====================================================================
-- STEP 2: Create parent tables first
-- =====================================================================

-- Create sessions table (independent table)
-- This table stores user sessions
CREATE TABLE IF NOT EXISTS "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);

-- Create users table (parent table)
-- This table stores user account information
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar NOT NULL,
	"password" varchar NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"subscription_status" varchar DEFAULT 'free' NOT NULL,
	"subscription_tier" varchar,
	"subscription_expires_at" timestamp,
	"downloads_used" integer DEFAULT 0 NOT NULL,
	"downloads_reset_at" timestamp,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

-- =====================================================================
-- STEP 3: Create child tables (that depend on parent tables)
-- =====================================================================

-- Create integration_projects table (depends on users)
-- This table stores data integration projects
CREATE TABLE "integration_projects" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"name" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"source_schema" jsonb,
	"target_schema" jsonb,
	"field_mappings" jsonb,
	"transformation_logic" jsonb,
	"integration_code" jsonb,
	"xslt_validation" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);

-- Create uploaded_files table (depends on integration_projects)
-- This table stores metadata about uploaded source/target files
CREATE TABLE "uploaded_files" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"file_name" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"system_type" text NOT NULL,
	"detected_schema" jsonb,
	"schema_confidence" integer,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);

-- Create field_mappings table (depends on integration_projects)
-- This table stores individual field-to-field mapping details
CREATE TABLE "field_mappings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"source_field" text NOT NULL,
	"target_field" text,
	"mapping_type" text NOT NULL,
	"confidence" integer,
	"transformation" jsonb,
	"is_validated" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- =====================================================================
-- STEP 4: Add foreign key constraints
-- =====================================================================
-- Add foreign keys in order: parent -> child relationships

-- Foreign key: integration_projects.user_id -> users.id
-- This ensures that projects can only be created by existing users
ALTER TABLE "integration_projects" 
ADD CONSTRAINT "integration_projects_user_id_users_id_fk" 
FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
ON DELETE CASCADE ON UPDATE NO ACTION;

-- Foreign key: uploaded_files.project_id -> integration_projects.id
-- This ensures that uploaded files are always associated with a valid project
ALTER TABLE "uploaded_files" 
ADD CONSTRAINT "uploaded_files_project_id_integration_projects_id_fk" 
FOREIGN KEY ("project_id") REFERENCES "public"."integration_projects"("id") 
ON DELETE CASCADE ON UPDATE NO ACTION;

-- Foreign key: field_mappings.project_id -> integration_projects.id
-- This ensures that field mappings are always associated with a valid project
ALTER TABLE "field_mappings" 
ADD CONSTRAINT "field_mappings_project_id_integration_projects_id_fk" 
FOREIGN KEY ("project_id") REFERENCES "public"."integration_projects"("id") 
ON DELETE CASCADE ON UPDATE NO ACTION;

-- =====================================================================
-- STEP 5: Create indexes for performance
-- =====================================================================

-- Index on sessions.expire for efficient cleanup of expired sessions
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "sessions" USING btree ("expire");

-- Index on integration_projects.user_id for efficient user project queries
CREATE INDEX IF NOT EXISTS "IDX_integration_projects_user_id" ON "integration_projects" USING btree ("user_id");

-- Index on uploaded_files.project_id for efficient project file queries
CREATE INDEX IF NOT EXISTS "IDX_uploaded_files_project_id" ON "uploaded_files" USING btree ("project_id");

-- Index on field_mappings.project_id for efficient project mapping queries
CREATE INDEX IF NOT EXISTS "IDX_field_mappings_project_id" ON "field_mappings" USING btree ("project_id");

-- =====================================================================
-- STEP 6: Verification Queries
-- =====================================================================
-- Run these queries to verify the schema is correct:

-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check foreign key constraints
SELECT
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- Check indexes
SELECT
    indexname,
    tablename,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =====================================================================
-- Done! After running this script:
-- =====================================================================
-- 1. Verify all tables and constraints were created successfully
-- 2. Create a new user account (the old ones were deleted)
-- 3. Restart your Railway integration-hub service
-- 4. Check the application logs for successful connection
-- 5. Test the application functionality
-- =====================================================================

-- =====================================================================
-- Notes:
-- =====================================================================
-- - All foreign keys use ON DELETE CASCADE, which means:
--   * Deleting a user will delete all their projects
--   * Deleting a project will delete all its uploaded files and field mappings
-- - This is safer than ON DELETE NO ACTION as it prevents orphaned records
-- - If you need to preserve data, create a backup before running this script
-- =====================================================================
