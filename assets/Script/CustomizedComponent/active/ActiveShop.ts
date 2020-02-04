import List from "../../Utils/GridScrollUtil/List";
import {ButtonMgr} from "../common/ButtonClick";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import ActiveShopItem from "./ActiveShopItem";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {GameComponent} from "../../core/component/GameComponent";
import {TimeUtil} from "../../Utils/TimeUtil";
import {IActivityStoreInfo} from "../../types/Response";
import {DataMgr} from "../../Model/DataManager";
import {JsonMgr} from "../../global/manager/JsonManager";
import {DotInst, COUNTERTYPE} from "../common/dotClient";
import {topUiType} from "../MainUiTopCmpt";
import CommonSimItem from "../common/CommonSimItem";
import {UIUtil} from "../../Utils/UIUtil";


const {ccclass, property} = cc._decorator;

@ccclass
export default class ActiveShop extends GameComponent {
    static url: string = "active/activeShop";

    @property(cc.Node)
    private backBut: cc.Node = null;

    @property(cc.Node)
    private shopView: cc.Node = null;

    @property(cc.Node)
    private aniNode: cc.Node = null;

    @property(cc.RichText)
    private timelab: cc.RichText = null;

    @property(cc.Prefab)
    private itemPre: cc.Prefab = null;

    @property(cc.Layout)
    private itemLay: cc.Layout = null;


    @property(cc.Sprite)
    private bgIcon: cc.Sprite = null;

    private activeData: IActivityStoreInfo = null;
    private shopData: IActivityStore[] = [];
    private xmlId: number = 0;
    private ownPorp = null;

    getBaseUrl() {
        return ActiveShop.url;
    }

    onEnable() {
        this.onShowPlay(1, this.aniNode);
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.ordinary);
    }

    onDisable(): void {
        ClientEvents.COMMUNITY_ACTIVE_SHOP.emit();
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -1);
    }

    onLoad() {
        this.xmlId = this.node['data'].XmlId;
        ButtonMgr.addClick(this.backBut, () => {
            if (DataMgr.activityModel.getIsLast()) {
                DotInst.clientSendDot(COUNTERTYPE.communityActive, "3511");
            } else {
                DotInst.clientSendDot(COUNTERTYPE.communityActive, "3521");
            }
            this.closeOnly();
        });
        this.dispose.add(ClientEvents.ACTIVESHOP_SHOPRESIDUAL.on(this.activeshop))
    }

    start() {
        this.activeshop();
    }

    //xmlId:商店id；activeId：商店内某一栏id
    activeshop = () => {
        HttpInst.postData(NetConfig.ACTIVE_SHOP, [this.xmlId], (response: IActivityStoreInfo) => {
            if(!this.timelab) return;
            this.timelab.string = TimeUtil.getDataTime(response.endTime);
            this.activeData = response;
            DataMgr.activeShopData.setActivityData(response);
            this.shopData = DataMgr.activeShopData.sortExchange();
            this.shopView.getComponent(List).numItems = this.shopData.length;
            this.itemShow();
        })
    }

    shopItem(item: cc.Node, index: number = 0) {
        let shopItem: ActiveShopItem = item.getComponent("ActiveShopItem");
        shopItem.shopview(this.shopData, this.activeData, index, this.xmlId);
    }

    itemShow = () => {
        let shopData: IActivityJson = JsonMgr.getActivityJson(this.xmlId);
        UIUtil.loadUrlImg(shopData.url, this.bgIcon);
        let shopArr = shopData.shopItem.split(";");
        this.itemLay.node.removeAllChildren();
        for (let i = 0; i < shopArr.length; i++) {
            let item = cc.instantiate(this.itemPre);
            let itemMess: CommonSimItem = item.getComponent(CommonSimItem)
            this.itemLay.node.addChild(item);
            for (let uid = 0; uid < this.activeData.assistanceItems.length; uid++) {
                let itemId = this.activeData.assistanceItems[uid].xmlId
                if (itemId == Number(shopArr[i])) {
                    this.ownPorp = this.activeData.assistanceItems[uid].number;
                }
            }
            itemMess.updateItem(Number(shopArr[i]), this.ownPorp);
        }
    }
}

