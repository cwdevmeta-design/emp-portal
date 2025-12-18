# Employee Portal - Deployment Files

This directory contains configuration files and scripts for deploying the Employee Portal to production.

## Files Overview

### Configuration Files

- **`nginx.conf`** - Nginx web server configuration
  - Copy to `/etc/nginx/sites-available/employee-portal` on your VPS
  - Update domain name before use

- **`backend/.env.production.example`** - Backend environment variables template
  - Copy to `backend/.env` on production server
  - Default port is **5173** (matches Nginx)
  - Update all placeholder values with actual credentials

- **`frontend/.env.production`** - Frontend environment variables
  - Update `VITE_API_URL` with your production domain
  - Used automatically during `npm run build`

### Scripts

- **`deploy.sh`** - Automated deployment script
  - Pulls latest code from Git
  - Installs dependencies
  - Builds frontend
  - Restarts backend
  - Reloads Nginx
  - **Usage**: `bash deploy.sh` (run from project root on VPS)

- **`backup-db.sh`** - Database backup script
  - Creates compressed MySQL backups
  - Keeps last 7 days of backups
  - **Usage**: `bash backup-db.sh`
  - **Schedule**: Add to crontab for daily backups

### Documentation

- **`documentation/HOSTINGER_DEPLOYMENT.md`** - Complete deployment guide
  - Step-by-step VPS setup instructions
  - Database configuration
  - SSL certificate setup
  - OAuth configuration
  - Troubleshooting guide

## Quick Start

1. **Read the deployment guide first:**
   ```bash
   cat documentation/HOSTINGER_DEPLOYMENT.md
   ```

2. **On your VPS, make scripts executable:**
   ```bash
   chmod +x deploy.sh backup-db.sh
   ```

3. **Configure environment variables:**
   ```bash
   # Backend
   cp backend/.env.production.example backend/.env
   nano backend/.env  # Update with your values
   
   # Frontend
   nano frontend/.env.production  # Update domain
   ```

4. **Set up Nginx:**
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/employee-portal
   sudo nano /etc/nginx/sites-available/employee-portal  # Update domain
   sudo ln -s /etc/nginx/sites-available/employee-portal /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

5. **Deploy the application:**
   ```bash
   bash deploy.sh
   ```

6. **Set up automated backups:**
   ```bash
   # Edit backup script with your DB password
   nano backup-db.sh
   
   # Make executable
   chmod +x backup-db.sh
   
   # Add to crontab (daily at 2 AM)
   crontab -e
   # Add: 0 2 * * * /var/www/employee-portal/backup-db.sh
   ```

## Important Notes

⚠️ **Before deploying:**
- Update all placeholder values in configuration files
- Generate strong JWT secrets
- Configure OAuth redirect URIs for production domain
- Set up SSL certificate using Certbot
- Test database connection
- Verify firewall rules

🔒 **Security:**
- Never commit `.env` files with real credentials
- Use strong passwords for database and JWT secrets
- Keep all software updated
- Monitor application logs regularly

📚 **For detailed instructions, see:**
`documentation/HOSTINGER_DEPLOYMENT.md`
