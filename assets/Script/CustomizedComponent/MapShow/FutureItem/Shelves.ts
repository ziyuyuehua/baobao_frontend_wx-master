/**
 *@Athuor ljx
 *@Date 11:45
 */
import { FutureFather } from "./FutureFather";
import { IShelves } from "../../../types/Response";
import { CacheCaseData, CacheMap, FutureState, NodeType } from "../CacheMapDataManager";
import { CoordinateTranslate } from "../../../Utils/CoordinateTranslate";
import { JsonMgr } from "../../../global/manager/JsonManager";
import { DataMgr } from "../../../Model/DataManager";
import { ResMgr } from "../../../global/manager/ResManager";
import { Vertex } from "../../../global/const/StringConst";
import { ClientEvents } from "../../../global/manager/ClientEventCenter";
import { UIMgr } from "../../../global/manager/UIManager";
import { ChangePosition } from "../Utils/changeTrueOrUse";
import { ShelvesType } from "../../../Model/market/ShelvesDataModle";
import ShelvesBubble from "./ShelvesBubble";
import { CommonUtil } from "../../../Utils/CommonUtil";
import { MapMgr } from "../MapInit/MapManager";
import { DotInst, COUNTERTYPE } from "../../common/dotClient";

const { ccclass, property } = cc._decorator;

@ccclass

export default class Shelves extends FutureFather {

    @property(cc.Prefab)
    private highlightPrefab: cc.Prefab = null;
    @property(cc.SpriteFrame)
    private redSprite: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    private greenSprite: cc.SpriteFrame = null;
    @property(cc.Sprite)
    private bubble: cc.Sprite = null;

    private highlightArray = new Array<cc.Node>();
    private influenceArray = new Array<cc.Node>();
    private influenceSurface = 0;
    private isCase = false;
    private rotaCachePos = null;
    private bubbleScript: ShelvesBubble;

    start() {
        this.isGroundFuture = true;
    }

    checkoutCanNotDo() {
        return this.xmlData.mainType == ShelvesType.CheckoutShelve;
    }

    touchStartEvent = () => {
        super.touchStartEvent();
    };

    touchMoveEvent = (event: cc.Event.EventTouch) => {
        switch (this.state.state) {
            case FutureState.NORMAL:
            case FutureState.ACCESS:
                this.isMove = UIMgr.moveOverried(event);
                break;
            case FutureState.DECORATE:
            case FutureState.SPECIAL_MOVE:
                if (this.isUp) {
                    this.moveShelf(event);
                } else {
                    this.isMove = UIMgr.moveOverried(event);
                }
                break;
        }
    };

    touchEventCancel = () => {
        if (this.checkoutCanNotDo()) {
            return;
        }
        switch (this.state.state) {
            case FutureState.DECORATE:
            case FutureState.SPECIAL_MOVE:
                this.recordItemPos();
                this.resetOffset();
                break;
        }
    };

    touchEndEvent = () => {
        switch (this.state.state) {
            case FutureState.NORMAL:
                if (!this.isMove) {
                    this.scaleToAni();
                    if (this.checkoutCanNotDo()) {
                        return;
                    }
                    ClientEvents.HIDE_JUMP_ARROW.emit();
                    DotInst.clientSendDot(COUNTERTYPE.mainPage, "2011", this.xmlData.id + "", this.getItemInMapPos(this.itemInMapPos) + "");
                    this.chooseItem();
                    this.setResetViewPos();
                }
                break;
            case FutureState.SPECIAL_MOVE:
            case FutureState.DECORATE:
                if (this.checkoutCanNotDo()) {
                    return;
                }
                if (!this.isMove) {
                    if (!this.isUp && this.state.state !== FutureState.SPECIAL_MOVE) {
                        this.upToChangePosition();
                    } else {
                        DotInst.clientSendDot(COUNTERTYPE.mainPage, "2036", this.xmlData.id + "", this.getItemInMapPos(this.itemInMapPos) + "");
                        this.recordItemPos();
                    }
                }
                break;
            case FutureState.ACCESS:
                this.scaleToAni();
                ClientEvents.EVENT_SEE_FURNITURE.emit(this.xmlData);
                break;
        }
        this.isMove = false;
        this.resetOffset();
        super.touchEndEvent();
    };

