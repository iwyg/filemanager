#! /bin/bash

SELF=$0
BUILD_PATH=`dirname $SELF`

cd $BUILD_PATH
rm -rf ../build
node r.js -o app.build.js
cp -r css ../build/css
cp -r images ../build/images

cd ../
rm assets
ln -s build assets
