# Docker Deployment Guide for Personal Finance Manager

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 2GB of available RAM
- Ports 80, 5000, and 3306 available

## Quick Start

1. **Clone the repository** (if not already done)
   ```bash
   git clone <repository-url>
   cd personal-finance-manager1
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your values:
   ```
   SECRET_KEY=your_super_secret_key_here
   DB_PASSWORD=your_secure_password
   DB_USER=pfm_user
   DB_NAME=personal_finance_manager
   JWT_SECRET_KEY=your_jwt_secret_key_here
   JWT_ACCESS_TOKEN_EXPIRES=3600
   EXCHANGE_RATE_API_KEY=your_api_key_here
   ```

3. **Build and start containers**
   ```bash
   docker-compose up -d --build
   ```

4. **Check container status**
   ```bash
   docker-compose ps
   ```

5. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:5000
   - Database: localhost:3306

## Docker Commands

### Starting services
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d backend
```

### Stopping services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes database)
docker-compose down -v
```

### Viewing logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Rebuilding containers
```bash
# Rebuild all containers
docker-compose up -d --build

# Rebuild specific container
docker-compose up -d --build backend
```

### Database operations
```bash
# Access MySQL shell
docker-compose exec db mysql -u root -p

# Backup database
docker-compose exec db mysqldump -u root -p personal_finance_manager > backup.sql

# Restore database
docker-compose exec -T db mysql -u root -p personal_finance_manager < backup.sql
```

### Maintenance
```bash
# View container resource usage
docker stats

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune
```

## Production Deployment

### Security Recommendations

1. **Change default passwords** in `.env`
2. **Use strong SECRET_KEY and JWT_SECRET_KEY**
3. **Enable HTTPS** with reverse proxy (nginx/traefik)
4. **Restrict database port** (remove port mapping in production)
5. **Set up firewall rules**
6. **Regular backups** of database volume

### Production docker-compose override

Create `docker-compose.prod.yml`:
```yaml
version: '3.8'

services:
  db:
    ports: []  # Remove external port exposure
    
  backend:
    environment:
      FLASK_ENV: production
    restart: always
    
  frontend:
    restart: always
```

Run with:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs [service-name]

# Verify environment variables
docker-compose config
```

### Database connection issues
```bash
# Check database is healthy
docker-compose exec db mysqladmin ping -h localhost -u root -p

# Verify network
docker network inspect personal-finance-manager1_pfm_network
```

### Frontend can't reach backend
- Ensure backend container is running
- Check backend logs for errors
- Verify API_URL environment variable in frontend

### Port conflicts
If ports are already in use, modify `docker-compose.yml`:
```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Change host port
```

## Development Mode

For development with hot reload:

1. **Backend development**
   ```bash
   # Stop production backend
   docker-compose stop backend
   
   # Run backend locally
   cd backend
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   python run.py
   ```

2. **Frontend development**
   ```bash
   # Stop production frontend
   docker-compose stop frontend
   
   # Run frontend locally
   cd frontend
   npm install
   npm run dev
   ```

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│   Database  │
│   (Nginx)   │     │   (Flask)   │     │   (MySQL)   │
│   Port 80   │     │  Port 5000  │     │  Port 3306  │
└─────────────┘     └─────────────┘     └─────────────┘
      │                     │                     │
      └─────────────────────┴─────────────────────┘
                    pfm_network
```

## Volume Management

Persistent data is stored in named volumes:
- `mysql_data`: Database files

To backup volumes:
```bash
docker run --rm -v personal-finance-manager1_mysql_data:/data -v $(pwd):/backup ubuntu tar czf /backup/mysql_backup.tar.gz /data
```

## Health Checks

All services include health checks:
- **Database**: MySQL ping
- **Backend**: Flask application running
- **Frontend**: Nginx serving files

## Support

For issues or questions:
1. Check container logs
2. Verify environment configuration
3. Review this documentation
4. Check application README.md
