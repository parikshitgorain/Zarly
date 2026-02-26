# Discord SaaS Bot System

A production-grade, multi-tenant Discord bot system with comprehensive features including moderation, XP/leveling, giveaways, automation, AI assistant, and more.

## 🏗️ Architecture

This is a monorepo project with 5 packages:

- **bot**: Discord.js bot service with sharding
- **api**: Express REST API with authentication
- **worker**: BullMQ background job processor
- **dashboard**: Next.js web dashboard
- **shared**: Shared types and utilities

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 15
- Redis >= 7
- Docker & Docker Compose (optional)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Start with Docker Compose
docker-compose up -d

# Or run services individually
npm run dev:bot
npm run dev:api
npm run dev:worker
npm run dev:dashboard
```

### Database Setup

```bash
# Run migrations
npm run migrate:up --workspace=packages/api

# Rollback migrations
npm run migrate:down --workspace=packages/api
```

## 📚 Documentation

- [Requirements](/.kiro/specs/discord-saas-bot/requirements.md)
- [Design](/.kiro/specs/discord-saas-bot/design.md)
- [Tasks](/.kiro/specs/discord-saas-bot/tasks.md)
- [Project Structure](/.kiro/specs/discord-saas-bot/PROJECT_STRUCTURE.md)
- [Master Lock Protocol](/.kiro/specs/discord-saas-bot/PROJECT_MASTER_LOCK.md)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🔒 Compliance

This project follows strict compliance rules defined in PROJECT_MASTER_LOCK.md:

- ✅ 11 Architectural Layers
- ✅ 90%+ Test Coverage
- ✅ Multi-Tenant Isolation
- ✅ Premium Feature Gating
- ✅ Comprehensive Error Handling

## 📝 License

MIT
