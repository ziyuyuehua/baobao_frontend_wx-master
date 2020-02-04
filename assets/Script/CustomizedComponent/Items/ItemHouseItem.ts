import {IItem} from "../../types/Response";
import {JsonMgr} from "../../global/manager/JsonManager";
import {ResMgr} from "../../global/manager/ResManager";
import {ButtonMgr} from "../../CustomizedComponent/common/ButtonClick";
import {UIMgr} from "../../global/manager/UIManager";
import ItemDetail from "./ItemDetail";
import {DataMgr} from "../../Model/DataManager";
import {COUNTERTYPE, DotInst} from "../common/dotClient";

// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class ItemHouseItem extends cc.Component {

    @property(cc.Sprite)
    itemIcon: cc.Sprite = null;

    @property(cc.Sprite)
    itemQuIcon: cc.Sprite = null;

    @property(cc.Label)
    itemNum: cc.Label = null;

    @property(cc.Node)
    redPoint: cc.Node = null;

    private itemData: IItem = null;

    start() {
        ButtonMgr.addClick(this.node, this.openDetail)
    }

    updateItem(itemData: IItem) {
        this.itemData = itemData;
        this.itemNum.string = itemData.num + "";
        let itemJson: IItemJson = JsonMgr.getItem(itemData.id);
        if (itemJson.type == 13) {
            ResMgr.getTreasureIcon(this.itemIcon, itemJson.icon);
        } else {
            ResMgr.imgTypeJudgment(this.itemIcon, itemData.id);
        }
        ResMgr.getItemBox(this.itemQuIcon, "k" + itemJson.color);
        this.redPoint.active = DataMgr.getItemType(itemData.id);
    }

    openDetail = () => {
        UIMgr.showView(ItemDetail.url, null, this.itemData);
        DotInst.clientSendDot(COUNTERTYPE.bag, "10402", this.itemData.id + ""); //点击道具打点
    }

}
