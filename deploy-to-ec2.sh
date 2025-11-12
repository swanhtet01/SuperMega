#!/bin/bash
# Deploy YTF System to EC2
set -e

echo "🚀 Deploying Yangon Tyre Factory System to AWS EC2"

# Build the application
echo "📦 Building application..."
pnpm install --prod=false
pnpm run build

# Create deployment archive
echo "📦 Creating deployment package..."
tar -czf ytf-deploy.tar.gz \
  package.json \
  pnpm-lock.yaml \
  dist/ \
  drizzle/ \
  server/ \
  shared/ \
  ecosystem.config.js \
  --exclude='node_modules' \
  --exclude='.git'

echo "✅ Deployment package created: ytf-deploy.tar.gz"
echo ""
echo "📋 Next steps:"
echo "1. Copy to EC2: scp -i /home/ubuntu/upload/key.pem ytf-deploy.tar.gz ubuntu@34.235.156.153:/home/ubuntu/"
echo "2. SSH to EC2: ssh -i /home/ubuntu/upload/key.pem ubuntu@34.235.156.153"
echo "3. Extract: tar -xzf ytf-deploy.tar.gz"
echo "4. Run deployment script from infrastructure/aws-setup.sh"
