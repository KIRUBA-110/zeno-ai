# 🚀 Free Deployment Guide for AI Chat App

This guide walks you through deploying your AI Chat application for **FREE** using:
- **Frontend**: Vercel (Next.js)
- **Backend**: Render (FastAPI)
- **Database**: Supabase (PostgreSQL)

---

## 📋 Prerequisites

Before starting, make sure you have:
- [ ] A GitHub account (to connect repositories)
- [ ] Your AI API keys (OpenAI or Anthropic)
- [ ] Your Supabase project credentials

---

## Part 1: Database Setup (Supabase)

> [!NOTE]
> If you already have a Supabase project set up, skip to Part 2.

### Step 1.1: Create a Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Sign up with GitHub (recommended) or email
3. Click **"New Project"**

### Step 1.2: Configure Your Project
1. **Name**: `ai-chat` (or your preferred name)
2. **Database Password**: Generate a strong password and **save it securely**
3. **Region**: Choose the closest to your users
4. Click **"Create new project"** (takes ~2 minutes)

### Step 1.3: Get Your Credentials
After the project is ready, go to **Settings → API**:

| Variable | Where to Find |
|----------|---------------|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_ANON_KEY` | `anon` `public` key |
| `DATABASE_URL` | Settings → Database → Connection string (URI) |

> [!IMPORTANT]
> For the `DATABASE_URL`, use the **Connection Pooler** URL with mode `transaction` for serverless deployments. Format:
> ```
> postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
> ```

---

## Part 2: Backend Deployment (Render)

### Step 2.1: Push to GitHub
Make sure your code is pushed to GitHub:
```bash
cd /home/kiruba/Desktop/ai-chat
git init  # if not already initialized
git add .
git commit -m "Prepare for deployment"
git remote add origin https://github.com/YOUR_USERNAME/ai-chat.git
git push -u origin main
```

### Step 2.2: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub (easiest)

### Step 2.3: Create a New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select your `ai-chat` repository

### Step 2.4: Configure the Service

| Setting | Value |
|---------|-------|
| **Name** | `ai-chat-backend` |
| **Region** | Choose closest to your users |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | **Free** |

### Step 2.5: Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"** and add:

```env
DEBUG=false
CORS_ORIGINS=["https://YOUR-FRONTEND-URL.vercel.app"]
DATABASE_URL=your-supabase-database-url
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
DEFAULT_MODEL=gpt-4-turbo
```

> [!CAUTION]
> Update `CORS_ORIGINS` after deploying your frontend to Vercel! Initially, you can leave it empty or use `["*"]` for testing.

### Step 2.6: Deploy
1. Click **"Create Web Service"**
2. Wait for the build to complete (~3-5 minutes)
3. Your backend URL will be: `https://ai-chat-backend.onrender.com`

> [!WARNING]
> **Free tier limitation**: The server sleeps after 15 minutes of inactivity. First request after sleep takes ~30-60 seconds.

---

## Part 3: Frontend Deployment (Vercel)

### Step 3.1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

### Step 3.2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Select your GitHub repository (`ai-chat`)
3. Click **"Import"**

### Step 3.3: Configure the Project

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js (auto-detected) |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` (default) |
| **Install Command** | `npm install` (default) |

### Step 3.4: Add Environment Variables
Add these environment variables:

```env
NEXT_PUBLIC_API_URL=https://ai-chat-backend.onrender.com
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Step 3.5: Deploy
1. Click **"Deploy"**
2. Wait for the build to complete (~2-3 minutes)
3. Your frontend URL will be: `https://ai-chat-xxx.vercel.app`

---

## Part 4: Post-Deployment Configuration

### Step 4.1: Update CORS on Render
Now that you have your Vercel URL, update the backend:

1. Go to your Render dashboard
2. Select `ai-chat-backend`
3. Go to **Environment** tab
4. Update `CORS_ORIGINS`:
   ```
   ["https://your-app-name.vercel.app"]
   ```
5. Click **"Save Changes"** (triggers a redeploy)

### Step 4.2: Run Database Migrations
If you need to run Alembic migrations, you can use Render's Shell:

1. Go to your service on Render
2. Click **"Shell"** tab
3. Run:
   ```bash
   alembic upgrade head
   ```

### Step 4.3: Test Your Deployment
1. Visit your Vercel URL
2. Try sending a message
3. Verify the response comes back from the AI

---

## 🔧 Troubleshooting

### Backend not responding?
- Check Render logs for errors
- Verify environment variables are set correctly
- Wait 30-60 seconds if the server was sleeping

### CORS errors?
- Ensure `CORS_ORIGINS` includes your exact Vercel URL
- No trailing slash (use `https://app.vercel.app` not `https://app.vercel.app/`)

### Database connection issues?
- Use the **pooler** connection string from Supabase
- Ensure the password is URL-encoded if it contains special characters

### Build failing on Vercel?
- Check that `frontend/` directory is set as root
- Verify all dependencies are in `package.json`

---

## 📊 Free Tier Limits Summary

| Service | Free Limits |
|---------|-------------|
| **Vercel** | 100GB bandwidth, unlimited static sites |
| **Render** | 750 hours/month, spins down after 15min |
| **Supabase** | 500MB database, 1GB file storage |

---

## 🎯 Quick Reference

After deployment, your URLs will be:

| Service | URL |
|---------|-----|
| Frontend | `https://your-app.vercel.app` |
| Backend | `https://ai-chat-backend.onrender.com` |
| API Docs | `https://ai-chat-backend.onrender.com/docs` |

---

## 🚀 Next Steps (Optional Upgrades)

- **Custom Domain**: Both Vercel and Render support free custom domains
- **Reduce Cold Starts**: Use [cron-job.org](https://cron-job.org) to ping your Render backend every 14 minutes
- **Better Performance**: Upgrade to Render paid tier ($7/mo) for always-on servers
