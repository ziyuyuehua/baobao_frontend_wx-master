import CacheMapDataManager, {CacheMap, FutureState} from "../CacheMapDataManager";
import {Area, ExpUtil} from "../Utils/ExpandUtil";
import {DataMgr} from "../../../Model/DataManager";
import {CoordinateTranslate} from "../../../Utils/CoordinateTranslate";
import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {ResManager} from "../../../global/manager/ResManager";
import {Vertex} from "../../../global/const/StringConst";
import {StringUtil} from "../../../Utils/StringUtil";
import {UIMgr} from "../../../global/manager/UIManager";
import {MapMgr} from "../MapInit/MapManager";
import {ButtonMgr} from "../../common/ButtonClick";
import {CommonUtil} from "../../../Utils/CommonUtil";
import {COUNTERTYPE, DotInst} from "../../common/dotClient";
import {TextTipConst} from "../../../global/const/TextTipConst";
import {JsonMgr} from "../../../global/manager/JsonManager";


const {ccclass, property} = cc._decorator;


enum Direction {
    UP = "up",
    DOWN = "down",
    LEFT = "left",
    RIGHT = "right"
}

@ccclass
export default class Floors extends cc.Component {

    @property(cc.Sprite)
    private icon: cc.Sprite = null;

    private map: cc.Node = null;
    private mapManager: CacheMapDataManager = null;
    private cachePos: cc.Vec2 = null;
    private itemPos: cc.Vec2 = null;
    private itemInMapPos: cc.Vec2 = null;
    private isAdd = false;
    private state = 0;
    private moveDirection = {V: Direction.LEFT, H: Direction.UP};
    private xmlData: IDecoShopJson = null;
    private xmlId: number = 0;
    private specialArea: Area = null;
    private normalArea: Area = null;
    private divPoint: number = 0;
    private checkX: number = 0;
    private checkY: number = 0;
    private defaultFloor: number = 0;

    onLoad() {
        this.mapManager = CacheMap;
        this.defaultFloor = MapMgr.getDefaultNum();
    }

    start() {
        this._bindEvent();
    }

    //该事件是由地图进入地板模式，点击地板触发
    initFloor = (clickMapPosition: cc.Vec2, xmlId: number) => {
        CacheMap.checkFloorDown(this);
        this.xmlData = DataMgr.jsonDatas.decoShopJsonData[xmlId];
        this.xmlId = xmlId;
        this.isAdd = false;
        this.state = FutureState.GROUND;
        this.node.position = CoordinateTranslate.changeToGLPosition(clickMapPosition);
        this.showChooseItemDo();
        ResManager.getFloorMoudle(this.icon, this.xmlData.pattern);
        this.itemPos = this.node.position;
        this.itemInMapPos = clickMapPosition;
        this.cachePos = clickMapPosition;
        MapMgr.changeOneNodeFloor(this.cachePos, MapMgr.getBaseFloorXmlData());
        this.setNormalAndSpecial();
        this.getDirection();
    };

    showChooseItemDo() {
        let grayCb = () => {

        };
        ClientEvents.EVENT_SHOW_CHOOSEITEMDO.emit("Floors", this, this.state, this.xmlData, grayCb);
    }

    private _bindEvent = () => {
        ButtonMgr.addClick(this.node, this.touchEndEvent, this.moveGround, null, this.touchEndEvent);
    };

    //移动地板的方法
    moveItem = (event: cc.Event.EventTouch) => {
        event.stopPropagation();
        let startPosition = this.node.convertToNodeSpaceAR(event.getStartLocation());
        let movePosition = this.node.convertToNodeSpaceAR(event.getLocation());
        let nowPosition = cc.v2(this.itemPos.x - (startPosition.x - movePosition.x), this.itemPos.y - (startPosition.y - movePosition.y));
        this.itemInMapPos = CoordinateTranslate.changeToMapPosition(nowPosition);
        if (this.specialArea) {
            this.specialCheck();
        } else {
            this.normalCheck();
        }
    };

    touchEndEvent = () => {
        this.getDirection();
        this.recordItemPos();
    };

