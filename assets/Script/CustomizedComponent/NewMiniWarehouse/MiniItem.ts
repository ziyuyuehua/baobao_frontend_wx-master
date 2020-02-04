import ListItem from "../../Utils/GridScrollUtil/ListItem";
import {MiniData, MiniGuideState} from "./MiniWarehouseData";
import {DataMgr} from "../../Model/DataManager";
import {ResManager, ResMgr} from "../../global/manager/ResManager";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {IItem} from "../../types/Response";
import {CommonUtil} from "../../Utils/CommonUtil";
import {ButtonMgr} from "../common/ButtonClick";
import {ShelvesType} from "../../Model/market/ShelvesDataModle";
import {CacheMap} from "../MapShow/CacheMapDataManager";
import {UIMgr} from "../../global/manager/UIManager";
import {ARROW_DIRECTION, GuideMgr} from "../common/SoftGuide";
import {JsonMgr} from "../../global/manager/JsonManager";
import {brownColor, miniItemGreen} from "../../global/const/StringConst";

const {ccclass, property} = cc._decorator;

export enum MiniItemState {
    SALE,
    DECORATE
}

@ccclass
export default class MiniItem extends ListItem {

    @property(cc.Label)
    private count: cc.Label = null;
    @property(cc.Sprite)
    private bg: cc.Sprite = null;
    @property(cc.Label)
    private valueCount: cc.Label = null;
    @property(cc.Node)
    private redNode: cc.Node = null;
    @property(cc.Node)
    private newNode: cc.Node = null;
    @property(cc.Node)
    private canNotSale: cc.Node = null;
    @property(cc.Node)
    private addFuture: cc.Node = null;
    @property(cc.Node)
    private popularityValue: cc.Node = null;
    @property(cc.Node)
    private unique: cc.Node = null;
    @property(cc.Node)
    private downNode: cc.Node = null;
    @property(cc.Node)
    private head: cc.Node = null;

    private xmlData: IDecoShopJson = null;
    private state: MiniItemState = null;
    private data: IItem = null;
    private index: number = 0;
    private arrowNode: cc.Node = null;
    private saleState: boolean = true;
    private special: boolean = false;

    private clickTime: number = 0;
    private hasClick: boolean = false;
    private hasMove: boolean = false;
    private isLongClick: boolean = false;
    private chooseSaleCount: number = 0;

    start() {
        this._bindEvent();
    }

    getIndex() {
        return this.index;
    }

    private _bindEvent() {
        ButtonMgr.addClick(this.node, this.itemClick, this.touchMove, this.touchStart, this.resetClickEvent);
        ButtonMgr.addClick(this.downNode, this.downSaleCount);
    }

    init(index: number, state: MiniItemState) {
        this.index = index;
        this.state = state;
        this.hasMove = false;
        if (this.index === MiniData.getShowDataLen()) {
            this.addFuture.active = true;
            this.downNode.active = false;
            this.count.node.active = false;
            this.popularityValue.active = false;
            this.newNode.active = false;
            this.special = true;
            this.unique.active = false;
            this.clearArrowNode();
        } else {
            this.special = false;
            this.addFuture.active = false;
            this.count.node.active = true;
            this.data = MiniData.getShowData(index);
            this.xmlData = DataMgr.jsonDatas.decoShopJsonData[this.data.id];
            ResMgr.getItemBox2(this.bg, "b" + this.xmlData.color);
            this.count.string = "x" + this.data.num.toString();
            ResManager.getShelvesItemIcon(this.icon, this.xmlData.icon, this.xmlData.mainType);
            this.valueCount.string = this.xmlData.Popularity.toString();
            this.initRedPoint();
            this.initNewNode();
            this.initGuide();
            this.initSale();
            let data = JsonMgr.getDecoEffect(this.xmlData.id);
            this.unique.active = !!data;
        }
    }

    touchStart = () => {
        if (this.state === MiniItemState.DECORATE) {
            this.hasClick = true;
        }
    };

