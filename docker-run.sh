#!/bin/bash

# Load environment variables from .env.local
if [ -f .env.local ]; then
    echo "📝 Loading environment from .env.local..."
    export $(cat .env.local | grep -v '^#' | xargs)
else
    echo "⚠️  .env.local not found! Please create it first."
    exit 1
fi

# Stop existing container if running
echo "🛑 Stopping existing container..."
docker stop confluence-doc-tracker 2>/dev/null || true
docker rm confluence-doc-tracker 2>/dev/null || true

# Run the container
echo "🚀 Running Docker container..."
docker run -d \
  --name confluence-doc-tracker \
  -p 3000:3000 \
  -e CONFLUENCE_DOMAIN="$CONFLUENCE_DOMAIN" \
  -e CONFLUENCE_EMAIL="$CONFLUENCE_EMAIL" \
  -e CONFLUENCE_API_TOKEN="$CONFLUENCE_API_TOKEN" \
  -e CONFLUENCE_USER_EMAIL="$CONFLUENCE_USER_EMAIL" \
  confluence-doc-tracker:latest

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Container is running!"
    echo "🌐 Access at: http://localhost:3000"
    echo ""
    echo "📋 Useful commands:"
    echo "  View logs: docker logs -f confluence-doc-tracker"
    echo "  Stop:      docker stop confluence-doc-tracker"
    echo "  Remove:    docker rm confluence-doc-tracker"
else
    echo "❌ Failed to run container!"
    exit 1
fi
