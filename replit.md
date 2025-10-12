# Integration Hub

## Overview

Integration Hub is a full-stack SaaS web application that provides intelligent data integration capabilities through automated field mapping and transformation logic generation. The platform features a beautiful marketing website with homepage, blog, and pricing pages, plus a comprehensive 6-step integration workflow with a freemium trial model. Users upload source and target data files, receive smart field mapping suggestions, generate XSLT and DataWeave transformations, validate results, and download production-ready code. The application is designed for commercial B2B launch with Stripe payment integration (ready to configure), complete SEO optimization, and trial-to-paid conversion optimization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript in a Single Page Application (SPA) architecture
- **Routing**: Uses Wouter for lightweight client-side routing with multi-page support
- **Pages**: Homepage, Integration Hub (main app), Blog, Pricing, and 404 error page
- **UI Components**: Built with shadcn/ui component library based on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming, custom animations, and gradient effects
- **State Management**: TanStack Query (React Query) for server state management and caching, React Context for subscription status
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

### Smart Mapping and Processing
- **Intelligent Mapping**: OpenAI GPT-4 integration for smart field mapping suggestions (no AI branding in UI)
- **File Analysis**: Automated schema detection supporting multiple file formats (CSV, JSON, XML, Excel)
- **Dual Format Support**: Generates both XSLT and DataWeave (MuleSoft) transformation code
- **XSLT Validation**: Real XSLT transformation testing with XML parsing, structure validation, and expected output comparison
- **Confidence Scoring**: Automated confidence scores for mapping quality assessment and transformation accuracy
- **Transformation Logic**: Automated generation of data transformation code with proper zero-padding, decimal formatting, and date conversions
- **Validation Preview**: Displays transformed data rows with trial limitations (3 rows for free users, unlimited for paid)

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

### Commercial Features and Freemium Model
- **Pricing Plans**: Three-tier pricing model (Starter $49 one-time, Professional $999 one-time, Enterprise $1999 one-time)
- **Payment Integration**: Stripe SDK integrated with @stripe/stripe-js and @stripe/react-stripe-js (ready for API keys)
- **Freemium Trial Model**: 
  - Free trial users: 3-row preview limit on validation page, downloads disabled, success page locked
  - Paid users: Unlimited row preview, full download access, complete workflow access
  - Subscription context with localStorage persistence for demo/testing
  - Prominent upgrade CTAs on validation and success pages with pricing links
  - Temporary activation UI on pricing page (to be replaced with Stripe checkout)
- **Marketing Pages**: Professional homepage with hero section, features showcase, stats, and CTA
- **Blog Platform**: Ready-to-use blog with article listings, full article pages, and category filtering
  - Full articles available:
    - "XSLT vs DataWeave: Choosing the Right Transformation Language" (Technical Deep Dive)
    - "Building ETL Pipelines: A Complete Guide" (Tutorial)
  - Navigation links: "Return to Home" on blog listing, "Back to Blog" and "Home" on article pages
- **SEO Optimization**: Complete meta tags, Open Graph, Twitter Cards on all pages for production launch
- **User Experience**: Removed all "AI" branding from interface - uses "Smart Mapping", "Map Fields", etc.

## Deployment Configuration

### GitHub Repository
- **Repository URL**: https://github.com/testdiageo/integration-hub
- **Status**: Repository created, ready for code push
- **Documentation**: See GITHUB_SETUP.md for push instructions

### Railway Deployment
- **Platform**: Railway.app (recommended for production)
- **Build Configuration**: Automated via railway.json
  - Build: `npm install && npm run build`
  - Start: `npm run start`
  - Migrations: Manual (first deploy only)
- **Database**: Railway PostgreSQL automatically provisioned
- **Documentation**: See DEPLOYMENT.md for complete setup instructions

### Environment Variables

#### Required (Application won't start without these)
- `DATABASE_URL`: PostgreSQL connection string (Railway auto-provides)
- `SESSION_SECRET`: Secure random string for session encryption
- `NODE_ENV`: Set to 'production' (Railway auto-sets)

#### Optional (Enables enhanced features)
- `OPENAI_API_KEY`: Enables smart field mapping (manual mapping still works without)
- `STRIPE_SECRET_KEY`: Enables payment processing
- `VITE_STRIPE_PUBLIC_KEY`: Stripe frontend integration

### Production Build Process
1. **Build Command**: `npm run build`
   - Builds React frontend with Vite
   - Bundles Express server with esbuild
   - Outputs to `dist/` directory
2. **Start Command**: `npm run start`
   - Runs production Express server
   - Serves static frontend files
   - Binds to Railway's PORT automatically
3. **Database Migrations**: `npm run db:push`
   - Run manually first time to avoid data loss
   - Uses Drizzle Kit to sync schema

### Deployment Checklist
- [x] GitHub repository created
- [x] Railway configuration (railway.json) ready
- [x] Environment variable documentation complete
- [x] .gitignore configured for production
- [x] Production build scripts tested
- [ ] Code pushed to GitHub main branch
- [ ] Railway project created and configured
- [ ] Database migrations run on first deploy
- [ ] Environment variables set in Railway
- [ ] Production deployment verified

### Next Steps for Production Launch
1. Push code to GitHub (see GITHUB_SETUP.md)
2. Create Railway project from GitHub repo
3. Add PostgreSQL database in Railway
4. Configure environment variables
5. Run initial database migration
6. Verify deployment and test functionality
7. Configure custom domain (optional)
8. Set up Stripe for payments

### Blog Content Status
- Featured article: "XSLT vs DataWeave" (ID 2) - Full content ✓
- Article 2: "Building ETL Pipelines" (ID 4) - Full content ✓
- Other articles (IDs 1, 3, 5, 6): Placeholder excerpts only

## Recent Changes (October 12, 2025)

### Deployment Setup
- Created GitHub repository at https://github.com/testdiageo/integration-hub
- Configured Railway deployment with safe migration process
- Updated .env.example with clear required vs optional variables
- Created comprehensive deployment documentation (DEPLOYMENT.md, GITHUB_SETUP.md)
- Fixed blog article routing to show featured articles with full content

### Production Readiness
- All tests passing successfully
- Railway configuration production-ready
- Environment variables properly documented
- Manual migration process prevents data loss
- Application verified working on local environment