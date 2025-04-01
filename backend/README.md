# EduWave Timetable Scheduler

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Docker](https://img.shields.io/badge/docker-ready-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

A Dockerized Laravel API with flexible stack options (Apache/Nginx + PostgreSQL/MySQL).

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js (for frontend)

```sh
# Clone the repository
git clone https://github.com/jdu211171/Timetable-Scheduler.git
cd Timetable-Scheduler

# Backend Setup
cp .env.example .env  # Update DB credentials if needed

# Configure your preferred Docker stack using our TUI tool:
# On Linux (64-bit):
./bin/docker-stack-linux-amd64

# On macOS (Intel):
./bin/docker-stack-macos-amd64

# On macOS (Apple Silicon):
./bin/docker-stack-macos-arm64

# On Windows:
bin\docker-stack-windows-amd64.exe

# Or if you have Go installed:
go run main.go
```

## Docker Commands

```sh
# Start containers
docker-compose up --build -d

# Run migrations
docker-compose exec web php artisan migrate

# Stop containers
docker-compose down
```

## Flexible Stack Options

Our project allows each developer to choose their preferred stack:

- **Web Server**: Apache or Nginx
- **Database**: PostgreSQL or MySQL
- **PHP Version**: 8.3, 8.2, or 8.1
- **Custom Ports**: Configure web and database ports

The TUI tool handles all configuration automatically!

## Development Workflow

### Backend

- Access container shell:
    ```sh
    # For Apache setup:
    docker-compose exec web bash

    # For Nginx+PHP-FPM setup:
    docker-compose exec app bash
    ```
- API URL: `http://localhost:<your-configured-port>`

### Switching Stacks

Need to try a different configuration? Simply run the TUI tool again and restart your containers.

## Before Contributing

1. Always pull latest changes:
    ```sh
    git pull --rebase
    ```
2. Run lint/fix scripts if available:
    ```sh
    npm run fix  # Frontend
    php artisan lint:fix  # Backend
    ```
3. Push your changes:
    ```sh
    git push
    ```

> **Important**  
> Your Docker stack configuration is developer-specific and excluded from version control.
> Do not commit `.env` or `docker-compose.override.yml` files.

## Project Structure

```
├── backend
│   └── EduWaveLaravel   # Laravel backend
├── frontend
│   ├── app
│   └── public
├── bin                  # Pre-built TUI binaries
└── docker               # Docker configuration templates
```

## Building the TUI Tool (For Maintainers)

If you need to update the TUI tool:

```bash
# Using the build script
chmod +x build.sh
./build.sh

# Or using make
make all  # Build for all platforms
```

> **Note**  
> Commit messages must be descriptive and reference related issues.