    decorateMode = () => {
        super.decorateMode();
    };

    playAndPreview = (state: number) => {
        this.decorateMode();
        this.state.state = state;
    };

    //初始化货架
    init = (item: IShelves, state: number, map: cc.Node, cb: Function, id: number) => {
        super.init(item, state, map, cb, id);
        let itemData = <IShelves>item;
        this.influenceSurface = this.xmlData.influence;
        this.initItemData(this.showPos, item.reversal);
        let shelfMapData: CacheCaseData = { CaseData: itemData, xmlData: this.xmlData, Node: this.node };
        this.mapManager.addItemDataMapOne(CommonUtil.posToKey(this.showPos), shelfMapData);
        //根据是配置表里的信息加载图片加载图片资源
        this.initBubble();
        this.bubbleScript.init(itemData, this.xmlData, this.node.scaleX);
        this.getFutureFrame(cb, true, id);
    };

    //公用初始化
    initItemData = (showPos: cc.Vec2, reversal: boolean) => {
        this.direction = reversal;
        this.setIndex();
        this.node.scaleX = this.direction ? 1 : -1;
        let truePos = ChangePosition.trueUseOrShowUse(this.useWidth, this.direction, null, showPos);
        this.itemInMapPos = truePos;
        this.node.position = CoordinateTranslate.changeToGLPosition(truePos);
        this.itemPos = this.node.position;
        this.mapManager.setShelfCloseGrid(this.useHeight, this.useWidth, this.direction, showPos, this.xmlData.influence);
    };

    initBubble() {
        this.bubbleScript = this.node.getComponent(ShelvesBubble);
    }

    //初始化货架的货物状态
    getFutureFrame(cb: Function = null, isInit: boolean = false, id: number) {
        let url: string = this.xmlData.pattern;
        if (this.xmlData.mainType === ShelvesType.CheckoutShelve) {
            let num = this.showPos.x === 18 ? 1 : 2;
            ResMgr.initCashier(MapMgr.getWallPaperUrl(), num, this.futureSprite, cb);
        } else {
            this.setNowUrl(url, isInit);
            ResMgr.getFutureMoudle(this.futureSprite, this.nowUrl, cb, id);
        }
    }

    moveShelf = (event: cc.Event.EventTouch) => {
        event.stopPropagation();
        let movePosition = event.getLocation();
        let nowShow = ChangePosition.trueUseOrShowUse(this.useWidth, this.direction, this.itemInMapPos, null);
        let nowPosition = this.node.parent.convertToNodeSpaceAR(movePosition);
        let trueNPos = cc.v2(this.node.scaleX > 0 ? nowPosition.x + this.node.width / 2 : nowPosition.x - this.node.width / 2, nowPosition.y - this.node.height / 2);
        let nowMapPos = this.getItemInMapPos(trueNPos);
        let showUsePos = ChangePosition.trueUseOrShowUse(this.useWidth, this.direction, nowMapPos, null);
        this.isOut(showUsePos, nowShow);
        this.itemInMapPos = ChangePosition.trueUseOrShowUse(this.useWidth, this.direction, null, showUsePos);
        let truePos = new cc.Vec2(this.itemInMapPos.x - 0.2, this.itemInMapPos.y - 0.2);
        this.node.setPosition(CoordinateTranslate.changeToGLPosition(truePos));
        let firstPosition = CoordinateTranslate.changeToMapPosition(this.highlightArray[0].getPosition());
        //计算高亮块的偏移量，并将偏移量附加给每一个高亮地块
        let offset = cc.v2(showUsePos.x - firstPosition.x, showUsePos.y - firstPosition.y);
        this.resetHighlightPos(offset);
        this.checkInCloseGrid();
    };

