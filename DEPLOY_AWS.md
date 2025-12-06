# AWS Ubuntu Deployment Guide

## Prerequisites
- AWS Ubuntu instance (20.04 or later)
- Domain pointing to your server IP
- SSH access to server

## Server Setup

### 1. Update System & Install Dependencies
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx certbot python3-certbot-nginx git
```

### 2. Clone Repository
```bash
cd /var/www
sudo git clone YOUR_REPO_URL dacreation
cd dacreation
sudo chown -R $USER:$USER .
```

### 3. Configure Environment
```bash
cp .env.example .env
nano .env
```

Fill in your values:
```
DATABASE_URL=postgresql://neondb_owner:npg_HzeE9qaGF1MD@ep-lively-wave-ahrcx1tg-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
SESSION_SECRET=your-random-secret-here
SMTP_ENCRYPTION_KEY=your-encryption-key
NODE_ENV=production
PORT=5000
```

Generate secrets:
```bash
openssl rand -hex 32  # For SESSION_SECRET
openssl rand -hex 16  # For SMTP_ENCRYPTION_KEY
```

### 4. Deploy Application
```bash
./deploy.sh
```

## PM2 Process Manager

### Install & Configure
```bash
sudo npm install -g pm2
pm2 start npm --name "dacreation" -- start
pm2 save
pm2 startup
```

Run the command PM2 outputs to enable auto-start on boot.

## Nginx Configuration

### Create Site Config
```bash
sudo nano /etc/nginx/sites-available/dacreation
```

Add:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/dacreation /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL Certificate

### Setup Let's Encrypt
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow prompts. Auto-renewal is configured automatically.

## Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable
```

## Updating the Application

```bash
cd /var/www/dacreation
git pull
npm install
npm run build
pm2 restart dacreation
```

## Troubleshooting

### Check Application Logs
```bash
pm2 logs dacreation
```

### Check Nginx Logs
```bash
sudo tail -f /var/log/nginx/error.log
```

### Restart Services
```bash
pm2 restart dacreation
sudo systemctl restart nginx
```

### Database Connection Issues
Ensure your Neon database allows connections from your AWS IP address.
