import {GameSpine} from "../../../../core/component/GameSpine";
import {UIUtil} from "../../../../Utils/UIUtil";
import {MapTourBus} from "../../MapTourBus";
import {ButtonMgr} from "../../../common/ButtonClick";
import {ResManager} from "../../../../global/manager/ResManager";
import {MapMgr} from "../../../MapShow/MapInit/MapManager";
import {CommonUtil} from "../../../../Utils/CommonUtil";
import {UIMgr} from "../../../../global/manager/UIManager";
import {CarMgr, CarName} from "../../../MapShow/CarMoveManager";
import {COUNTERTYPE, DotInst} from "../../../common/dotClient";
import {DataMgr} from "../../../../Model/DataManager";

const {ccclass, property} = cc._decorator;

@ccclass
export class Bus extends GameSpine {

    @property(cc.Sprite)
    private tourNumBg: cc.Sprite = null;
    @property(cc.Label)
    private tourNumLab: cc.Label = null;

    @property(cc.Node)
    private numNode: cc.Node = null;
    @property(cc.Label)
    private firstLab: cc.Label = null;

    private mapTourBus: MapTourBus = null;

    private isFirst: boolean = false; //是否第1次开启巴士
    private isRemove: boolean = false; //是否第3辆车过来顶走移除
    private running: boolean = false; //是否大巴在运行中
    private isMove: boolean = false; //是否长按移动地图

    onLoad() {
        super.onLoad();
        ButtonMgr.addClick(this.node, this.receptionOrOpenView, this.moveEvent);
    }

    moveEvent = (event: cc.Event.EventTouch) => {
        this.isMove = UIMgr.moveOverried(event);
    };

    init(mapTourBus: MapTourBus, tourNum: number, isFirst: boolean = false) {
        this.mapTourBus = mapTourBus;
        this.isFirst = isFirst;
        UIUtil.show(this.tourNumBg);
        UIUtil.setLabel(this.tourNumLab, tourNum);
    }

    getSpineUrl() {
        return ResManager.platformPath("spine/map/bus/map_bus");
    }

    doOnComplete = () => {
        cc.log("Bus doOnComplete");
        this.stop();
    };

    setRemove() {
        this.isRemove = true;
    }

    receptionOrOpenView = () => {
        if (this.isRemove || this.running) {
            return;
        }
        if (!this.isMove) {
            DotInst.clientSendDot(COUNTERTYPE.mainPage, "2039", "1");
            MapMgr.checkBusCanDown() && this.mapTourBus.receptionOrOpenView();
        }
        this.isMove = false;
    };

    reception() {
        UIUtil.hide(this.tourNumBg);
    }

    run() {
        if(!this.isValid) return;
        this.play("run");
        this.running = true;
        UIUtil.hide(this.tourNumBg);
    }

    click() {
        if(!this.isValid) return;
        this.play("dianji");
    }

    stop() {
        if(!this.isValid) return;
        this.play("stop");
        this.running = false;

        UIUtil.show(this.tourNumBg);
        UIUtil.visibleNode(this.numNode, !this.isFirst);
        UIUtil.visible(this.firstLab, this.isFirst);
    }

    runAwayAni = (station: number, busMap: Map<number, Bus>, busLayer: cc.Node) => {
        let click = cc.callFunc(() => {
            if (!this.isRemove) {
                this.click();
            }
            this.reception();
        });
        let delay = cc.delayTime(this.isRemove ? 1 : 3);
        let run = cc.callFunc(() => {
            this.run();
        });
        let move = cc.moveTo(5, -1365, -1430);
        let destroy = cc.callFunc(() => {
            this.node.destroy();
        });

        let moveFun = (cb?: Function) => {
            if(!this.node) return;
            this.node.runAction(cc.sequence(click, delay, run, move, destroy, cc.callFunc(() => {
                cb && cb();
            })));
            busMap.delete(station);
            if (busMap.size > 0) { //如果后面还有巴士，则顶上第一个位置
                let bus = CommonUtil.mapValues(busMap)[0];
                setTimeout(() => {
                    //bus.node.setPosition(START_POS);
                    let run = cc.callFunc(() => {
                        bus.run();
                    });
                    let move = cc.moveTo(2, 245, -660);
                    let stop = cc.callFunc(() => {
                        bus.stop();
                    });
                    bus.node.runAction(cc.sequence(run, move, stop));
                }, 3000);
            }
        };
        CarMgr.addCarToQue({carName: CarName.BusCar, cb: moveFun});
    };
}