    specialCheck() {
        let pos = this.getNowMapPos();
        let xY;
        if (this.specialArea.area == "left") {
            xY = Floors.areaCheck(this.specialArea.minY, this.specialArea.minX,
                this.specialArea.maxY, this.normalArea.maxX, this.normalArea.minX, this.normalArea.minX, this.normalArea.minY,
                this.itemInMapPos.y, this.itemInMapPos.x, pos.x, pos.y
            );
            this.itemInMapPos.x = xY.check2;
            this.itemInMapPos.y = xY.check1;
        } else {
            xY = Floors.areaCheck(this.specialArea.minX, this.specialArea.minY, this.specialArea.maxX, this.normalArea.maxY,
                this.normalArea.minY, this.normalArea.minY, this.normalArea.minX, this.itemInMapPos.x, this.itemInMapPos.y,
                pos.y, pos.x);
            this.itemInMapPos.x = xY.check1;
            this.itemInMapPos.y = xY.check2;
        }
    }

    getNowMapPos() {
        return CoordinateTranslate.changeToMapPosition(this.node.getPosition());
    }

    /**
     *
     * @param divArePoint
     * @param otherNum1 分离区域最小值
     * @param otherNum2 分离区域最大值
     * @param otherNum3 正常区域最大值
     * @param otherNum4 正常区域最小值
     * @param otherNum5 分离区域分割值
     * @param otherNum6
     * @param checkPoint1
     * @param checkPoint2
     * @param nowPoint1 当前位置1
     * @param nowPoint2 当前位置2
     */
    static areaCheck(divArePoint: number, otherNum1: number, otherNum2: number,
                     otherNum3: number, otherNum4: number, otherNum5: number, otherNum6: number,
                     checkPoint1: number, checkPoint2: number, nowPoint1: number, nowPoint2: number) {
        if (nowPoint2 >= divArePoint) {
            if (checkPoint2 < otherNum1) {
                checkPoint2 = otherNum1
            }
            if (checkPoint1 > otherNum2) {
                checkPoint1 = otherNum2
            }
            if (checkPoint2 > otherNum3) {
                checkPoint2 = otherNum3;
            }
            if (nowPoint1 < otherNum5 && nowPoint2 >= divArePoint && checkPoint1 < divArePoint) {
                checkPoint1 = divArePoint;
            }
        } else {
            if (checkPoint2 < otherNum4) {
                checkPoint2 = otherNum4;
            } else if (checkPoint2 > otherNum3) {
                checkPoint2 = otherNum3;
            }
            if (checkPoint1 < otherNum6) {
                checkPoint1 = otherNum6;
            }
        }
        return {check1: checkPoint1, check2: checkPoint2};
    }

    normalCheck() {
        let minX = this.normalArea.minX;
        let maxX = this.normalArea.maxX;
        let minY = this.normalArea.minY;
        let maxY = this.normalArea.maxY;
        if (this.itemInMapPos.x < minX) {
            this.itemInMapPos.x = minX;
        }
        if (this.itemInMapPos.x > maxX) {
            this.itemInMapPos.x = maxX;
        }
        if (this.itemInMapPos.y < minY) {
            this.itemInMapPos.y = minY;
        }
        if (this.itemInMapPos.y > maxY) {
            this.itemInMapPos.y = maxY;
        }
    }

    setNormalAndSpecial() {
        this.specialArea = ExpUtil.getSpecialArea();
        this.normalArea = ExpUtil.getNormalArea();
    }

    moveGround = (event: cc.Event.EventTouch) => {
        //点用移动的函数
        this.moveItem(event);
        //判断点击的地方是否为可点击的地板
        this.node.setPosition(CoordinateTranslate.changeToGLPosition(cc.v2(this.itemInMapPos.x, this.itemInMapPos.y)));
    };

    //重置position
    recordItemPos = () => {
        this.itemPos = this.node.getPosition();
    };

