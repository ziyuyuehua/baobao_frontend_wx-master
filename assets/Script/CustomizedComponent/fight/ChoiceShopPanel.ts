/**
 * @author Lizhen
 * @date 2019/9/18
 * @Description:
 */
import {GameComponent} from "../../core/component/GameComponent";
import {DataMgr} from "../../Model/DataManager";
import {PostsModel} from "../../Model/staff/PostsModel";
import {UIUtil} from "../../Utils/UIUtil";
import {UIMgr} from "../../global/manager/UIManager";
import {ChoiceShopItem} from "./ChoiceShopItem";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {COUNTERTYPE, DotInst} from "../common/dotClient";
import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;

@ccclass()
export class ChoiceShopPanel extends GameComponent {
    static url: string = "Prefab/fight/ChoiceShopPanel";

    private shopData: Map<number, PostsModel> = null;
    private shopListData: Array<PostsModel> = [];
    private itemArr: Array<cc.Node> = [];

    @property(cc.Node)
    listBg: cc.Node = null;
    getBaseUrl() {
        return ChoiceShopPanel.url;
    }
    onEnable() {
        this.onShowPlay(2, this.node.getChildByName("bg"));
    }
    load() {
        this.initData();
        this.initList();
        this.createItem();
    }
    initData() {
        this.shopData = DataMgr.staffData.getPostsMap();
        DataMgr.fightViewData.shopSelect = DataMgr.staffData.getBestPostMap().marketId;
        cc.log("店铺数据", this.shopData);
    }
    initList() {
        this.shopData.forEach((value, key) => {
            this.shopListData.push(value);
        });
    }
    createItem() {
        if (this.itemArr.length == this.shopListData.length) return;
        let orderData: PostsModel = this.shopListData[this.itemArr.length];
        UIUtil.dynamicLoadPrefab(ChoiceShopItem.url, (pre: cc.Node) => {
            if(!this.itemArr) return;
            pre.parent = this.listBg;
            this.itemArr.push(pre);
            let component: ChoiceShopItem = pre.getComponent(pre.name);
            component.init(orderData, this.itemArr.length - 1, this.createItem.bind(this));
        });
    }
    closeHandler() {
        UIMgr.closeView(ChoiceShopPanel.url, true);
    }
    sureHandler() {
        DotInst.clientSendDot(COUNTERTYPE.fight, "5505", DataMgr.fightViewData.shopSelect + "");
        this.closeHandler();
        ClientEvents.START_FIGHT.emit();
    }
    unload() {
        for (let i = 0; i < this.itemArr.length; i++) {
            this.itemArr[i].removeFromParent(true);
        }
        this.itemArr = [];
    }
}
