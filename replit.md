# Integration Hub

## Overview

Integration Hub is a full-stack SaaS web application that provides intelligent data integration capabilities through automated field mapping and transformation logic generation. The platform features a beautiful marketing website with homepage, blog, and pricing pages, plus a comprehensive 6-step integration workflow. Users upload source and target data files, receive AI-powered field mappings, generate XSLT and DataWeave transformations, validate results, and download production-ready code. The application is designed for commercial B2B launch with Stripe payment integration (ready to configure) and complete SEO optimization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript in a Single Page Application (SPA) architecture
- **Routing**: Uses Wouter for lightweight client-side routing with multi-page support
- **Pages**: Homepage, Integration Hub (main app), Blog, Pricing, and 404 error page
- **UI Components**: Built with shadcn/ui component library based on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming, custom animations, and gradient effects
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Build System**: Vite for fast development and optimized production builds
- **SEO**: Complete meta tags, Open Graph, Twitter Cards, and canonical URLs on all pages
- **Navigation**: Sticky header with mobile-responsive menu and active route highlighting

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
- **Dual Format Support**: Generates both XSLT and DataWeave (MuleSoft) transformation code
- **XSLT Validation**: Real XSLT transformation testing with XML parsing, structure validation, and expected output comparison
- **Confidence Scoring**: AI-generated confidence scores for mapping quality assessment and transformation accuracy
- **Transformation Logic**: Automated generation of data transformation code with proper zero-padding, decimal formatting, and date conversions

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
- **Database Hosting**: Neon Database for serverless PostgreSQL hosting (ready to migrate to Railway/Supabase)
- **AI Services**: OpenAI API for natural language processing and mapping intelligence
- **Payment Processing**: Stripe integration (configured, ready for API keys)
- **File Upload**: Local storage with multer for handling multipart form data
- **XSLT Processing**: xmldom and xslt-processor for XML/XSLT parsing and transformation validation

### Commercial Features
- **Pricing Plans**: Three-tier pricing model (Starter one-time, Professional monthly, Enterprise annual)
- **Payment Integration**: Stripe SDK integrated with @stripe/stripe-js and @stripe/react-stripe-js
- **Marketing Pages**: Professional homepage with hero section, features showcase, stats, and CTA
- **Blog Platform**: Ready-to-use blog with article listings and category filtering
- **SEO Optimization**: Complete meta tags, Open Graph, Twitter Cards on all pages for production launch