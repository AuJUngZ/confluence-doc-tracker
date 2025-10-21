# Confluence Document Tracker - Docker Setup

## 📋 Prerequisites

- Docker installed and running
- `.env.local` file with your Confluence credentials

## 🏗️ Build & Run

### 1. Build the Docker image

```bash
./docker-build.sh
```

Or manually:

```bash
docker build -t confluence-doc-tracker:latest .
```

### 2. Run the container

Using the script (loads from `.env.local`):

```bash
./docker-run.sh
```

Or manually:

```bash
docker run -d \
  --name confluence-doc-tracker \
  -p 3000:3000 \
  -e CONFLUENCE_DOMAIN='your-domain.atlassian.net' \
  -e CONFLUENCE_EMAIL='your-email@example.com' \
  -e CONFLUENCE_API_TOKEN='your-api-token' \
  -e CONFLUENCE_USER_EMAIL='your-email@example.com' \
  confluence-doc-tracker:latest
```

### 3. Access the application

Open your browser: http://localhost:3000

## 🛠️ Useful Commands

```bash
# View logs
docker logs -f confluence-doc-tracker

# Stop container
docker stop confluence-doc-tracker

# Remove container
docker rm confluence-doc-tracker

# View image size
docker images confluence-doc-tracker:latest

# Rebuild (if you make changes)
docker build -t confluence-doc-tracker:latest . && docker stop confluence-doc-tracker && docker rm confluence-doc-tracker && ./docker-run.sh
```

## 📦 Image Features

- **Multi-stage build**: Minimal final image size
- **Bun runtime**: Faster than Node.js
- **Alpine Linux**: Smallest base image
- **Non-root user**: Security best practice
- **Standalone output**: Only necessary files included

## 🔒 Environment Variables

Required environment variables:

- `CONFLUENCE_DOMAIN`: Your Confluence domain (e.g., `company.atlassian.net`)
- `CONFLUENCE_EMAIL`: Your Confluence email
- `CONFLUENCE_API_TOKEN`: Your Confluence API token
- `CONFLUENCE_USER_EMAIL`: Email of the user to search documents for

## 🐛 Troubleshooting

### Docker daemon not running

```bash
# macOS/Windows: Start Docker Desktop
# Linux: sudo systemctl start docker
```

### Port 3000 already in use

```bash
# Use a different port
docker run -p 8080:3000 ...
```

### View container logs

```bash
docker logs confluence-doc-tracker
```
