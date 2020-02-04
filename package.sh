#!/bin/sh

echo 'begin package shell'

#cp ./splash.png ./build/web-mobile/splash.03ce1.png
cd ./build
rm -f web-mobile.zip
zip -r web-mobile.zip web-mobile

echo 'end package shell'