    //修改某一块地板
    changeGround = (isChange: boolean = true) => {
        DotInst.clientSendDot(COUNTERTYPE.decoration, "7011", this.xmlData.id.toString(), DataMgr.getMarketId().toString(), this.itemInMapPos.toString());
        let nowData = this.mapManager.getOneFloorData(this.itemInMapPos);
        let id = nowData.value;
        if (this.isAdd) {
            if (id !== this.xmlId) {
                let xmlData = DataMgr.jsonDatas.getDecoShopXmlData(id);
                if (id !== this.defaultFloor) {
                    ClientEvents.BACK_TO_MINI_WARE.emit(xmlData, 1);
                }
                this.mapManager.setFloorDataByPos(this.itemInMapPos, this.xmlId);
                MapMgr.changeOneNodeFloor(this.itemInMapPos, this.xmlData);
            } else {
                ClientEvents.BACK_TO_MINI_WARE.emit(this.xmlData, 1);
            }
        } else {
            if (!this.cachePos.equals(this.itemInMapPos)) {
                if (this.xmlId !== id) {
                    let xmlData = DataMgr.jsonDatas.getDecoShopXmlData(id);
                    if (id !== this.defaultFloor) {
                        ClientEvents.BACK_TO_MINI_WARE.emit(xmlData, 1);
                    }
                    this.mapManager.setFloorDataByPos(this.itemInMapPos, this.xmlId);
                    MapMgr.changeOneNodeFloor(this.itemInMapPos, this.xmlData);
                } else {
                    ClientEvents.BACK_TO_MINI_WARE.emit(this.xmlData, 1);
                }
                this.mapManager.setFloorDataByPos(this.cachePos, this.defaultFloor);
            } else {
                MapMgr.changeOneNodeFloor(this.itemInMapPos, this.xmlData);
            }
        }
        let pos;
        if (!isChange) {
            pos = this.checkCanCountineDown();
        }
        if (!pos) {
            this.backToPool();
        } else {
            this.isAdd = true;
            ClientEvents.BACK_TO_MINI_WARE.emit(this.xmlData, -1);
            this.itemInMapPos = cc.v2(pos.x, pos.y);
            this.node.position = CoordinateTranslate.changeToGLPosition(this.itemInMapPos);
            ClientEvents.EVENT_RESET_VIEW.emit(CommonUtil.getRestView(this.node));
            this.recordItemPos();
            return true;
        }

    };

    checkCanCountineDown = () => {
        let floorData = DataMgr.warehouseData.getFloorDataVo(this.xmlId);
        if (!floorData || floorData.num <= 0) {
            return null;
        }
        return this.checkNextPosition();
    };

    getDirection = () => {
        this.getMinXAndMinY();
        let VMid = Math.ceil(this.checkY / 2);
        let HMid = Math.ceil(this.checkX / 2);
        if (this.itemInMapPos.x >= Vertex.VERTEX_X - HMid) {
            this.moveDirection.H = Direction.LEFT;
        } else {
            this.moveDirection.H = Direction.RIGHT;
        }
        if (this.itemInMapPos.y >= Vertex.VERTEX_Y - VMid) {
            this.moveDirection.V = Direction.UP;
        } else {
            this.moveDirection.V = Direction.DOWN;
        }
    };

    changeMoveDirection = () => {
        if (this.moveDirection.H === Direction.LEFT) {
            this.moveDirection.H = Direction.RIGHT;
        } else {
            this.moveDirection.H = Direction.LEFT;
        }
    };

    checkNextPosition = () => {
        this.getMinXAndMinY();
        this.moveDirection.H === Direction.LEFT ? (this.itemInMapPos.x--) : (this.itemInMapPos.x++);
        let nextPosX = this.itemInMapPos.x;
        let nextPosY = this.itemInMapPos.y;
        let result;
        if (nextPosX > Vertex.VERTEX_X || nextPosX < this.checkX) {
            this.moveDirection.V === Direction.UP ? (this.itemInMapPos.y--) : (this.itemInMapPos.y++);
            nextPosY = this.itemInMapPos.y;
            if (nextPosX > Vertex.VERTEX_X) {
                this.itemInMapPos.x = nextPosX = Vertex.VERTEX_X;
            } else if (nextPosX < this.checkX) {
                this.itemInMapPos.x = nextPosX = this.checkX;
            }
            this.changeMoveDirection();
        }
        let data = this.mapManager.getOneFloorData(cc.v2(nextPosX, nextPosY));
        if (!data) {
            return null;
        }
        if (data.value == this.xmlId) {
            if ((
                (this.moveDirection.H === Direction.RIGHT && this.moveDirection.V === Direction.UP)
                && (nextPosX >= Vertex.VERTEX_X && nextPosY <= this.checkY))
                ||
                ((this.moveDirection.H === Direction.RIGHT && this.moveDirection.V === Direction.DOWN) &&
                    (nextPosX >= Vertex.VERTEX_X && nextPosY >= Vertex.VERTEX_Y))
                ||
                ((this.moveDirection.H === Direction.LEFT && this.moveDirection.V === Direction.UP)
                    && (nextPosX <= this.checkX && nextPosY <= this.checkY))
                ||
                ((this.moveDirection.H === Direction.LEFT && this.moveDirection.V === Direction.DOWN)
                    && (nextPosX <= this.checkX && nextPosY >= Vertex.VERTEX_Y))) {
                return null;
            }
            return this.checkNextPosition();
        } else {
            result = {x: nextPosX, y: nextPosY};
            return result;
        }
    };

