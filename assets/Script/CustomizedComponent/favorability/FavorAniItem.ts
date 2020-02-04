import {JsonMgr} from "../../global/manager/JsonManager";
import {ResMgr} from "../../global/manager/ResManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FavorAniItem extends cc.Component {

    @property(cc.Sprite)
    itemIcon: cc.Sprite = null;

    @property(cc.Sprite)
    itemQuIcon: cc.Sprite = null;

    updateItem(itemId: number, itemNum: number) {
        let itemJson: IItemJson = JsonMgr.getInformationAndItem(itemId);
        ResMgr.getItemBox(this.itemQuIcon, "k" + itemJson.color);
        ResMgr.imgTypeJudgment(this.itemIcon, itemId, 0.7);
    }

}
