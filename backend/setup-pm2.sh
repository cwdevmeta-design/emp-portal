#!/bin/bash

# PM2 Setup Script for Employee Portal Backend
# This script properly configures PM2 to run continuously

echo "🔧 Setting up PM2 for Employee Portal Backend..."

# Get the current directory
BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_NAME="employee-portal-backend"

# Create logs directory if it doesn't exist
mkdir -p "$BACKEND_DIR/logs"

# Stop existing process if running
if pm2 list | grep -q "$APP_NAME"; then
    echo "🛑 Stopping existing PM2 process..."
    pm2 delete "$APP_NAME" || true
fi

# Start the application using ecosystem file
echo "🚀 Starting application with PM2..."
cd "$BACKEND_DIR"
pm2 start ecosystem.config.js

# Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save

# Setup PM2 to start on system boot
echo "⚙️  Setting up PM2 to start on system boot..."
echo ""
echo "⚠️  IMPORTANT: Run the command shown below as root/sudo:"
echo ""
pm2 startup

echo ""
echo "✅ PM2 setup completed!"
echo ""
echo "📊 Current PM2 status:"
pm2 status
echo ""
echo "📝 To view logs, run: pm2 logs $APP_NAME"
echo "🔄 To restart, run: pm2 restart $APP_NAME"
echo "🛑 To stop, run: pm2 stop $APP_NAME"