    touchMove = (event: cc.Event.EventTouch) => {
        if (this.state === MiniItemState.DECORATE) {
            if (Math.abs(event.getStartLocation().x - event.getLocation().x) > Math.sqrt(50) || Math.abs(event.getStartLocation().y - event.getLocation().y) > Math.sqrt(50)) {
                this.hasMove = true;
                this.resetClickEvent();
            }
        }
    };

    resetClickEvent = () => {
        this.hasClick = false;
        this.clickTime = 0;
        this.isLongClick = false;
    };

    initSale() {
        this.hideShowArrow(this.state !== MiniItemState.SALE);
        if (this.state === MiniItemState.SALE) {
            if (this.xmlData.resolveReward) {
                this.canNotSale.active = false;
                this.saleState = true;
                this.popularityValue.active = this.valueCount.node.active = this.head.active = false;
                this.checkHasSale();
            } else {
                this.canNotSale.active = true;
                this.saleState = false;
                this.changeLabelSaleState();
            }
            this.redNode.active = false;
        } else {
            this.initNormal();
            this.hideShowArrow(true);
        }
    }

    checkHasSale() {
        let data = MiniData.getSaleData(this.xmlData.id);
        if (data) {
            this.chooseSaleCount = data.count;
            this.changeToSaleLabelShowCount();
        } else {
            this.chooseSaleCount = 0;
            this.changeLabelSaleState();
        }
    }

    changeToSaleLabelShowCount() {
        this.downNode.active = true;
        this.count.string = this.chooseSaleCount + "/" + this.data.num;
        this.count.node.color = miniItemGreen;
    }

    itemClick = () => {
        if (!this.hasMove) {
            if (this.special) {
                let cb = () => {
                    UIMgr.loadaccessPathList(510007, null, true);
                };
                ClientEvents.SAVE_MAP.emit(cb, false);
            } else {
                if (!this.isLongClick || this.xmlData.mainType === ShelvesType.WallPaperShelve || this.xmlData.mainType === ShelvesType.FloorShelve) {
                    switch (this.state) {
                        case MiniItemState.DECORATE:
                            if (this.checkLand() && CacheMap.getLockedState()) {
                                UIMgr.showTipText("店铺过于拥挤，无法继续摆放！");
                            } else {
                                if (this.xmlData.mainType === ShelvesType.FeaturesShelve) {
                                    if (!CacheMap.checkIsMax()) {
                                        UIMgr.showTipText("可放置的货架已达上限，请扩建后再放置！");
                                    } else {
                                        this.addItemToMap();
                                    }
                                } else {
                                    this.addItemToMap();
                                }
                            }
                            break;
                        case MiniItemState.SALE:
                            this.saleItem();
                            break;
                    }
                }
            }
        }
        this.hasClick = false;
        this.clickTime = 0;
        this.isLongClick = false;
        this.hasMove = false;
    };

    checkLand() {
        return this.xmlData.mainType === ShelvesType.FeaturesShelve || this.xmlData.mainType === ShelvesType.GroundShelve;
    }

    addItemToMap = () => {
        if (this.newNode.active === true) {
            DataMgr.warehouseData.deleteWithMainTypeSubTypeAndId(this.xmlData.mainType, this.xmlData.subType, this.xmlData.id);
        }
        this.clearArrowNode();
        ClientEvents.REFERSH_MINIWAREHOUSE_NEW.emit();
        ClientEvents.ADD_ITEM_TO_MAP.emit(this.xmlData, CommonUtil.getNodeType(this.xmlData.mainType));
        MiniData.updateMiniItem(this.xmlData, this.index, -1);
        this.count.string = "x" + this.data.num.toString();
    };

    saleItem = () => {
        if (this.saleState) {
            if (this.chooseSaleCount < this.data.num) {
                this.chooseSaleCount++;
                MiniData.addSaleToMap(this.xmlData.id);
                this.changeToSaleLabelShowCount();
            } else {
                UIMgr.showTipText("已经全部选中");
            }
        }
    };

