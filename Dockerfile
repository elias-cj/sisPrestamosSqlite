# Stage 1: Build Frontend Assets

FROM node:20-alpine as frontend

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve Application
FROM php:8.4-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    oniguruma-dev \
    libzip-dev \
    icu-dev \
    sqlite-dev

# Install PHP extensions
RUN docker-php-ext-install \
    pdo_mysql \
    pdo_sqlite \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    intl \
    zip \
    opcache

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy application files (excluding things in .dockerignore)
COPY . .

# Copy built frontend assets from Stage 1
COPY --from=frontend /app/public/build /var/www/public/build
RUN cp -r /var/www/public/build /var/www/public/build_backup

# Setup database directory structure (ensure it exists)
RUN mkdir -p /var/www/database

# Install PHP dependencies (Production optimized)
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Set permissions for www-data user
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache /var/www/database

# Copy custom configurations
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/entrypoint.sh /usr/local/bin/start-container

RUN chmod +x /usr/local/bin/start-container

EXPOSE 9000

ENTRYPOINT ["start-container"]
