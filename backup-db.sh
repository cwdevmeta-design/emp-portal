#!/bin/bash

# Database Backup Script for Employee Portal
# This script creates automated backups of the MySQL database

# Configuration
BACKUP_DIR="/var/backups/employee-portal"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="employee_portal"
DB_USER="portal_user"
DB_PASS="YOUR_DB_PASSWORD"  # Update this with your actual password

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
echo "Starting database backup..."
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/employee_portal_$DATE.sql.gz

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "✓ Backup completed successfully: employee_portal_$DATE.sql.gz"
    
    # Keep only last 7 days of backups
    find $BACKUP_DIR -name "employee_portal_*.sql.gz" -mtime +7 -delete
    echo "✓ Old backups cleaned up (kept last 7 days)"
    
    # Show backup size
    BACKUP_SIZE=$(du -h $BACKUP_DIR/employee_portal_$DATE.sql.gz | cut -f1)
    echo "Backup size: $BACKUP_SIZE"
else
    echo "✗ Backup failed!"
    exit 1
fi

# List all backups
echo ""
echo "Available backups:"
ls -lh $BACKUP_DIR/employee_portal_*.sql.gz