    downSaleCount = (event: cc.Event.EventTouch) => {
        event.stopPropagation();
        this.chooseSaleCount--;
        MiniData.addSaleToMap(this.xmlData.id, -1);
        if (this.chooseSaleCount === 0) {
            this.downNode.active = false;
            this.changeLabelSaleState();
        } else {
            cc.log(this.chooseSaleCount);
            this.count.string = this.chooseSaleCount + "/" + this.data.num;
        }
    };

    changeLabelSaleState() {
        this.downNode.active = false;
        this.count.node.color = brownColor;
        this.count.string = this.data.num.toString();
    }

    changeState(state: MiniItemState) {
        if (this.index < MiniData.getShowDataLen()) {
            this.state = state;
            this.initSale();
        }
    }

    initNormal() {
        this.saleState = true;
        this.canNotSale.active = false;
        this.chooseSaleCount = 0;
        this.downNode.active = false;
        this.count.string = "x" + this.data.num.toString();
        this.popularityValue.active = this.valueCount.node.active = this.head.active = true;
        this.count.node.color = brownColor;
        this.initRedPoint();
    }

    initRedPoint() {
        if (DataMgr.checkShowDecorateRed()) {
            this.redNode.active = this.xmlData.mainType === ShelvesType.FeaturesShelve && DataMgr.iMarket.getIsLimited();
        } else {
            this.redNode.active = false;
        }
    }

    initNewNode() {
        let data = DataMgr.warehouseData.getInitNewFutureSet();
        this.newNode.active = !!data.get(this.xmlData.id);
    }

    initGuide() {
        this.clearArrowNode();
        if (!DataMgr.getCanShowRedPoint()) {
            if (this.index === 0) {
                switch (this.xmlData.mainType) {
                    case ShelvesType.FeaturesShelve:
                        if (MiniData.getIsJump()) {
                            if (MiniData.getSaveHasShow() || MiniData.getGuideState() === MiniGuideState.DECORATE) {
                                return;
                            }
                        } else {
                            return;
                        }
                        this.initCaseGuide("摆放\n货架吧");
                        break;
                    case ShelvesType.WallShelve:
                    case ShelvesType.GroundShelve:
                        if (MiniData.getIsJump()) {
                            if (MiniData.getSaveHasShow() || MiniData.getGuideState() === MiniGuideState.CASE) {
                                return;
                            }
                        } else {
                            return;
                        }
                        this.initCaseGuide("摆放\n新装饰");
                        break;
                    default:
                        this.clearArrowNode();
                        break;
                }
            }
        }
    }

    clearArrowNode() {
        if (this.arrowNode) {
            this.arrowNode.removeFromParent();
            this.arrowNode.destroy();
            this.arrowNode = null;
        }
    }

    hideShowArrow(state: boolean) {
        if (this.arrowNode) {
            this.arrowNode.active = state;
        }
    }

    initCaseGuide(desc: string) {
        ClientEvents.HIDE_SAVE_GUIDE.emit();
        if (!this.arrowNode) {
            this.node.zIndex = 999;
            GuideMgr.showSoftGuide(this.node, ARROW_DIRECTION.LEFT, desc, (node: cc.Node) => {
                this.arrowNode = node;
            }, false, -15, false, this.itemClick);
        } else {
            this.arrowNode.active = true;
        }
    }

    showLongClickView() {
        this.hasClick = false;
        this.clickTime = 0;
        this.hasMove = false;
        UIMgr.openDetailViewAboutFuture(this.xmlData);
    }

    protected update(dt: number): void {
        if (this.hasClick && this.index !== MiniData.getShowDataLen()) {
            this.clickTime++;
            if (this.clickTime / 60 > .7) {
                this.isLongClick = true;
                this.showLongClickView();
            }
        }
    }
}
