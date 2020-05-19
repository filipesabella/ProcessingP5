./node_modules/.bin/electron-builder install-app-deps


./node_modules/.bin/parcel build -d build/ node_modules/monaco-editor/esm/vs/language/typescript/ts.worker.js --no-source-maps
./node_modules/.bin/parcel build -d build/ node_modules/monaco-editor/esm/vs/editor/editor.worker.js --no-source-maps
./node_modules/.bin/parcel build ./src/main/index.html -d build/ --public-url ./

mkdir -p build/icons
cp assets/icons/png/512x512.png build/icons/icon.png
cp assets/icons/win/* build/icons/
cp assets/icons/mac/* build/icons/

GH_TOKEN=`cat token` ./node_modules/.bin/electron-builder build -mwl -p always
