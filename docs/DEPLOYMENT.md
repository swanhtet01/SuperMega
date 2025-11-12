# YTF System - Deployment Guide

**Complete guide for deploying to AWS and configuring production environment**

---

## Prerequisites

### AWS Account Setup
- AWS account with EC2 access
- Security group configured (ports 80, 443, 3000)
- SSH key pair generated
- Elastic IP assigned (optional but recommended)

### Domain Configuration
- supermega.dev domain access
- DNS management access (Google Domains)
- SSL certificate (Let's Encrypt)

### Required Credentials
- Database connection string (TiDB Cloud)
- JWT secret key
- Anthropic API key (for AI features)
- Google Workspace credentials (for email)

---

## Step 1: AWS EC2 Setup

### Launch EC2 Instance

```bash
# Instance type: t3.medium or larger
# OS: Ubuntu 22.04 LTS
# Storage: 30GB SSD minimum
# Security Group: Allow ports 22, 80, 443, 3000
```

### Connect to Instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PM2
npm install -g pm2

# Install nginx
sudo apt install -y nginx

# Install certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

---

## Step 2: Clone and Configure

### Clone Repository

```bash
cd /home/ubuntu
git clone https://github.com/swanhtet01/yangon-tyre-bms.git ytf-system
cd ytf-system
```

### Install Dependencies

```bash
pnpm install
```

### Configure Environment

```bash
# Create .env file
cat > .env << 'EOF'
# Database
DATABASE_URL=mysql://user:password@host:port/database

# Authentication
JWT_SECRET=your-secret-key-here
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im

# Application
VITE_APP_TITLE=Yangon Tyre Factory
VITE_APP_ID=ytf-production
VITE_APP_LOGO=/logo.svg

# Owner (for admin access)
OWNER_OPEN_ID=your-owner-id
OWNER_NAME=Swan Htet

# Built-in Services
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key

# AI Integration
ANTHROPIC_API_KEY=your-anthropic-key

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=devteam@supermega.dev
SMTP_PASSWORD=your-app-password
EOF

# Set permissions
chmod 600 .env
```

### Push Database Schema

```bash
pnpm db:push
```

---

## Step 3: Build Application

```bash
# Build frontend and backend
pnpm build

# Create logs directory
mkdir -p logs
```

---

## Step 4: Configure nginx

### Create nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/ytf-system
```

Add configuration:

```nginx
server {
    listen 80;
    server_name ytf.supermega.dev factory.supermega.dev;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ytf.supermega.dev factory.supermega.dev;

    # SSL certificates (will be configured by certbot)
    ssl_certificate /etc/letsencrypt/live/ytf.supermega.dev/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ytf.supermega.dev/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:3000;
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

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API endpoints
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }
}
```

### Enable Site

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/ytf-system /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

---

## Step 5: Configure DNS

### Add DNS Records in Google Domains

```
Type: A
Name: ytf
Data: your-ec2-elastic-ip
TTL: 3600

Type: A
Name: factory
Data: your-ec2-elastic-ip
TTL: 3600
```

Wait for DNS propagation (5-30 minutes)

---

## Step 6: SSL Certificate

### Obtain SSL Certificate

```bash
# Get certificate for both subdomains
sudo certbot --nginx -d ytf.supermega.dev -d factory.supermega.dev

# Follow prompts:
# - Enter email: swanhtet@supermega.dev
# - Agree to terms
# - Choose redirect HTTP to HTTPS
```

### Auto-renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot automatically sets up cron job for renewal
```

---

## Step 7: Start Application with PM2

### Start Application

```bash
cd /home/ubuntu/ytf-system

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Set up PM2 to start on boot
pm2 startup
# Run the command it outputs
```

### PM2 Commands

```bash
# View logs
pm2 logs ytf-system

# Monitor
pm2 monit

# Restart
pm2 restart ytf-system

# Stop
pm2 stop ytf-system

# Status
pm2 status
```

---

## Step 8: Configure GitHub Secrets

### Add Secrets to GitHub Repository

Go to: https://github.com/swanhtet01/yangon-tyre-bms/settings/secrets/actions

Add these secrets:

```
AWS_HOST=your-ec2-ip-or-domain
AWS_SSH_KEY=your-private-ssh-key-content
DATABASE_URL=your-database-connection-string
JWT_SECRET=your-jwt-secret
VITE_APP_TITLE=Yangon Tyre Factory
```

---

## Step 9: Test Deployment

### Manual Test

```bash
# Check if application is running
curl http://localhost:3000/health

# Check via domain
curl https://ytf.supermega.dev/health
```

### Automated Deployment

```bash
# Push to main branch triggers deployment
git add .
git commit -m "Deploy to production"
git push origin main

# Monitor GitHub Actions
# https://github.com/swanhtet01/yangon-tyre-bms/actions
```

---

## Step 10: Set Up Monitoring

### CloudWatch (Optional)

```bash
# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb
```

### Simple Monitoring Script

```bash
# Create monitoring script
cat > /home/ubuntu/monitor.sh << 'EOF'
#!/bin/bash
if ! curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "YTF System is down! Restarting..."
    pm2 restart ytf-system
    echo "YTF System restarted at $(date)" >> /home/ubuntu/restart.log
fi
EOF

chmod +x /home/ubuntu/monitor.sh

# Add to crontab (check every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * /home/ubuntu/monitor.sh") | crontab -
```

---

## Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs ytf-system

# Check environment variables
cat .env

# Check database connection
pnpm db:push
```

### nginx Errors

```bash
# Check nginx logs
sudo tail -f /var/log/nginx/error.log

# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### SSL Issues

```bash
# Check certificate
sudo certbot certificates

# Renew manually
sudo certbot renew --force-renewal
```

### Database Connection Issues

```bash
# Test connection
mysql -h your-host -u your-user -p your-database

# Check firewall
sudo ufw status
```

---

## Maintenance

### Regular Updates

```bash
# Pull latest code
cd /home/ubuntu/ytf-system
git pull origin main

# Install dependencies
pnpm install

# Rebuild
pnpm build

# Restart
pm2 restart ytf-system
```

### Database Backups

```bash
# Create backup script
cat > /home/ubuntu/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -h your-host -u your-user -p your-database > /home/ubuntu/backups/ytf_$DATE.sql
# Keep only last 7 days
find /home/ubuntu/backups -name "ytf_*.sql" -mtime +7 -delete
EOF

chmod +x /home/ubuntu/backup.sh

# Run daily at 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * /home/ubuntu/backup.sh") | crontab -
```

---

## Security Checklist

- [ ] SSH key-based authentication only
- [ ] Firewall configured (ufw)
- [ ] SSL certificate installed
- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] Regular security updates
- [ ] Backup strategy in place
- [ ] Monitoring enabled
- [ ] Logs reviewed regularly

---

## Support

For deployment issues:
- Email: devteam@supermega.dev
- GitHub Issues: https://github.com/swanhtet01/yangon-tyre-bms/issues

---

**Deployment Status**: Ready for Production  
**Last Updated**: November 13, 2025

