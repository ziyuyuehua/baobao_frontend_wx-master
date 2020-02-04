/**
 *@Athuor ljx
 *@Date 19:40
 */
import { FutureFather } from "./FutureFather";
import { Vertex } from "../../../global/const/StringConst";
import {CacheCaseData, CacheMap, FutureState, NodeType, WallFactor} from "../CacheMapDataManager";
import { ClientEvents } from "../../../global/manager/ClientEventCenter";
import { IShelves } from "../../../types/Response";
import { ResMgr } from "../../../global/manager/ResManager";
import { CoordinateTranslate, TileSize } from "../../../Utils/CoordinateTranslate";
import { CommonUtil } from "../../../Utils/CommonUtil";
import { UIMgr } from "../../../global/manager/UIManager";
import { ExpUtil } from "../Utils/ExpandUtil";
import property = cc._decorator.property;
import { DotInst, COUNTERTYPE } from "../../common/dotClient";
import {DataMgr} from "../../../Model/DataManager";
import {MapMgr} from "../MapInit/MapManager";

const { ccclass } = cc._decorator;

@ccclass

export default class WallDeco extends FutureFather {
    @property(cc.Prefab)
    private highlight: cc.Prefab = null;
    @property(cc.SpriteFrame)
    private red: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    private green: cc.SpriteFrame = null;

    private highLightArr: cc.Node[] = [];
    private xmlId = null;
    private landScape: boolean = true;

    private moveBase = 0;
    private nowOffset = 0;
    private landY = 0;
    private landX = 0;
    private vertMap: Map<number, StateAndLandP> = new Map<number, StateAndLandP>();

    private limitArr: cc.Vec2[] = null;
    private checkValue1: cc.Vec2 = null;
    private checkValue2: cc.Vec2 = null;
    private checkValue3: cc.Vec2 = null;
    private cacheOffset: number = 0;

    start() {
        this.futureSprite.node.zIndex = 999;
        this.setMoveBase();
    }

    setFutureSprite(cb: Function = null, id: number) {
        this.setNowUrl(this.xmlData.pattern, true);
        ResMgr.getFutureMoudle(this.futureSprite, this.nowUrl, cb, id);
    }

