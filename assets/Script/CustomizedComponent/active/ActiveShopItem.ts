import { HttpInst } from "../../core/http/HttpClient";
import { NetConfig } from "../../global/const/NetConfig";
import { ClientEvents } from "../../global/manager/ClientEventCenter";
import { JsonMgr } from "../../global/manager/JsonManager";
import { UIMgr } from "../../global/manager/UIManager";
import { IActivityStoreInfo, IShopItemInfo } from "../../types/Response";
import { ButtonMgr } from "../common/ButtonClick";
import CommonSimItem from "../common/CommonSimItem";
import ShopIconItem from "./ShopIconItem";
import { DataMgr } from "../../Model/DataManager";
import activeExchange from "./ActiveExchange";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ActiveShopItem extends cc.Component {

    @property(cc.Node)
    private iconLay: cc.Node = null;
    @property(cc.Prefab)
    private iconPre: cc.Prefab = null;
    @property(cc.Button)
    private exchange: cc.Button = null;
    @property(cc.Node)
    private propLay: cc.Node = null;
    @property(cc.Prefab)
    private propPre: cc.Prefab = null;
    @property([cc.Label])
    private labArr: Array<cc.Label> = [];
    @property(cc.Sprite)
    private redPoint: cc.Sprite = null;

    private activeId = null;
    private xmlid = null;

    start() {
        ButtonMgr.addClick(this.exchange.node, this.exchangeprop)
    }

    shopview = (shopData: IShopItemInfo[], activeData: IActivityStoreInfo, index: number, xmlId: number) => {
        let shopId = shopData[index].id;
        this.activeId = shopId;
        this.xmlid = xmlId;

        for (let i = 0; i < activeData.activityStore.length; i++) {
            let activeId = activeData.activityStore[i].id;
            if (shopId == activeId) {
                let shopNum = activeData.activityStore[i].residualNum;
                if (shopNum == -1) {
                    this.labArr[0].string = "无限";
                } else {
                    this.labArr[0].string = shopNum + ""
                }
            }
        }

        //兑换目标道具
        let itemStr = shopData[index].itemId.split(",");
        this.iconLay.removeAllChildren();
        let item = cc.instantiate(this.iconPre);
        let iconItem: CommonSimItem = item.getComponent(CommonSimItem);
        this.iconLay.addChild(item);
        if (DataMgr.activityModel.getIsLast()) {
            iconItem.setDotId(3510);
        } else {
            iconItem.setDotId(3520);
        }
        let itemBoxType = DataMgr.activeShopData.getItemBoxType(Number(itemStr[0]));
        iconItem.updateItem(Number(itemStr[0]), Number(itemStr[1]), itemBoxType);
        // UIMgr.addDetailedEvent(item, Number(itemStr[0]));

        let itemJson: IItemJson = JsonMgr.getInformationAndItem(Number(itemStr[0]));
        this.labArr[1].string = itemJson.name + "";

        //需求道具显示
        let iconArr = shopData[index].price.split(";");
        this.propLay.removeAllChildren();
        for (let i = 0; i < iconArr.length; i++) {
            let iconStr = iconArr[i].split(",");

            let propitem = cc.instantiate(this.propPre);
            let iconItem: ShopIconItem = propitem.getComponent(ShopIconItem);
            this.propLay.addChild(propitem);
            iconItem.mess(Number(iconStr[0]), Number(iconStr[1]),this.activeId)
        }

        //能否兑换
        let itemSort = shopData[index].sort;
        if (itemSort == -1) {
            this.exchange.interactable = true;
            this.redPoint.node.active = true;
        } else {
            this.exchange.interactable = false;
            this.exchange.enableAutoGrayEffect = true;
            this.redPoint.node.active = false;
        }
    };

    exchangeprop = () => {
        UIMgr.showView(activeExchange.url, null, { XmlId: this.xmlid, ActiveId: this.activeId });
    }
    // update (dt) {}
}
