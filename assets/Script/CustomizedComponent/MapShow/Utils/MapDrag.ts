import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {CompositeDisposable} from "../../../Utils/event-kit";
import {UIMgr} from "../../../global/manager/UIManager";
import {CacheMap, FutureState} from "../CacheMapDataManager";
import {DataMgr} from "../../../Model/DataManager";
import {dircetionConst, IBubbleInfo, IDirection, redBubbleConst} from "../../../global/const/RedBubbleConst";
import {MapMgr} from "../MapInit/MapManager";
import {MiniData} from "../../NewMiniWarehouse/MiniWarehouseData";

const {ccclass, property} = cc._decorator;

@ccclass
export class MapDrag extends cc.Component {

    //主背景节点
    @property(cc.Node)
    mainNode: cc.Node = null;

    //拖拽前后记录的当前地图位置
    private curMapPos: cc.Vec2 = null;

    //拖拽移动地图最大、小X、Y坐标值
    private maxX: number;
    private minX: number;
    private maxY: number;
    private minY: number;

    private clickPoint: number = 0;
    private maxScale = 1.7;
    private minScale = 0.65;
    private touches: cc.Event.EventTouch[] = [];
    private distance = 0;

    private baseChange: number = 350;
    private dispose = new CompositeDisposable();
    private canvas: cc.Node = null;

    private hasMove: boolean = false;

