.DEFAULT_GOAL := test
.PHONY: build lint unit test clean help

IMAGE_NAME := cvi-web-test

build:
	docker build -f Dockerfile -t $(IMAGE_NAME) --target test .

lint: build
	docker run --rm -e NODE_ENV=test $(IMAGE_NAME) npm run lint
	docker run --rm -e NODE_ENV=test $(IMAGE_NAME) npm run format:check
	docker run --rm -e NODE_ENV=test $(IMAGE_NAME) npm run type-check

unit: build
	docker run --rm \
		-e NODE_ENV=test \
		-e NEXTAUTH_SECRET=test-secret \
		-e NEXTAUTH_URL=http://localhost:3000 \
		-e AUTHENTIK_CLIENT_ID=test-client-id \
		-e AUTHENTIK_CLIENT_SECRET=test-client-secret \
		-e AUTHENTIK_ISSUER_URL=http://authentik-server:9000/application/o/cvi/ \
		-e BACKEND_API_INTERNAL_URL=http://backend:8000 \
		-e NEXT_PUBLIC_API_URL=http://localhost:8000 \
		$(IMAGE_NAME) npm run test:coverage

test: lint unit

clean:
	docker rmi $(IMAGE_NAME) 2>/dev/null || true

help:
	@echo "Targets:"
	@echo "  make build   Bangun image test"
	@echo "  make lint    Linter (ESLint + Prettier + TypeScript) di dalam container"
	@echo "  make unit    Unit test (Jest) di dalam container"
	@echo "  make test    Gate lengkap: lint + unit (default)"
	@echo "  make clean   Hapus image test"
