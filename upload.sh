#!/bin/sh

echo 'begin upload to '$1

cd ./build

scp web-mobile.zip root@$1:/usr/local/tomcat/
ssh root@$1 "cd /usr/local/tomcat ; ls -lh ; cd webapps; ./frontend_moego.sh"

echo 'end upload to '$1 