    resetHighlightPos(offset: cc.Vec2) {
        this.resetArrPos(offset, this.highlightArray);
        this.resetArrPos(offset, this.influenceArray);
    }

    resetArrPos(offset: cc.Vec2, arr: cc.Node[]) {
        for(let i = 0; i < arr.length; i++) {
            let nowHighLightPos = CoordinateTranslate.changeToMapPosition(arr[i].getPosition());
            arr[i].setPosition(CoordinateTranslate.changeToGLPosition(cc.v2(nowHighLightPos.x + offset.x, nowHighLightPos.y + offset.y)));
        }
    }

    //祖传代码，不想动了
    leftCheck(checkMinX: number, checkMaxX: number, checkMaxY: number, checkMinY: number, maxX: number, minX: number, minY: number, maxY: number, showPos: cc.Vec2, nowShow: cc.Vec2) {
        let pos = this.direction ? nowShow.y - (this.useWidth - 1) : nowShow.y;
        let posX = this.direction ? nowShow.x : nowShow.x - (this.useWidth - 1);
        if (pos >= this.specialArea.minY) {
            maxY = this.normalArea.maxY;
            minX = this.specialArea.minX;
            maxX = this.normalArea.maxX;
            if (checkMaxY > maxY) {
                showPos.y = this.direction ? maxY : maxY - this.influenceSurface;
            }
            if (checkMinX <= minX) {
                showPos.x = this.direction ? minX + this.useHeight - 1 : minX + (this.useWidth - 1);
            } else if (checkMaxX > maxX) {
                showPos.x = this.direction ? maxX - this.influenceSurface : maxX;
            }
            if (posX < this.normalArea.minX && pos >= this.specialArea.minY && checkMinY <= this.specialArea.minY) {
                showPos.y = this.direction ? this.specialArea.minY + (this.useWidth - 1) : this.specialArea.minY + this.useHeight - 1;
            }
            if (checkMinX < this.specialArea.maxX && checkMinY < this.specialArea.minY) {
                showPos.y = this.direction ? this.specialArea.minY + (this.useWidth - 1) : this.specialArea.minY + this.useHeight - 1;
            }
        } else {
            minY = this.normalArea.minY;
            minX = this.normalArea.minX;
            maxX = this.normalArea.maxX;
            if (checkMinY <= minY) {
                showPos.y = this.direction ? minY + (this.useWidth - 1) : minY + this.useHeight - 1;
            }
            if (checkMinX <= minX) {
                showPos.x = this.direction ? minX + this.useHeight - 1 : minX + (this.useWidth - 1);
            } else if (checkMaxX > maxX) {
                showPos.x = this.direction ? maxX - this.influenceSurface : maxX;
            }
        }
    }

    rightCheck(checkMinX: number, checkMaxX: number, checkMaxY: number, checkMinY: number, maxX: number, minX: number, minY: number, maxY: number, showPos: cc.Vec2, nowShow: cc.Vec2) {
        let pos = this.direction ? nowShow.x : nowShow.x - (this.useWidth - 1);
        let posY = this.direction ? nowShow.y - (this.useWidth - 1) : nowShow.y;
        if (pos < this.specialArea.minX) {
            maxY = this.normalArea.maxY;
            minY = this.normalArea.minY;
            minX = this.normalArea.minX;
            if (checkMaxY > maxY) {
                showPos.y = this.direction ? maxY : maxY - this.influenceSurface;
            } else if (checkMinY <= minY) {
                showPos.y = this.direction ? minY + (this.useWidth - 1) : minY + this.useHeight - 1;
            }
            if (checkMinX <= minX) {
                showPos.x = this.direction ? minX + this.useHeight - 1 : minX + (this.useWidth - 1);
            }
        } else {
            maxX = this.normalArea.maxX;
            minY = this.specialArea.minY;
            maxY = this.normalArea.maxY;
            if (checkMaxY > maxY) {
                showPos.y = this.direction ? maxY : maxY - this.influenceSurface;
            } else if (checkMinY <= minY) {
                showPos.y = this.direction ? minY + (this.useWidth - 1) : minY + this.useHeight - 1;
            }
            if (checkMaxX > maxX) {
                showPos.x = this.direction ? maxX - this.influenceSurface : maxX;
            }
            if (posY < this.normalArea.minY && pos >= this.specialArea.minX && checkMinX <= this.specialArea.minX) {
                showPos.x = this.direction ? this.specialArea.minX + this.useHeight - 1 : this.specialArea.minX + (this.useWidth - 1);
            }
            if (checkMinY < this.specialArea.maxY && checkMinX < this.specialArea.minX) {
                showPos.x = this.direction ? this.specialArea.minX + this.useHeight - 1 : this.specialArea.minX + (this.useWidth - 1);
            }
        }

    }

