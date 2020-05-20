rm -rf dist/ .cache/ node_modules
yarn

./node_modules/.bin/electron-builder install-app-deps

./node_modules/.bin/parcel build node_modules/monaco-editor/esm/vs/language/typescript/ts.worker.js --no-source-maps
./node_modules/.bin/parcel build node_modules/monaco-editor/esm/vs/editor/editor.worker.js --no-source-maps
./node_modules/.bin/parcel build ./src/main/index.html --public-url ./

mkdir -p dist/icons
cp assets/icons/png/512x512.png dist/icons/icon.png
cp assets/icons/win/* dist/icons/
cp assets/icons/mac/* dist/icons/

GH_TOKEN=`cat token` ./node_modules/.bin/electron-builder build \
  --mac dmg \
  --linux AppImage deb \
  --win \
  --publish always

# ./node_modules/.bin/electron-builder build -m
