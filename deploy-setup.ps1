Write-Host "🚀 Setting up deployment configuration..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "frontend/package.json") -or -not (Test-Path "backend/package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Project structure verified" -ForegroundColor Green

# Create .gitignore files if they don't exist
if (-not (Test-Path "frontend/.gitignore")) {
    Write-Host "📝 Creating frontend .gitignore..." -ForegroundColor Yellow
@"
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
"@ | Out-File -FilePath "frontend/.gitignore" -Encoding UTF8
}

if (-not (Test-Path "backend/.gitignore")) {
    Write-Host "📝 Creating backend .gitignore..." -ForegroundColor Yellow
@"
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
"@ | Out-File -FilePath "backend/.gitignore" -Encoding UTF8
}

Write-Host "✅ .gitignore files created" -ForegroundColor Green

# Check if environment files exist
Write-Host "📋 Environment files check:" -ForegroundColor Cyan
if (Test-Path "backend/.env") {
    Write-Host "✅ Backend .env exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend .env missing - you'll need to create this with your environment variables" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Magenta
Write-Host "1. Create separate GitHub repositories for frontend and backend"
Write-Host "2. Push your code to the repositories"
Write-Host "3. Follow the DEPLOYMENT_GUIDE.md for detailed deployment instructions"
Write-Host "4. Set up your environment variables in Vercel and Netlify"
Write-Host ""
Write-Host "📚 Read DEPLOYMENT_GUIDE.md for complete instructions" -ForegroundColor Cyan 