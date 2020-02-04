var loadingBg = "launcher/default_sprite_splash.png"
var logo = "launcher/logo.png"

var winSize = cc.director.getWinSize();

var scene = new cc.Scene();
var root = new cc.Node();
root.parent = scene;
var canvas = root.addComponent(cc.Canvas);
canvas.designResolution = cc.size(750, 1334);
canvas.fitWidth = true;

var createImage = function (sprite, url) {
  var image = wx.createImage();
  image.onload = function () {
    var texture = new cc.Texture2D();
    texture.initWithElement(image);
    texture.handleLoadedTexture();
    sprite.spriteFrame = new cc.SpriteFrame(texture);
  };
  image.src = url;
}

var logoNode = new cc.Node();
logoNode.parent = root;
var logoSprite = logoNode.addComponent(cc.Sprite);
createImage(logoSprite, logo);

scene.loadinglaunchScene = function (launchScene) {
  cc.director.preloadScene(launchScene, (completedCount, totalCount, item) => {
  }, (error) => {
    if (error) {
      console.log('preloadScene error', launchScene, error)
    }
    let fadeout = cc.fadeOut(0.5);
    scene.runAction(cc.sequence(fadeout, cc.callFunc(() => {
      cc.director.loadScene(launchScene, null, function () {
        cc.loader.onProgress = null;
      }
      );
    })));
  })
}

module.exports = scene;
