

default: build start

build:
	npm run build

start:
	npm start

watch:
	npm run watch

test:
	npm test

clean:
	rm -rf node_modules dist

.PHONY: build test
