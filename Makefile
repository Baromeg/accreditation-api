start: ## Start all services in background
	docker-compose up -d --build

dev: ## Start app in live-reload mode
	docker-compose up

stop: ## Stop and remove containers
	docker-compose down

logs: ## Tail container logs
	docker-compose logs -f api

migrate: ## Run initial Prisma migration
	docker-compose exec api pnpm prisma:migrate --name init

studio: ## Open Prisma Studio in container
	docker-compose exec api pnpm prisma studio

bash: ## Open shell in the app container
	docker-compose exec api sh
