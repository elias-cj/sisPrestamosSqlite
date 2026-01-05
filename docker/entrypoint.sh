#!/bin/sh
set -e

# Increase memory limit for runtime
echo "memory_limit=512M" > /usr/local/etc/php/conf.d/memory-limit.ini

# Ensure storage directories exist
mkdir -p /var/www/storage/framework/sessions
mkdir -p /var/www/storage/framework/views
mkdir -p /var/www/storage/framework/cache
mkdir -p /var/www/storage/app/public
mkdir -p /var/www/storage/logs

# Fix permissions for storage and database (crucial for SQLite)
chown -R www-data:www-data /var/www/storage /var/www/database

# Create symbolic link for storage
php artisan storage:link || true

# Sync assets to shared volume
echo "Syncing assets to volume..."
if [ -d /var/www/public/build_backup ]; then
    mkdir -p /var/www/public/build
    cp -rf /var/www/public/build_backup/. /var/www/public/build/
fi

# Check if SQLite database exists, if not create it
if [ ! -f /var/www/database/database.sqlite ]; then
    echo "Creating database.sqlite..."
    touch /var/www/database/database.sqlite
    chown www-data:www-data /var/www/database/database.sqlite
fi

# Run migrations to ensure schema is up to date
echo "Running migrations..."
php artisan migrate --force

# Optimize Laravel configuration
echo "Caching configuration..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Start PHP-FPM
echo "Starting PHP-FPM..."
exec php-fpm
