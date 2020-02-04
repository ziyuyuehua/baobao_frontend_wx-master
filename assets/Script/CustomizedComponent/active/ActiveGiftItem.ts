import {GameComponent} from "../../core/component/GameComponent";
import {itemType, JsonMgr} from "../../global/manager/JsonManager";
import {ResMgr} from "../../global/manager/ResManager";
import {ButtonMgr} from "../common/ButtonClick";
import {UIMgr} from "../../global/manager/UIManager";
import {UIUtil} from "../../Utils/UIUtil";
import {Reward} from "../../Utils/CommonUtil";
import {SetBoxType} from "../common/CommonSimItem";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AcitveGiftItem extends GameComponent {
    static url: string = "active/ActiveGiftItem"

    @property(cc.Label)
    itemNum: cc.Label = null;

    @property(cc.Sprite)
    itemIcon: cc.Sprite = null;

    @property(cc.Sprite)
    itemQuIcon: cc.Sprite = null;

    @property scaleNum: number = 1;


    getBaseUrl() {
        return AcitveGiftItem.url;
    }

    start() {

    }

    numShow = (Id: number, Num: number, itemBoxType: SetBoxType = SetBoxType.Item) => {

        let itemJson: IItemJson = JsonMgr.getInformationAndItem(Id);
        switch (itemBoxType) {
            case SetBoxType.Item:
                ResMgr.getItemBox(this.itemQuIcon, "k" + itemJson.color, this.scaleNum);
                break;
            case SetBoxType.Goods:
                ResMgr.getItemBox(this.itemQuIcon, "goods" + itemJson.color, this.scaleNum);
                break;
        }
        ResMgr.imgTypeJudgment(this.itemIcon, Id);
        this.itemNum.string = Num + "";
        if (itemJson && itemJson.type !== itemType.ZhiOpenGift) {
            ButtonMgr.addClick(this.itemIcon.node, () => {
                UIMgr.addDetailedEvent(this.itemIcon.node, Id);
            });
        }

    }

    bagShow = (rewards: Reward[], itemid: number, itemnum: number, itemBoxType: SetBoxType = SetBoxType.Item) => {
        let itemJson: IItemJson = JsonMgr.getInformationAndItem(itemid);
        switch (itemBoxType) {
            case SetBoxType.Item:
                ResMgr.getItemBox(this.itemQuIcon, "k" + itemJson.color, this.scaleNum);
                break;
            case SetBoxType.Staff:
                ResMgr.getItemBox(this.itemQuIcon, "k" + itemJson.star, this.scaleNum);
                break;
            case SetBoxType.Goods:
                ResMgr.getItemBox(this.itemQuIcon, "goods" + itemJson.color, this.scaleNum);
                break;
        }
        ResMgr.imgTypeJudgment(this.itemIcon, itemid);
        this.itemNum.string = itemnum + "";
    }

    // update (dt) {}
}
