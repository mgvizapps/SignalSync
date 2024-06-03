## Global variables
node_bin=./node_modules/.bin

## Build
.PHONY: build
build:
	${node_bin}/webpack --config webpack.config.js
	${node_bin}/rollup -c rollup.config.js
	cp ./packages/app/public/index.html ./public/
	cp ./packages/app/public/embed.html ./public/
	cp -R ./resources ./public/ 

## Test the app
.PHONY: test
test:
	${node_bin}/stattic --folder ./public --port 3000

## Publish the app
.PHONY: publish
publish:
	firebase deploy --only hosting:mgviz-apps-dev --project mgviz-apps


