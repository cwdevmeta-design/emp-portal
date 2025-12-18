#!/bin/bash

# Employee Portal - Troubleshooting Script
# Run this on your VPS to check for common issues

echo "🔍 Starting Diagnostic Check..."
echo "=============================="

# 1. Check Permissions
echo -e "\n1. Checking Permissions..."
if [ -w "backend" ] && [ -w "frontend" ]; then
    echo "✅ Directories are writable"
else
    echo "❌ Permission issue: current user cannot write to project directories"
    ls -ld backend frontend
fi

# 2. Check Port 5173
echo -e "\n2. Checking Port 5173..."
if lsof -i :5173 > /dev/null; then
    echo "✅ Port 5173 is in use by:"
    lsof -i :5173 -t | xargs ps -p -o comm=
else
    echo "❌ Port 5173 is NOT in use. The backend is not running."
fi

# 3. Check Nginx Config
echo -e "\n3. Checking Nginx..."
if sudo nginx -t 2>&1 | grep -q "successful"; then
    echo "✅ Nginx syntax is valid"
else
    echo "❌ Nginx configuration error:"
    sudo nginx -t
fi

# 4. Check PM2 Status
echo -e "\n4. Checking PM2..."
pm2 list
echo -e "\nRecent Backend Logs:"
pm2 logs employee-portal-backend --lines 20 --nostream

# 5. Check Disk Space
echo -e "\n5. Checking Disk Space..."
df -h | grep "/$"

echo -e "\n=============================="
echo "Diagnostic complete."
