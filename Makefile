.PHONY: install build test typecheck website website-install website-build website-docs website-typecheck

install website-install:
	npm ci

build website-build:
	npm run build

test:
	npm test

typecheck website-typecheck:
	npm run typecheck

website:
	npm start

website-docs:
	npm run prepare:docs
