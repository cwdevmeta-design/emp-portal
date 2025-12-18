#!/bin/bash

# Employee Portal Deployment Script
# This script automates the deployment process on Hostinger VPS

set -e  # Exit on error

echo "🚀 Starting Employee Portal Deployment..."

# Configuration
APP_DIR="/home/eduwhistle-emp-portal/htdocs/emp"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
PM2_APP_NAME="employee-portal-backend"

# Safety Check - Ensure we target only our specific app
echo "🎯 Target Application: $PM2_APP_NAME"
echo "🛡️  Safety Mode: Other PM2 processes will NOT be affected"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if running in correct directory
if [ ! -f "package.json" ]; then
    print_error "Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Step 1: Pull latest changes (if using Git)
if [ -d ".git" ]; then
    echo "📥 Pulling latest changes from Git..."
    git pull origin main || git pull origin master
    print_success "Git pull completed"
else
    print_warning "Not a Git repository. Skipping Git pull."
fi

# Step 2: Install/Update dependencies
echo "📦 Installing dependencies..."

# Root dependencies
npm install
print_success "Root dependencies installed"

# Backend dependencies
cd "$BACKEND_DIR"
npm install
print_success "Backend dependencies installed"

# Frontend dependencies
cd "$FRONTEND_DIR"
npm install
print_success "Frontend dependencies installed"

# Step 3: Build Frontend
echo "🔨 Building frontend for production..."
cd "$FRONTEND_DIR"
npm run build
print_success "Frontend build completed"

# Step 4: Restart Backend
echo "🔄 Restarting backend application..."
cd "$APP_DIR"

# Check if PM2 process exists
# Check if PM2 process exists
if pm2 list | grep -q "$PM2_APP_NAME"; then
    echo "Process found. Reloading..."
    cd "$BACKEND_DIR"
    pm2 reload ecosystem.config.js
    pm2 save
    print_success "Backend reloaded"
else
    print_warning "PM2 process not found. Starting new process..."
    cd "$BACKEND_DIR"
    pm2 start ecosystem.config.js
    pm2 save
    print_success "Backend started"
fi

# Step 5: Reload Nginx
echo "🌐 Reloading Nginx..."
sudo systemctl reload nginx
print_success "Nginx reloaded"

# Step 6: Show status
echo ""
echo "📊 Deployment Status:"
echo "===================="
pm2 status
echo ""

# Step 7: Show logs
echo "📝 Recent logs:"
echo "==============="
pm2 logs "$PM2_APP_NAME" --lines 20 --nostream

echo ""
print_success "🎉 Deployment completed successfully!"
echo ""
echo "Your application should now be live at your domain."
echo "Run 'pm2 logs $PM2_APP_NAME' to view real-time logs."
