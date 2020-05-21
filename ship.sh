rm -rf dist/ .cache/ packaged/ node_modules
yarn

./node_modules/.bin/electron-builder install-app-deps

./node_modules/.bin/parcel build node_modules/monaco-editor/esm/vs/language/typescript/ts.worker.js --no-source-maps
./node_modules/.bin/parcel build node_modules/monaco-editor/esm/vs/editor/editor.worker.js --no-source-maps
./node_modules/.bin/parcel build ./src/main/index.html --public-url ./

echo Copying icons
mkdir -p dist/icons
cp assets/icons/png/* dist/icons/
cp assets/icons/win/* dist/icons/
cp assets/icons/mac/* dist/icons/

DEBUG=electron-builder GH_TOKEN=`cat token` ./node_modules/.bin/electron-builder build \
  --linux AppImage deb \
  --win \
  --mac \
  --publish always

# ./node_modules/.bin/electron-builder build -m
