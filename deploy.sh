#!/bin/bash

# Deployment script for AWS Ubuntu
# Usage: chmod +x deploy.sh && ./deploy.sh

set -e

echo "======================================"
echo "Starting Deployment"
echo "======================================"

# Check if .env exists
if [ ! -f .env ]; then
    echo "ERROR: .env file not found!"
    echo "Copy .env.example to .env and fill in your values:"
    echo "  cp .env.example .env"
    echo "  nano .env"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Verify required variables
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL is not set in .env"
    exit 1
fi

if [ -z "$SESSION_SECRET" ]; then
    echo "ERROR: SESSION_SECRET is not set in .env"
    exit 1
fi

echo "Installing dependencies..."
npm install

echo "Building application..."
npm run build

echo "Pushing database schema..."
npm run db:push

echo "======================================"
echo "Deployment Complete!"
echo "======================================"
echo ""
echo "Start the server with:"
echo "  npm start"
echo ""
echo "Or use PM2 for production:"
echo "  pm2 start npm --name 'yourapp' -- start"
echo "  pm2 save"
echo "  pm2 startup"
echo ""
echo "Nginx configuration:"
echo "  sudo nano /etc/nginx/sites-available/yourapp"
echo ""
echo "SSL setup:"
echo "  sudo certbot --nginx -d yourdomain.com"
echo ""
