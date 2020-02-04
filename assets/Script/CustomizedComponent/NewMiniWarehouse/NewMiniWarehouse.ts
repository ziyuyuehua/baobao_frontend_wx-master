/**
 *@Athuor ljx
 *@Date 15:13
 */
import List from "../../Utils/GridScrollUtil/List";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {MiniData, MiniGuideState, MiniWareChooseType} from "./MiniWarehouseData";
import MiniItem, {MiniItemState} from "./MiniItem";
import {DataMgr} from "../../Model/DataManager";
import {CacheMap} from "../MapShow/CacheMapDataManager";
import {UIMgr} from "../../global/manager/UIManager";
import {GameComponent} from "../../core/component/GameComponent";
import {ButtonMgr} from "../common/ButtonClick";
import {ShelvesType} from "../../Model/market/ShelvesDataModle";
import {IMarketModel} from "../../Model/market/MarketDataMoudle";
import {TextTipConst} from "../../global/const/TextTipConst";
import MarketState from "./MarketState";
import {ARROW_DIRECTION, GuideMgr} from "../common/SoftGuide";
import {JumpConst} from "../../global/const/JumpConst";
import {COUNTERTYPE, DotInst} from "../common/dotClient";
import ResolveCommonNode, {ResolveData, ResolveState} from "./ResolveCommonNode";
import {brownColor} from "../../global/const/StringConst";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewMiniWarehouse extends GameComponent {

    static url = "miniWarehouse/decoration";

    @property(cc.Label)
    //已摆放货架数量
    private count: cc.Label = null;
    @property(cc.ProgressBar)
    private popularityProgress: cc.ProgressBar = null;
    @property(cc.Label)
    private progressLabel: cc.Label = null;
    @property(cc.Node)
    private setCaseCountBg: cc.Node = null;
    @property(cc.Node)
    private showPopularity: cc.Node = null;
    @property(List)
    private itemScroll: List = null;
    @property(cc.Node)
    private middle: cc.Node = null;
    @property(cc.Node)
    private case: cc.Node = null;
    @property(cc.Node)
    private decorate: cc.Node = null;
    @property(cc.Node)
    private floorAndWallPaper: cc.Node = null;
    @property(cc.Node)
    private shelfScroll: cc.Node = null;
    @property(cc.Node)
    private decorateChoose: cc.Node = null;
    @property(cc.Node)
    private floorAndWallpaperChoose: cc.Node = null;
    @property(cc.Node)
    private openScrollBtn: cc.Node = null;
    @property(cc.Node)
    private close: cc.Node = null;
    @property(cc.Node)
    private bottom: cc.Node = null;
    @property(cc.Node)
    private saleFuture: cc.Node = null;
    @property(cc.Node)
    private backDecorate: cc.Node = null;
    @property(cc.Node)
    private shelfChooseArr: cc.Node[] = [];
    @property(cc.Node)
    private decorateChooseArr: cc.Node[] = [];
    @property(cc.Node)
    private floorAndWallPaperArr: cc.Node[] = [];
    @property(cc.Node)
    private fatherChooseLabel: cc.Node = null;
    @property(cc.ScrollView)
    private bottomScroll: cc.ScrollView = null;

    //这里开始是2号滑动视图的节点内容
    @property(cc.Node)
    private bottom2: cc.Node = null;
    @property(List)
    private itemScroll2: List = null;
    @property(cc.Node)
    private case2: cc.Node = null;
    @property(cc.Node)
    private decorate2: cc.Node = null;
    @property(cc.Node)
    private floorAndWallPaper2: cc.Node = null;
    @property(cc.Node)
    private shelfScroll2: cc.Node = null;
    @property(cc.Node)
    private decorateChoose2: cc.Node = null;
    @property(cc.Node)
    private floorAndWallpaperChoose2: cc.Node = null;
    @property(cc.Node)
    private openScrollBtn2: cc.Node = null;
    @property(cc.Node)
    private middle2: cc.Node = null;
    @property(cc.Node)
    private shelfChooseArr2: cc.Node[] = [];
    @property(cc.Node)
    private decorateChooseArr2: cc.Node[] = [];
    @property(cc.Node)
    private floorAndWallPaperArr2: cc.Node[] = [];
    @property(cc.ScrollView)
    private bottomScroll2: cc.ScrollView = null;
    @property(cc.Node)
    private mask: cc.Node = null;

    @property(cc.SpriteFrame)
    private clickSprite: cc.SpriteFrame[] = [];
    @property(cc.SpriteFrame)
    private backSprite: cc.SpriteFrame = null;

    @property(cc.Node)
    private limitNode: cc.Node = null;
    @property(cc.Label)
    private limitLabel: cc.Label = null;
    @property(cc.Node)
    private backDeco: cc.Node = null;

    private miniState: MiniItemState = MiniItemState.DECORATE;
    private showScroll: cc.Node = null;
    private isHide: boolean = true;

    private saveBubble: cc.Node = null;
    private decorateBubble: cc.Node = null;
    private decorateBubble2: cc.Node = null;
    private aniTime: number = 0;
    private scrollHasInit = false;
    private bottom2HasInit = false;
    private hasInit: boolean = false;
    private closeHasClick: boolean = false;
    private hasChangeState: boolean = false;

    static ShelfChooseArrSubType: Array<number> = [
        0,
        101,
        102,
        103,
        104,
        105
    ];

    static DecorateArrMainType: Array<number> = [
        0,
        ShelvesType.GroundShelve,
        ShelvesType.WallShelve
    ];

    static FloorAndWallPaperMainType: Array<number> = [
        0,
        ShelvesType.FloorShelve,
        ShelvesType.WallPaperShelve
    ];

    init = (jumpId: number, isOpen: boolean) => {
        if (jumpId === JumpConst.DECORATE_DISMANTLING && !this.isHide) {
            return;
        }
        isOpen && CacheMap.changeToDecorate();
        MiniData.setClickCb();
        MiniData.initState();
        this.showScroll = this.bottom;
        this._bindEvent();
        this._addListener();
        let isJump = jumpId >= 0;
        if (!isJump) {
            this.nothingDo();
        }
        MiniData.setIsJump(isJump);
        if (jumpId === JumpConst.DECORATE_DECORATE) {
            if (!DataMgr.getCanShowRedPoint() && DataMgr.warehouseData.getDecorationDataVO(1).size > 0) {
                this.initChooseStateAndShow(MiniWareChooseType.SHELF, this.case, this.case2, this.shelfChooseArr, this.shelfChooseArr2, this.case.getSiblingIndex(), MiniGuideState.DECORATE);
                this.loadGuideForDecorate();
            } else {
                this.initChooseStateAndShow(MiniWareChooseType.DECORATE, this.decorate, this.decorate2, this.decorateChooseArr, this.decorateChooseArr2, this.decorate.getSiblingIndex(), MiniGuideState.DECORATE);
            }
        } else {
            MiniData.setGuideState(MiniGuideState.CASE);
            this.initChooseStateAndShow(MiniWareChooseType.SHELF, this.case, this.case2, this.shelfChooseArr, this.shelfChooseArr2, this.case.getSiblingIndex(), MiniGuideState.CASE);
        }
        this.chooseNodeBindEvent();
        CacheMap.getShelfCount();
        this.initCountAndValue();
        this.initState();
        this.initMiniWarehouNew(true);
    };

    loadGuideForDecorate() {
        if (!DataMgr.getCanShowRedPoint()) {
            GuideMgr.showSoftGuide(this.decorate, ARROW_DIRECTION.BOTTOM, "选择\n装饰栏", (node: cc.Node) => {
                this.decorateBubble = node;
            }, false, 0, false, this.changeToChooseMode);
            GuideMgr.showSoftGuide(this.decorate2, ARROW_DIRECTION.BOTTOM, "选择\n装饰栏", (node: cc.Node) => {
                this.decorateBubble2 = node;
            }, false, 0, false, this.changeToChooseMode);
        }
    }

    initMiniWarehouNew = (isInit: boolean = false) => {
        this.initShowNew();
        this.initChooseShowNew();
        this.initOtherChooseNew(this.decorateChooseArr, this.decorateChooseArr2, [0, ShelvesType.GroundShelve, ShelvesType.WallShelve]);
        this.initOtherChooseNew(this.floorAndWallPaperArr, this.floorAndWallPaperArr2, [0, ShelvesType.FloorShelve, ShelvesType.WallPaperShelve]);
        !isInit && this.setListItemNum();
    };

    private _bindEvent() {
        ButtonMgr.addClick(this.close, this.closeCurView);
        ButtonMgr.addClick(this.showPopularity, this.goToShop);
        ButtonMgr.addClick(this.case, this.changeToChooseMode);
        ButtonMgr.addClick(this.case2, this.changeToChooseMode);
        ButtonMgr.addClick(this.decorate, this.changeToChooseMode);
        ButtonMgr.addClick(this.decorate2, this.changeToChooseMode);
        ButtonMgr.addClick(this.floorAndWallPaper, this.changeToChooseMode);
        ButtonMgr.addClick(this.floorAndWallPaper2, this.changeToChooseMode);
        ButtonMgr.addClick(this.openScrollBtn, this.resetScrollSize);
        ButtonMgr.addClick(this.openScrollBtn2, this.resetScrollSize);
        ButtonMgr.addClick(this.saleFuture, this.changeToSaleState);
        ButtonMgr.addClick(this.backDecorate, this.sureResolve);
        ButtonMgr.addClick(this.backDeco, this.changeToDecorateState);
        ButtonMgr.addClick(this.limitNode, this.openMsgTip);
    }

    saleFutureModeInit = () => {
        if (this.miniState !== MiniItemState.SALE) {
            if (this.getNowShowBoolean()) {
                this.resetScrollSize();
            }
            this.changeToSaleState();
        }
    };

    openMsgTip = () => {
        UIMgr.showView(MarketState.url);
    };

    openHelpTip = () => {
        UIMgr.showTextTip(TextTipConst.FosterCareTip);
    };

    initCountAndValue() {
        let iMarket = DataMgr.iMarket;
        let maxCount = NewMiniWarehouse.getMaxCount(iMarket);
        let maxValue = iMarket.getMaxPopularity();
        let nowValue = CacheMap.getNowPopularity();
        this.count.string = CacheMap.getCaseCount() + "/" + maxCount;
        this.progressLabel.string = nowValue + "/" + maxValue;
        this.popularityProgress.progress = nowValue / maxValue;
    }

    static getMaxCount(iMarket: IMarketModel) {
        let expandTime = iMarket.getExFrequency();
        let sceneJson: ISceneJson = DataMgr.jsonDatas.sceneJsonData[expandTime];
        return sceneJson.putShelves;
    }

    resetCountAndValue = () => {
        this.initCountAndValue();
        this.initState();
    };

    initChooseStateAndShow(type: MiniWareChooseType, chooseNode: cc.Node, chooseNode2: cc.Node, chooseArr: cc.Node[], chooseArr2, zIndex: number, guideState?: MiniGuideState) {
        let active = this.getNowShowBoolean();
        let chooseData = active ? MiniData.getChooseState() : MiniData.getChooseState2();
        let node = active ? chooseNode : chooseNode2;
        if (chooseData && node == chooseData.node) {
            return;
        }
        guideState && MiniData.setGuideState(guideState);
        let state1 = NewMiniWarehouse.getMiniMainType(type, chooseNode, zIndex);
        let state2 = NewMiniWarehouse.getMiniMainType(type, chooseNode2, zIndex);
        MiniData.setChooseState(state1, state2, this.backSprite, this.clickSprite[zIndex]);
        this.middle.zIndex = 3;
        this.middle2.zIndex = 3;
        MiniData.setShowData({
            type: NewMiniWarehouse.ShelfChooseArrSubType[0],
            node: chooseArr[0]
        }, {type: NewMiniWarehouse.ShelfChooseArrSubType[0], node: chooseArr2[0]});
        this.showChooses();
        this.scrollHasInit && this.setListItemNum();
    }

    initShowNew = () => {
        let result1 = MiniData.checkHasNew(MiniWareChooseType.SHELF);
        this.showChooseNodeNew(this.case, result1);
        this.showChooseNodeNew(this.case2, result1);
        let result2 = MiniData.checkHasNew(MiniWareChooseType.DECORATE);
        this.showChooseNodeNew(this.decorate, result2);
        this.showChooseNodeNew(this.decorate2, result2);
        let result3 = MiniData.checkHasNew(MiniWareChooseType.FLOOR_AND_WALLPAPER);
        this.showChooseNodeNew(this.floorAndWallPaper, result3);
        this.showChooseNodeNew(this.floorAndWallPaper2, result3);
    };

    initChooseShowNew() {
        this.shelfChooseArr.forEach((value, index) => {
            if (index > 0) {
                let subType = NewMiniWarehouse.ShelfChooseArrSubType[index];
                let result = DataMgr.warehouseData.checkCase(subType);
                this.showChooseNodeNew(value, result);
                this.showChooseNodeNew(this.shelfChooseArr2[index], result);
            }
        });
    }

    initOtherChooseNew(arr1: cc.Node[], arr2: cc.Node[], type: ShelvesType[]) {
        arr1.forEach((value, key) => {
            if (key > 0) {
                let mainType = type[key];
                let result = DataMgr.warehouseData.checkHasWithMainType(mainType);
                this.showChooseNodeNew(value, result);
                this.showChooseNodeNew(arr2[key], result);
            }
        });
    }

    showChooseNodeNew(node: cc.Node, result: boolean) {
        let child = node.getChildByName("new");
        child.active = result;
    }

    static getMiniMainType(type: MiniWareChooseType, node: cc.Node, zIndex: number) {
        return {type: type, node: node, zIndex: zIndex};
    }

    changeToChooseMode = (event: cc.Event.EventTouch) => {
        let active = this.getNowShowBoolean();
        let node = event ? event.getCurrentTarget() : (active ? this.decorate : this.decorate2);
        switch (node) {
            case active ? this.case : this.case2:
                DotInst.clientSendDot(COUNTERTYPE.decoration, "7005");
                this.initChooseStateAndShow(MiniWareChooseType.SHELF, this.case, this.case2, this.shelfChooseArr, this.shelfChooseArr2, 2, MiniGuideState.CASE);
                ClientEvents.EVENT_LEAVE_FLOORMODE.emit();
                break;
            case active ? this.decorate : this.decorate2:
                DotInst.clientSendDot(COUNTERTYPE.decoration, "7005");
                this.initChooseStateAndShow(MiniWareChooseType.DECORATE, this.decorate, this.decorate2, this.decorateChooseArr, this.decorateChooseArr2, 1, MiniGuideState.DECORATE);
                ClientEvents.EVENT_LEAVE_FLOORMODE.emit();
                break;
            case active ? this.floorAndWallPaper : this.floorAndWallPaper2:
                this.decorate.zIndex = 1;
                this.decorate2.zIndex = 1;
                DotInst.clientSendDot(COUNTERTYPE.decoration, "7006");
                this.initChooseStateAndShow(MiniWareChooseType.FLOOR_AND_WALLPAPER, this.floorAndWallPaper, this.floorAndWallPaper2, this.floorAndWallPaperArr, this.floorAndWallPaperArr2, 0);
                ClientEvents.EVENT_FLOORMODE.emit();
                break;
        }
    };

    chooseNodeBindEvent() {
        this._arrayBindEvent(this.shelfChooseArr);
        this._arrayBindEvent(this.decorateChooseArr);
        this._arrayBindEvent(this.floorAndWallPaperArr);
        this._arrayBindEvent(this.shelfChooseArr2);
        this._arrayBindEvent(this.decorateChooseArr2);
        this._arrayBindEvent(this.floorAndWallPaperArr2);
    }

    _arrayBindEvent(arr: Array<cc.Node>) {
        arr.forEach((value) => {
            ButtonMgr.addClick(value, this.chooseNodeEvent);
        });
    }

    chooseNodeEvent = (event: cc.Event.EventTouch) => {
        let node = event.getCurrentTarget();
        let index = node.getSiblingIndex();
        DotInst.clientSendDot(COUNTERTYPE.decoration, "7007", index.toString());
        let typeArr = this.getTypeArr();
        MiniData.setShowData({type: typeArr.type[index], node: typeArr.node1[index]}, {
            type: typeArr.type[index],
            node: typeArr.node2[index]
        });
        this.scrollHasInit && this.setListItemNum();
    };

    _addListener() {
        this.dispose.add(ClientEvents.HIDE_WAREHOUSE.on(this.hideWare));
        this.dispose.add(ClientEvents.REFRESH_MINIWAREHOUSE.on(this.setListItemNum));
        this.dispose.add(ClientEvents.BACK_TO_MINI_WARE.on(this.backItemToMiniWarehouse));
        this.dispose.add(ClientEvents.REFRESH_COUNT_AND_VALUE.on(this.resetCountAndValue));
        this.dispose.add(ClientEvents.RESET_LIMIT_WARN.on(this.initState));
        this.dispose.add(ClientEvents.REFRESH_NEWSTATE.on(this.initShowNew));
        this.dispose.add(ClientEvents.REFERSH_MINIWAREHOUSE_NEW.on(this.initMiniWarehouNew));
        this.dispose.add(ClientEvents.SHOW_SAVE_GUIDE.on(this.showSaveGuide));
        this.dispose.add(ClientEvents.HIDE_SAVE_GUIDE.on(this.hideSaveGuide));
        this.dispose.add(ClientEvents.FOCUS_SAVE.on(this.closeCurView));
    }

    hideWare = (isHide: boolean) => {
        this.popularityProgress.node.active = !isHide;
        this.fatherChooseLabel.active = !isHide;
        this.setCaseCountBg.active = !isHide;
        this.showScroll.active = !isHide;
        if(!this.hasInit && !isHide) {
            this.scrollAni(false, null);
        }
    };

    showSaveGuide = () => {
        if (!this.saveBubble) {
            GuideMgr.showSoftGuide(this.close, ARROW_DIRECTION.RIGHT, "回去咯～", (node: cc.Node) => {
                this.saveBubble = node;
            }, false, 0, false, this.closeCurView);
        } else {
            this.saveBubble.active = true;
        }
    };

    hideSaveGuide = () => {
        this.clearAllNode();
    };

    clearAllNode() {
        if (this.saveBubble) {
            MiniData.setSaveHasShow(false);
            this.saveBubble.destroy();
            this.saveBubble = null;
        }
        if (this.decorateBubble && this.decorateBubble2) {
            this.decorateBubble.destroy();
            this.decorateBubble2.destroy();
            this.decorateBubble = null;
            this.decorateBubble2 = null;
        }
    }

    backItemToMiniWarehouse = (xmlData: IDecoShopJson, count: number = 1) => {
        MiniData.backItemToMiniWare(xmlData, count);
    };

    hideScroll = (isHide: boolean) => {
        if (!this.isHide) {
            this.scrollAni(isHide);
        }
    };

    scrollAni = (isHide: boolean = true, cb: Function = null) => {
        if (cb) {
            if (!this.hasInit) {
                this.scrollBottom(isHide, cb);
            } else {
                cb && cb();
            }
        } else {
            this.scrollBottom(isHide, null);
        }
    };

    scrollBottom = (isHide: boolean, cb: Function) => {
        if (this.aniTime === 0) {
            this.hasInit = true;
            this.aniTime++;
            this.isHide = isHide;
            let offset = this.getOffsetY();
            this.doAni(!this.isHide ? -320 : 320, this.popularityProgress.node);
            this.doAni(!this.isHide ? offset : -offset, this.fatherChooseLabel);
            this.doAni(!this.isHide ? offset : -offset, this.setCaseCountBg);
            this.doAni(!this.isHide ? offset : -offset, this.showScroll, () => {
                cb && cb();
                this.aniTime = 0;
                if (!this.scrollHasInit) {
                    this.setListItemNum();
                    this.scrollHasInit = true;
                }
            });
        }
    };

    getTypeArr() {
        switch (MiniData.getChooseState().type) {
            case MiniWareChooseType.SHELF:
                return {
                    type: NewMiniWarehouse.ShelfChooseArrSubType,
                    node1: this.shelfChooseArr,
                    node2: this.shelfChooseArr2
                };
            case MiniWareChooseType.DECORATE:
                return {
                    type: NewMiniWarehouse.DecorateArrMainType,
                    node1: this.decorateChooseArr,
                    node2: this.decorateChooseArr2
                };
            case MiniWareChooseType.FLOOR_AND_WALLPAPER:
                return {
                    type: NewMiniWarehouse.FloorAndWallPaperMainType,
                    node1: this.floorAndWallPaperArr,
                    node2: this.floorAndWallPaperArr2
                };
        }
    }

    showChooses() {
        let miniChooseState = MiniData.getChooseState().type;
        this.shelfScroll.active = miniChooseState == MiniWareChooseType.SHELF;
        this.decorateChoose.active = miniChooseState == MiniWareChooseType.DECORATE;
        this.floorAndWallpaperChoose.active = miniChooseState == MiniWareChooseType.FLOOR_AND_WALLPAPER;
        this.shelfScroll2.active = miniChooseState == MiniWareChooseType.SHELF;
        this.decorateChoose2.active = miniChooseState == MiniWareChooseType.DECORATE;
        this.floorAndWallpaperChoose2.active = miniChooseState == MiniWareChooseType.FLOOR_AND_WALLPAPER;
    }

    closeCurView = () => {
        if (this.closeHasClick) {
            return;
        }
        this.closeHasClick = true;
        let cb = () => {
            MiniData.clearSaleMap();
            this.hasInit = false;
            this.closeView();
            ClientEvents.EVENT_SHOW_MENUS.emit();
        };
        let errCb = () => {
            this.closeHasClick = false;
        };
        ClientEvents.SAVE_MAP.emit(cb, true, errCb, errCb);
    };

    goToShop = () => {
        let res = CacheMap.getPopularityBubbleState();
        if (!res) {
            CacheMap.setPopularityBubbleState(true);
            CacheMap.showAllPopularityBubble();
        } else {
            CacheMap.setPopularityBubbleState(false);
            CacheMap.hideAllPopularityBubble();
        }
    };

    setListItemNum = () => {
        this.itemScroll._stopAutoScroll();
        this.itemScroll2._stopAutoScroll();
        this.itemScroll.numItems = MiniData.getAllDataLength() + 1;
        this.bottom2HasInit && (this.itemScroll2.numItems = MiniData.getShowDataLen() + 1);
    };

    renderItem(item: cc.Node, index: number) {
        let script: MiniItem = item.getComponent("MiniItem");
        script.init(index, this.miniState);
    }

    getOffsetY() {
        return this.getNowShowBoolean() ? 588 : 1073;
    }

    getNowShowBoolean() {
        return this.showScroll === this.bottom;
    }

    doAni = (offsetY: number, node: cc.Node, cb: Function = null) => {
        let moveFun = cc.moveBy(0.2, 0, offsetY);
        node.runAction(cc.sequence(moveFun, cc.callFunc(() => {
            cb && cb();
        })))
    };

    resetScrollSize = () => {
        let delta = this.getDeltaOfOneTow();
        let active = this.getNowShowBoolean();
        active ? this.bottomScroll.stopAutoScroll() : this.bottomScroll2.stopAutoScroll();
        if (this.showScroll === this.bottom) {
            this.bottom2.active = true;
            this.bottom2.y += 588;
            this.bottom.y -= 588;
            this.showScroll = this.bottom2;
            this.bottom2.runAction(cc.moveBy(0.25, 0, delta));
            this.fatherChooseLabel.runAction(cc.moveBy(0.25, 0, delta));
            this.setCaseCountBg.runAction(cc.sequence(cc.moveBy(0.25, 0, delta), cc.callFunc(() => {
                this.resetBottom2();
            })));
            this.bottom.active = false;
        } else {
            this.bottom2.runAction(cc.sequence(cc.moveBy(0.25, 0, -delta), cc.callFunc(() => {
                if (this.miniState === MiniItemState.SALE) {
                    this.changeToDecorateState(false);
                }
                this.resetBottom();
                this.bottom.active = true;
                this.bottom.y += 588;
                this.bottom2.y -= 588;
                this.showScroll = this.bottom;
                this.bottom2.active = false;
            })));
            this.setCaseCountBg.runAction(cc.moveBy(0.25, 0, -delta));
            this.fatherChooseLabel.runAction(cc.moveBy(0.25, 0, -delta));
        }
    };

    resetBottom2() {
        if (!this.bottom2HasInit) {
            this.bottom2HasInit = true;
            this.itemScroll2.numItems = MiniData.getShowDataLen() + 1;
        }
        let offset = this.bottomScroll.getScrollOffset();
        if (!offset.equals(cc.v2(0, 0))) {
            this.bottomScroll2.scrollToOffset(offset, 0.1);
        }
    }

    resetBottom() {
        let height = this.bottomScroll2.content.height;
        if (height <= this.itemScroll.node.height) {
            return;
        } else {
            this.bottomScroll.scrollToOffset(this.bottomScroll2.getScrollOffset(), 0.1);
        }
    }

    getDeltaOfOneTow() {
        return this.bottom2.height - this.bottom.height;
    }

    changeToSaleState = () => {
        if (this.hasChangeState) {
            return;
        }
        this.hasChangeState = true;
        let cb = () => {
            this.hasChangeState = false;
            this.mask.active = true;
            this.mask.runAction(cc.fadeTo(.2, 150));
            this.miniState = MiniItemState.SALE;
            this.changeItemState();
            this.backAni(this.saleFuture);
            this.showAni(this.backDecorate);
            this.showAni(this.backDeco);
        };
        let errCb = () => {
            this.hasChangeState = false;
        };
        this.bottomScroll2.cancelInnerEvents = true;
        ClientEvents.SAVE_MAP.emit(cb, false, errCb, errCb);
    };

    changeItemState() {
        let content2 = this.bottomScroll2.content.children;
        this.changeState(content2);
    }

    changeToDecorateState = (doHide: boolean = true) => {
        this.miniState = MiniItemState.DECORATE;
        MiniData.clearSaleMap();
        this.changeItemState();
        this.mask.runAction(cc.sequence(cc.fadeOut(.2), cc.callFunc(() => {
            this.mask.active = false;
        })));
        this.bottomScroll2.cancelInnerEvents = false;
        if (doHide) {
            this.doAniHide();
        } else {
            this.resetPosHide();
        }
    };

    resetPosHide() {
        this.backDecorate.active = false;
        this.backDeco.active = false;
        this.saleFuture.active = true;
        this.backDeco.x += 187;
        this.backDecorate.x += 187;
        this.saleFuture.x -= 187;
    }

    doAniHide() {
        this.backAni(this.backDecorate);
        this.backAni(this.backDeco);
        this.showAni(this.saleFuture);
    }

    sureResolve = () => {
        if (MiniData.getSaleSize()) {
            UIMgr.showView(ResolveCommonNode.url, null, null, (node: cc.Node) => {
                let script = node.getComponent(ResolveCommonNode);
                script.init(MiniData.getSaleArr(), MiniData.getResolveGetDataArr(), "确认回收", "被回收的家具将会被从仓库中扣除", "包含5星", this.setCountLabel, this.changeToDecorateState);
                script.setResolveState(ResolveState.Future);
            });
        } else {
            UIMgr.showTipText("您还未选择需要分解的家具!");
        }
    };

    setCountLabel = (data: ResolveData, fatherNode: cc.Node) => {
        let node = new cc.Node();
        let label = node.addComponent(cc.Label);
        label.string = data.count.toString();
        label.fontSize = 22;
        node.color = brownColor;
        fatherNode.addChild(node);
        node.setPosition(0, -11);
    };

    changeState(nodeArr: cc.Node[]) {
        nodeArr.forEach((value) => {
            value.getComponent(MiniItem).changeState(this.miniState);
        });
    }

    backAni(node: cc.Node) {
        node.runAction(cc.sequence(cc.moveBy(.2, 187, 0).easing(cc.easeCubicActionOut()),
            cc.callFunc(() => {
                node.active = false;
            })));
    }

    showAni(node: cc.Node) {
        node.active = true;
        node.runAction(cc.moveBy(.2, -187, 0).easing(cc.easeCubicActionIn()));
    }

    initState = () => {
        let state = CacheMap.getLockedState();
        let percent = (Math.floor(CacheMap.getPercent() * 100)).toString();
        this.limitNode.active = state;
        this.limitLabel.node.active = state;
        this.limitLabel.string = percent.toString();
    };

    nothingDo() {
        if (!DataMgr.checkBackShowGuide() && !DataMgr.checkInPowerGuide()) {
            this.schedule(() => {
                let result = MiniData.noThingDoAdd();
                if (result) {
                    this.showSaveGuide();
                } else if (this.saveBubble && this.saveBubble.active) {
                    this.hideSaveArrow();
                }
            }, .5);
        }
    }

    hideSaveArrow = () => {
        this.saveBubble.active = false;
        MiniData.resetNoThingDo();
    };

    unload(): void {
        MiniData.clearData();
    }

    protected onDestroy() {
        MiniData.clearCb();
        super.onDestroy();
    }

    protected getBaseUrl(): string {
        return NewMiniWarehouse.url;
    }

    onEnable(): void {
        DataMgr.UiTop = false;
    }

    onDisable(): void {
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -1);
    }
}