    getItemInMapPos = (nowPosition: cc.Vec2): cc.Vec2 => {
        let inMapPosition = CoordinateTranslate.changeToMapPosition(nowPosition);
        return this.useWidth % 2 === 0 ? inMapPosition : cc.v2(inMapPosition.x + 0.5, inMapPosition.y + 0.5)
    };

    isOut(showPos: cc.Vec2, nowShow: cc.Vec2) {
        let checkMinX = this.direction ? showPos.x : showPos.x - (this.useWidth - 1);
        let checkMaxX = this.direction ? showPos.x + this.influenceSurface : showPos.x;
        let checkMaxY = this.direction ? showPos.y : showPos.y + this.influenceSurface;
        let checkMinY = this.direction ? showPos.y - (this.useWidth - 1) : showPos.y;
        let maxX: number = 0;
        let maxY: number = 0;
        let minX: number = 0;
        let minY: number = 0;
        if (this.specialArea) {
            if (this.specialArea.area == "left") {
                this.leftCheck(checkMinX, checkMaxX, checkMaxY, checkMinY, maxX, minX, minY, maxY, showPos, nowShow);
            } else {
                this.rightCheck(checkMinX, checkMaxX, checkMaxY, checkMinY, maxX, minX, minY, maxY, showPos, nowShow);
            }
        } else {
            maxX = this.normalArea.maxX;
            maxY = this.normalArea.maxY;
            minX = this.normalArea.minX;
            minY = this.normalArea.minY;
            if (checkMinX <= minX) {
                showPos.x = this.direction ? minX + this.useHeight - 1 : minX + (this.useWidth - 1);
            } else if (checkMaxX > maxX) {
                showPos.x = this.direction ? maxX - this.influenceSurface : maxX;
            }
            if (checkMinY <= minY) {
                showPos.y = this.direction ? minY + (this.useWidth - 1) : minY + this.useHeight - 1;
            } else if (checkMaxY > maxY) {
                showPos.y = this.direction ? maxY : maxY - this.influenceSurface;
            }
        }
    }

    checkInCloseGrid = () => {
        this.canDown = true;
        let func = (cb: Function, showPos: cc.Vec2, node: cc.Node) => {
            this.mapManager.checkInCloseAndInfluence(cb, showPos, node);
        };
        this.checkGrid(this.highlightArray, func);
        this.checkGrid(this.influenceArray);
        ClientEvents.EVENT_GRAY_BTN.emit("sure", this.canDown);
    };

    checkGrid(arr: cc.Node[], func?: Function) {
        let cb = (isCan: boolean, node: cc.Node) => {
            if (isCan) {
                node.getComponent(cc.Sprite).spriteFrame = this.redSprite;
                this.canDown = false;
            } else {
                node.getComponent(cc.Sprite).spriteFrame = this.greenSprite;
            }
        };
        for (let i of arr) {
            let showPos = CoordinateTranslate.changeToMapPosition(i.getPosition());
            let isOnClose = this.mapManager.isOnShelfClose(showPos);
            cb(isOnClose, i);
            func && func(cb, showPos, i);
        }
    }

