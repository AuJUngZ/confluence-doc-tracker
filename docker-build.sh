#!/bin/bash

# Build Docker image
echo "🔨 Building Docker image..."
docker build -t confluence-doc-tracker:latest .

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully!"
    echo ""
    echo "📦 Image size:"
    docker images confluence-doc-tracker:latest
    echo ""
    echo "🚀 To run the container, use:"
    echo ""
    echo "docker run -p 3000:3000 \\"
    echo "  -e CONFLUENCE_DOMAIN='your-domain.atlassian.net' \\"
    echo "  -e CONFLUENCE_EMAIL='your-email@example.com' \\"
    echo "  -e CONFLUENCE_API_TOKEN='your-api-token' \\"
    echo "  -e CONFLUENCE_USER_EMAIL='your-email@example.com' \\"
    echo "  confluence-doc-tracker:latest"
else
    echo "❌ Build failed!"
    exit 1
fi
