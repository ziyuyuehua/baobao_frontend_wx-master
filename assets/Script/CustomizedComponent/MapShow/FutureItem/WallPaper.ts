/**
*@Athuor ljx
*@Date 09:30
*/
import {UIUtil} from "../../../Utils/UIUtil";
import {MapMgr} from "../MapInit/MapManager";

const {ccclass, property} = cc._decorator;

@ccclass

export default class WallPaper extends cc.Component {
    @property(cc.Sprite)
    private wallPaper: cc.Sprite = null;

    private suffix: string = null;

    init = (suffix: string) => {
        this.suffix = suffix;
        this.changeSprite();
        if(MapMgr.getExpandShowAin()) {
            this.fadeInAni();
        }
    };

    changeSprite(index?: number, cb: Function = null) {
        let url = this.getUrl();
        UIUtil.dynamicLoadImage(url, (sprite: cc.SpriteFrame) => {
            this.wallPaper.spriteFrame = sprite;
            if(cb) {
                index++;
                cb(index);
            }
        });
    }

    fadeInAni() {
        this.node.opacity = 0;
        this.node.runAction(cc.fadeIn(.6));
    }

    clearSprite() {
        this.wallPaper.spriteFrame = null;
    }

    getUrl() {
        return MapMgr.getWallPaperUrl() + "/" + this.suffix;
    }

}