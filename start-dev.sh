#!/bin/bash

# Quick dev server startup script with HTTPS support
# HTTPS is REQUIRED for camera API on mobile devices
# This is for local testing only - can be ignored when uploading to GitHub

echo "Starting development server with HTTPS..."
echo ""
echo "HTTPS is enabled for mobile device camera support"
echo ""
echo "NOTE: If you see SSL errors, you can generate proper certificates by running:"
echo "   ./generate-certs.sh"
echo ""
echo "Otherwise, you may need to accept the security warning in your browser:"
echo "   Click 'Advanced' -> 'Proceed to localhost' (or 'Accept the Risk')"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

# Check if vite is available
if command -v vite &> /dev/null || [ -f "node_modules/.bin/vite" ]; then
    echo "Starting Vite dev server with HTTPS on https://localhost:3000"
    echo "   Access from mobile: https://YOUR_IP:3000"
    echo "   Find your IP: ip addr show | grep 'inet '"
    echo ""
    echo "   Press Ctrl+C to stop"
    echo ""
    
    # Get local IP for mobile access
    if command -v ip &> /dev/null; then
        LOCAL_IP=$(ip addr show | grep -oP 'inet \K[\d.]+' | grep -v '127.0.0.1' | head -1)
        if [ ! -z "$LOCAL_IP" ]; then
            echo "   Mobile access: https://$LOCAL_IP:3000"
            echo ""
        fi
    elif command -v ifconfig &> /dev/null; then
        LOCAL_IP=$(ifconfig | grep -oP 'inet \K[\d.]+' | grep -v '127.0.0.1' | head -1)
        if [ ! -z "$LOCAL_IP" ]; then
            echo "   Mobile access: https://$LOCAL_IP:3000"
            echo ""
        fi
    fi
    
    npm run dev
else
    echo "WARNING: Vite not found. Cannot provide HTTPS."
    echo "   Camera API will NOT work on mobile devices without HTTPS!"
    echo ""
    echo "   Installing Vite..."
    npm install vite --save-dev
    echo ""
    echo "   Please run this script again."
    exit 1
fi
