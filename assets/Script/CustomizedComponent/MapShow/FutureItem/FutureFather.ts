import {IShelves} from "../../../types/Response";
import {DataMgr} from "../../../Model/DataManager";
import CacheMapDataManager, {CacheCaseData, CacheMap, FutureState} from "../CacheMapDataManager";
import {Area, ExpUtil} from "../Utils/ExpandUtil";
import {UIMgr} from "../../../global/manager/UIManager";
import Update from "../update/Update";
import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {ButtonMgr} from "../../common/ButtonClick";
import {MapResMgr} from "../MapResManager";
import {ShelvesType} from "../../../Model/market/ShelvesDataModle";
import {CommonUtil} from "../../../Utils/CommonUtil";
import PopularityUp from "../PopularityUp";
import SaleValueUp from "../SaleValueUp";
import {UIUtil} from "../../../Utils/UIUtil";
import {COUNTERTYPE, DotInst} from "../../common/dotClient";

const {ccclass, property} = cc._decorator;

@ccclass
export class FutureFather extends cc.Component {

    @property(cc.Sprite)
    futureSprite: cc.Sprite = null;
    @property(cc.Node)
    private popularityBg: cc.Node = null;
    @property(cc.Label)
    private popularityCount: cc.Label = null;

    xmlData: IDecoShopJson = null;
    useHeight = 0;
    useWidth = 0;
    map: cc.Node = null;
    mapManager: CacheMapDataManager = null;
    direction: boolean = false;
    state = {state: 0};
    isMove: boolean = false;
    canDown = true;
    itemPos = cc.v2();
    marketWidth: number = 0;
    marketHeight: number = 0;
    showPos: cc.Vec2 = cc.v2();
    itemInMapPos: cc.Vec2 = new cc.Vec2();
    isUp: boolean = null;
    normalArea: Area;
    specialArea: Area;

    clickTime: number = 0;
    isClick: boolean = false;
    isLongClick: boolean = false;
    nowUrl: string;
    cacheKey: number = null;
    isGroundFuture: boolean = false;
    openState: boolean = false;

    private popularityNode: cc.Node = null;
    private saleValueNode: cc.Node = null;

    start() {
    }

    bindEvents() {
        if (this.xmlData.mainType === ShelvesType.CheckoutShelve) {
            ButtonMgr.addClick(this.node, null, this.touchMoveEvent, null, null, this);
        } else {
            ButtonMgr.addClick(this.node, this.touchEndEvent, this.touchMoveEvent, this.touchStartEvent, this.touchEventCancel, this);
        }
    }

    offEvent() {
        ButtonMgr.removeClick(this.node, this);
    }

    init(item: IShelves, state: number, map: cc.Node, cb: Function = null, id: number) {
        this.map = map;
        this.cacheKey = cb ? item.id : null;
        this.state.state = state;
        this.xmlData = DataMgr.jsonDatas.decoShopJsonData[item.xmlId];
        this.useHeight = this.xmlData.acreage[1];
        this.useWidth = this.xmlData.acreage[0];
        this.direction = item.reversal;
        let leftAndRight = ExpUtil.getOutWallLeftAndRight();
        this.marketHeight = leftAndRight.right;
        this.marketWidth = leftAndRight.left;
        this.showPos = cc.v2(item.x, item.y);
        this.mapManager = CacheMap;
        this.bindEvents();
    }

    touchStartEvent() {
        if (this.state.state == FutureState.NORMAL) {
            this.openState = DataMgr.getFutureMoveOpen();
            this.xmlData.mainType != ShelvesType.CheckoutShelve && (this.isClick = true);
        }
    };

    touchMoveEvent(event: cc.Event.EventTouch) {
    }

    touchEndEvent() {
        this.isClick = false;
        this.resetLongClick();
    }

    touchEventCancel(event) {
    }

    recordItemPos() {
        this.itemPos = this.node.getPosition();
    };

    getCanDown() {
        return this.canDown;
    }

    decorateMode() {
        this.state.state = FutureState.DECORATE;
        this.futureSprite.node.opacity = 120;
        this.node.active = true;
    }

    specialMoveMode() {
        this.state.state = FutureState.SPECIAL_MOVE;
        this.futureSprite.node.opacity = 120;
        this.node.active = true;
    }

    showPopularityBubble() {
        this.popularityBg.x = -this.node.width / 2;
        this.popularityBg.scaleX = this.node.scaleX > 0 ? .7 : -.7;
        this.popularityCount.string = this.xmlData.Popularity.toString();
        this.popularityBg.active = true;
    }

    hidePopularityBubble() {
        this.popularityBg.active = false;
    }

    setResetViewPos() {
        ClientEvents.EVENT_RESET_VIEW.emit(CommonUtil.getRestView(this.node));
    }

    leaveDecorate() {
        this.state.state = FutureState.NORMAL;
        this.futureSprite.node.opacity = 255;
        this.node.active = true;
    }


