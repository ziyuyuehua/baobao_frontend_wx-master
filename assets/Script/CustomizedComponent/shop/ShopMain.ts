import {GameComponent} from "../../core/component/GameComponent";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {JsonMgr} from "../../global/manager/JsonManager";
import {ButtonMgr} from "../common/ButtonClick";
import {CacheMap} from "../MapShow/CacheMapDataManager";
import {DataMgr, GET_ANI_TYPE} from "../../Model/DataManager";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {topUiType} from "../MainUiTopCmpt";
import {COUNTERTYPE, DotInst} from "../common/dotClient";
import shopPageView from "./shopPageView";
import List from "../../Utils/GridScrollUtil/List";
import {GuideIdType, GuideShowType, judgeSoftGuideStart} from "../../global/const/GuideConst";
import {ARROW_DIRECTION, GuideMgr} from "../common/SoftGuide";
import ShopDetail from "./ShopDetail";
import {UIMgr} from "../../global/manager/UIManager";
import dialogueView from "../common/dialogueView";
import {IShopBuyInfo} from "../../types/Response";

const {ccclass, property} = cc._decorator;

export enum TabbarType {
    DECOSHOP = 0,
    ITEM = 1,
    TREASUREBOX = 2
}

@ccclass
export default class ShopMain extends GameComponent {
    static url: string = "shop/ShopMain";

    @property(cc.ScrollView)
    private scrollNode: cc.ScrollView = null;

    @property(cc.PageView)
    private pageNode: cc.PageView = null;

    @property(cc.Prefab)
    PageViewPre: cc.Prefab = null;

    @property(cc.Node)
    private decoBtn: cc.Node = null;

    @property(cc.Node)
    private boxBtn: cc.Node = null;

    @property(cc.Node)
    private itemBtn: cc.Node = null;

    @property(cc.Node)
    private closeBtn: cc.Node = null;

    @property(cc.Node)
    private aniNode: cc.Node = null;

    @property(cc.Node)
    private softGuideNode: cc.Node = null;

    private curChose: number = 0;
    private dataJson: Array<IShopJson> = [];
    private resData = null;
    maxPage: number = 0;
    shopData: Array<IShopJson> = [];
    dataArr = [];
    curPageInx: number = 0;
    guideNode: cc.Node = null;

    onLoad() {
        this.scrollNode.content.setAnchorPoint(0.5, 1);
        this.scrollNode.node.active = true;
        this.pageNode.node.active = false;
        DataMgr.setGetAniType(GET_ANI_TYPE.SHOW_TIPS_ONLY);
        this.resData = this.node["data"][1];
        this.dispose.add(ClientEvents.UPDATE_SHOP_VIEW.on(() => {
            HttpInst.postData(NetConfig.AREADY_BUY_GOODS, [], (res:IShopBuyInfo) => {
                this.resData = res;
                DataMgr.setBuyInfo(res.buyInfo);
                this.updateView();
            });

        }));
        this.addEvent(ClientEvents.CLOSE_SHOP_GUIDE.on(() => {
            if (this.guideNode) {
                this.guideNode.active = false;
            }
        }))
        ButtonMgr.addClick(this.decoBtn, this.decoBtnHandler, null, this.decoBtnStart);
        ButtonMgr.addClick(this.itemBtn, this.itemBtnHandler, null, this.itemStart);
        ButtonMgr.addClick(this.boxBtn, this.boxBtnHandler, null, this.boxStart);
        ButtonMgr.addClick(this.closeBtn, () => {
            DataMgr.nullshopItemDataMap();
            DataMgr.setGetAniType(GET_ANI_TYPE.SHOW_ANI_AND_TIPS);
            DotInst.clientSendDot(COUNTERTYPE.bag, "10504"); //返回
            if (!CacheMap.getDecorateState()) {
                this.closeView();
            } else {
                this.closeOnly();
            }
        });
    }

    decoBtnStart = () => {
        this.decoBtn.zIndex = 3;
        this.itemBtn.zIndex = 2;
        this.boxBtn.zIndex = 2;
    }

    itemStart = () => {
        this.decoBtn.zIndex = 2;
        this.itemBtn.zIndex = 3;
        this.boxBtn.zIndex = 2;
    }

    boxStart = () => {
        this.decoBtn.zIndex = 2;
        this.itemBtn.zIndex = 2;
        this.boxBtn.zIndex = 3;
    }

    getBaseUrl() {
        return ShopMain.url;
    }

    start() {
        if (this.node["data"][0]) {
            this.curChose = this.node["data"][0];
        }
        this.updateView();
    }

