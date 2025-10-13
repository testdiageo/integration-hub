-- =====================================================================
-- Railway Database Schema Fix
-- =====================================================================
-- This script creates/recreates all tables to match the expected schema
-- Run this in your Railway PostgreSQL database using Beekeeper Studio
-- =====================================================================

-- Create sessions table (if not exists)
CREATE TABLE IF NOT EXISTS "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);

-- Create users table (drop and recreate to ensure clean schema)
-- WARNING: This will delete all existing users!
-- If you have existing users, use ALTER TABLE instead
DROP TABLE IF EXISTS "users" CASCADE;

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

-- Create integration_projects table
CREATE TABLE IF NOT EXISTS "integration_projects" (
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

-- Create uploaded_files table
CREATE TABLE IF NOT EXISTS "uploaded_files" (
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

-- Create field_mappings table
CREATE TABLE IF NOT EXISTS "field_mappings" (
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

-- Add foreign key constraints
-- (These will fail if constraints already exist - that's OK)

DO $$ 
BEGIN
    -- Foreign key: integration_projects.user_id -> users.id
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'integration_projects_user_id_users_id_fk'
    ) THEN
        ALTER TABLE "integration_projects" 
        ADD CONSTRAINT "integration_projects_user_id_users_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
        ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;

    -- Foreign key: uploaded_files.project_id -> integration_projects.id
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'uploaded_files_project_id_integration_projects_id_fk'
    ) THEN
        ALTER TABLE "uploaded_files" 
        ADD CONSTRAINT "uploaded_files_project_id_integration_projects_id_fk" 
        FOREIGN KEY ("project_id") REFERENCES "public"."integration_projects"("id") 
        ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;

    -- Foreign key: field_mappings.project_id -> integration_projects.id
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'field_mappings_project_id_integration_projects_id_fk'
    ) THEN
        ALTER TABLE "field_mappings" 
        ADD CONSTRAINT "field_mappings_project_id_integration_projects_id_fk" 
        FOREIGN KEY ("project_id") REFERENCES "public"."integration_projects"("id") 
        ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END $$;

-- Create index on sessions.expire
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "sessions" USING btree ("expire");

-- =====================================================================
-- Verification Queries
-- =====================================================================
-- Uncomment and run these to verify the schema is correct:

-- Check users table schema
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'users'
-- ORDER BY ordinal_position;

-- Check all tables
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public'
-- ORDER BY table_name;

-- Check foreign keys
-- SELECT
--     tc.constraint_name, 
--     tc.table_name, 
--     kcu.column_name,
--     ccu.table_name AS foreign_table_name,
--     ccu.column_name AS foreign_column_name 
-- FROM information_schema.table_constraints AS tc 
-- JOIN information_schema.key_column_usage AS kcu
--     ON tc.constraint_name = kcu.constraint_name
--     AND tc.table_schema = kcu.table_schema
-- JOIN information_schema.constraint_column_usage AS ccu
--     ON ccu.constraint_name = tc.constraint_name
--     AND ccu.table_schema = tc.table_schema
-- WHERE tc.constraint_type = 'FOREIGN KEY' 
--     AND tc.table_schema = 'public';

-- =====================================================================
-- Done! After running this script:
-- 1. Restart your Railway integration-hub service
-- 2. Check the application logs for successful connection
-- 3. Test login functionality
-- =====================================================================
