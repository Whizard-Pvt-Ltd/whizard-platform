# Docker Deployment Guide for Whizard Platform

This guide covers building, running, and deploying the Whizard Platform using Docker and GitHub Actions.

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Local Development with Docker](#local-development-with-docker)
- [Building Docker Images Manually](#building-docker-images-manually)
- [GitHub Actions CI/CD](#github-actions-cicd)
- [Environment Variables](#environment-variables)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Monorepo Structure with Separate Dependencies

Whizard Platform uses a **pnpm workspace monorepo** with **separate package.json files per app** to optimize Docker image sizes:

```
whizard-platform/
├── package.json                      # Shared deps (@prisma/client) + dev tools
├── pnpm-workspace.yaml               # Workspace configuration
├── apps/
│   ├── api/
│   │   ├── bff/
│   │   │   ├── package.json          # @whizard/bff - Fastify deps only
│   │   │   └── Dockerfile
│   │   └── core-api/
│   │       ├── package.json          # @whizard/core-api - Fastify deps only
│   │       └── Dockerfile
│   └── web/
│       └── admin-portal/
│           ├── package.json          # @whizard/admin-portal - Angular deps only
│           └── Dockerfile
```

### Dependency Separation Benefits

✅ **No Angular in backend images** - Backend services only include Fastify, Prisma, bcrypt, pino
✅ **No Fastify in frontend images** - Frontend only includes Angular framework
✅ **Minimal image sizes** - Core API: ~150MB, Admin Portal: ~40MB
✅ **Reduced attack surface** - Each service has minimal dependencies
✅ **Faster deployments** - Smaller images download and start faster

### Docker Build Optimization

The Dockerfiles use **pnpm workspace filters** to install only app-specific production dependencies:

```dockerfile
# Install only production dependencies for core-api
RUN pnpm install --frozen-lockfile --prod --filter=@whizard/core-api...
```

This dramatically reduces image sizes compared to installing all monorepo dependencies.

---

## Prerequisites

### Required Software
- Docker Engine 20.10+
- Docker Compose 2.0+
- Git

### Optional (for manual builds)
- Node.js 24+
- pnpm 10.6.0+

---

## Local Development with Docker

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd whizard-platform
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and set your JWT secrets
   ```

3. **Start all services with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Check service health**
   ```bash
   docker-compose ps
   ```

5. **View logs**
   ```bash
   # All services
   docker-compose logs -f

   # Specific service
   docker-compose logs -f bff
   docker-compose logs -f core-api
   docker-compose logs -f admin-portal
   ```

6. **Access the application**
   - Admin Portal: http://localhost:4200
   - BFF API: http://localhost:3000
   - Core API: http://localhost:3001
   - PostgreSQL: localhost:5432

### Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (deletes database data)
docker-compose down -v
```

---

## Building Docker Images Manually

### Build Individual Services

#### BFF API
```bash
docker build -f apps/api/bff/Dockerfile -t whizard-bff:latest .
```

#### Core API
```bash
docker build -f apps/api/core-api/Dockerfile -t whizard-core-api:latest .
```

#### Admin Portal
```bash
docker build -f apps/web/admin-portal/Dockerfile -t whizard-admin-portal:latest .
```

### Run Individual Containers

#### BFF API
```bash
docker run -d \
  --name whizard-bff \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:postgres@localhost:5432/whizard" \
  -e JWT_ACCESS_SECRET="your-secret-here" \
  -e JWT_REFRESH_SECRET="your-secret-here" \
  whizard-bff:latest
```

#### Core API
```bash
docker run -d \
  --name whizard-core-api \
  -p 3001:3001 \
  -e DATABASE_URL="postgresql://postgres:postgres@localhost:5432/whizard" \
  -e IAM_ACCESS_TOKEN_SECRET="your-secret-here" \
  -e IAM_REFRESH_TOKEN_SECRET="your-secret-here" \
  whizard-core-api:latest
```

#### Admin Portal
```bash
docker run -d \
  --name whizard-admin-portal \
  -p 4200:80 \
  whizard-admin-portal:latest
```

---

## GitHub Actions CI/CD

### Overview

The platform includes automated Docker image building and pushing via GitHub Actions.

**Workflow File**: `.github/workflows/docker-build-push.yml`

### Triggers

The workflow runs on:
- **Push to `main` or `develop` branches**: Builds and pushes images
- **Pull Requests**: Builds images (does not push)
- **Tags starting with `v*`**: Builds and pushes versioned releases

### What Gets Built

The workflow builds three Docker images:
1. `ghcr.io/<username>/whizard-platform-bff`
2. `ghcr.io/<username>/whizard-platform-core-api`
3. `ghcr.io/<username>/whizard-platform-admin-portal`

### Image Tagging Strategy

Images are automatically tagged with:
- `latest` - Latest commit on main branch
- `main` - All commits on main branch
- `develop` - All commits on develop branch
- `pr-123` - Pull request number
- `main-abc1234` - Branch name + short commit SHA
- `v1.2.3` - Semantic version tags
- `1.2` - Major.minor version

### Setting Up GitHub Container Registry

1. **Enable GitHub Packages**
   - Go to your repository settings
   - Navigate to "Packages" section
   - Ensure container registry is enabled

2. **Repository Permissions**
   - The workflow uses `GITHUB_TOKEN` automatically
   - No additional secrets needed for GHCR

3. **Pull Images**
   ```bash
   # Login to GHCR
   echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

   # Pull images
   docker pull ghcr.io/<username>/whizard-platform-bff:latest
   docker pull ghcr.io/<username>/whizard-platform-core-api:latest
   docker pull ghcr.io/<username>/whizard-platform-admin-portal:latest
   ```

### Build Cache

The workflow uses GitHub Actions cache to speed up builds:
- Layer caching across builds
- Shared cache for all services
- Automatic cache invalidation

---

## Environment Variables

### Required Variables

#### Backend Services (BFF & Core API)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_ACCESS_SECRET` | JWT access token secret (min 32 chars) | `your-secure-secret-here` |
| `JWT_REFRESH_SECRET` | JWT refresh token secret (min 32 chars) | `your-secure-secret-here` |
| `IAM_ACCESS_TOKEN_SECRET` | IAM access token secret (min 32 chars) | `your-secure-secret-here` |
| `IAM_REFRESH_TOKEN_SECRET` | IAM refresh token secret (min 32 chars) | `your-secure-secret-here` |
| `PORT` | Service port | `3000` or `3001` |
| `NODE_ENV` | Environment | `production` |

#### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CORE_API_URL` | Core API URL (for BFF) | `http://core-api:3001` |
| `LOG_LEVEL` | Logging level | `info` |

### Setting Environment Variables

#### Docker Compose
Edit the `.env` file in the root directory:
```bash
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/whizard
JWT_ACCESS_SECRET=your-secret-min-32-characters-long
JWT_REFRESH_SECRET=your-secret-min-32-characters-long
IAM_ACCESS_TOKEN_SECRET=your-secret-min-32-characters-long
IAM_REFRESH_TOKEN_SECRET=your-secret-min-32-characters-long
```

#### Kubernetes
Use ConfigMaps and Secrets:
```bash
kubectl create secret generic whizard-secrets \
  --from-literal=jwt-access-secret='your-secret' \
  --from-literal=jwt-refresh-secret='your-secret' \
  --from-literal=iam-access-token-secret='your-secret' \
  --from-literal=iam-refresh-token-secret='your-secret'
```

---

## Production Deployment

### Using Docker Compose (Small Scale)

1. **Set production environment variables**
   ```bash
   cp .env.example .env.production
   # Edit .env.production with production values
   ```

2. **Deploy**
   ```bash
   docker-compose -f docker-compose.yml --env-file .env.production up -d
   ```

### Using Kubernetes (Recommended for Production)

#### 1. Create Namespace
```bash
kubectl create namespace whizard-platform
```

#### 2. Create Secrets
```bash
kubectl create secret generic whizard-secrets \
  --namespace whizard-platform \
  --from-literal=database-url='postgresql://user:pass@host:5432/whizard' \
  --from-literal=jwt-access-secret='your-secret' \
  --from-literal=jwt-refresh-secret='your-secret' \
  --from-literal=iam-access-token-secret='your-secret' \
  --from-literal=iam-refresh-token-secret='your-secret'
```

#### 3. Deploy PostgreSQL
```bash
# Using Helm (recommended)
helm install whizard-postgres bitnami/postgresql \
  --namespace whizard-platform \
  --set auth.username=whizard \
  --set auth.password=secure-password \
  --set auth.database=whizard
```

#### 4. Deploy Services
```bash
# Pull images
docker pull ghcr.io/<username>/whizard-platform-bff:latest
docker pull ghcr.io/<username>/whizard-platform-core-api:latest
docker pull ghcr.io/<username>/whizard-platform-admin-portal:latest

# Create deployments (example for Core API)
kubectl create deployment core-api \
  --image=ghcr.io/<username>/whizard-platform-core-api:latest \
  --namespace whizard-platform

# Expose services
kubectl expose deployment core-api \
  --port=3001 \
  --target-port=3001 \
  --namespace whizard-platform
```

#### 5. Run Database Migrations
```bash
kubectl run prisma-migrate \
  --image=ghcr.io/<username>/whizard-platform-core-api:latest \
  --namespace whizard-platform \
  --restart=Never \
  --rm -it \
  --command -- pnpm prisma:migrate:deploy
```

---

## Troubleshooting

### Common Issues

#### 1. Build Fails: "Cannot find module"
**Solution**: Ensure all workspace dependencies are correctly copied in Dockerfile
```bash
# Clean build
docker-compose build --no-cache
```

#### 2. Container Exits Immediately
**Solution**: Check logs for errors
```bash
docker-compose logs <service-name>
```

#### 3. Database Connection Failed
**Solution**: Verify DATABASE_URL and ensure PostgreSQL is healthy
```bash
docker-compose ps postgres
docker exec -it whizard-postgres psql -U postgres -c '\l'
```

#### 4. Prisma Client Not Generated
**Solution**: Prisma client is generated during Docker build
```bash
# Rebuild image
docker-compose build --no-cache core-api
```

#### 5. Health Check Failing
**Solution**: Ensure `/health` endpoint exists in your services
```bash
curl http://localhost:3000/health
curl http://localhost:3001/health
```

### Debug Mode

Run containers in interactive mode:
```bash
docker run -it --rm \
  --entrypoint sh \
  whizard-bff:latest
```

### View Container Logs
```bash
# Docker Compose
docker-compose logs -f <service-name>

# Docker
docker logs -f <container-name>

# Kubernetes
kubectl logs -f <pod-name> -n whizard-platform
```

---

## Performance Optimization

### Build Time
- Uses multi-stage builds to reduce image size
- Layer caching optimizes rebuild times
- GitHub Actions cache speeds up CI/CD

### Runtime
- Non-root user for security
- Minimal Alpine-based images
- Health checks for orchestration
- dumb-init for proper signal handling

### Image Sizes (Approximate)
- BFF API: ~200MB
- Core API: ~200MB
- Admin Portal: ~50MB (Nginx + static assets)

---

## Security Best Practices

1. **Never commit secrets** to version control
2. **Use environment variables** for sensitive data
3. **Run containers as non-root** (already configured)
4. **Keep base images updated** regularly
5. **Scan images** for vulnerabilities:
   ```bash
   docker scan whizard-bff:latest
   ```
6. **Use secrets management** (e.g., HashiCorp Vault, AWS Secrets Manager)
7. **Enable TLS/SSL** in production

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

---

## Support

For issues and questions:
- Check the [GitHub Issues](https://github.com/<username>/whizard-platform/issues)
- Review logs using `docker-compose logs`
- Consult the main README.md for development setup
