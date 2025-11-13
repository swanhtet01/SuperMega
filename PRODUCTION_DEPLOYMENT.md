# YTF Production Deployment Guide

## Overview
This guide deploys the YTF (Yangon Tyre Factory) system to AWS EC2 at `ytf.supermega.dev`.

## Prerequisites
- AWS EC2 instance (t3.small or larger)
- Ubuntu 22.04 LTS
- SSH key pair
- Domain: ytf.supermega.dev (configured in Route53)

## Quick Start (One Command)

```bash
# Run from your local machine
ssh -i your-key.pem ubuntu@YOUR_EC2_IP << 'DEPLOY'
curl -fsSL https://raw.githubusercontent.com/swanhtet01/SuperMega/main/deploy.sh | bash
DEPLOY
```

## Manual Deployment Steps

### Step 1: Connect to EC2
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
```

### Step 2: Update System
```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### Step 3: Install Dependencies
```bash
# Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# pnpm
sudo npm install -g pnpm

# nginx
sudo apt-get install -y nginx

# SSL certificates
sudo apt-get install -y certbot python3-certbot-nginx

# Git
sudo apt-get install -y git
```

### Step 4: Clone Repository
```bash
sudo mkdir -p /opt/ytf-production
sudo chown ubuntu:ubuntu /opt/ytf-production
cd /opt/ytf-production
git clone https://github.com/swanhtet01/SuperMega.git .
```

### Step 5: Install & Build
```bash
cd /opt/ytf-production
pnpm install --frozen-lockfile
pnpm run build
```

### Step 6: Configure Environment
```bash
cat > .env.production << 'ENVFILE'
# Database
DATABASE_URL="mysql://root:password@localhost:3306/ytf_production"

# JWT & Auth
JWT_SECRET="$(openssl rand -base64 32)"
VITE_APP_ID="your-app-id"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://login.manus.im"

# API Keys
BUILT_IN_FORGE_API_KEY="your-api-key"
BUILT_IN_FORGE_API_URL="https://api.manus.im"

# App Config
VITE_APP_TITLE="FlowCore - YTF Production"
VITE_APP_LOGO="/logo.png"
NODE_ENV="production"
PORT=3000
ENVFILE
```

### Step 7: Setup nginx
```bash
sudo tee /etc/nginx/sites-available/ytf.supermega.dev > /dev/null << 'NGINXCONF'
server {
    listen 80;
    server_name ytf.supermega.dev;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINXCONF

sudo ln -sf /etc/nginx/sites-available/ytf.supermega.dev /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 8: Setup PM2
```bash
sudo npm install -g pm2

cat > ecosystem.config.js << 'PMCONF'
module.exports = {
  apps: [{
    name: 'ytf-production',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
PMCONF

mkdir -p logs
pm2 start ecosystem.config.js
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

### Step 9: Setup SSL
```bash
sudo certbot certonly --nginx -d ytf.supermega.dev --non-interactive --agree-tos -m admin@supermega.dev
```

### Step 10: Verify Deployment
```bash
pm2 logs ytf-production
curl http://localhost:3000
```

## Monitoring & Maintenance

### View Logs
```bash
pm2 logs ytf-production
pm2 logs ytf-production --lines 100
```

### Restart Application
```bash
pm2 restart ytf-production
```

### Update Application
```bash
cd /opt/ytf-production
git pull origin main
pnpm install
pnpm run build
pm2 restart ytf-production
```

### Check Status
```bash
pm2 status
pm2 monit
```

## Troubleshooting

### Application won't start
```bash
pm2 logs ytf-production --lines 50
```

### Port already in use
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

### nginx not working
```bash
sudo nginx -t
sudo systemctl restart nginx
sudo tail -f /var/log/nginx/error.log
```

### SSL certificate issues
```bash
sudo certbot renew --dry-run
sudo certbot renew
```

## Scaling

### Increase PM2 instances
Edit `ecosystem.config.js` and change `instances: 'max'` to a specific number.

### Load balancing
nginx automatically load balances across PM2 instances.

### Database optimization
- Enable query caching
- Add indexes on frequently queried fields
- Monitor slow queries

## Security

### Firewall rules
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### SSH hardening
- Disable password authentication
- Use SSH keys only
- Change default SSH port (optional)

### Application security
- Keep dependencies updated: `pnpm update`
- Use environment variables for secrets
- Enable HTTPS only
- Set security headers in nginx

## Backup & Recovery

### Database backup
```bash
mysqldump -u root -p ytf_production > backup.sql
```

### Application backup
```bash
tar -czf ytf-backup-$(date +%Y%m%d).tar.gz /opt/ytf-production
```

### Restore
```bash
tar -xzf ytf-backup-*.tar.gz
cd /opt/ytf-production
pm2 restart ytf-production
```

## Performance Optimization

### Enable gzip compression in nginx
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

### Cache static assets
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Connection pooling
Configure in `.env.production`:
```
DATABASE_CONNECTION_POOL_SIZE=20
```

## Support

For issues or questions:
1. Check logs: `pm2 logs ytf-production`
2. Review nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Check system resources: `top`, `df -h`
4. Contact: devteam@supermega.dev

