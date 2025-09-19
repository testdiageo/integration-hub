# Integration Hub

## Overview

Integration Hub is a full-stack web application that provides intelligent data integration capabilities through automated field mapping and transformation logic generation. The system features a comprehensive 5-step workflow: users upload source and target data files, validate XSLT transformations, generate AI-powered field mappings, generate transformation logic, and deploy integrations. The application includes XSLT validation capabilities that allow users to test XML transformations against expected outputs with detailed confidence scoring and error reporting.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript in a Single Page Application (SPA) architecture
- **Routing**: Uses Wouter for lightweight client-side routing
- **UI Components**: Built with shadcn/ui component library based on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming and customization
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Build System**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints following resource-based URL patterns
- **File Processing**: Multer for handling multipart file uploads with support for CSV, JSON, XML, and Excel formats
- **Development Server**: Custom Vite integration for hot module replacement in development

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon Database serverless PostgreSQL instance
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **Session Storage**: PostgreSQL-based session storage using connect-pg-simple
- **File Storage**: Local file system storage for uploaded files with configurable upload limits

### Database Schema Design
- **Integration Projects**: Central entity storing project metadata, schemas, transformation logic, and XSLT validation results
- **Uploaded Files**: File metadata with detected schema information and confidence scores, supporting multiple system types including XSLT validation files
- **Field Mappings**: Granular field-to-field mapping relationships with AI confidence scores and validation status
- **XSLT Validation**: Stores validation results with confidence scores, warnings, errors, and transformation match status
- **Schema Versioning**: JSON-based schema storage allowing flexible data structure evolution

### AI Integration and Processing
- **AI Service**: OpenAI GPT-4 integration for intelligent field mapping suggestions
- **File Analysis**: Automated schema detection supporting multiple file formats (CSV, JSON, XML, Excel)
- **XSLT Validation**: Real XSLT transformation testing with XML parsing, structure validation, and expected output comparison
- **Confidence Scoring**: AI-generated confidence scores for mapping quality assessment and XSLT transformation accuracy
- **Transformation Logic**: Automated generation of data transformation code based on field mappings

### Authentication and Authorization
- **Session Management**: Express-session with PostgreSQL store for server-side session persistence
- **Security**: CORS configuration and secure session cookies
- **Development Features**: Replit-specific development tools and error handling overlays

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form with Zod validation
- **Backend Framework**: Express.js with TypeScript support via tsx runtime
- **Database**: Drizzle ORM with PostgreSQL dialect and Neon Database serverless driver

### AI and Data Processing
- **OpenAI Integration**: OpenAI API client for GPT-4 powered field mapping intelligence
- **File Processing Libraries**: 
  - PapaParse for CSV parsing and data type detection
  - XLSX library for Excel file format support
  - fast-xml-parser for XML document processing
- **Data Validation**: Zod for runtime type checking and schema validation

### UI and Styling Libraries
- **Component Library**: Comprehensive shadcn/ui component collection built on Radix UI
- **Styling**: Tailwind CSS with PostCSS for advanced CSS processing
- **Icons**: Lucide React for consistent iconography
- **Utilities**: clsx and tailwind-merge for conditional styling

### Development and Build Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Development Tools**: Replit-specific plugins for cartographer and dev banner
- **Runtime**: esbuild for fast TypeScript compilation and bundling
- **Type Checking**: TypeScript compiler with strict mode configuration

### External Services
- **Database Hosting**: Neon Database for serverless PostgreSQL hosting
- **AI Services**: OpenAI API for natural language processing and mapping intelligence
- **File Upload**: Local storage with multer for handling multipart form data
- **XSLT Processing**: xmldom and xslt-processor for XML/XSLT parsing and transformation validation