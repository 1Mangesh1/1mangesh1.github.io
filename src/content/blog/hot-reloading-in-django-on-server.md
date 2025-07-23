---
title: "Hot Reload Implementation for Django Staging Environment"
description: "Learn how to implement hot reloading for Django applications in a staging environment with Docker Compose and Gunicorn for improved development experience."
pubDate: 2025-06-21T00:00:00Z
tags: ["Django", "Docker", "Gunicorn", "Hot Reload", "Development"]
---

This guide describes the implementation of hot reloading for a Django application in a staging environment with Docker Compose. Hot reloading enables automatic application refreshes when code changes are detected, significantly improving the development experience by eliminating manual restarts.

## Architecture Components

The hot reload implementation consists of several key components:

1. **Docker Compose volume mapping** - To sync local files with the container
2. **Gunicorn configuration** - With reload mode enabled
3. **Django settings** - Optimized for development/staging
4. **Start script** - For proper initialization and monitoring
5. **Traefik configuration** - For routing HTTP traffic without forcing HTTPS
6. **Dependencies** - Required packages for hot reloading

## Docker Compose Configuration

The `staging.yml` file contains the configuration for the Docker Compose environment:

```yaml
version: "3"

volumes:
  staging_postgres_data_backups: {}
  staging_postgres_data: {}
  staging_traefik: {}

services:
  django: &django
    build:
      context: .
      dockerfile: ./compose/staging/django/Dockerfile
    image: my_awesome_project_staging_django
    depends_on:
      - postgres
    env_file:
      - ./.envs/.staging/.django
      - ./.envs/.staging/.postgres
    command: /start
    volumes:
      - .:/app:rw # Key configuration for hot reloading - maps local files to container
```

The crucial part for hot reloading is the volume mapping (`- .:/app:rw`), which ensures that any changes to the local codebase are immediately reflected within the container.

## Gunicorn Configuration

Gunicorn is configured to watch for file changes and automatically reload:

```python
# config/gunicorn.config.py
bind = "0.0.0.0:5000"

# Sample Worker processes
workers = 6
try:
    import uvicorn
    worker_class = "uvicorn.workers.UvicornWorker"
except ImportError:
    worker_class = "sync"

timeout = 180
max_requests = 1
max_requests_jitter = 5
reload = True  # Enable hot reloading
reload_extra_files = []  # Add any extra files to watch if needed

# Ignore specific file patterns for reloading
reload_ignore_files = [".*\.pyc", ".*\.py~", ".*\.log"]
```

The key settings for hot reloading are:

- `reload = True` - Enables automatic reloading on file changes
- `max_requests = 1` - Makes workers restart after handling a single request
- `max_requests_jitter = 5` - Adds randomness to restart times to prevent all workers restarting simultaneously
- `reload_ignore_files` - Patterns for files to ignore during hot reloading

## Django Start Script

The start script (`compose/staging/django/start`) initializes the environment and launches Gunicorn:

```bash
#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

echo "Starting Django application in staging mode..."

# Install watchdog if not already installed
if ! pip list | grep -q "watchdog"; then
    echo "Installing watchdog..."
    pip install watchdog
fi

# Set environment variables if not set
if [ -z "${USE_DOCKER:-}" ]; then
    echo "Setting USE_DOCKER=yes"
    export USE_DOCKER=yes
fi

# Check if Django settings module is properly set
if [ -z "${DJANGO_SETTINGS_MODULE:-}" ]; then
    echo "Setting DJANGO_SETTINGS_MODULE=config.settings.staging"
    export DJANGO_SETTINGS_MODULE=config.settings.staging
fi

echo "Using settings module: $DJANGO_SETTINGS_MODULE"

# Run initial setup
echo "Collecting static files..."
python /app/manage.py collectstatic --noinput || echo "Warning: collectstatic failed"

echo "Running migrations..."
python /app/manage.py migrate --noinput || echo "Warning: migrations failed"

echo "Starting application server with hot reload..."
echo "Hot reload will restart the server on code changes"

# Start Gunicorn with hot reloading
exec /opt/venv/bin/gunicorn config.asgi --config config/gunicorn.config.py --chdir=/app
```

This script:

1. Ensures watchdog is installed
2. Sets necessary environment variables
3. Runs Django's collectstatic and migrate commands
4. Starts Gunicorn with the hot reload configuration

## Django Settings

The `config/settings/staging.py` file contains the Django settings optimized for staging with hot reloading:

```python
# Key settings for hot reloading
DEBUG = True
ALLOWED_HOSTS = ["*"]  # Allow all hosts for staging

# CSRF Settings for local development
CSRF_TRUSTED_ORIGINS = ["http://localhost", "https://localhost", "http://0.0.0.0", "https://0.0.0.0"]

# Security settings relaxed for development
SECURE_PROXY_SSL_HEADER = None
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# Development tools
INSTALLED_APPS += ["django_extensions"]
if "debug_toolbar" not in INSTALLED_APPS:
    INSTALLED_APPS += ["debug_toolbar"]
    MIDDLEWARE += ["debug_toolbar.middleware.DebugToolbarMiddleware"]

# For Docker usage
INTERNAL_IPS = ["127.0.0.1", "10.0.2.2", "0.0.0.0"]
if env("USE_DOCKER") == "yes":
    import socket
    hostname, _, ips = socket.gethostbyname_ex(socket.gethostname())
    INTERNAL_IPS += [".".join(ip.split(".")[:-1] + ["1"]) for ip in ips]
```

The key settings include:

- `DEBUG = True` - Enables detailed error pages
- `ALLOWED_HOSTS = ["*"]` - Accepts requests from any host
- Security settings like `SECURE_SSL_REDIRECT = False` - Prevents forced HTTPS redirection
- Django extensions and debug toolbar for development

## Traefik Configuration

The Traefik configuration (`compose/staging/traefik/traefik.yml`) manages routing:

```yaml
entryPoints:
  web:
    # http
    address: ":80"
    # Removed redirection to allow HTTP access

http:
  routers:
    # HTTP router for direct access
    web-router:
      rule: "Host(`localhost`) || Host(`0.0.0.0`)"
      entryPoints:
        - web
      service: django
```

Key changes:

- Removed forced HTTPS redirection from the web entrypoint
- Added a direct HTTP router for localhost and 0.0.0.0

## Requirements

The dependencies required for hot reloading are specified in `requirements/staging.txt`:

```
# PRECAUTION: avoid production dependencies that aren't in development

-r production.txt

# Development tools
django-extensions==3.2.0
uvicorn[standard]==0.26.0
django-debug-toolbar

# Hot reloading
watchdog==3.0.0
```

Key packages:

- `uvicorn[standard]` - For ASGI support with Gunicorn
- `watchdog` - For file system monitoring
- `django-extensions` and `django-debug-toolbar` - For development tools

## Environment Variables

The environment variables in `.envs/.staging/.django` configure Django:

```
# General
DJANGO_READ_DOT_ENV_FILE=False
DJANGO_SETTINGS_MODULE=config.settings.staging
DJANGO_SECRET_KEY=secret
DJANGO_ADMIN_URL=admin/
DJANGO_ALLOWED_HOSTS=localhost,localhost:5000
USE_DOCKER=yes

# Security
DJANGO_SECURE_SSL_REDIRECT=False
```

Key variables:

- `DJANGO_SETTINGS_MODULE=config.settings.staging` - Use the staging settings
- `USE_DOCKER=yes` - Indicate we're running in Docker
- `DJANGO_SECURE_SSL_REDIRECT=False` - Disable SSL redirect

## Running the Setup

To use this hot reload setup:

1. Build the images:

   ```bash
   docker-compose -f staging.yml build
   ```

2. Start the containers:

   ```bash
   docker-compose -f staging.yml up
   ```

3. Access the application:

   ```bash
   curl http://localhost
   ```

4. Monitor logs for hot reload activity:
   ```bash
   docker-compose -f staging.yml logs -f django
   ```

When you modify the code, you should see output in the logs indicating that workers are reloading:

```
[INFO] Worker reloading: /app/path/to/changed/file.py modified
```

## Handling Database Changes

For database schema changes (e.g., adding models or fields):

1. Make the code changes - they will be automatically detected
2. Create migrations:
   ```bash
   docker-compose -f staging.yml run django python manage.py makemigrations
   ```
3. Apply migrations:
   ```bash
   docker-compose -f staging.yml run django python manage.py migrate
   ```

## Troubleshooting

### Common Issues and Solutions

1. **403 Forbidden Errors**

   - Ensure `ALLOWED_HOSTS` includes your hostname
   - Check `CSRF_TRUSTED_ORIGINS` includes your access URL
   - Verify Traefik is not forcing HTTPS redirects

2. **Hot reload not working**

   - Check logs for file change detection
   - Ensure volume mapping is correct in docker-compose
   - Verify `reload = True` in Gunicorn config

3. **Static files not loading**

   - Run `collectstatic` manually
   - Check `STATIC_ROOT` and `STATIC_URL` in settings

4. **Package missing errors**
   - Update requirements/staging.txt and rebuild

## Conclusion

This hot reload implementation provides a productive development environment for Django in a staging-like Docker setup. It combines the benefits of containerization with the convenience of automatic code reloading, enabling developers to iterate quickly without manual restarts.

By correctly configuring Docker volumes, Gunicorn, Django settings, and Traefik, changes to the codebase are immediately reflected in the running application, with special handling for database schema changes through Django's migration system.

That's it! You have successfully implemented hot reloading for Django in a Docker staging environment. I hope you found this post helpful. If you have any questions or feedback, feel free to dm me on [X](https://x.com/Mangesh_Bide) or mail me at [hello@mangeshbide.tech](mailto:hello@mangeshbide.tech).