    private amplification: number = (this.maxScale - 1) / this.baseChange;

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_END, () => {
            if (this.hasMove) {
                ClientEvents.HIDE_JUMP_ARROW.emit();
            }
            this.hasMove = false;
        });
        this.node.on(cc.Node.EventType.TOUCH_MOVE, () => {
            this.hasMove = true;
        });
    }

    //start() {}

    private addMoveMapListener() {
        this.calcMoveMapLimit();
        this.mainNode.on(cc.Node.EventType.TOUCH_MOVE, this.moveMap, this);
        this.node.on(cc.Node.EventType.TOUCH_START, this.checkManyPoint, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.recordMapPos, this);//
        this.node.on(cc.Node.EventType.TOUCH_END, this.recordMapPos, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.scaleMap, this);
    }

    //记录地图当前位置
    private recordMapPos() {
        this.clickPoint === 2 && this.calcMoveMapLimit();
        this.touches.splice(0, this.touches.length);
        this.clickPoint = 0;
        this.curMapPos = this.node.getPosition();
        CacheMap.setScaleValue(this.node.scale);
        if (MapMgr.getMapState() === FutureState.NORMAL) {
            this.setMainUIBubbleData();
        }
    }

    setMainUIBubbleData = () => {
        if (!DataMgr.getCanShowRedPoint()) return;
        let longOrderNode = UIMgr.getLongOrderNode();
        let orderNode = UIMgr.getOrderNode();
        if (!longOrderNode) return;

        let isLongOrder: boolean = DataMgr.getCommitResult() || DataMgr.getNewCarRedResult() || DataMgr.getReceiveResult();
        let isOrder: boolean = DataMgr.orderRedResult();
        let longOrderShow: boolean = false;
        let orderShow: boolean = false;
        let longDirection: IDirection = {directionX: 0, directionY: 0};
        let orderDirection: IDirection = {directionX: 0, directionY: 0};
        let data: IBubbleInfo = {direction: {directionX: 0, directionY: 0}, bubbleType: 0, isShow: false};
        let longOrderPos = this.canvas.convertToNodeSpaceAR(longOrderNode.convertToWorldSpaceAR(cc.v2(0, 0)));
        let orderPos = this.canvas.convertToNodeSpaceAR(orderNode.convertToWorldSpaceAR(cc.v2(0, 0)));
        if (-longOrderPos.x > (this.canvas.width / 2 + longOrderNode.width) || -longOrderPos.y > (this.canvas.height / 2 + longOrderNode.height)) {
            longOrderShow = true;
        }
        if (Math.abs(orderPos.x) > (this.canvas.width / 2 + orderNode.width / 2) || -orderPos.y > (this.canvas.height / 2 + orderNode.height / 2)) {
            orderShow = true;
            if (orderPos.x < -(this.canvas.width / 2 + orderNode.width / 2)) {
                orderDirection.directionX = dircetionConst.LEFT;
            } else if (orderPos.x > (this.canvas.width / 2 + orderNode.width / 2)) {
                orderDirection.directionX = dircetionConst.RIGHT;
            }
        }
        if (isLongOrder) {
            data.bubbleType = redBubbleConst.LONGORDER;
            data.direction = longDirection;
            data.isShow = longOrderShow;
        } else if (isOrder) {
            data.bubbleType = redBubbleConst.ORDER;
            data.direction = orderDirection;
            data.isShow = orderShow;
        }
        ClientEvents.REFRESH_MAINUI_REDBUBBLE.emit(data);
    };

    start() {
        this.canvas = UIMgr.getCanvas();
        let heiB = this.canvas.height / this.mainNode.height;
        let widB = this.canvas.width / this.mainNode.width;
        this.minScale = Math.max(heiB, widB);
        CacheMap.setScaleValue(1.4);
        this.node.scale = CacheMap.getScaleValue();
        this.addMoveMapListener();
        this.addListener();
    }

    addListener = () => {
        this.dispose.add(ClientEvents.EVENT_RESET_VIEW.on(this.resetview));
        this.dispose.add(ClientEvents.EVENT_CLEAR_TOUCHES.on(this.clearTouches));
    };

    clearTouches = () => {
        this.touches.splice(0, this.touches.length);
        this.clickPoint = 0;
    };

    resetview = (position: cc.Vec2, cb?: Function, duraciont?: number) => {
        let canvasPos = this.canvas.convertToWorldSpaceAR(cc.v2(0, 0));
        let pos = cc.v2(this.node.x - (position.x - canvasPos.x), this.node.y - (position.y - canvasPos.y));
        this.calcMoveMapLimit();
        if (pos.x < this.minX) {
            pos.x = this.minX;
        }
        if (pos.y < this.minY) {
            pos.y = this.minY;
        }
        if (pos.x > this.maxX) {
            pos.x = this.maxX;
        }
        if (pos.y > this.maxY) {
            pos.y = this.maxY;
        }
        this.node.runAction(cc.sequence(cc.moveTo(duraciont === 0 ? duraciont : 0.2, pos), cc.callFunc(() => {
            cb && cb();
        })));
    };

    //计算移动地图x与y能达到的最大最小值
    private calcMoveMapLimit() {
        let min = this.canvas.convertToWorldSpaceAR(cc.v2(-this.canvas.width / 2, -this.canvas.height / 2));
        let max = this.canvas.convertToWorldSpaceAR(cc.v2(this.canvas.width / 2, this.canvas.height / 2));
        let mainMin = this.mainNode.convertToWorldSpaceAR(cc.v2(this.mainNode.width / 2, this.mainNode.height / 2));
        let mainMax = this.mainNode.convertToWorldSpaceAR(cc.v2(-this.mainNode.width / 2, -this.mainNode.height / 2));
        this.maxX = this.node.x - (mainMax.x - min.x);
        this.minX = this.node.x - (mainMin.x - max.x);
        this.maxY = this.node.y - (mainMax.y - min.y);
        this.minY = this.node.y - (mainMin.y - max.y);
    }

    //移动地图
    moveMap(event: cc.Event.EventTouch) {
        if (this.clickPoint != 1){
            return;
        }

        MiniData.resetNoThingDo();
        CacheMap.setHasMove(true);
        //获取鼠标偏移量
        let startLocation = this.canvas.convertToWorldSpaceAR(event.getStartLocation());
        let moveLocation = this.canvas.convertToWorldSpaceAR(event.getLocation());
        this.node.setPosition(this.curMapPos.x - (startLocation.x - moveLocation.x),
            this.curMapPos.y - (startLocation.y - moveLocation.y));

        let nowPos = this.node.getPosition();
        //防止滑动超出地图大小
        if (nowPos.x > this.maxX) {
            nowPos.x = this.maxX;
        } else if (nowPos.x < this.minX) {
            nowPos.x = this.minX;
        }
        if (nowPos.y > this.maxY) {
            nowPos.y = this.maxY;
        } else if (nowPos.y < this.minY) {
            nowPos.y = this.minY;
        }
        this.node.setPosition(nowPos);
        this.checkLoadBigHouse();
    }

    private checkLoadBigHouse(){
        if(!UIMgr.loadedBigHouse){
            ClientEvents.LOAD_BIG_HOUSE.emit();
            UIMgr.loadedBigHouse = true;
        }
    }

    checkManyPoint = (event: cc.Event.EventTouch) => {
        this.clickPoint++;
        this.touches.push(event);
        if (this.clickPoint === 2) {
            this.distance = this.getDistance();
        }
        this.curMapPos = this.node.getPosition();
    };

    //缩放地图
    scaleMap = () => {
        if (this.clickPoint != 2){
            return;
        }

        MiniData.resetNoThingDo();
        CacheMap.setHasMove(true);
        let distance = this.getDistance();
        let offset = this.distance - distance;
        if (offset < 0) {
            this.node.scale = this.node.scale + (-offset) * this.amplification >= this.maxScale ? this.maxScale : this.node.scale + (-offset) * this.amplification;
        } else if (offset > 0) {
            let scale = this.node.scale;
            if (scale + (-offset) * this.amplification <= this.minScale) {
                this.node.scale = this.minScale
            } else {
                this.node.scale = scale + (-offset) * this.amplification;
            }
            let worP = this.getMainMinWorPos();
            if (worP.x >= 0) {
                this.node.x -= this.getMainMinWorPos().x;
            }
            if (worP.y >= 0) {
                this.node.y -= this.getMainMinWorPos().y;
            }
            let rightPos = this.getMainMaxWorPos();
            if (rightPos.x <= this.canvas.width) {
                this.node.x += this.canvas.width - this.getMainMaxWorPos().x;
            }
            if (rightPos.y <= this.canvas.height) {
                this.node.y += this.canvas.height - this.getMainMaxWorPos().y;
            }

        }
        this.distance = distance;
        this.checkLoadBigHouse();
    };

    getMainMinWorPos = () => {
        return this.mainNode.convertToWorldSpaceAR(cc.v2(-this.mainNode.width / 2, -this.mainNode.height / 2));
    };

    getMainMaxWorPos = () => {
        return this.mainNode.convertToWorldSpaceAR(cc.v2(this.mainNode.width / 2, this.mainNode.height / 2));
    };

    private getDistance = () => {
        let firstLocation = this.touches[0].getLocation();
        let secondLocation = this.touches[1].getLocation();
        let x = Math.abs(firstLocation.x - secondLocation.x);
        let y = Math.abs(firstLocation.y - secondLocation.y);
        return Math.sqrt(x * x + y * y);
    };

    protected onDestroy(): void {
        this.dispose.dispose();
    }
}