    upToChangePosition = () => {
        this.mapManager.checkCanDownCB(this.upCallBack);
    };


    upCallBack = () => {
        super.upToChangePosition();
        this.mapManager.setChosenItem(this);
        this.getNormalAndSpecial();
        this.isUp = true;
        this.initHight(CommonUtil.keyToPos(this.cacheKey));
        this.removeFromCloseGrid();
        this.node.zIndex = 999;
        this.futureSprite.node.opacity = 255;
        let pos = CoordinateTranslate.changeToGLPosition(cc.v2(this.itemInMapPos.x - 0.2, this.itemInMapPos.y - 0.2));
        this.node.setPosition(pos);
        this.showDo();
    };

    resetOffset() {
        this.rotaCachePos = null;
    }

    removeFromCloseGrid = () => {
        this.deleteUseGrid();
    };

    deleteUseGrid() {
        for (let i = 0; i < this.useWidth; i++) {
            for (let j = 0; j < this.useHeight; j++) {
                let posX = this.direction ? this.showPos.x - j : this.showPos.x - i;
                let posY = this.direction ? this.showPos.y - i : this.showPos.y - j;
                this.mapManager.deleteShelfCloseGrid(cc.v2(posX, posY));
            }
        }
        if (this.xmlData.influence > 0) {
            for (let i = 0; i < this.useWidth; i++) {
                let posX = this.direction ? this.showPos.x + 1 : this.showPos.x - i;
                let posY = this.direction ? this.showPos.y - i : this.showPos.y + 1;
                this.mapManager.deleteInfluences(cc.v2(posX, posY));
            }
        }
    }

    initHight = (position: cc.Vec2) => {
        let highlightCb = (node: cc.Node, i: number, j: number) => {
            node.position = CoordinateTranslate.changeToGLPosition(cc.v2(position.x - (!this.direction ? i : j),
                position.y - (!this.direction ? j : i)));
            this.highlightArray.push(node);
        };
        let influenceCb = (node: cc.Node, i: number, j: number) => {
            node.position = CoordinateTranslate.changeToGLPosition(cc.v2(position.x - (this.direction ? -1 : j),
                position.y - (this.direction ? j : -1)));
            this.influenceArray.push(node);
        };
        this.getHighlight(this.useWidth, this.useHeight, highlightCb);
        this.getHighlight(this.influenceSurface, this.useWidth, influenceCb);
    };

