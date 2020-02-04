/**
*@Athuor ljx
*@Date 14:24
*/
import {MapMgr} from "../MapInit/MapManager";
import {UIUtil} from "../../../Utils/UIUtil";

const {ccclass, property} = cc._decorator;

@ccclass

export default class OutWall extends cc.Component {
    @property(cc.Sprite)
    private icon: cc.Sprite = null;

    init(url: string, pos: cc.Vec2, cb: Function, nextPos: cc.Vec2, index: number, isShow: boolean) {
        let outUrl = MapMgr.getOutWallUrl(url);
        UIUtil.dynamicLoadImage(outUrl, (sprite: cc.SpriteFrame) => {
            if(!sprite || !this.icon) return;
            this.icon.spriteFrame = sprite;
            this.node.setPosition(pos);
            cb(index, nextPos, isShow);
        });

    }

    clearSprite() {
        this.icon.spriteFrame = null;
    }

    setSprite() {

    }
}