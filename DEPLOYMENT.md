# IntegrationHub - Deployment Guide

## Railway Deployment Instructions

### Prerequisites
- GitHub account connected
- Railway account (sign up at https://railway.app)
- PostgreSQL database (Railway provides this)

### Environment Variables

#### REQUIRED Variables

Set these in Railway dashboard:

```bash
# Database (Railway auto-provides when PostgreSQL is added)
DATABASE_URL=<automatically set by Railway>

# Session Secret (generate with: openssl rand -base64 32)
SESSION_SECRET=<your-random-secure-string>

# Node Environment (Railway auto-sets or manually set)
NODE_ENV=production
```

#### OPTIONAL Variables (App works without these but with limited features)

```bash
# OpenAI - enables smart field mapping (manual mapping still works without it)
OPENAI_API_KEY=<your-openai-key>

# Stripe - enables payment processing (app works without payments initially)
STRIPE_SECRET_KEY=<your-stripe-secret>
VITE_STRIPE_PUBLIC_KEY=<your-stripe-public>
```

**Note**: Railway automatically sets `PORT` - do not configure it manually.

### Step-by-Step Deployment

#### 1. Push to GitHub
```bash
# Repository already created: https://github.com/testdiageo/integration-hub
# Follow GITHUB_SETUP.md for push instructions
```

#### 2. Create Railway Project
1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `integration-hub` repository
5. Railway uses `railway.json` configuration:
   - Build: `npm install && npm run build`
   - Start: `npm run start`
   - **Note**: Migrations run separately (see step 5)

#### 3. Add PostgreSQL Database
1. In your Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically set `DATABASE_URL` environment variable

#### 4. Configure Environment Variables
1. Go to your service settings
2. Click "Variables" tab
3. Add all required environment variables listed above
4. **Note**: `DATABASE_URL` is auto-set when PostgreSQL is added

#### 5. Run Database Migrations (First Time Only)

**Important**: Run migrations manually the first time to avoid data loss:

1. In Railway dashboard, go to your service
2. Click "Settings" → "Deploy"  
3. Under "Custom Start Command", temporarily add: `npm run db:push && npm run start`
4. Deploy once, then change back to: `npm run start`

**Or** use Railway CLI:
```bash
railway run npm run db:push
```

#### 6. Deploy

Railway automatically:
1. Installs dependencies (`npm install`)
2. Builds frontend and server (`npm run build`)
3. Starts production server (`npm run start`)

#### 7. Access Your Application
- Railway provides a public URL like: `https://integration-hub-production.up.railway.app`
- Custom domains can be added in settings

### Database Setup

The app uses Drizzle ORM with PostgreSQL:

1. Railway creates PostgreSQL and sets `DATABASE_URL`
2. Run `npm run db:push` manually for first deployment (see step 5)
3. Schema changes require manual migration to prevent data loss

**Why manual migrations?** Auto-running `db:push` on every deploy can overwrite production data. Always run migrations manually or in a controlled manner.

### Troubleshooting

**Build Fails:**
- Check Railway build logs
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

**Database Connection Issues:**
- Verify `DATABASE_URL` is set
- Check PostgreSQL service is running
- Review connection logs

**Environment Variables:**
- Double-check all required vars are set
- Restart deployment after adding vars

### Production Checklist

- [ ] All environment variables configured
- [ ] PostgreSQL database connected
- [ ] OpenAI API key added (for field mapping)
- [ ] Stripe keys added (when ready for payments)
- [ ] Database migrations run successfully
- [ ] Application accessible via Railway URL
- [ ] Custom domain configured (optional)
- [ ] Monitoring and logs reviewed

### Monitoring

Railway provides:
- Real-time logs in dashboard
- Metrics and analytics
- Auto-scaling capabilities
- Health checks

### Costs

Railway pricing:
- Free tier: $5 credit/month
- Pro: $20/month includes $20 credit
- Usage-based after credits

PostgreSQL:
- ~$5-10/month for small databases
- Scales with usage

### Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: [Your repo]/issues

---

## Alternative: Replit Deployment

You can also deploy directly from Replit:
1. Click "Deploy" button
2. Select deployment type (Autoscale recommended)
3. Configure environment variables
4. Deploy!

Replit handles scaling, monitoring, and domains automatically.
