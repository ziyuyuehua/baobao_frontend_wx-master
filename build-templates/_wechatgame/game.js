require('./libs/wrapper/builtin/index');
window.DOMParser = require('./libs/common/xmldom/dom-parser').DOMParser;
require('./libs/common/engine/globalAdapter/index');
require('./libs/wrapper/unify');
require('./libs/wrapper/systemInfo');
// Ensure getting the system info in open data context

const REMOTE_SERVER_ROOT = "https://cdn.nuojuekeji.com/wx_game_13";

// function loadSettings() {
//     var settingsUrl = REMOTE_SERVER_ROOT + "res/settings.json";
//
//     var request = new XMLHttpRequest();
//     request.responseType = "text";
//     request.setRequestHeader('content-type', 'application/json');
//     request.open("GET", settingsUrl, true);
//     request.onreadystatechange = function() {
//         if (request.readyState == 4) {
//             var result = JSON.parse(request.responseText);
//             window._CCSettings = result;
//             (function(e){var t=e.uuids,r=e.md5AssetsMap;for(var s in r)for(var i=r[s],n=0;n<i.length;n+=2)"number"==typeof i[n]&&(i[n]=t[i[n]])})(window._CCSettings);
//             initGame();
//         } else {
//             console.error(request);
//         }
//     };
//     request.send();
// }

window.__globalAdapter.init(function () {
    require('./src/settings');
    initGame();
    // loadSettings();
});

function initGame() {
    // Will be replaced with cocos2d-js path in editor
    requirePlugin('cocos/cocos2d-js-min.js');
    require('./libs/common/engine/index');
    require('./main');
    require('./libs/common/remote-downloader');

    // Adjust devicePixelRatio
    cc.view._maxPixelRatio = 4;

    // downloader polyfill
    window.wxDownloader = remoteDownloader;
    // handle remote downloader
    remoteDownloader.REMOTE_SERVER_ROOT = REMOTE_SERVER_ROOT;
    remoteDownloader.SUBCONTEXT_ROOT = "";
    var pipeBeforeDownloader = cc.loader.subPackPipe || cc.loader.md5Pipe || cc.loader.assetLoader;
    cc.loader.insertPipeAfter(pipeBeforeDownloader, remoteDownloader);

    if (cc.sys.platform === cc.sys.WECHAT_GAME_SUB) {
        var SUBDOMAIN_DATA = require('src/subdomain.json.js');
        cc.game.once(cc.game.EVENT_ENGINE_INITED, function () {
            cc.Pipeline.Downloader.PackDownloader._doPreload("SUBDOMAIN_DATA", SUBDOMAIN_DATA);
        });

        require('./libs/wrapper/sub-context-adapter');
    }
    else {
        // Release Image objects after uploaded gl texture
        cc.macro.CLEANUP_IMAGE_CACHE = true;
    }

    remoteDownloader.init();
    window.boot();
}
