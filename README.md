# 📚 Confluence Document Tracker

A modern web application for tracking and searching documents you've contributed to in Confluence. Built with Next.js 15, shadcn/ui, and Bun.

![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8)
![Bun](https://img.shields.io/badge/Bun-1.x-fbf0df)

## ✨ Features

- 🔍 **Smart Search**: Search documents by date range with creator/contributor filtering
- 📁 **Grouped Display**: Documents organized by Space and folder hierarchy
- 🎨 **Beautiful UI**: Modern design with shadcn/ui components and smooth animations
- 🌓 **Dark Mode**: Full dark mode support
- 📋 **Quick Actions**:
  - Click documents to open in Confluence
  - Copy document URLs with one click
  - Collapse/expand document groups
- 🐳 **Docker Ready**: Optimized Dockerfile for production deployment (260MB image)
- ⚡ **Lightning Fast**: Built with Bun runtime for maximum performance

## 🏗️ Tech Stack

- **Framework**: [Next.js 15.5.6](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Runtime**: [Bun](https://bun.sh/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **API**: Confluence Cloud REST API

## 🚀 Getting Started

### Prerequisites

- Bun installed ([installation guide](https://bun.sh/docs/installation))
- Confluence Cloud account with API access
- API Token ([create here](https://id.atlassian.com/manage-profile/security/api-tokens))

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd my-document
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Configure environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   CONFLUENCE_DOMAIN=your-domain.atlassian.net
   CONFLUENCE_EMAIL=your-email@example.com
   CONFLUENCE_API_TOKEN=your-api-token-here
   CONFLUENCE_USER_EMAIL=your-email@example.com
   ```

4. **Run the development server**

   ```bash
   bun run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 🐳 Docker Deployment

### Build & Run with Docker

```bash
# Build the image
./docker-build.sh

# Run the container (loads env from .env.local)
./docker-run.sh
```

### Manual Docker Commands

```bash
# Build
docker build -t confluence-doc-tracker:latest .

# Run with environment variables
docker run -d -p 3000:3000 \
  -e CONFLUENCE_DOMAIN='your-domain.atlassian.net' \
  -e CONFLUENCE_EMAIL='your-email@example.com' \
  -e CONFLUENCE_API_TOKEN='your-api-token' \
  -e CONFLUENCE_USER_EMAIL='your-email@example.com' \
  confluence-doc-tracker:latest

# View logs
docker logs -f confluence-doc-tracker

# Stop
docker stop confluence-doc-tracker
```

See [DOCKER.md](./DOCKER.md) for detailed Docker documentation.

## 📖 How It Works

1. **Authentication**: Uses Confluence API token for secure access
2. **User Discovery**: Automatically finds your Confluence account ID
3. **Smart Querying**: Uses CQL (Confluence Query Language) to search for:
   - Pages you created
   - Pages you contributed to (as a contributor)
4. **Data Enrichment**: Fetches space and ancestor information for grouping
5. **Beautiful Display**: Groups documents by path and displays with rich metadata

## 🎨 UI Components

The application uses a modern design system with:

- **Gradient backgrounds** for visual appeal
- **Card-based layouts** for content organization
- **Collapsible groups** for better navigation
- **Hover effects** and smooth transitions
- **Responsive design** for all screen sizes
- **Icons** from Lucide React for visual clarity

## 🔧 Development

```bash
# Development server
bun run dev

# Build for production
bun run build

# Start production server
bun run start
```

## 📁 Project Structure

```
my-document/
├── app/
│   ├── api/
│   │   └── confluence/
│   │       ├── config/        # Configuration API
│   │       └── search/        # Search API
│   ├── globals.css            # Global styles with Tailwind v4
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── components/
│   ├── ui/                    # shadcn/ui components
│   │   ├── alert.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── separator.tsx
│   └── confluence-search.tsx  # Main search component
├── lib/
│   └── utils.ts               # Utility functions
├── types/
│   ├── confluence.ts          # Confluence API types
│   └── config.ts              # Configuration types
├── Dockerfile                 # Production Docker image
├── docker-build.sh            # Build script
├── docker-run.sh              # Run script
└── next.config.ts             # Next.js configuration
```

## 🔐 Environment Variables

| Variable                | Description                                            | Required |
| ----------------------- | ------------------------------------------------------ | -------- |
| `CONFLUENCE_DOMAIN`     | Your Confluence domain (e.g., `company.atlassian.net`) | ✅       |
| `CONFLUENCE_EMAIL`      | Your Confluence email                                  | ✅       |
| `CONFLUENCE_API_TOKEN`  | Your Confluence API token                              | ✅       |
| `CONFLUENCE_USER_EMAIL` | Email of user to search for                            | ✅       |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Atlassian Confluence API](https://developer.atlassian.com/cloud/confluence/rest/v1/intro/) - API documentation
- [Bun](https://bun.sh/) - Fast JavaScript runtime
