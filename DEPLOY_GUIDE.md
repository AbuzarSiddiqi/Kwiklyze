# Deploy to Vercel - Step by Step Guide

## Prerequisites

- GitHub account
- Vercel account (free - sign up at https://vercel.com)

## Step 1: Push Your Code to GitHub

1. **Initialize Git (if not already done)**

   ```bash
   git init
   git add .
   git commit -m "Initial commit - KwikLyze AI Companion"
   ```

2. **Create a new repository on GitHub**

   - Go to https://github.com/new
   - Name it "kwiklyze-ai-companion" (or any name you like)
   - Don't add README, .gitignore, or license (we already have them)
   - Click "Create repository"

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/kwiklyze-ai-companion.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended for first time)

1. **Go to Vercel**

   - Visit https://vercel.com
   - Click "Sign Up" or "Log In"
   - Sign in with your GitHub account

2. **Import Your Project**

   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Find and select your "kwiklyze-ai-companion" repository
   - Click "Import"

3. **Configure Project**

   - **Framework Preset**: Vite (should auto-detect)
   - **Root Directory**: ./
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `dist` (auto-filled)
   - **Install Command**: `npm install` (auto-filled)

4. **Add Environment Variables (IMPORTANT!)**
   Click "Environment Variables" and add these with YOUR actual API keys:

   - Name: `VITE_GROQ_API_KEY_1`
     Value: `your_groq_api_key_1_here`

   - Name: `VITE_GROQ_API_KEY_2`
     Value: `your_groq_api_key_2_here`

   - Name: `VITE_ELEVENLABS_API_KEY_1`
     Value: `your_elevenlabs_api_key_1_here`

   - Name: `VITE_ELEVENLABS_API_KEY_2`
     Value: `your_elevenlabs_api_key_2_here`

   - Name: `VITE_ELEVENLABS_API_KEY_3`
     Value: `your_elevenlabs_api_key_3_here`

   **Get your API keys from:**

   - Groq: https://console.groq.com/keys
   - ElevenLabs: https://elevenlabs.io/app/settings/api-keys

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for the build to complete
   - Once done, you'll get a live URL like: `https://kwiklyze-ai-companion.vercel.app`

### Option B: Deploy via Vercel CLI (Alternative)

1. **Install Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**

   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts
   - Choose your project settings
   - Add environment variables when prompted

## Step 3: Post-Deployment

1. **Test Your App**

   - Visit your live URL
   - Test all features (chat, routine, tasks, voice)
   - Check if API keys are working

2. **Custom Domain (Optional)**

   - Go to your Vercel project dashboard
   - Click "Settings" → "Domains"
   - Add your custom domain (e.g., kwiklyze.com)

3. **Automatic Deployments**
   - Every git push to main will auto-deploy
   - Pull requests create preview deployments

## Troubleshooting

### If build fails:

1. Check build logs in Vercel dashboard
2. Make sure all dependencies are in package.json
3. Verify environment variables are set

### If APIs don't work:

1. Check environment variables are prefixed with `VITE_`
2. Rebuild the project after adding env vars
3. Check browser console for API errors

## Important Notes

⚠️ **Security**: The API keys are exposed in the frontend. For production:

- Consider moving API calls to serverless functions
- Use Vercel Edge Functions or API routes
- Implement rate limiting
- Add authentication

✅ **Your app is now live!** Share the URL with anyone!

## Useful Vercel Commands

- `vercel` - Deploy to preview
- `vercel --prod` - Deploy to production
- `vercel logs` - View deployment logs
- `vercel env pull` - Pull environment variables locally
