#!/bin/bash

# Script to generate SSL certificates for local development
# These certificates will work with modern browsers

CERT_FILE="localhost.pem"
KEY_FILE="localhost-key.pem"

echo "Generating SSL certificates for localhost..."
echo ""

# Check if openssl is available
if ! command -v openssl &> /dev/null; then
    echo "ERROR: openssl is not installed."
    echo "Please install openssl first:"
    echo "  - Arch/Manjaro: sudo pacman -S openssl"
    echo "  - Ubuntu/Debian: sudo apt-get install openssl"
    echo "  - macOS: openssl should be pre-installed"
    exit 1
fi

# Generate certificate with proper settings for modern browsers
openssl req -x509 \
    -newkey rsa:4096 \
    -keyout "$KEY_FILE" \
    -out "$CERT_FILE" \
    -days 365 \
    -nodes \
    -subj "/C=US/ST=State/L=City/O=Development/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1,IP:::1" \
    -addext "extendedKeyUsage=serverAuth"

if [ $? -eq 0 ]; then
    echo ""
    echo "SSL certificates generated successfully!"
    echo "  Certificate: $CERT_FILE"
    echo "  Private Key: $KEY_FILE"
    echo ""
    echo "These certificates will be used automatically by Vite."
    echo "You may still need to accept the certificate in your browser"
    echo "the first time you visit https://localhost:3000"
else
    echo ""
    echo "ERROR: Failed to generate certificates."
    echo "Vite will use auto-generated certificates instead."
    exit 1
fi
