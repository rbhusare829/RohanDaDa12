#!/bin/bash
# ==============================================================================
# AWS EC2 Setup & Permissions Script for Rohan Deshmukh Website Backend
# Run this on your EC2 instance (Ubuntu 22.04 / 24.04 or Amazon Linux 2023)
# ==============================================================================

set -e

echo "🚀 Starting AWS EC2 Backend Setup..."

# 1. Update system packages
if command -v apt-get &> /dev/null; then
    echo "📦 Detected Ubuntu / Debian. Updating packages..."
    sudo apt-get update -y && sudo apt-get upgrade -y
    sudo apt-get install -y curl git build-essential nginx
elif command -v dnf &> /dev/null; then
    echo "📦 Detected Amazon Linux 2023 / RHEL. Updating packages..."
    sudo dnf update -y
    sudo dnf install -y curl git nginx
fi

# 2. Install Node.js 22 LTS if not installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js 22 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs || sudo dnf install -y nodejs
fi

echo "✓ Node.js $(node -v) and npm $(npm -v) verified."

# 3. Install PM2 process manager globally
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2 globally..."
    sudo npm install -g pm2
fi

# 4. Prepare directories and permissions
BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$BACKEND_DIR"

echo "🔒 Configuring storage and permissions..."
mkdir -p data uploads backups logs

# Set secure file permissions: owner can read/write, group can read, others restricted
chmod -R 750 "$BACKEND_DIR"
chmod -R 775 "$BACKEND_DIR/uploads" "$BACKEND_DIR/data" "$BACKEND_DIR/logs" "$BACKEND_DIR/backups"

# 5. Install backend dependencies (production)
echo "📦 Installing dependencies..."
npm install --omit=dev

# 6. Check .env file
if [ ! -f .env ]; then
    echo "⚠️  No .env file found! Copying from .env.example..."
    cp .env.example .env
    # Generate random JWT_SECRET
    RANDOM_SECRET=$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")
    sed -i "s/JWT_SECRET=/JWT_SECRET=${RANDOM_SECRET}/" .env
    echo "✓ Created .env with new JWT_SECRET."
    echo "⚠️  Remember to update PUBLIC_URL and CORS_ORIGINS with your Amplify frontend URL!"
fi

# 7. Start or restart with PM2
echo "⚡ Starting backend with PM2..."
pm2 start ecosystem.config.cjs || pm2 restart ecosystem.config.cjs
pm2 save

echo "🎉 Setup complete! Backend is running on port 3001."
echo "👉 Check logs with: pm2 logs rohan-backend"
