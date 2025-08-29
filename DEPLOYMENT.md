# FCBC Financial System - Deployment Guide

## Overview
This guide covers deploying the FCBC Financial System with:
- **Backend**: Deployed on Render
- **Frontend**: Deployed on Vercel

## Prerequisites
- GitHub repository with your code
- Supabase project with database setup
- Render account
- Vercel account

## Backend Deployment (Render)

### 1. Prepare Backend
The backend is already configured with:
- `render.yaml` configuration file
- Production build scripts
- Environment variable setup

### 2. Deploy to Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the `backend` folder as the root directory
5. Configure the service:
   - **Name**: `fcbc-financial-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 3. Environment Variables (Render)
Add these environment variables in Render dashboard:

```
NODE_ENV=production
PORT=10000
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://fcbc-financial-system.vercel.app
SMS_PROVIDER=hubtel
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

### 4. Get Backend URL
After deployment, note your backend URL (e.g., `https://fcbc-financial-backend.onrender.com`)

## Frontend Deployment (Vercel)

### 1. Prepare Frontend
The frontend is configured with:
- `vercel.json` configuration
- Production build optimization
- Environment variable support

### 2. Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3. Environment Variables (Vercel)
Add this environment variable in Vercel dashboard:

```
VITE_API_URL=https://fcbc-financial-backend.onrender.com/api
```

Replace `fcbc-financial-backend.onrender.com` with your actual Render backend URL.

### 4. Deploy
Click "Deploy" and wait for the build to complete.

## Post-Deployment Setup

### 1. Update CORS Settings
In your Supabase project:
1. Go to Authentication → Settings
2. Add your Vercel frontend URL to "Site URL"
3. Add your Vercel frontend URL to "Redirect URLs"

### 2. Test the Application
1. Visit your Vercel frontend URL
2. Try logging in with the created credentials:
   - **Jayden**: `jayden.osafo@fcbc.com` / `Jayden2024!`
   - **Wilson**: `wilson.deku@fcbc.com` / `Wilson2024!`

### 3. Domain Configuration (Optional)
- **Custom Domain**: Configure custom domains in both Render and Vercel
- **SSL**: Both platforms provide free SSL certificates

## Monitoring and Maintenance

### Render (Backend)
- Monitor logs in Render dashboard
- Set up health checks
- Configure auto-deploy from main branch

### Vercel (Frontend)
- Monitor deployments in Vercel dashboard
- Set up preview deployments for branches
- Configure analytics

## Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure FRONTEND_URL in backend matches Vercel URL
2. **Environment Variables**: Double-check all environment variables are set
3. **Build Failures**: Check build logs in respective dashboards
4. **Database Connection**: Verify Supabase credentials and network access

### Support
- Render: [Render Documentation](https://render.com/docs)
- Vercel: [Vercel Documentation](https://vercel.com/docs)
- Supabase: [Supabase Documentation](https://supabase.com/docs)

## URLs After Deployment
- **Frontend**: `https://fcbc-financial-system.vercel.app`
- **Backend**: `https://fcbc-financial-backend.onrender.com`
- **API Endpoints**: `https://fcbc-financial-backend.onrender.com/api/*`
