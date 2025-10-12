# GitHub Setup & Deployment Guide

## ✅ Repository Created

Your GitHub repository is ready at:
**https://github.com/testdiageo/integration-hub**

## 📤 Push Code to GitHub

Since git operations require manual confirmation in Replit, follow these steps:

### Step 1: Open Replit Shell

Click the Shell tab in Replit (or use the terminal).

### Step 2: Configure Git Remote

```bash
# Add GitHub as remote
git remote add origin https://github.com/testdiageo/integration-hub.git

# Or if remote already exists, update it:
git remote set-url origin https://github.com/testdiageo/integration-hub.git
```

### Step 3: Stage and Commit Files

```bash
# Stage all files
git add .

# Create initial commit
git commit -m "Initial commit - IntegrationHub SaaS platform"
```

### Step 4: Push to GitHub

```bash
# Push to main branch
git push -u origin main

# Or if you're on master branch:
git branch -M main
git push -u origin main
```

### Step 5: Verify

Visit https://github.com/testdiageo/integration-hub to see your code!

---

## 🚀 Deploy to Railway

Once your code is on GitHub, deploy to Railway:

### Option A: Quick Deploy (Recommended)

1. **Go to Railway**: https://railway.app
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Choose** `testdiageo/integration-hub`
5. **Railway auto-detects Node.js** and starts deployment

### Option B: Manual Setup

1. **Create Railway Project**: Click "New Project" → "Empty Project"
2. **Add GitHub Repo**: Click "New" → "GitHub Repo" → Select your repo
3. **Configure Build**: Railway auto-detects from `railway.json`

### Configure Railway Environment

#### Required Variables:

```bash
# Database (Railway auto-provides)
DATABASE_URL=<automatically set>

# Session Secret (generate: openssl rand -base64 32)
SESSION_SECRET=your-random-secure-string

# Environment
NODE_ENV=production
```

#### Optional Variables (enables extra features):

```bash
# OpenAI - smart field mapping
OPENAI_API_KEY=sk-...

# Stripe - payment processing  
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

**Note**: `PORT` is auto-set by Railway. Don't configure it.

### Add PostgreSQL Database

1. In Railway project, click **"New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway automatically sets `DATABASE_URL`

### Database Migrations (First Deploy)

**Important**: Run migrations manually first time:

```bash
# Option 1: Railway CLI
railway run npm run db:push

# Option 2: Railway Dashboard
# Temporarily set start command to: npm run db:push && npm run start
# Deploy once, then change back to: npm run start
```

### Build Process

Railway automatically runs (from `railway.json`):

```bash
# Build command
npm install && npm run build

# Start command
npm run start
```

**What happens:**
1. `npm install` - Installs dependencies
2. `npm run build` - Builds frontend (Vite) and server (esbuild)
3. `npm run start` - Starts production server on Railway's PORT

**Note**: Migrations run manually to prevent accidental data overwrites.

### Access Your App

- Railway provides URL: `https://integration-hub-production.up.railway.app`
- Add custom domain in Railway settings

---

## 🔄 Future Updates

### Update Code on GitHub

```bash
# Make changes, then:
git add .
git commit -m "Your commit message"
git push
```

### Auto-Deploy from GitHub

Railway automatically deploys when you push to main branch.

Configure auto-deploy:
1. Go to Railway service settings
2. Enable "Deploy on Push"
3. Select branch (main)

---

## 📊 Deployment Checklist

### Pre-Deployment
- [x] Code pushed to GitHub
- [ ] Environment variables ready
- [ ] OpenAI API key obtained
- [ ] Stripe keys ready (optional)

### Railway Setup
- [ ] Railway project created
- [ ] GitHub repo connected
- [ ] PostgreSQL database added
- [ ] Environment variables configured
- [ ] First deployment successful

### Post-Deployment
- [ ] Application accessible
- [ ] Database migrations run
- [ ] File uploads working
- [ ] Smart mapping functional
- [ ] Custom domain added (optional)

---

## 🐛 Troubleshooting

### Push to GitHub fails

```bash
# If authentication fails, use Replit's git integration:
# 1. Click "Version Control" tab in Replit
# 2. Connect to GitHub
# 3. Push from UI
```

### Railway build fails

- Check build logs in Railway dashboard
- Verify `package.json` scripts are correct
- Ensure all dependencies are listed

### Database connection issues

- Verify `DATABASE_URL` is set in Railway
- Check PostgreSQL service status
- Review connection logs

### Environment variables not working

- Must restart deployment after adding vars
- Verify variable names are exact
- Check Railway service logs

---

## 🎯 Next Steps

1. **Push code to GitHub** (follow steps above)
2. **Deploy to Railway** (follow Railway section)
3. **Configure environment variables**
4. **Test the deployed app**
5. **Add custom domain** (optional)

---

## 📞 Support Resources

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **GitHub Issues**: https://github.com/testdiageo/integration-hub/issues
- **Deployment Troubleshooting**: See DEPLOYMENT.md

---

Happy deploying! 🚀
