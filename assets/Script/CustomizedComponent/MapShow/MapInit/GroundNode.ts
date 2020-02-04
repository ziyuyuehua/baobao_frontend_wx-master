/**
 *@Athuor ljx
 *@Date 16:57
 */
import {UIUtil} from "../../../Utils/UIUtil";
import {MapMgr} from "./MapManager";

const {ccclass, property} = cc._decorator;

@ccclass

export default class GroundNode extends cc.Component {
    @property(cc.Sprite)
    private icon: cc.Sprite = null;

    private xmlData: IDecoShopJson = null;

    setSprite = (sprite: cc.SpriteFrame) => {
        if(!sprite || !this.icon) return;
        this.icon.spriteFrame = sprite;
    };

    changeSprite(xmlData: IDecoShopJson) {
        this.xmlData = xmlData;
        let url = MapMgr.getBaseFloorUrl() + xmlData.pattern;
        UIUtil.dynamicLoadImage(url, this.setSprite);
    }

    destroySprite() {
        this.icon.spriteFrame = null;
        this.xmlData = null;
    }

    getNowXmlId() {
        if(!this.xmlData) {
            return -1;
        }
        return this.xmlData.id;
    }
}