rm -rf dist/ .cache/ release/ node_modules
yarn

./node_modules/.bin/electron-builder install-app-deps

./node_modules/.bin/parcel build node_modules/monaco-editor/esm/vs/language/typescript/ts.worker.js --no-source-maps
./node_modules/.bin/parcel build node_modules/monaco-editor/esm/vs/editor/editor.worker.js --no-source-maps
./node_modules/.bin/parcel build ./src/main/index.html --public-url ./

DEBUG=electron-builder GH_TOKEN=`cat token` \
  ./node_modules/.bin/electron-builder build \
  --linux AppImage deb \
  --mac \
  --win
