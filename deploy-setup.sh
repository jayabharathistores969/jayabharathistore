#!/bin/bash

echo "🚀 Setting up deployment configuration..."

# Check if we're in the right directory
if [ ! -f "frontend/package.json" ] || [ ! -f "backend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project structure verified"

# Create .gitignore files if they don't exist
if [ ! -f "frontend/.gitignore" ]; then
    echo "📝 Creating frontend .gitignore..."
    cat > frontend/.gitignore << EOF
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
EOF
fi

if [ ! -f "backend/.gitignore" ]; then
    echo "📝 Creating backend .gitignore..."
    cat > backend/.gitignore << EOF
# dependencies
node_modules/

# environment variables
.env
.env.local
.env.production

# logs
logs/
*.log
npm-debug.log*

# runtime data
pids/
*.pid
*.seed
*.pid.lock

# coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
EOF
fi

echo "✅ .gitignore files created"

# Check if environment files exist
echo "📋 Environment files check:"
if [ -f "backend/.env" ]; then
    echo "✅ Backend .env exists"
else
    echo "⚠️  Backend .env missing - you'll need to create this with your environment variables"
fi

echo ""
echo "🎯 Next steps:"
echo "1. Create separate GitHub repositories for frontend and backend"
echo "2. Push your code to the repositories"
echo "3. Follow the DEPLOYMENT_GUIDE.md for detailed deployment instructions"
echo "4. Set up your environment variables in Vercel and Netlify"
echo ""
echo "📚 Read DEPLOYMENT_GUIDE.md for complete instructions" 