#!/bin/bash

# Exit on error
set -e

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Set variables
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/database"
BACKUP_FILE="db_backup_$DATE.sql"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-7}

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
echo "Creating database backup..."
pg_dump "$DATABASE_URL" > "$BACKUP_DIR/$BACKUP_FILE"

# Compress backup
echo "Compressing backup..."
gzip "$BACKUP_DIR/$BACKUP_FILE"

# Clean up old backups
echo "Cleaning up old backups..."
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed successfully: $BACKUP_DIR/${BACKUP_FILE}.gz" 