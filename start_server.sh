#!/bin/bash
# Quick start script for local development server

cd /home/iceman404/Downloads/Personal-Website/Creative-Coder-Portfolio

echo "Starting local server..."
echo "Server will run at: http://localhost:8000"
echo ""
echo "Open in browser:"
echo "  - Bio page: http://localhost:8000/bio.html"
echo "  - Home page: http://localhost:8000/index.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python3 -m http.server 8000
