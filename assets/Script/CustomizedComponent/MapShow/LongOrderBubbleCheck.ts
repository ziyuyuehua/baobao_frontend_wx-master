import {CompositeDisposable} from "../../Utils/event-kit";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {DataMgr} from "../../Model/DataManager";
import {MapMgr} from "./MapInit/MapManager";
import {FutureState} from "./CacheMapDataManager";
import {JumpConst} from "../../global/const/JumpConst";

const {ccclass, property} = cc._decorator;

@ccclass
export default class LongOrderBubbleCheck extends cc.Component {

    @property(cc.Node)
    private canUp: cc.Node = null;
    @property(cc.Node)
    private canGet: cc.Node = null;
    @property(cc.Node)
    private nameBubble: cc.Node = null;
    @property(cc.Node)
    private newCar: cc.Node = null;
    @property(cc.Node)
    private arrowOfLongOrder: cc.Node = null;

    private dispose: CompositeDisposable = new CompositeDisposable();
    private canGetState: boolean = false;
    private canUpState: boolean = false;
    private newCarState: boolean = false;
    private nameBubbleState: boolean = false;
    private mapState: FutureState = FutureState.NORMAL;

    start() {
        this._addListener();
        if (MapMgr.getMapState() !== FutureState.ACCESS) {
            this.showAllBubble();
        }
    }

    private _addListener() {
        this.dispose.add(ClientEvents.LONG_ORDER_BUBBLE.on(this.showBubble));
        this.dispose.add(ClientEvents.GO_FRIEND_HOME.on(this.hideAllBubble));
        this.dispose.add(ClientEvents.BACK_HOME.on(this.showAllBubble));
        this.dispose.add(ClientEvents.SHOW_JUMP_ARROW.on(this.showJumpArrow));
        this.dispose.add(ClientEvents.HIDE_JUMP_ARROW.on(this.hideJumpArrow));
    }

    showJumpArrow = (jumpId: number) => {
        if(jumpId === JumpConst.LONG_ORDER_JUMP) {
            this.newCar.active = false;
            this.canGet.active = false;
            this.canUp.active = false;
            this.nameBubble.active = false;
            this.arrowOfLongOrder.active = true;
            this.moveBubble(this.arrowOfLongOrder, cc.v2(150, 122));
        }
    };

    hideJumpArrow = () => {
        if (this.arrowOfLongOrder && this.arrowOfLongOrder.active) {
            this.arrowOfLongOrder.active = false;
            this.showAllBubble();
        }
    };

    showBubble = (type: number, result: boolean) => {
        this.mapState = MapMgr.getMapState();
        if(MapMgr.getMapState() !== FutureState.ACCESS && !this.arrowOfLongOrder.active) {
            switch (type) {
                case 0:
                    this.showCanGetBubble(result);
                    break;
                case 1:
                    this.showCanUpState(result);
                    break;
                case 2:
                    this.showNewCarBubble(result);
                    break;
                default:
                    this.nameBubble.active = true;
                    break;
            }
        } else {
            this.nameBubble.active = true;
        }
    };

    showCanGetBubble(result: boolean) {
        this.canGetState = result;
        if (!this.newCarState) {
            if (this.canGet.active !== result) {
                this.canGet.active = this.mapState === FutureState.NORMAL ? result : false;
                if(this.canGet.active) {
                    this.moveBubble(this.canGet, cc.v2(150, 130));
                    this.nameBubbleState = !this.canGetState;
                }
            }
        } else {
            this.canGet.active = false;
            this.clearAni(this.canGet);
            this.nameBubbleState = false;
        }
    }

    showCanUpState(result: boolean) {
        this.canUpState = result;
        if (!this.canGetState && !this.newCarState) {
            if (this.canUp.active !== this.canUpState) {
                this.canUp.active = this.mapState === FutureState.NORMAL ? result : false;
                if (this.canUpState) {
                    this.moveBubble(this.canUp, cc.v2(150, 130));
                    this.nameBubbleState = !this.canUpState;
                }
            }
        } else {
            this.canUp.active = false;
            this.nameBubbleState = false;
        }
        this.nameBubble.active = !this.canUpState && !this.canGetState && !this.newCarState;
        MapMgr.longOrderBubbleState = !this.nameBubble.active;
    }

    showNewCarBubble(result: boolean) {
        this.newCarState = result;
        if (result) {
            if (this.newCar.active !== result) {
                this.newCar.active = this.mapState === FutureState.NORMAL ? result : false;
                if (this.newCarState) {
                    this.moveBubble(this.newCar, cc.v2(150, 130));
                } else {
                    this.clearAni(this.newCar);
                }
                this.nameBubble.active = !this.newCarState;
            }
        } else {
            this.nameBubbleState = true;
            this.newCar.active = false;
        }
    }

    hideAllBubble = () => {
        this.arrowOfLongOrder.active = false;
        this.nameBubble.active = false;
        this.canUp.active = false;
        this.canGet.active = false;
        this.newCar.active = false;
        this.clearAni(this.canUp);
        this.clearAni(this.canGet);
        this.clearAni(this.newCar);
    };

    showAllBubble = () => {
        DataMgr.ShowNewCarRed();
        DataMgr.ShowreceiveRed();
        DataMgr.ShowCommitRed();
    };

    protected onDestroy(): void {
        this.dispose.dispose();
    }

    moveBubble(node: cc.Node, pos: cc.Vec2) {
        this.clearAni(node);
        node.setPosition(pos);
        node.runAction(cc.repeatForever(cc.sequence(cc.moveBy(.7, 0, 20), cc.moveBy(.7, 0, -20))));
    }

    clearAni(node: cc.Node) {
        node.stopAllActions();
    }

    // update (dt) {}
}
