#!/bin/bash
# AWS Infrastructure Setup for YTF System
# Enterprise-grade scalable architecture

set -e

echo "🚀 Setting up AWS Infrastructure for Yangon Tyre Factory System"
echo "================================================================"

# Configuration
INSTANCE_ID="i-020ec2022c95828c8"
REGION="us-east-1"
PROJECT_NAME="yangon-tyre-bms"
DOMAIN="ytf.supermega.dev"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Create IAM Role for EC2 to access Secrets Manager
echo -e "${BLUE}📋 Step 1: Creating IAM Role for EC2...${NC}"

# Check if role exists
if aws iam get-role --role-name YTF-EC2-SecretsManager-Role 2>/dev/null; then
    echo "✅ IAM Role already exists"
else
    # Create trust policy
    cat > /tmp/trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

    # Create role
    aws iam create-role \
        --role-name YTF-EC2-SecretsManager-Role \
        --assume-role-policy-document file:///tmp/trust-policy.json \
        --description "Role for YTF EC2 to access Secrets Manager"

    # Create policy for Secrets Manager access
    cat > /tmp/secrets-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret",
        "secretsmanager:ListSecrets"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-1:770031531585:secret:ytf/*"
    }
  ]
}
EOF

    # Attach policy
    aws iam put-role-policy \
        --role-name YTF-EC2-SecretsManager-Role \
        --policy-name YTF-SecretsManager-Access \
        --policy-document file:///tmp/secrets-policy.json

    # Create instance profile
    aws iam create-instance-profile \
        --instance-profile-name YTF-EC2-SecretsManager-Profile

    # Add role to instance profile
    aws iam add-role-to-instance-profile \
        --instance-profile-name YTF-EC2-SecretsManager-Profile \
        --role-name YTF-EC2-SecretsManager-Role

    echo "✅ IAM Role created successfully"
fi

# 2. Attach IAM role to EC2 instance
echo -e "${BLUE}📋 Step 2: Attaching IAM Role to EC2...${NC}"

# Check current instance profile
CURRENT_PROFILE=$(aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --query 'Reservations[0].Instances[0].IamInstanceProfile.Arn' \
    --output text 2>/dev/null || echo "None")

if [ "$CURRENT_PROFILE" == "None" ]; then
    # Wait for instance profile to be ready
    sleep 10
    
    # Associate instance profile
    aws ec2 associate-iam-instance-profile \
        --instance-id $INSTANCE_ID \
        --iam-instance-profile Name=YTF-EC2-SecretsManager-Profile
    
    echo "✅ IAM Role attached to EC2 instance"
else
    echo "✅ IAM Role already attached"
fi

# 3. Configure Security Groups
echo -e "${BLUE}📋 Step 3: Configuring Security Groups...${NC}"

# Get current security group
SG_ID=$(aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId' \
    --output text)

echo "Current Security Group: $SG_ID"

# Add HTTP/HTTPS rules if not exist
aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0 2>/dev/null || echo "Port 80 already open"

aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0 2>/dev/null || echo "Port 443 already open"

aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 3000 \
    --cidr 0.0.0.0/0 2>/dev/null || echo "Port 3000 already open"

echo "✅ Security groups configured"

# 4. Create deployment script for EC2
echo -e "${BLUE}📋 Step 4: Creating deployment script...${NC}"

cat > /tmp/deploy-ytf.sh << 'DEPLOY_SCRIPT'
#!/bin/bash
# YTF System Deployment Script for EC2
set -e

echo "🚀 Deploying Yangon Tyre Factory System"

# Install dependencies
echo "📦 Installing dependencies..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get update
sudo apt-get install -y nodejs git nginx certbot python3-certbot-nginx jq awscli

# Install PM2
sudo npm install -g pm2 pnpm

# Clone or update repository
if [ -d "/home/ubuntu/yangon-tyre-bms" ]; then
    echo "📥 Updating repository..."
    cd /home/ubuntu/yangon-tyre-bms
    git pull origin main
else
    echo "📥 Cloning repository..."
    cd /home/ubuntu
    git clone https://github.com/swanhtet01/yangon-tyre-bms.git
    cd yangon-tyre-bms
fi

# Fetch secrets from AWS Secrets Manager
echo "🔐 Fetching secrets from AWS Secrets Manager..."
export AWS_REGION=us-east-1

# Function to get secret
get_secret() {
    aws secretsmanager get-secret-value --secret-id "$1" --query SecretString --output text
}

# Create .env file
cat > .env << EOF
# Database
DATABASE_URL=$(get_secret "ytf/database-url")

# AI API Keys
OPENAI_API_KEY=$(get_secret "ytf/openai-admin-key")
ANTHROPIC_API_KEY=$(get_secret "ytf/claude-api-key")
GEMINI_API_KEY=$(get_secret "ytf/gemini-api-key")

# GitHub
GITHUB_TOKEN=$(get_secret "ytf/github-pat")

# Stripe (from JSON)
STRIPE_PUBLISHABLE_KEY=$(get_secret "ytf/stripe-keys" | jq -r .publishable_key)
STRIPE_SECRET_KEY=$(get_secret "ytf/stripe-keys" | jq -r .secret_key)

# Application
NODE_ENV=production
PORT=3000
JWT_SECRET=$(openssl rand -base64 32)
EOF

echo "✅ Environment variables configured"

# Install packages
echo "📦 Installing Node packages..."
pnpm install

# Build application
echo "🔨 Building application..."
pnpm run build

# Setup PM2
echo "⚙️ Configuring PM2..."
pm2 delete ytf-system 2>/dev/null || true
pm2 start npm --name "ytf-system" -- start
pm2 save
pm2 startup | tail -1 | sudo bash

# Configure Nginx
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/ytf << 'NGINX_CONFIG'
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
NGINX_CONFIG

sudo ln -sf /etc/nginx/sites-available/ytf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

echo "✅ Nginx configured"

# Setup SSL (if domain is configured)
echo "🔒 Setting up SSL..."
sudo certbot --nginx -d ytf.supermega.dev --non-interactive --agree-tos -m swanhtet@supermega.dev || echo "SSL setup skipped (domain not configured yet)"

echo ""
echo "✅ Deployment complete!"
echo "🌐 Application running at: http://ytf.supermega.dev"
echo "📊 PM2 status: pm2 status"
echo "📝 PM2 logs: pm2 logs ytf-system"
DEPLOY_SCRIPT

echo "✅ Deployment script created"

# 5. Create monitoring and auto-scaling configuration
echo -e "${BLUE}📋 Step 5: Setting up CloudWatch monitoring...${NC}"

# Create CloudWatch alarm for high CPU
aws cloudwatch put-metric-alarm \
    --alarm-name ytf-high-cpu \
    --alarm-description "Alert when CPU exceeds 80%" \
    --metric-name CPUUtilization \
    --namespace AWS/EC2 \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2 \
    --dimensions Name=InstanceId,Value=$INSTANCE_ID 2>/dev/null || echo "CloudWatch alarm already exists"

echo "✅ Monitoring configured"

# 6. Summary
echo ""
echo -e "${GREEN}================================================================${NC}"
echo -e "${GREEN}✅ AWS Infrastructure Setup Complete!${NC}"
echo -e "${GREEN}================================================================${NC}"
echo ""
echo "📋 Summary:"
echo "  • IAM Role: YTF-EC2-SecretsManager-Role"
echo "  • Instance Profile: YTF-EC2-SecretsManager-Profile"
echo "  • Security Groups: HTTP (80), HTTPS (443), App (3000)"
echo "  • Secrets Manager: 6 secrets configured"
echo "  • CloudWatch: CPU monitoring enabled"
echo ""
echo "🚀 Next Steps:"
echo "  1. Copy deployment script to EC2:"
echo "     scp -i key.pem /tmp/deploy-ytf.sh ubuntu@34.235.156.153:/home/ubuntu/"
echo ""
echo "  2. SSH into EC2 and run deployment:"
echo "     ssh -i key.pem ubuntu@34.235.156.153"
echo "     bash /home/ubuntu/deploy-ytf.sh"
echo ""
echo "  3. Configure DNS:"
echo "     Add A record: ytf.supermega.dev -> 34.235.156.153"
echo ""
echo "  4. Monitor deployment:"
echo "     pm2 status"
echo "     pm2 logs ytf-system"
echo ""

