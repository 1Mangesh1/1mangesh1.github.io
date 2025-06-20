.PHONY: install dev build preview clean deploy help maintenance-on maintenance-off maintenance-toggle maintenance-status maintenance-deploy-on maintenance-deploy-off setup seo-check seo-install

# Default target
help:
	@echo "Available commands:"
	@echo ""
	@echo "  Development:"
	@echo "    make install          - Install dependencies"
	@echo "    make dev              - Start development server"
	@echo "    make build            - Build for production"
	@echo "    make preview          - Preview production build"
	@echo "    make clean            - Clean build artifacts"
	@echo ""
	@echo "  Deployment:"
	@echo "    make deploy           - Build and commit for deployment"
	@echo "    make setup            - Quick setup for new environment"
	@echo ""
	@echo "  Maintenance Mode:"
	@echo "    make maintenance-on         - Enable maintenance mode"
	@echo "    make maintenance-off        - Disable maintenance mode"
	@echo "    make maintenance-toggle     - Toggle maintenance mode"
	@echo "    make maintenance-status     - Check maintenance mode status"
	@echo "    make maintenance-deploy-on  - Enable maintenance mode and deploy"
	@echo "    make maintenance-deploy-off - Disable maintenance mode and deploy"
	@echo ""
	@echo "  SEO & Optimization:"
	@echo "    make seo-check        - Check SEO implementation status"
	@echo "    make seo-install      - Install SEO dependencies"
	@echo ""
	@echo "    make help             - Show this help message"
# Install dependencies
install:
	yarn install

# Start development server
dev:
	yarn dev

# Build for production
build:
	yarn build

# Preview production build
preview:
	yarn preview

# Clean build artifacts
clean:
	rm -rf dist/
	rm -rf .astro/

# Build and commit for deployment (GitHub Actions will handle the rest)
deploy: build
	git add .
	git commit -m "Deploy: $(shell date '+%Y-%m-%d %H:%M:%S')" || echo "Nothing to commit"
	git push origin main

# Quick setup for new environment
setup: install
	@echo "Installing SEO dependencies..."
	@yarn add @astrojs/sitemap
	@echo "Setup complete! Run 'make dev' to start development."

# Maintenance mode commands
maintenance-on:
	@yarn maintenance:on
	@echo "🚧 Maintenance mode is now ENABLED"
	@echo "💡 Run 'make deploy' to apply changes to live site"

maintenance-off:
	@yarn maintenance:off
	@echo "✅ Maintenance mode is now DISABLED"
	@echo "💡 Run 'make deploy' to apply changes to live site"

maintenance-toggle:
	@yarn maintenance:toggle
	@echo "💡 Run 'make deploy' to apply changes to live site"

maintenance-status:
	@echo "Current maintenance mode status:"
	@if grep -q "maintenanceMode: true" src/config/site.ts; then \
		echo "🚧 ENABLED - Site is in maintenance mode"; \
	else \
		echo "✅ DISABLED - Site is online"; \
	fi

# Quick maintenance deployment commands
maintenance-deploy-on: maintenance-on
	@echo "Deploying maintenance mode..."
	@git add src/config/site.ts
	@git commit -m "Enable maintenance mode" || echo "Nothing to commit"
	@git push origin main
	@echo "🚧 Maintenance mode deployed!"

maintenance-deploy-off: maintenance-off
	@echo "Deploying site back online..."
	@git add src/config/site.ts
	@git commit -m "Disable maintenance mode - site back online" || echo "Nothing to commit"
	@git push origin main
	@echo "✅ Site is back online!"

# SEO verification commands
seo-check:
	@echo "🔍 SEO Status Check:"
	@echo "📄 Robots.txt: $(shell test -f public/robots.txt && echo '✅ Present' || echo '❌ Missing')"
	@echo "🗺️  Sitemap integration: $(shell grep -q '@astrojs/sitemap' package.json && echo '✅ Configured' || echo '❌ Missing')"
	@echo "📱 Web manifest: $(shell test -f public/site.webmanifest && echo '✅ Present' || echo '❌ Missing')"
	@echo "🏷️  Meta tags: $(shell grep -q 'og:title' src/layouts/Layout.astro && echo '✅ Configured' || echo '❌ Missing')"
	@echo ""
	@echo "📋 Next steps: See docs/SEO_CHECKLIST.md for complete guide"

seo-install:
	@echo "Installing SEO dependencies..."
	@yarn add @astrojs/sitemap
	@echo "✅ SEO dependencies installed!" 