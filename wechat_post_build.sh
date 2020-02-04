#!/bin/bash

cp build-templates/_wechatgame/game.js build/wechatgame/
rm build/wechatgame/main.js
cp build-templates/_wechatgame/main.js build/wechatgame/
cp -r build-templates/_wechatgame/launcher build/wechatgame/
tsc --project build-templates/_wechatgame
cp -r build-templates/_wechatgame/odc build/wechatgame/
#mv build/wechatgame/src/project*.js build/wechatgame/src/project.js

#echo "var s=" > build/wechatgame/src/t.js
#grep -o "{.*};" build/wechatgame/src/settings.js >> build/wechatgame/src/t.js
#echo "console.log(JSON.stringify(s));" >> build/wechatgame/src/t.js
#node build/wechatgame/src/t.js > build/wechatgame/res/settings.json
#rm build/wechatgame/src/settings.js
#rm build/wechatgame/src/t.js

hash=`md5 build/wechatgame/src/settings.js`
name=settings.${hash:0-5}
mv build/wechatgame/src/settings.js build/wechatgame/src/${name}.js
sed -i '' 's/settings/'${name}'/' build/wechatgame/game.js
echo ${name} >> build/wechatgame/res/${name}

rm -rf build/res build/res.zip
mv build/wechatgame/res build/

cd build
zip -qr res.zip res
