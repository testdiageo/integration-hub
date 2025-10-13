# Connetly 🔄

> AI-Powered Data Integration & Transformation Platform

Connetly is a full-stack SaaS web application that provides intelligent data integration capabilities through automated field mapping and transformation logic generation. Upload your source and target files, get smart field mapping suggestions, and generate production-ready XSLT and DataWeave transformation code.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)

## ✨ Features

### 🎯 Core Capabilities
- **Smart Field Mapping**: Intelligent field mapping suggestions powered by OpenAI GPT-4
- **Dual Format Support**: Generate both XSLT and DataWeave (MuleSoft) transformation code
- **Multi-Format Support**: CSV, JSON, XML, and Excel file formats
- **XSLT Validation**: Real transformation testing with structure validation
- **Freemium Model**: 3-row preview for free users, unlimited for paid subscribers

### 🌐 Marketing & Content
- Professional homepage with features showcase
- Blog platform with technical articles
- Pricing page with three-tier subscription model
- Complete SEO optimization

### 💎 Premium Features
- Unlimited data preview and downloads
- Advanced transformation templates
- Team collaboration
- Priority support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/testdiageo/connetly.git
cd connetly

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

The app will be available at `http://localhost:5000`

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```


## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Wouter** for routing
- **TanStack Query** for state management
- **shadcn/ui** component library
- **Tailwind CSS** for styling
- **Vite** for build tooling

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **PostgreSQL** with Drizzle ORM
- **OpenAI API** for smart mapping
- **Multer** for file uploads

### Infrastructure
- **Neon Database** (PostgreSQL)
- **Railway** deployment ready
- **Stripe** for payments (ready to configure)

## 📊 Project Structure

```
connetly/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   └── lib/          # Utilities
├── server/                # Backend Express application
│   ├── routes.ts         # API routes
│   ├── services/         # Business logic
│   └── storage.ts        # Database interface
├── shared/               # Shared types and schemas
│   └── schema.ts        # Drizzle schema definitions
└── uploads/             # File upload directory
```

## 🔑 Environment Variables

Create a `.env` file with:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# OpenAI
OPENAI_API_KEY=sk-...

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLIC_KEY=pk_test_...

# Session
SESSION_SECRET=your-secret-key

# Environment
NODE_ENV=development
```

## 🎨 Key Features

### 6-Step Integration Workflow
1. **Upload Files**: Source and target data files
2. **Smart Mapping**: AI-powered field mapping suggestions
3. **Review & Adjust**: Manual mapping refinement
4. **Generate Code**: XSLT and DataWeave transformation
5. **Validate**: Test transformations with sample data
6. **Download**: Production-ready code and documentation

### Freemium Trial Model
- **Free Trial**: 3-row data preview, locked downloads
- **Paid Users**: Unlimited preview, full downloads, all features

## 📦 Deployment

### Railway (Recommended)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

Quick deploy:
1. Push to GitHub
2. Create Railway project from repo
3. Add PostgreSQL database
4. Configure environment variables
5. Deploy!

### Replit
1. Click "Deploy" button in Replit
2. Configure environment variables
3. Select deployment type
4. Deploy!

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test
npm test -- validation.test.ts
```

## 📝 API Documentation

### Main Endpoints

- `POST /api/projects` - Create integration project
- `POST /api/upload` - Upload source/target files
- `POST /api/projects/:id/generate-mappings` - Generate field mappings
- `POST /api/projects/:id/generate-code` - Generate transformations
- `POST /api/projects/:id/validate-generated` - Validate XSLT
- `GET /api/projects/:id/download/:type` - Download files

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- shadcn for the amazing UI components
- Railway for seamless deployment
- The open-source community

## 📧 Support

- Documentation: [docs link]
- Issues: [GitHub Issues](https://github.com/[your-username]/connetly/issues)
- Email: support@integrationhub.com

---

Built with ❤️ by the Connetly team
