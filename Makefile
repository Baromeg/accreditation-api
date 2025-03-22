start: ## Start all services in background
	docker-compose up -d --build

dev: ## Start app in live-reload mode
	docker-compose up

stop: ## Stop and remove containers
	docker-compose down

logs: ## Tail container logs
	docker-compose logs -f api

generate: ## Generate Prisma client
	docker-compose exec api pnpm prisma generate

migrate: ## Run initial Prisma migration
	docker-compose exec api pnpm prisma:migrate --name init

test: ## Run unit tests
	docker-compose exec api pnpm test

test:e2e: ## Run end-to-end tests
	docker-compose exec api pnpm test:e2e
	
studio: ## Open Prisma Studio in container
	docker-compose exec api pnpm prisma studio

bash: ## Open shell in the app container
	docker-compose exec api sh
