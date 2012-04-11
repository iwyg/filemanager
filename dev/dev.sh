#! /bin/bash

SELF=$0
BUILD_PATH=`dirname $SELF`
cd $BUILD_PATH
cd ../
rm -rf assets
ln -s dev assets
#cp -r dev assets