    initGuide() {
        //货架
        let curSoftGuideShelf = JsonMgr.getSoftGuideJsoById(GuideIdType.shelf, 2);
        if (curSoftGuideShelf && judgeSoftGuideStart(curSoftGuideShelf)) {
            DotInst.clientSendDot(COUNTERTYPE.softGuide, "19012");
            this.showGuideHandler(curSoftGuideShelf);
            return;
        }
        //装饰
        let curSoftGuide = JsonMgr.getSoftGuideJsoById(GuideIdType.deco, 2);
        if (curSoftGuide && judgeSoftGuideStart(curSoftGuide)) {
            DotInst.clientSendDot(COUNTERTYPE.softGuide, "19005");
            this.showGuideHandler(curSoftGuide);
            return;
        }
    }

    showGuideHandler(curSoftGuideShelf) {
        this.softGuideNode.zIndex = 10;
        GuideMgr.showSoftGuide(this.softGuideNode, ARROW_DIRECTION.BOTTOM, curSoftGuideShelf.displayText, (node: cc.Node) => {
            this.guideNode = node;
        }, false, 0, false, () => {
            if (this.guideNode) {
                this.guideNode.active = false;
            }
            UIMgr.showView(ShopDetail.url, null, {itemData: this.dataJson[0], type: this.curChose});
        });
    }


    onEnable() {
        this.onShowPlay(1, this.aniNode);
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.ordinary);
    }

    onDisable(): void {
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -1);
    }

    decoBtnHandler = () => {
        if (this.curChose == TabbarType.DECOSHOP) {
            return;
        }
        this.curChose = TabbarType.DECOSHOP;
        this.updateView();
        this.toTop();
    }

    itemBtnHandler = () => {
        if (this.curChose == TabbarType.ITEM) {
            return;
        }
        this.curChose = TabbarType.ITEM;
        this.updateView();
        this.toTop();
    }

    boxBtnHandler = () => {
        if (this.curChose == TabbarType.TREASUREBOX) {
            return;
        }
        this.curChose = TabbarType.TREASUREBOX;
        this.updateView();
        this.toTop();
    }

    updateTabbar(tarBarNode: cc.Node, state) {
        let weiSprite: cc.Sprite = tarBarNode.getChildByName("weixuanzhong").getComponent(cc.Sprite);
        weiSprite.node.active = !state;
        let choseSprite: cc.Sprite = tarBarNode.getChildByName("xuanzhong").getComponent(cc.Sprite);
        choseSprite.node.active = state;
    }

    updateView() {
        if (!this.scrollNode) return;

        DotInst.clientSendDot(COUNTERTYPE.shop, "10501", this.curChose + ""); //点击页签打点
        this.dataJson = JsonMgr.getNewShopJson(this.curChose);
        // this.setpage();
        this.scrollNode.getComponent(List).numItems = Math.ceil(this.dataJson.length / 9);
        //this.pageNode.scrollToPage(this.curPageInx, 0);
        this.updateTabbar(this.decoBtn, this.curChose == TabbarType.DECOSHOP);
        this.updateTabbar(this.itemBtn, this.curChose == TabbarType.ITEM);
        this.updateTabbar(this.boxBtn, this.curChose == TabbarType.TREASUREBOX);
        if (this.guideNode) {
            this.guideNode.active = false;
        }
        if (this.curChose == TabbarType.DECOSHOP) {
            this.initGuide();
        }
    }

    toTop() {
        this.scrollNode.getComponent(List).scrollTo(0);
        // this.pageNode.setCurrentPageIndex(0);
    }

    // setpage() {
    //     this.maxPage = Math.ceil(this.dataJson.length / 9);
    //     this.dataArr = [];
    //     for (let idx in this.dataJson) {
    //         this.shopData = [];
    //         let maxNum: number = idx * 9 + 9;
    //         if (maxNum > this.dataJson.length) {
    //             maxNum = this.dataJson.length;
    //         }
    //         for (let nid = idx * 9; nid < maxNum; nid++) {
    //             this.shopData.push(this.dataJson[nid]);
    //         }
    //         this.dataArr.push(this.shopData);
    //     }
    //     this.pageNode.removeAllPages();
    //     for (let nid = 0; nid < this.maxPage; nid++) {
    //         let node = cc.instantiate(this.PageViewPre);
    //         node.getComponent(shopPageView).updateItem(this.dataArr[nid], this.curChose, this.resData);
    //         this.pageNode.addPage(node);
    //     }
    // }

    onListVRender(item: cc.Node, idx: number) {
        let shopItem: shopPageView = item.getComponent(shopPageView);
        let shopData: Array<IShopJson> = [];
        let maxNum: number = idx * 9 + 9;
        if (maxNum > this.dataJson.length) {
            maxNum = this.dataJson.length;
        }
        for (let nid = idx * 9; nid < maxNum; nid++) {
            shopData.push(this.dataJson[nid]);
        }
        shopItem.updateItem(shopData, this.curChose, this.resData);
    }

    // update(dt) {
    //     this.curPageInx = this.pageNode.getCurrentPageIndex();
    // }
}
