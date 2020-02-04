#!/bin/sh

echo 'begin deploy appTest shell'

PWD=654321
read -p 'please input password: ' -s pwd
echo $pwd $PWD
if [ $pwd != $PWD ]
then
    echo 'error password!'
    exit 1
fi

gulp

#cp ./splash.png ./build/web-mobile/splash.03ce1.png
cd ./build
rm -f web-mobile.zip
zip -r web-mobile.zip web-mobile
cd ../

scp ./build/web-mobile.zip root@134.175.74.96:/data/nginx/nginxroot/
ssh root@134.175.74.96 "cd /data/nginx/nginxroot ; ls -lh ; ./frontend_moego.sh"

echo 'end deploy appTest shell'
