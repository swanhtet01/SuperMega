#!/bin/bash
set -e

echo "🚀 YTF Production Deployment"
echo "============================"

# Step 1: System setup
echo "1️⃣ Updating system..."
sudo apt-get update -qq
sudo apt-get upgrade -y -qq

# Step 2: Install dependencies
echo "2️⃣ Installing dependencies..."
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - > /dev/null 2>&1
sudo apt-get install -y -qq nodejs nginx certbot python3-certbot-nginx git

# Step 3: Install Node tools
echo "3️⃣ Installing Node.js tools..."
sudo npm install -g pnpm pm2 > /dev/null 2>&1

# Step 4: Setup application directory
echo "4️⃣ Setting up application..."
sudo mkdir -p /opt/ytf-production
sudo chown ubuntu:ubuntu /opt/ytf-production
cd /opt/ytf-production

# Step 5: Clone or pull repository
if [ -d ".git" ]; then
    echo "5️⃣ Updating repository..."
    git pull origin main
else
    echo "5️⃣ Cloning repository..."
    git clone https://github.com/swanhtet01/SuperMega.git .
fi

# Step 6: Install dependencies
echo "6️⃣ Installing pnpm dependencies..."
pnpm install --frozen-lockfile

# Step 7: Build
echo "7️⃣ Building application..."
pnpm run build

# Step 8: Setup PM2
echo "8️⃣ Configuring PM2..."
mkdir -p logs
pm2 start ecosystem.config.js || pm2 restart ytf-production
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu > /dev/null 2>&1

# Step 9: Configure nginx
echo "9️⃣ Configuring nginx..."
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
sudo nginx -t > /dev/null 2>&1
sudo systemctl restart nginx

# Step 10: SSL setup (optional)
echo "🔟 Setting up SSL..."
sudo certbot certonly --nginx -d ytf.supermega.dev --non-interactive --agree-tos -m admin@supermega.dev 2>/dev/null || echo "   (SSL setup skipped - configure manually if needed)"

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo "========================"
echo "YTF Production System is now running at:"
echo "  http://ytf.supermega.dev (or your EC2 IP)"
echo ""
echo "Monitor with: pm2 logs ytf-production"
echo "Status: pm2 status"
echo "Restart: pm2 restart ytf-production"