    setMoveBase = () => {
        let x = TileSize.width;
        let y = TileSize.height;
        this.moveBase = Math.sqrt(Math.pow((x / 2), 2) + Math.pow((y / 2), 2));
    };

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
                    this.moveWallDecoration(event);
                } else {
                    this.isMove = UIMgr.moveOverried(event);
                }
                break;
        }
    };

    touchEndEvent = () => {
        if (!this.isMove) {
            switch (this.state.state) {
                case FutureState.SPECIAL_MOVE:
                    this.recordItemPos();
                    break;
                case FutureState.DECORATE:
                    //装修模式
                    if (!this.isUp) {
                        this.upToChangePosition();
                    } else {
                        this.recordItemPos();
                    }
                    break;
                case FutureState.NORMAL:
                    //正常
                    DotInst.clientSendDot(COUNTERTYPE.mainPage, "2011", this.xmlData.id + "", this.getShowPos() + "");
                    ClientEvents.HIDE_JUMP_ARROW.emit();
                    this.scaleToAni();
                    this.chooseItem();
                    this.setResetViewPos();
                    break;
                case FutureState.ACCESS:
                    this.scaleToAni();
                    ClientEvents.EVENT_SEE_FURNITURE.emit(this.xmlData);
                    break;
            }
            this.restOffset();
        }
        this.isMove = false;
        super.touchEndEvent();
    };

    touchEventCancel = (event) => {
        if (event.currentTouch !== null) {
            this.recordItemPos();
            this.restOffset();
        }
    };

    init(item: IShelves, state: number, map: cc.Node, cb: Function = null, id: number) {
        super.init(item, state, map, cb, id);
        this.getNormalAndSpecial();
        this.itemInMapPos = cc.v2(item.x + 1, item.y + 1);
        this.landScape = !this.direction;
        this.initLandPos();
        this.xmlId = this.xmlData.id;
        this.setFutureSprite(cb, id);
        this.initDecorateData(this.itemInMapPos, this.landScape);
        let wallData: CacheCaseData = {
            xmlData: this.xmlData,
            Node: this.node,
            WallData: item
        };
        this.mapManager.addItemDataMapOne(this.setKey(this.showPos), wallData);
    };

    initLandPos() {
        if (this.specialArea) {
            if (this.specialArea.area == "left") {
                if (!this.landScape && this.itemInMapPos.y - this.useWidth >= this.specialArea.minY) {
                    this.landX = this.specialArea.minX;
                } else if (this.landScape && this.itemInMapPos.y == this.specialArea.minY) {
                    this.landY = this.specialArea.minY;
                } else if (this.landScape) {
                    this.landY = this.normalArea.minY;
                } else if (!this.landScape && this.itemInMapPos.y <= this.specialArea.minY) {
                    this.landX = this.normalArea.minX;
                }
            } else {
                if (this.landScape && this.itemInMapPos.x - this.useWidth >= this.specialArea.minX) {
                    this.landY = this.specialArea.minY;
                } else if (!this.landScape && this.itemInMapPos.x == this.specialArea.minX) {
                    this.landX = this.specialArea.minX;
                } else if (this.landScape && this.itemInMapPos.x <= this.specialArea.minX) {
                    this.landY = this.normalArea.minY;
                } else if (!this.landScape) {
                    this.landX = this.normalArea.minX;
                }
            }
        } else {
            this.landX = this.normalArea.minX;
            this.landY = this.normalArea.minY;
        }
    }

    setLandValue() {
        return this.landScape ? this.landY : this.landX;
    }

    setKey(pos: cc.Vec2) {
        return CommonUtil.posToKey(pos) + this.setLandValue() * WallFactor.WallFactor;
    }

    setOffsetKey() {
        let key = this.setLandValue();
        return key * WallFactor.WallFactor;
    }

    initDecorateData = (truePosition: cc.Vec2, landScape: boolean) => {
        this.node.scaleX = landScape ? 1 : -1;
        this.node.position = CoordinateTranslate.changeToGLPosition(truePosition);
        this.itemPos = this.node.getPosition();
        this.mapManager.setWallCloseGrid(this.useWidth, this.landScape, truePosition, this.setLandValue());
        this.setItemInMapPos();
        this.setShowPos();
    };

    moveWallDecoration(event: cc.Event.EventTouch) {
        let startPosition = this.node.convertToNodeSpaceAR(event.getStartLocation());
        let movePosition = this.node.convertToNodeSpaceAR(event.getLocation());
        let offset: number;
        let sqrt = Math.sqrt(Math.pow((startPosition.x - movePosition.x), 2) + Math.pow((startPosition.y - movePosition.y), 2));
        offset = movePosition.x - startPosition.x > 0 ? sqrt : -sqrt;
        let now = Math.floor((offset - this.nowOffset) / this.moveBase);
        this.nowOffset += now * this.moveBase;
        if (now !== 0) {
            if (now > 1 || now < -1) {
                return;
            }
            let result = this.isChange(now);
            //判断是否可放置
            if (result) {
                this.checkInWallCloseGrid();
                this.node.setPosition(CoordinateTranslate.changeToGLPosition(this.itemInMapPos));
            }
        }

    }

    isChange(now: number) {
        let getPos: cc.Vec2;
        if (now > 0) {
            getPos = this.itemInMapPos;
        } else {
            getPos = this.landScape ?
                cc.v2(this.itemInMapPos.x - this.useWidth, this.itemInMapPos.y) :
                cc.v2(this.itemInMapPos.x, this.itemInMapPos.y - this.useWidth);
        }
        let cacheKey = CommonUtil.posToKey(getPos);
        let state: StateAndLandP = this.vertMap.get(cacheKey);
        this.itemInMapPos = this.landScape ? cc.v2(this.itemInMapPos.x + now, this.landY) : cc.v2(this.landX, this.itemInMapPos.y + now);
        if (state) {
            if (state.state === "normal") {
                return this.normalChange(now < 0, state, getPos);
            } else {
                return this.unNormal(now < 0, state, getPos);
            }
        } else {
            this.checkIsOut();
            return true;
        }
    }

    checkIsOut() {
        this.itemInMapPos = this.landScape ?
            cc.v2(this.itemInMapPos.x > Vertex.VERTEX_X + 1 ? Vertex.VERTEX_X + 1 : this.itemInMapPos.x, this.landY) :
            cc.v2(this.landX, this.itemInMapPos.y > Vertex.VERTEX_Y + 1 ? Vertex.VERTEX_Y + 1 : this.itemInMapPos.y);
    }

    normalChange(isDown: boolean, state: StateAndLandP, vrtPos: cc.Vec2) {
        if (isDown) {
            if (this.landScape) {
                if (this.itemInMapPos.x - this.useWidth < vrtPos.x) {
                    this.changeLand(state);
                    this.changeLandscape(this.landScape);
                    return true;
                } else {
                    this.checkIsOut();
                    return true;
                }
            } else {
                if (this.itemInMapPos.y - this.useWidth < vrtPos.y) {
                    this.changeLand(state);
                    this.changeLandscape(this.landScape);
                    return true;
                } else {
                    this.checkIsOut();
                    return true;
                }
            }
        } else {
            if (this.landScape) {
                if (this.itemInMapPos.x - this.useWidth < vrtPos.x) {
                    this.changeLand(state);
                    this.changeLandscape(this.landScape);
                    return true;
                } else {
                    this.checkIsOut();
                    return true;
                }
            } else {
                if (this.itemInMapPos.y + this.useWidth > vrtPos.y) {
                    this.changeLand(state);
                    this.changeLandscape(this.landScape);
                    return true;
                } else {
                    this.checkIsOut();
                    return true;
                }
            }
        }
    }

    unNormal(isDown: boolean, state: StateAndLandP, vrtPos: cc.Vec2) {
        if (isDown) {
            if (this.landScape) {
                if (this.itemInMapPos.x + this.useWidth < vrtPos.x) {
                    this.changeLand(state);
                    this.changeLandscape(this.landScape, false);
                    return true;
                } else {
                    this.checkIsOut();
                    return true;
                }
            } else {
                if (this.itemInMapPos.y - this.useWidth < vrtPos.y) {
                    this.changeLand(state);
                    this.changeLandscape(this.landScape, false);
                    return true;
                } else {
                    this.checkIsOut();
                    return true;
                }
            }
        } else {
            if (this.landScape) {
                if (this.itemInMapPos.x > vrtPos.x) {
                    this.changeLand(state);
                    this.changeLandscape(this.landScape, false);
                    return true;
                } else {
                    this.checkIsOut();
                    return true;
                }
            } else {
                if (this.itemInMapPos.y + this.useWidth > vrtPos.y) {
                    this.changeLand(state);
                    this.changeLandscape(this.landScape, false);
                    return true;
                } else {
                    this.checkIsOut();
                    return true;
                }
            }
        }
    }

    changeLand(state: StateAndLandP) {
        this.landX = state.landX;
        this.landY = state.landY;
    }

    changeLandscape = (landScape: boolean, isNormal: boolean = true) => {
        DotInst.clientSendDot(COUNTERTYPE.decoration, "7002", this.xmlData.mainType + "", DataMgr.iMarket.getMarketId() + "", this.getShowPos() + "");
        if (landScape) {
            this.node.scaleX = -1;
            this.itemInMapPos = cc.v2(this.landX, isNormal ? this.landY + this.useWidth : this.landY);
            this.landScape = false;
            this.direction = true;
        } else {
            this.node.scaleX = 1;
            this.itemInMapPos = cc.v2(isNormal ? this.landX + this.useWidth : this.landX, this.landY);
            this.direction = false;
            this.landScape = true;
        }
    };

    checkInWallCloseGrid = () => {
        this.canDown = this.mapManager.checkWallCachePos(this.useWidth, this.useHeight, this.landScape, this.itemInMapPos, this.setLandValue(), this.highLightArr, this.red, this.green);
        this.changeParentCanBeDown();
    };

    changeParentCanBeDown = () => {
        ClientEvents.EVENT_GRAY_BTN.emit("sure", this.canDown);
    };

    upToChangePosition = () => {
        this.mapManager.checkCanDownCB(this.upCallBack);
    };

    upCallBack = () => {
        super.upToChangePosition();
        this.initHighlight();
        this.mapManager.setChosenItem(this);
        this.initLandPos();
        this.cacheOffset = this.setOffsetKey();
        this.isUp = true;
        this.getNormalAndSpecial();
        this.initVerMap();
        this.showDo();
        this.removeFromCloseGrid();
        this.node.zIndex = 999;
        this.futureSprite.node.opacity = 255;
        this.checkInWallCloseGrid();
    };

    initHighlight() {
        for (let i = 0; i < this.useWidth; i++) {
            let node = CacheMap.getFutureNode(this.highlight, NodeType.WALL_HIGHLIGHT);
            this.highLightArr.push(node);
            node.scaleX = -1;
            this.node.addChild(node);
            node.setPosition(-node.width * i, node.width / 2 * i);
        }
    }

    backHighlight() {
        this.highLightArr.forEach((value) => {
            value.scaleX = 1;
            CacheMap.backWallHighlightPool(value);
        });
        this.highLightArr.splice(0, this.highLightArr.length);
    }

    setItemInMapPos() {
        this.itemPos = this.node.getPosition();
        let inMapPosition = CoordinateTranslate.changeToMapPosition(this.itemPos);
        this.itemInMapPos = cc.v2(inMapPosition.x, inMapPosition.y);
    }

    removeFromCloseGrid = () => {
        this.mapManager.deleteWallCloseGrid(this.itemInMapPos, this.useWidth, this.landScape, this.setLandValue());
    };

    initVerMap() {
        if (this.specialArea) {
            let specialPos1: cc.Vec2;
            let specialPos2: cc.Vec2;
            if (this.specialArea.area == "left") {
                specialPos1 = cc.v2(this.specialArea.minX, this.specialArea.minY);
                specialPos2 = cc.v2(this.specialArea.maxX, this.specialArea.minY);
                this.vertMap.set(CommonUtil.posToKey(specialPos1), {
                    state: "normal",
                    landX: this.specialArea.minX,
                    landY: this.specialArea.minY
                });
                this.vertMap.set(CommonUtil.posToKey(specialPos2), {
                    state: "back",
                    landX: this.normalArea.minX,
                    landY: this.specialArea.minY
                });
            } else {
                specialPos1 = cc.v2(this.specialArea.minX, this.specialArea.minY);
                specialPos2 = cc.v2(this.specialArea.minX, this.specialArea.maxY);
                this.vertMap.set(CommonUtil.posToKey(specialPos1), {
                    state: "normal",
                    landX: this.specialArea.minX,
                    landY: this.specialArea.minY
                });
                this.vertMap.set(CommonUtil.posToKey(specialPos2), {
                    state: "back",
                    landX: this.specialArea.minX,
                    landY: this.normalArea.minY
                });
            }

        }
        let normalPos = cc.v2(this.normalArea.minX, this.normalArea.minY);
        this.vertMap.set(CommonUtil.posToKey(normalPos), {
            state: "normal",
            landX: this.normalArea.minX,
            landY: this.normalArea.minY
        });
    }

    restOffset() {
        this.nowOffset = 0;
    }

    putDown = () => {
        this.node.zIndex = 0;
        super.putDown();
        this.backHighlight();
        CacheMap.valueWithPercentCheck();
        this.mapManager.checkBackIsChosen(this);
        this.futureSprite.node.opacity = 120;
        this.mapManager.setWallCloseGrid(this.useWidth, this.landScape, this.itemInMapPos, this.setLandValue());
        this.itemInMapPos = CoordinateTranslate.changeToMapPosition(this.node.position);
        this.setShowPos();
        this.mapManager.updateWallDataMap(this.direction, this.xmlData, this.itemInMapPos, this.cacheKey, this.node, this.setOffsetKey(), this.cacheOffset, (nowKey: number) => {
            this.cacheKey = nowKey;
        });
        this.isUp = false;
        this.cacheOffset = this.setOffsetKey();
    };

    setShowPos() {
        let x = this.itemInMapPos.x - 1;
        let y = this.itemInMapPos.y - 1;
        this.showPos = cc.v2(x, y);
    }

    removeItem = () => {
        DotInst.clientSendDot(COUNTERTYPE.decoration, "7004", this.xmlData.mainType + "", DataMgr.iMarket.getMarketId() + "", this.getShowPos() + "");
        this.mapManager.checkBackIsChosen(this);
        let cacheItemPos = CommonUtil.keyToPos(this.cacheKey);
        if (!cacheItemPos) {
            ClientEvents.BACK_TO_MINI_WARE.emit(this.xmlData, 1);
            this.backToPool();
        } else {
            this.backHighlight();
            let key = CommonUtil.posToKey(cacheItemPos) + this.cacheOffset;
            let reversal = this.mapManager.getWallReversal(key);
            this.direction = reversal;
            this.initDecorateData(cc.v2(cacheItemPos.x + 1, cacheItemPos.y + 1), !reversal);
            this.landScape = !reversal;
            this.futureSprite.node.opacity = 120;
            this.node.zIndex = 0;
            this.isUp = false;
        }
    };

    collapsItem = () => {
        DotInst.clientSendDot(COUNTERTYPE.decoration, "7003", this.xmlData.mainType + "", DataMgr.iMarket.getMarketId() + "", this.getShowPos() + "");
        let cacheKey = this.cacheKey + this.cacheOffset;
        let data = this.mapManager.getDataFromMap(cacheKey);
        this.backToPool();
        if (data) {
            if (data.WallData.id !== 0) {
                this.mapManager.setDeleteData(cacheKey, true);
            }
            if (this.mapManager.getFutureChangeData(cacheKey)) {
                this.mapManager.deleteFutureChangeData(cacheKey);
            }
            this.mapManager.deleteItemDataMapOne(cacheKey);
        }
        ClientEvents.BACK_TO_MINI_WARE.emit(this.xmlData, 1);
        this.cacheKey = null;
    };

    getShowPosKey() {
        return CommonUtil.posToKey(this.showPos) + this.setLandValue() * WallFactor.WallFactor;
    }

    addItem = (Msg: IShelves, type: number, map: cc.Node) => {
        let id = MapMgr.getFutureId();
        super.init(Msg, type, map, null, id);
        this.mapManager.setChosenItem(this);
        this.getNormalAndSpecial();
        this.node.zIndex = 999;
        let showPos = cc.v2(Msg.x, Msg.y);
        this.initWallDecoPos(showPos);
        this.state.state = type;
        this.xmlId = Msg.xmlId;
        this.isUp = true;
        this.setFutureSprite(null, id);
        this.node.position = CoordinateTranslate.changeToGLPosition(showPos);
        this.futureSprite.node.opacity = 255;
        this.itemPos = this.node.getPosition();
        this.itemInMapPos = cc.v2(CoordinateTranslate.changeToMapPosition(this.itemPos));
        this.initVerMap();
        this.initLandPos();
        this.initHighlight();
        this.showDo(true);
    };

    initWallDecoPos(pos: cc.Vec2) {
        this.limitArr = ExpUtil.getWallLimit();
        let glPos = UIMgr.changeCanvasPosToNode(this.map);
        if (this.specialArea) {
            this.initPoint();
            if (this.specialArea.area == "left") {
                this.leftCheck(pos, glPos);
            } else {
                this.rightCheck(pos, glPos);
            }
        } else {
            this.normalCheck(pos, glPos);
        }
    }

    leftCheck(pos: cc.Vec2, checkPos: cc.Vec2) {
        if (checkPos.x <= this.checkValue1.x) {
            pos.x = this.landX = this.specialArea.minX;
            this.direction = true;
            this.node.scaleX = -1;
            if (pos.y - this.useWidth < this.specialArea.minY) {
                pos.y = this.specialArea.minY + this.useWidth;
            }
        } else if (checkPos.x > this.checkValue1.x && checkPos.x <= this.checkValue2.x) {
            pos.y = this.landY = this.specialArea.minY;
            this.direction = false;
            this.node.scaleX = 1;
            if (pos.x > this.specialArea.maxX) {
                pos.x = this.specialArea.maxX;
            } else if (pos.x - this.useWidth < this.specialArea.minX) {
                pos.x = this.specialArea.minX + this.useWidth;
            }
        } else if (checkPos.x > this.checkValue2.x && checkPos.x <= this.checkValue3.x) {
            pos.x = this.landX = this.normalArea.minX;
            this.direction = true;
            this.node.scaleX = -1;
            if (pos.y >= this.specialArea.minY) {
                pos.y = this.specialArea.minY;
            } else if (pos.y - this.useWidth < this.normalArea.minY) {
                pos.y = this.normalArea.minY + this.useWidth;
            }
        } else if (checkPos.x > this.checkValue3.x) {
            pos.y = this.landY = this.normalArea.minY;
            this.direction = false;
            this.node.scaleX = 1;
            if (pos.x - this.useWidth + 1 < this.normalArea.minX + 1) {
                pos.x = this.normalArea.minX + this.useWidth;
            }
        }
        this.landScape = !this.direction;
    }

    rightCheck(pos: cc.Vec2, checkPos: cc.Vec2) {
        if (checkPos.x >= this.checkValue1.x) {
            pos.y = this.landY = this.specialArea.minY;
            this.direction = false;
            this.node.scaleX = 1;
            if (pos.x - this.useWidth < this.specialArea.minX) {
                pos.x = this.specialArea.minX + this.useWidth;
            }
        } else if (checkPos.x < this.checkValue1.x && checkPos.x >= this.checkValue2.x) {
            pos.x = this.landX = this.specialArea.minX;
            this.direction = true;
            this.node.scaleX = -1;
            if (pos.y > this.normalArea.minY) {
                pos.y = this.normalArea.minY;
            } else if (pos.y - this.useWidth < this.specialArea.minY) {
                pos.y = this.specialArea.minY + this.useWidth;
            }
        } else if (checkPos.x < this.checkValue2.x && checkPos.x >= this.checkValue3.x) {
            pos.y = this.landY = this.specialArea.maxY;
            this.direction = false;
            this.node.scaleX = 1;
            if (pos.x - this.useWidth < this.normalArea.minX) {
                pos.x = this.normalArea.minX + this.useWidth;
            } else if (pos.x > this.specialArea.minX) {
                pos.x = this.specialArea.minX;
            }
        } else if (checkPos.x < this.checkValue3.x) {
            pos.x = this.landX = this.normalArea.minX;
            this.direction = true;
            this.node.scaleX = -1;
            if (pos.y - this.useWidth < this.normalArea.minY) {
                pos.y = this.normalArea.minY + this.useWidth;
            }
        }
        this.landScape = !this.direction;
    }

    initPoint() {
        this.checkValue1 = CoordinateTranslate.changeToGLPosition(this.limitArr[0]);
        this.checkValue2 = CoordinateTranslate.changeToGLPosition(this.limitArr[1]);
        this.checkValue3 = CoordinateTranslate.changeToGLPosition(this.limitArr[2]);
    }

    normalCheck(pos: cc.Vec2, glPos: cc.Vec2) {
        let limit = CoordinateTranslate.changeToGLPosition(this.limitArr[0]);
        if (glPos.x < limit.x) {
            pos.x = this.landX = this.normalArea.minX;
            this.direction = true;
            this.node.scaleX = -1;
            if (pos.y - this.useWidth + 1 < this.normalArea.minY + 1) {
                pos.y = this.normalArea.minY + this.useWidth;
            }
        } else {
            pos.y = this.landY = this.normalArea.minY;
            this.direction = false;
            this.node.scaleX = 1;
            if (pos.x - this.useWidth < this.normalArea.minX) {
                pos.x = this.normalArea.minX + this.useWidth;
            }
        }
        this.landScape = !this.direction;
    }

    backToPool = (isChangeMarket: boolean = false) => {
        super.backToPool(isChangeMarket);
        this.vertMap.clear();
        this.backHighlight();
        !isChangeMarket && CacheMap.valueWithPercentCheck();
        (this.node.scaleX == -1) && (this.landScape = !this.landScape);
        this.mapManager.backWallNodePool(this.node);
    };

    showDo = (isAdd: boolean = false) => {
        let grayCb = () => {
            this.checkInWallCloseGrid();
        };
        ClientEvents.EVENT_SHOW_CHOOSEITEMDO.emit("WallDeco", this, this.state.state, this.xmlData, grayCb, isAdd);
    };

    getShowPos() {
        this.itemInMapPos = CoordinateTranslate.changeToMapPosition(this.node.position);
        return cc.v2(this.itemInMapPos.x - 1, this.itemInMapPos.y - 1);
    }

    getMapPos() {
        return CoordinateTranslate.changeToMapPosition(this.node.position);
    }

    getCachePosKey() {
        return this.cacheKey + this.cacheOffset;
    }

    getItemMapData() {
        return CacheMap.getDataFromMap(this.getCachePosKey());
    }

    getDirection() {
        return this.direction;
    }

    getNowShowPos() {
        return CommonUtil.posToKey(cc.v2(this.itemInMapPos.x - 1, this.itemInMapPos.y - 1));
    }
}

interface StateAndLandP {
    landY: number;
    landX: number;
    state: string
}

