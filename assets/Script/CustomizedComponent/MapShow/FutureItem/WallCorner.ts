import {UIUtil} from "../../../Utils/UIUtil";
import {MapMgr} from "../MapInit/MapManager";

/**
*@Athuor ljx
*@Date 10:06
*/

const {ccclass, property} = cc._decorator;

@ccclass

export default class WallCorner extends cc.Component {
    @property(cc.Sprite)
    private wallCorner: cc.Sprite = null;
    private suffix: string = null;

    init = (suffix: string) => {
        this.suffix = suffix;
        this.changeSprite();
        if(MapMgr.getExpandShowAin()) {
            this.fadeInAni();
        }
    };

    changeSprite = (index?: number, cb: Function = null) => {
        let url = MapMgr.getWallPaperUrl() + "/" + this.suffix;
        UIUtil.dynamicLoadImage(url, (sprite: cc.SpriteFrame) => {
            this.wallCorner.spriteFrame = sprite;
            index++;
            if(cb) {
                cb(index);
            }
        });
    };

    fadeInAni() {
        this.node.opacity = 0;
        this.node.runAction(cc.fadeIn(.6));
    }

    clearSprite() {
        this.wallCorner.spriteFrame = null;
    }
}