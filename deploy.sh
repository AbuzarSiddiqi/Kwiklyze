#!/bin/bash

echo "🚀 KwikLyze - Vercel Deployment Script"
echo "======================================"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - KwikLyze AI Companion"
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

echo ""
echo "📝 Next steps:"
echo ""
echo "1. Create a GitHub repository at: https://github.com/new"
echo "   Name suggestion: kwiklyze-ai-companion"
echo ""
echo "2. Run these commands (replace YOUR_USERNAME):"
echo "   git remote add origin https://github.com/YOUR_USERNAME/kwiklyze-ai-companion.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Go to Vercel: https://vercel.com"
echo "   - Sign in with GitHub"
echo "   - Click 'Add New...' → 'Project'"
echo "   - Import your GitHub repository"
echo "   - Add environment variables (see DEPLOY_GUIDE.md)"
echo "   - Click 'Deploy'"
echo ""
echo "4. Wait 2-3 minutes and your app will be live! 🎉"
echo ""
echo "📖 For detailed instructions, read: DEPLOY_GUIDE.md"