    getNormalAndSpecial() {
        this.specialArea = ExpUtil.getSpecialArea();
        this.normalArea = ExpUtil.getNormalArea();
    }

    putDown() {
        let data = this.getItemMapData();
        if (!data) {
            DotInst.clientSendDot(COUNTERTYPE.decoration, "7001", this.xmlData.mainType + "", DataMgr.iMarket.getMarketId() + "", this.itemInMapPos + "");
            let nowPopularity = CacheMap.getTruePopularity();
            CacheMap.addTruePopularity(this.xmlData.Popularity);
            this.upAni(nowPopularity);
        }
    }

    upAni(nowPopularity: number) {
        let maxPopularity = DataMgr.iMarket.getMaxPopularity();
        if (!CacheMap.getLockedState() && nowPopularity <= maxPopularity && this.xmlData.Popularity > 0) {
            UIUtil.dynamicLoadPrefab(PopularityUp.url, (node: cc.Node) => {
                this.node.addChild(node);
                this.popularityNode = node;
                let script = node.getComponent(PopularityUp);
                script.init(this.node, () => {
                    this.showAni();
                    this.popularityNode = null;
                });
            });
        }
    }

    showAni = () => {
        UIUtil.dynamicLoadPrefab(SaleValueUp.url, (node: cc.Node) => {
            this.node.addChild(node);
            this.saleValueNode = node;
            let script = node.getComponent(SaleValueUp);
            script.init(this.node, () => {
                this.saleValueNode = null;
            });
        });
    };

    removeItem() {
    }

    addItem = (canshu: IShelves, mapState: number, map: cc.Node) => {
    };

    scaleToAni = () => {
        let ani = cc.sequence(cc.scaleTo(0.1, 1, 0.85), cc.scaleTo(0.1, 1));
        this.futureSprite.node.runAction(ani);
    };

    getShowPosKey(): number {
        return 1;
    }

    chooseItem = () => {
        let data = this.mapManager.getDataFromMap(this.getShowPosKey());
        if (!data) {
            cc.log(">>> data is lost!!!");
            return;
        }
        let node: cc.Node = UIMgr.getView(Update.url);
        if (node) {
            node.getComponent(Update).setData(data);
            return;
        }
        UIMgr.showView(Update.url, null, null, (upGoodsOrLevelNode: cc.Node) => {
            setTimeout(() => {
                upGoodsOrLevelNode.getComponent(Update).setData(data);
            }, 32);
        }, false, 1001);
    };

    upToChangePosition() {
        UIMgr.hideAllPopularityBubble();
    };

    setCachePos() {
    }

    collapsItem = () => {
    };

    removeFromCloseGrid = () => {
    };

    longClickEvent = () => {

    };

    getIsLongClick() {
        return this.isLongClick;
    }

    resetLongClick() {
        this.isLongClick = false;
        this.clickTime = 0;
    }

    upFuture = () => {
        CacheMap.changeToSpecialMove();
        this.upToChangePosition();
    };

    protected update(dt: number): void {
        if (this.xmlData && this.xmlData.mainType !== ShelvesType.CheckoutShelve && this.openState) {
            if (this.isClick && !this.isMove) {
                if (this.clickTime <= 30) {
                    this.clickTime++;
                    this.isLongClick = true;
                } else {
                    this.isClick = false;
                    ClientEvents.EVENT_HIDE_MENUS.emit();
                    this.upFuture();
                }
            }
        }
    }

    setNowUrl(url: string, isInit: boolean) {
        !isInit && MapResMgr.releaseAssets(this.nowUrl);
        this.nowUrl = url;
    }

    backToPool(isChangeMarket: boolean = false) {
        let data = this.getItemMapData();
        CacheMap.isBackCase(this.xmlData.mainType);
        if (data) {
            CacheMap.addTruePopularity(-this.xmlData.Popularity);
        }
        if (this.isGroundFuture && data) {
            CacheMap.addUseGrid(this.xmlData, true, isChangeMarket);
        }
        this.specialArea = null;
        this.setNowUrl(null, false);
        this.mapManager.checkBackIsChosen(this);
        this.itemInMapPos = null;
        this.itemPos = null;
        this.isUp = false;
        this.futureSprite.node.opacity = 255;
        this.futureSprite.spriteFrame = null;
        if (this.node.scaleX === -1) {
            this.node.scaleX = 1;
            this.direction = !this.direction;
        }
        if (this.saleValueNode) {
            this.saleValueNode.destroy();
            this.saleValueNode = null;
        }
        if (this.popularityNode) {
            this.popularityNode.destroy();
            this.popularityNode = null;
        }
        this.node.removeFromParent(false);
        this.offEvent();
    }

    getItemMapData(): CacheCaseData {
        return null;
    }

    getNowShowPos() {
    }

    getCacheData() {
    }

    showUpAni() {
        CacheMap.initLimitGridData();
        let nowPopularity = CacheMap.getTruePopularity();
        CacheMap.addTruePopularity(this.xmlData.Popularity);
        this.upAni(nowPopularity);
    }
}
