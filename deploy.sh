#!/bin/sh

echo 'begin deploy shell'

gulp

#cp ./splash.png ./build/web-mobile/splash.03ce1.png
cd ./build
rm -f web-mobile.zip
zip -r web-mobile.zip web-mobile

scp web-mobile.zip root@119.254.147.98:/usr/local/tomcat/
ssh root@119.254.147.98 "cd /usr/local/tomcat ; ls -lh ; cd webapps; ./frontend_moego.sh"

echo 'end deploy shell'