    private getMinXAndMinY() {
        if (this.specialArea) {
            if (this.specialArea.area == "left") {
                this.divPoint = this.specialArea.minY;
                this.checkX = this.itemInMapPos.y < this.divPoint ? this.normalArea.minX : this.specialArea.minX;
                this.checkY = this.normalArea.minY;
            } else {
                this.divPoint = this.specialArea.minX;
                this.checkX = this.normalArea.minX;
                this.checkY = this.itemInMapPos.x < this.divPoint ? this.normalArea.minY : this.specialArea.minY;
            }
        } else {
            this.checkX = this.normalArea.minX;
            this.checkY = this.normalArea.minY;
        }
    }

    removeItem = () => {
        //取消操作，判断是否是添加的状态
        if (this.isAdd) {
            ClientEvents.BACK_TO_MINI_WARE.emit(this.xmlData, 1);
        } else {
            MapMgr.changeOneNodeFloor(this.cachePos, this.xmlData);
        }
        this.backToPool();

    };

    //回收单块地板的逻辑
    collapsItem = () => {
        if (!this.isAdd) {
            this.mapManager.setFloorDataByPos(this.itemInMapPos, this.defaultFloor);
            MapMgr.changeOneNodeFloor(this.cachePos, MapMgr.getBaseFloorXmlData());
        }
        ClientEvents.BACK_TO_MINI_WARE.emit(this.xmlData, 1);
        this.backToPool();
    };

    analysPosition = (position: number) => {
        return {x: Math.floor(position / 1000), y: position % 1000};
    };

    //一键全收，分为当前平铺和未平铺的情况，平铺则只需要将地板重置为初始地板，非平铺则需要回收当前选中的地板类型
    storgeAll = () => {
        let count = 0;
        let map = new Map<number, number>();
        count = this.mapManager.getMapAndFloorCount(map, this.xmlId, count);
        map.forEach((value, key) => {
            this.mapManager.setFloorData(key, value);
        });
        let trueCount = this.isAdd ? count + 1 : count;
        ClientEvents.BACK_TO_MINI_WARE.emit(this.xmlData, trueCount);
        this.backToPool();
    };

    backToPool = () => {
        CacheMap.clearChosenFloor();
        CacheMap.backFloorToNodePool(this.node);
    };

    unuse = () => {
        this.isAdd = false;
    };

    changeAllFloor = () => {
        this.mapManager.oneSetChangeFloor(this.xmlId);
        ExpUtil.oneSetFloor(this.xmlData);
    };

    //从仓库里拿出来时，判断地板数量是否足够
    canChangeAllFloor = () => {
        let floorCount = DataMgr.warehouseData.getFloorDataVo(this.xmlId);
        let count = 0;
        let backMap = new Map<number, number>();
        count = this.mapManager.getChangeAllCount(this.xmlId, count, backMap);
        let trueCount = this.isAdd ? count + 1 + (floorCount ? floorCount.num : 0) : count + (floorCount ? floorCount.num : 0);
        let total = CacheMap.getFloorData().size;
        if (trueCount < total) {
            UIMgr.showTipText(StringUtil.format(JsonMgr.getTips(TextTipConst.QUESHAODIBAN), (total - trueCount)));
            return true;
        }
        let allData = DataMgr.jsonDatas.decoShopJsonData;
        backMap.forEach((value, key) => {
            let xmlData = allData[key];
            ClientEvents.BACK_TO_MINI_WARE.emit(xmlData, value);
        });
        DotInst.clientSendDot(COUNTERTYPE.decoration, "7012", this.xmlData.id.toString(), DataMgr.getMarketId().toString());
        let needCount = this.isAdd ? (total - count - 1) : (total - count);
        if (needCount !== 0) {
            ClientEvents.BACK_TO_MINI_WARE.emit(this.xmlData, -needCount);
        }
        this.changeAllFloor();
        this.backToPool();

    };

    addFloor = (xmlData: IDecoShopJson, state: number, pos: cc.Vec2, map: cc.Node) => {
        CacheMap.checkFloorDown(this);
        this.map = map;
        this.xmlData = xmlData;
        this.xmlId = this.xmlData.id;
        this.state = state;
        ResManager.getFloorMoudle(this.icon, this.xmlData.pattern);
        this.node.position = CoordinateTranslate.changeToGLPosition(pos);
        this.itemPos = this.node.getPosition();
        this.itemInMapPos = cc.v2(CoordinateTranslate.changeToMapPosition(this.itemPos));
        this.isAdd = true;
        this.setNormalAndSpecial();
        this.getDirection();
        this.showChooseItemDo();
    };

    getShowPos() {
        return this.itemInMapPos;
    }
}