    getHighlight = (width: number, height: number, cb: Function) => {
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                let highLight: cc.Node = this.mapManager.getFutureNode(this.highlightPrefab, NodeType.HIGHLIGHT);
                highLight.active = true;
                this.node.parent.addChild(highLight, 997);
                cb(highLight, i, j);
            }
        }
    };

    putDown = () => {
        super.putDown();
        if (!this.getItemMapData()) {
            CacheMap.addUseGrid(this.xmlData, false);
        }
        this.mapManager.checkBackIsChosen(this);
        this.futureSprite.node.opacity = 120;
        this.itemInMapPos = this.useWidth % 2 === 0 ? cc.v2(Math.ceil(this.itemInMapPos.x), Math.ceil((this.itemInMapPos.y))) : cc.v2(this.itemInMapPos.x, this.itemInMapPos.y);
        let pos = CoordinateTranslate.changeToGLPosition(this.itemInMapPos);
        this.node.setPosition(pos);
        this.showPos = ChangePosition.trueUseOrShowUse(this.useWidth, this.direction, this.itemInMapPos, null);
        this.mapManager.setShelfCloseGrid(this.useHeight, this.useWidth, this.direction, this.showPos, this.influenceSurface);
        this.mapManager.updateMap(this.cacheKey, this.useWidth, this.useHeight, this.itemInMapPos, this.direction, this.xmlData, this.node, (nowKey: number) => {
            this.cacheKey = nowKey;
        });
        this.removeHighLight();
        this.setIndex();
        this.isUp = false;
        this.isMove = false;
        this.resetOffset();
    };

    getNowShowPos() {
        let pos = this.useWidth % 2 === 0 ? cc.v2(Math.ceil(this.itemInMapPos.x), Math.ceil((this.itemInMapPos.y))) : cc.v2(this.itemInMapPos.x, this.itemInMapPos.y);
        return CommonUtil.posToKey(ChangePosition.trueUseOrShowUse(this.useWidth, this.direction, pos, null));
    }

    setIndex() {
        this.node.zIndex = this.showPos.x + this.showPos.y;
    }

    removeHighLight() {
        this.mapManager.removeHighLight(this.highlightArray);
        this.mapManager.removeHighLight(this.influenceArray);
    }

    removeItem = () => {
        this.mapManager.checkBackIsChosen(this);
        DotInst.clientSendDot(COUNTERTYPE.decoration, "7004", this.xmlData.mainType + "", DataMgr.iMarket.getMarketId() + "", this.getItemInMapPos(this.itemInMapPos) + "");
        let data = this.mapManager.getDataFromMap(this.cacheKey);
        if (!data) {
            ClientEvents.BACK_TO_MINI_WARE.emit(this.xmlData, 1);
            this.backToPool();
        } else {
            this.initItemData(CommonUtil.keyToPos(this.cacheKey), data.CaseData.reversal);
            this.futureSprite.node.opacity = 120;
            this.removeHighLight();
            this.resetOffset();
            this.isUp = false;
        }
    };

    collapsItem = () => {
        DotInst.clientSendDot(COUNTERTYPE.decoration, "7003", this.xmlData.mainType + "", DataMgr.iMarket.getMarketId() + "", this.getItemInMapPos(this.itemInMapPos) + "");
        this.backToPool();
        this.mapManager.removeLandFuture(CommonUtil.keyToPos(this.cacheKey));
        this.cacheKey = null;
        ClientEvents.BACK_TO_MINI_WARE.emit(this.xmlData, 1);
    };

    //旋转
    rotateItem = () => {
        DotInst.clientSendDot(COUNTERTYPE.decoration, "7002", this.xmlData.mainType + "", DataMgr.iMarket.getMarketId() + "", this.getItemInMapPos(this.itemInMapPos) + "");
        let cacheShowPos = ChangePosition.trueUseOrShowUse(this.useWidth, this.direction, this.itemInMapPos, null);
        this.node.scaleX = this.node.scaleX === -1 ? 1 : -1;
        let itemShowPos: cc.Vec2;
        let changePos: cc.Vec2;
        //记录上一次的坐标
        if (this.rotaCachePos !== null) {
            itemShowPos = this.rotaCachePos;
            this.rotaCachePos = cacheShowPos;
        } else {
            itemShowPos = this.resetPos(itemShowPos, cacheShowPos);
            this.rotaCachePos = cacheShowPos;
        }
        changePos = ChangePosition.trueUseOrShowUse(this.useWidth, !this.direction, null, itemShowPos);
        let nowPos = CoordinateTranslate.changeToGLPosition(cc.v2(changePos.x - 0.2, changePos.y - 0.2));
        this.node.position = cc.v2(nowPos);
        this.itemPos = cc.v2(nowPos);
        this.itemInMapPos = changePos;
        this.direction = !this.direction;
        this.removeHighLight();
        this.initHight(itemShowPos);
        this.checkInCloseGrid();
    };

    resetPos(itemShowPos: cc.Vec2, cacheShowPos: cc.Vec2, ) {
        if (this.direction) {
            if (cacheShowPos.x + this.useWidth - 1 > Vertex.VERTEX_X) {
                itemShowPos = cc.v2(Vertex.VERTEX_X, cacheShowPos.y - this.useWidth + this.useHeight);
            } else {
                itemShowPos = cc.v2(cacheShowPos.x + this.useWidth - 1, cacheShowPos.y - this.useWidth + this.useHeight);
            }
        } else {
            if (cacheShowPos.y + this.useWidth - 1 > Vertex.VERTEX_Y) {
                itemShowPos = cc.v2(cacheShowPos.x - this.useWidth + this.useHeight, Vertex.VERTEX_Y);
            } else {
                itemShowPos = cc.v2(cacheShowPos.x - this.useWidth + this.useHeight, cacheShowPos.y + this.useWidth - 1);
            }
        }
        return itemShowPos;
    }

    getShowPosKey() {
        return CommonUtil.posToKey(this.showPos);
    }

    addItem = (canshu: IShelves, mapState: number, map: cc.Node) => {
        let id = MapMgr.getFutureId();
        super.init(canshu, mapState, map, null, id);
        this.mapManager.setChosenItem(this);
        this.getNormalAndSpecial();
        let show = cc.v2(canshu.x, canshu.y);
        this.isUp = true;
        this.node.scaleX = this.direction ? 1 : -1;
        this.influenceSurface = this.xmlData.influence;
        if (this.xmlData.mainType === 1) {
            this.isCase = true;
        }
        this.initBubble();
        this.bubbleScript.initXmlData(this.xmlData);
        this.getFutureFrame(null, true, id);
        let pos = ChangePosition.trueUseOrShowUse(this.useWidth, this.direction, null, show);
        this.node.position = CoordinateTranslate.changeToGLPosition(cc.v2(pos.x - 0.2, pos.y - 0.2));
        this.futureSprite.node.opacity = 255;
        this.node.zIndex = 999;
        this.itemPos = this.node.getPosition();
        this.itemInMapPos = cc.v2(CoordinateTranslate.changeToMapPosition(this.itemPos));
        this.itemInMapPos.x += 1;
        this.itemInMapPos.y += 1;
        let showPos = ChangePosition.trueUseOrShowUse(this.useWidth, canshu.reversal, this.itemInMapPos, null);
        this.itemInMapPos = this.useWidth % 2 === 0 ? cc.v2(this.itemInMapPos.x, this.itemInMapPos.y) : cc.v2(this.itemInMapPos.x - 0.5, this.itemInMapPos.y - 0.5);
        this.initHight(this.useWidth % 2 === 0 ? cc.v2(showPos.x, showPos.y) : cc.v2(showPos.x - 0.5, showPos.y - 0.5));
        this.showDo(true);
    };

    setInitPos(show: cc.Vec2) {
        if (show.x + this.influenceSurface > Vertex.VERTEX_X) {
            show.x = show.x - this.influenceSurface;
        }
        if (show.x - this.useHeight <= Vertex.VERTEX_X - this.marketWidth) {
            show.x = Vertex.VERTEX_X - this.marketWidth + this.useHeight;
        }
        if (show.y - this.useWidth < Vertex.VERTEX_Y - this.marketHeight) {
            show.y = show.y + (Vertex.VERTEX_Y - this.marketHeight - show.y + this.useWidth);
        }
    }

    backToPool = (isChangeMarket: boolean = false) => {
        super.backToPool(isChangeMarket);
        this.bubbleScript.restBubble();
        this.resetOffset();
        this.removeHighLight();
        this.node.active = true;
        this.isCase = false;
        this.mapManager.backFutureNodePool(this.node);
    };

    showDo = (isAdd: boolean = false) => {
        let grayCb = () => {
            this.checkInCloseGrid();
        };
        ClientEvents.EVENT_SHOW_CHOOSEITEMDO.emit("Shelves", this, this.state.state, this.xmlData, grayCb, isAdd);
    };

    getShelfId() {
        return CommonUtil.posToKey(this.showPos);
    }

    getItemMapData(): CacheCaseData {
        return CacheMap.getDataFromMap(this.cacheKey);
    }

    getDirection() {
        return this.direction;
    }
}

