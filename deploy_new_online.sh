#!/bin/sh

echo 'begin deploy bbshop online'

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

chmod 700 bb_online
#scp -i game ./build/web-mobile.zip root@111.231.239.232:/data/nginx/nginxroot/
scp -i bb_online ./build/res.zip root@129.204.213.249:/bbd/nginx/html/wx_game_2
#ssh -i game root@111.231.239.232 "cd /data/nginx/nginxroot ; ls -lh ; ./frontend_bbshop.sh"

echo 'end deploy bbshop online'
