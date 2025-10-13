# Integration Hub

## Overview
Integration Hub is a full-stack SaaS web application offering intelligent data integration through automated field mapping and transformation logic generation. It includes a marketing website and a 6-step integration workflow with a four-tier subscription model (free, one-time, monthly, annual). Users create an account with username/password authentication, then can upload data, receive smart mapping suggestions, generate XSLT and DataWeave transformations, validate results, and download production-ready code. The platform is designed for commercial B2B launch, featuring Stripe payment integration, comprehensive SEO, and free-to-paid conversion optimization.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript (SPA)
- **Routing**: Wouter for client-side routing
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS with CSS variables
- **State Management**: TanStack Query for server state, React Context for subscription
- **Build System**: Vite
- **SEO**: Complete meta tags, Open Graph, Twitter Cards

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful
- **File Processing**: Multer for multipart file uploads (CSV, JSON, XML, Excel)

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM (Neon Database serverless instance)
- **Schema Management**: Drizzle Kit for migrations
- **Session Storage**: PostgreSQL-based using connect-pg-simple
- **File Storage**: Local file system

### Database Schema
- **Core Entities**: Integration Projects, Uploaded Files, Field Mappings, XSLT Validation
- **Schema Versioning**: JSON-based schema storage

### Smart Mapping and Processing
- **Intelligent Mapping**: OpenAI GPT-4 integration for field mapping suggestions
- **File Analysis**: Automated schema detection across multiple formats
- **Transformation Output**: Generates both XSLT and DataWeave code
- **XSLT Validation**: Real-time XSLT transformation testing and validation
- **Confidence Scoring**: Automated scores for mapping quality
- **Transformation Logic**: Automated generation of data transformation code
- **Validation Preview**: Displays transformed data rows (trial limitations apply)

### Authentication and Authorization
- **Authentication Provider**: Traditional username/password authentication using Passport.js local strategy
- **Password Security**: Scrypt hashing with salt for secure credential storage
- **Session Management**: Passport.js with Express-session and PostgreSQL store (connect-pg-simple)
- **Session Persistence**: PostgreSQL-backed sessions with 7-day TTL, survives server restarts
- **User Database**: Users table with subscription status (free/one-time/monthly/annual), tier, and admin role
- **Protected Routes**: Middleware for authentication (`isAuthenticated`), subscription (`requirePaidSubscription`), and admin access (`requireAdmin`)
- **Admin System**: Admin dashboard at `/admin` for user and subscription management; `isAdmin` flag for role-based access
- **Security**: Whitelisted registration fields prevent privilege escalation; password never sent to client

## External Dependencies

### Core Framework
- **React Ecosystem**: React 18, React DOM, React Hook Form (Zod validation)
- **Backend Framework**: Express.js (tsx runtime)
- **Database**: Drizzle ORM (PostgreSQL dialect, Neon Database driver)

### AI and Data Processing
- **OpenAI Integration**: OpenAI API client (GPT-4)
- **File Processing Libraries**: PapaParse (CSV), XLSX (Excel), fast-xml-parser (XML)
- **Data Validation**: Zod

### UI and Styling
- **Component Library**: shadcn/ui (Radix UI)
- **Styling**: Tailwind CSS, PostCSS
- **Icons**: Lucide React

### Development and Build Tools
- **Build System**: Vite
- **Runtime**: esbuild (TypeScript compilation)
- **Type Checking**: TypeScript compiler

### External Services
- **Database Hosting**: Neon Database (PostgreSQL)
- **AI Services**: OpenAI API
- **Payment Processing**: Stripe (SDK integrated)
- **File Upload**: Multer (local storage)
- **XSLT Processing**: xmldom, xslt-processor

### Commercial Features
- **Pricing Plans**: Four-tier subscription model (free, one-time, monthly, annual)
- **Payment Integration**: Stripe SDK
- **Freemium Model**: Free tier with limited features (3 projects, 5 row preview, 14-day retention)
- **Subscription Tiers**: 
  - Free: $0/once - Limited features, 3 projects (one-time per user)
  - One-Time: $49 - 10 projects, 60-day retention
  - Monthly: $99/month - Unlimited projects and features
  - Annual: $999/year - Everything in Monthly + 2 months free
- **Marketing Pages**: Homepage, Blog, Pricing pages
- **SEO Optimization**: Comprehensive meta tags, Open Graph, Twitter Cards