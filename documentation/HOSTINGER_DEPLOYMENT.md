# Hostinger VPS Deployment Guide
## Employee Portal - Complete Deployment Documentation

This guide provides step-by-step instructions for deploying the Employee Portal application on Hostinger VPS hosting.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [VPS Initial Setup](#vps-initial-setup)
3. [Database Configuration](#database-configuration)
4. [Application Deployment](#application-deployment)
5. [Web Server Configuration](#web-server-configuration)
6. [SSL Certificate Setup](#ssl-certificate-setup)
7. [Environment Configuration](#environment-configuration)
8. [OAuth Configuration](#oauth-configuration)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:
- ✅ Hostinger VPS plan (KVM 1 or higher recommended)
- ✅ Domain name (configured to point to your VPS IP)
- ✅ SSH access to your VPS
- ✅ FTP/SFTP client (FileZilla, WinSCP, etc.)
- ✅ Local copy of your Employee Portal project

### Recommended VPS Specifications
- **RAM**: 2GB minimum (4GB recommended)
- **Storage**: 20GB minimum
- **CPU**: 1 core minimum (2 cores recommended)
- **OS**: Ubuntu 20.04 LTS or 22.04 LTS

---

## VPS Initial Setup

### Step 1: Connect to Your VPS

```bash
ssh root@your-vps-ip-address
```

### Step 2: Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

### Step 3: Install Node.js (v18 LTS)

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher
```

### Step 4: Install MySQL Server

```bash
# Install MySQL
sudo apt install mysql-server -y

# Secure MySQL installation
sudo mysql_secure_installation
```

When prompted:
- Set root password: **Choose a strong password**
- Remove anonymous users: **Yes**
- Disallow root login remotely: **Yes**
- Remove test database: **Yes**
- Reload privilege tables: **Yes**

### Step 5: Install PM2 Process Manager

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

### Step 6: Install Nginx Web Server

```bash
# Install Nginx
sudo apt install nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### Step 7: Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Check firewall status
sudo ufw status
```

---

## Database Configuration

### Step 1: Create Database and User

```bash
# Login to MySQL
sudo mysql -u root -p
```

Execute the following SQL commands:

```sql
-- Create database
CREATE DATABASE employee_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (replace 'your_secure_password' with a strong password)
CREATE USER 'portal_user'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON employee_portal.* TO 'portal_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Verify database creation
SHOW DATABASES;

-- Exit MySQL
EXIT;
```

### Step 2: Import Database Schema (if you have existing data)

```bash
# If you have a database dump from local development
mysql -u portal_user -p employee_portal < /path/to/database_dump.sql
```

> [!NOTE]
> If you don't have a database dump, the application will create tables automatically using Sequelize migrations when it first runs.

---

## Application Deployment

### Step 1: Create Application Directory

```bash
# Create directory for the application
sudo mkdir -p /var/www/employee-portal
sudo chown -R $USER:$USER /var/www/employee-portal
cd /var/www/employee-portal
```

### Step 2: Upload Project Files

**Option A: Using Git (Recommended)**

```bash
# If your project is on GitHub/GitLab
git clone https://github.com/yourusername/employee-portal.git .

# Or if using private repository
git clone https://your-git-username@github.com/yourusername/employee-portal.git .
```

**Option B: Using SFTP/FTP**

1. Use FileZilla or WinSCP
2. Connect to your VPS using SFTP
3. Upload all project files to `/var/www/employee-portal`

### Step 3: Install Dependencies

```bash
cd /var/www/employee-portal

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 4: Configure Backend Environment

```bash
cd /var/www/employee-portal/backend
nano .env
```

Update the `.env` file with production settings:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
MYSQL_URL=mysql://portal_user:your_secure_password@localhost:3306/employee_portal

# JWT Configuration (CHANGE THESE TO SECURE RANDOM STRINGS!)
JWT_SECRET=your_super_secure_jwt_secret_key_min_32_chars
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_key_min_32_chars
JWT_REFRESH_EXPIRATION=7d

# Google OAuth (Update with your production credentials)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback

# Microsoft OAuth (Update with your production credentials)
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
MICROSOFT_CALLBACK_URL=https://yourdomain.com/api/auth/microsoft/callback
```

> [!IMPORTANT]
> **Security Best Practices:**
> - Generate strong random strings for JWT secrets (minimum 32 characters)
> - Never commit `.env` file to version control
> - Use different secrets for development and production
> - Keep database credentials secure

**Generate secure JWT secrets:**

```bash
# Generate random secret (run twice for JWT_SECRET and JWT_REFRESH_SECRET)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 5: Update Frontend API Configuration

```bash
cd /var/www/employee-portal/frontend
nano .env.production
```

Create `.env.production` file:

```env
VITE_API_URL=https://yourdomain.com/api
```

Update `frontend/src/services/api.js`:

```bash
nano src/services/api.js
```

Modify the baseURL to use environment variable:

```javascript
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// ... rest of the file remains the same
```

### Step 6: Build Frontend

```bash
cd /var/www/employee-portal/frontend
npm run build
```

This creates an optimized production build in `frontend/dist` directory.

### Step 7: Update Backend CORS Configuration

```bash
cd /var/www/employee-portal/backend
nano server.js
```

Update the CORS configuration (around line 26):

```javascript
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? 'https://yourdomain.com'  // Replace with your actual domain
        : 'http://localhost:5173',
    credentials: true
}));
```

Or better, add to `.env`:

```env
FRONTEND_URL=https://yourdomain.com
```

And update `server.js`:

```javascript
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
```

### Step 8: Start Backend with PM2

```bash
cd /var/www/employee-portal/backend

# Start the application
pm2 start server.js --name employee-portal-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup systemd
# Follow the command output instructions

# Check application status
pm2 status
pm2 logs employee-portal-backend
```

**Useful PM2 Commands:**

```bash
pm2 list                    # List all processes
pm2 logs                    # View logs
pm2 restart all             # Restart all processes
pm2 stop employee-portal-backend    # Stop specific process
pm2 delete employee-portal-backend  # Delete process
pm2 monit                   # Monitor processes
```

---

## Web Server Configuration

### Step 1: Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/employee-portal
```

Add the following configuration:

```nginx
server {
    listen 80;
    listen [::]:80;
    
    server_name yourdomain.com www.yourdomain.com;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Root directory for frontend
    root /var/www/employee-portal/frontend/dist;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
    
    # Frontend - Serve static files
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API - Proxy to Node.js
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Step 2: Enable the Site

```bash
# Create symbolic link to enable site
sudo ln -s /etc/nginx/sites-available/employee-portal /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## SSL Certificate Setup

### Step 1: Install Certbot

```bash
# Install Certbot and Nginx plugin
sudo apt install certbot python3-certbot-nginx -y
```

### Step 2: Obtain SSL Certificate

```bash
# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts:
1. Enter your email address
2. Agree to terms of service
3. Choose whether to redirect HTTP to HTTPS (recommended: Yes)

### Step 3: Verify Auto-Renewal

```bash
# Test renewal process
sudo certbot renew --dry-run

# Check renewal timer
sudo systemctl status certbot.timer
```

> [!TIP]
> SSL certificates auto-renew every 90 days. The certbot timer handles this automatically.

---

## OAuth Configuration

### Update OAuth Redirect URIs

After deploying to production, update your OAuth application settings:

#### Google OAuth Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Edit your OAuth 2.0 Client ID
5. Add authorized redirect URI: `https://yourdomain.com/api/auth/google/callback`
6. Add authorized JavaScript origin: `https://yourdomain.com`

#### Microsoft Azure Portal
1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Select your application
4. Go to **Authentication**
5. Add redirect URI: `https://yourdomain.com/api/auth/microsoft/callback`
6. Update frontend redirect URI if needed

> [!WARNING]
> After updating OAuth settings, restart your backend application:
> ```bash
> pm2 restart employee-portal-backend
> ```

---

## Monitoring & Maintenance

### Application Monitoring

```bash
# View real-time logs
pm2 logs employee-portal-backend

# Monitor CPU and memory usage
pm2 monit

# View detailed process info
pm2 show employee-portal-backend
```

### Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### Database Backup

Create automated backup script:

```bash
sudo nano /usr/local/bin/backup-employee-portal-db.sh
```

Add the following:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/employee-portal"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="employee_portal"
DB_USER="portal_user"
DB_PASS="your_secure_password"

mkdir -p $BACKUP_DIR

mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/employee_portal_$DATE.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "employee_portal_*.sql.gz" -mtime +7 -delete

echo "Backup completed: employee_portal_$DATE.sql.gz"
```

Make it executable and schedule:

```bash
sudo chmod +x /usr/local/bin/backup-employee-portal-db.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
# Add this line:
0 2 * * * /usr/local/bin/backup-employee-portal-db.sh
```

### System Updates

```bash
# Regular system updates (run monthly)
sudo apt update && sudo apt upgrade -y

# Update Node.js packages
cd /var/www/employee-portal
npm outdated  # Check for updates
npm update    # Update packages
```

---

## Troubleshooting

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs employee-portal-backend --lines 100

# Check if port 5000 is in use
sudo lsof -i :5000

# Restart application
pm2 restart employee-portal-backend
```

### Database Connection Issues

```bash
# Test database connection
mysql -u portal_user -p employee_portal

# Check MySQL status
sudo systemctl status mysql

# Restart MySQL
sudo systemctl restart mysql

# Check MySQL error logs
sudo tail -f /var/log/mysql/error.log
```

### Nginx Issues

```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Force renewal
sudo certbot renew --force-renewal
```

### Frontend Not Loading

1. **Check if build exists:**
   ```bash
   ls -la /var/www/employee-portal/frontend/dist
   ```

2. **Rebuild frontend:**
   ```bash
   cd /var/www/employee-portal/frontend
   npm run build
   ```

3. **Check Nginx configuration:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### API Requests Failing

1. **Check CORS configuration** in `backend/server.js`
2. **Verify API URL** in `frontend/.env.production`
3. **Check backend logs:**
   ```bash
   pm2 logs employee-portal-backend
   ```

### High Memory Usage

```bash
# Check memory usage
free -h

# Check PM2 processes
pm2 list

# Restart application to free memory
pm2 restart employee-portal-backend
```

---

## Deployment Checklist

Before going live, verify:

- [ ] Database is created and configured
- [ ] Environment variables are set correctly
- [ ] JWT secrets are strong and unique
- [ ] CORS is configured for production domain
- [ ] Frontend is built and deployed
- [ ] Backend is running via PM2
- [ ] Nginx is configured and running
- [ ] SSL certificate is installed
- [ ] OAuth redirect URIs are updated
- [ ] Firewall rules are configured
- [ ] Database backups are scheduled
- [ ] Application logs are accessible
- [ ] Test all major features (login, EOD, leaves, etc.)

---

## Quick Reference Commands

```bash
# Application Management
pm2 restart employee-portal-backend
pm2 logs employee-portal-backend
pm2 monit

# Nginx Management
sudo systemctl reload nginx
sudo nginx -t

# Database Access
mysql -u portal_user -p employee_portal

# View Logs
pm2 logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/mysql/error.log

# Update Application
cd /var/www/employee-portal
git pull
npm install
cd frontend && npm run build
pm2 restart employee-portal-backend
```

---

## Support & Additional Resources

- **Hostinger Documentation**: https://support.hostinger.com/
- **PM2 Documentation**: https://pm2.keymetrics.io/docs/
- **Nginx Documentation**: https://nginx.org/en/docs/
- **Let's Encrypt**: https://letsencrypt.org/docs/

---

> [!IMPORTANT]
> **Post-Deployment Security:**
> - Change all default passwords
> - Enable automatic security updates
> - Regularly monitor application logs
> - Keep all software up to date
> - Implement rate limiting for API endpoints
> - Set up monitoring and alerts

---

**Deployment completed successfully!** 🎉

Your Employee Portal should now be accessible at `https://yourdomain.com`
