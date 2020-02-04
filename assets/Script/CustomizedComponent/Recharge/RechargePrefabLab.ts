import {IClientActivityInfo} from "../../types/Response";
import {JsonMgr} from "../../global/manager/JsonManager";
import {ResManager} from "../../global/manager/ResManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class RechargePrefabLab extends cc.Component {

    @property(cc.RichText)
    label: cc.RichText = null;

    @property(cc.Sprite)
    prefabIcon: cc.Sprite = null;

    updateItem(buffData: any) {
        this.label.string = buffData.description;
        ResManager.getVipBuffIcon(this.prefabIcon, buffData.buffIcon, false);
    }
}
