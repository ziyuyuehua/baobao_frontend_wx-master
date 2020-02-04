#!/bin/sh

echo 'begin deploy bbshop appTest shell'

gulp

#cp ./splash.png ./build/web-mobile/splash.03ce1.png
cd ./build
rm -f web-mobile.zip
zip -r web-mobile.zip web-mobile
cd ../

scp ./build/web-mobile.zip root@10.2.0.201:/data/nginx/nginxroot/bbshop
ssh root@10.2.0.201 "cd /data/nginx/nginxroot/bbshop ; ls -lh ; ./frontend_bbshop.sh"

echo 'end deploy bbshop appTest shell'
