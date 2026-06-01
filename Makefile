.DEFAULT_GOAL := ci
.PHONY: lint test ci clean

# Sama dengan .github/workflows/lint.yml — berjalan di dalam Docker
# (tidak memerlukan Node.js atau npm terinstal di lokal)
lint:
	docker build -t cvi-web:test --target test .
	docker run --rm \
		-e NODE_ENV=test \
		cvi-web:test npm run lint
	docker run --rm \
		-e NODE_ENV=test \
		cvi-web:test npm run format:check
	docker run --rm \
		-e NODE_ENV=test \
		cvi-web:test npm run type-check

# Sama dengan .github/workflows/test.yml — berjalan di dalam Docker
# (tidak menghasilkan artefak di lokal, tidak memerlukan npm ci)
test:
	docker build -t cvi-web:test --target test .
	docker compose -f docker-compose.test.yml up \
		--abort-on-container-exit \
		--exit-code-from test
	docker compose -f docker-compose.test.yml down --volumes

ci: lint test

clean:
	docker compose -f docker-compose.test.yml down --volumes --rmi local 2>/dev/null || true
	docker rmi cvi-web:test 2>/dev/null || true
