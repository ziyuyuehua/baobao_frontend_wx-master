#!/bin/sh

echo 'begin deploy shell'

PWD=123456
read -p 'please input password: ' -s pwd
echo $pwd $PWD
if [ $pwd != $PWD ]
then
    echo 'error password!'
    exit 1
fi

gulp online

#cp ./splash.png ./build/web-mobile/splash.03ce1.png
cd ./build
rm -f web-mobile.zip
zip -r web-mobile.zip web-mobile
cd ../

chmod 700 game
scp -i game ./build/web-mobile.zip root@111.231.239.232:/data/nginx/nginxroot/
ssh -i game root@111.231.239.232 "cd /data/nginx/nginxroot ; ls -lh ; ./frontend_moego.sh"

echo 'end deploy shell'
