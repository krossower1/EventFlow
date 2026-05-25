# Docker Setup for EventFlow

This project can be run using Docker and Docker Compose for easy deployment and development.

## Prerequisites

- Docker installed (version 20.10 or higher)
- Docker Compose installed (version 2.0 or higher)

## Quick Start

1. Navigate to the project root directory:
```bash
cd d:\Szkoła\DB\Rep\Rep
```

2. Build and start all services:
```bash
docker-compose up --build
```

3. Access the application:
- Frontend: http://localhost
- Backend API: http://localhost:8081
- MySQL Database: localhost:3306

## Services

The docker-compose.yml file defines three services:

### 1. MySQL Database
- Image: mysql:8.0
- Port: 3306
- Database: event_flow
- Credentials: root/haslo
- Volume: mysql-data (persistent storage)

### 2. Backend (Spring Boot)
- Build context: ./com
- Port: 8081
- Depends on: MySQL
- Environment variables configured for database connection

### 3. Frontend (React)
- Build context: ./react
- Port: 80
- Depends on: Backend
- Served via nginx

## Useful Commands

### Start all services in detached mode:
```bash
docker-compose up -d
```

### Stop all services:
```bash
docker-compose down
```

### Stop and remove all containers and volumes:
```bash
docker-compose down -v
```

### View logs:
```bash
docker-compose logs -f
```

### View logs for a specific service:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### Rebuild a specific service:
```bash
docker-compose up -d --build backend
```

### Execute commands in a container:
```bash
docker-compose exec backend bash
docker-compose exec mysql mysql -u root -phaslo event_flow
```

## Configuration

### Environment Variables

The backend uses environment variables for configuration. These are set in docker-compose.yml but can be overridden:

- `SPRING_DATASOURCE_URL`: Database connection URL
- `SPRING_DATASOURCE_USERNAME`: Database username
- `SPRING_DATASOURCE_PASSWORD`: Database password
- `SERVER_PORT`: Backend server port (default: 8081)
- `SPRING_MAIL_*`: Email configuration

### Database

The MySQL database is configured with:
- Database name: event_flow
- Root password: haslo
- Additional user: eventflow/eventflow

Data is persisted in a Docker volume named `mysql-data`.

## Development

### Running without Docker

For local development, you can still run the services without Docker:

**Backend:**
```bash
cd com
./gradlew bootrun
```

**Frontend:**
```bash
cd react
npm start
```

**Database:**
Ensure MySQL is running locally on port 3306 with database `event_flow`.

## Troubleshooting

### Port conflicts
If ports 80, 8081, or 3306 are already in use, modify the port mappings in docker-compose.yml.

### Database connection issues
- Ensure MySQL service is healthy before backend starts
- Check database credentials in docker-compose.yml
- Verify network connectivity between containers

### Build failures
- Clear Docker cache: `docker system prune -a`
- Rebuild specific service: `docker-compose up -d --build <service-name>`

### Permission issues (Linux/Mac)
If you encounter permission issues with volumes, ensure proper user permissions or run Docker with appropriate user context.

## Architecture

```
┌─────────────┐
│   Frontend  │ (React + nginx)
│   Port 80   │
└──────┬──────┘
       │
       │ HTTP
       │
┌──────▼──────┐
│   Backend   │ (Spring Boot)
│  Port 8081  │
└──────┬──────┘
       │
       │ JDBC
       │
┌──────▼──────┐
│   MySQL     │
│  Port 3306  │
└─────────────┘
```

All services communicate via the `eventflow-network` Docker bridge network.
