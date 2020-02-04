import {TimeUtil} from "../../../Utils/TimeUtil";
import {ClientEvents} from "../../../global/manager/ClientEventCenter";

const {ccclass, property} = cc._decorator;

export enum TimeOutType {
    GoldRecruit
}

@ccclass
export class LeftTime extends cc.Component {

    @property(cc.Label)
    leftTimeLabel: cc.Label = null;

    millis: number = -1;
    interval = null;

    private type: TimeOutType = null;

    private des:string = "";


    onLoad() {

    }

    init(millis: number, type: TimeOutType,des?:string) {
        this.des = "";
        this.millis = millis;
        this.type = type;
        if (millis <= 0) {
            //this.node.active = false;
            this.leftTimeLabel.string = "";
            return;
        }

        //if(!this.node.active){
        //this.node.active = true;
        //}
        if(des){
            this.des = des;
        }
        this.leftTimeLabel.string = TimeUtil.getLeftTimeStr(millis)+this.des;
    }

    start() {

    }

    update(dt) {

    }

    onEnable() {
        if (this.hasTime()) {
            this.checkClearInterval();
            this.interval = setInterval(() => {
                // cc.log("LeftTime run...");
                this.millis -= 1000;
                if (this.millis <= 0) {
                    //this.node.active = false;
                    this.leftTimeLabel.string = "时间已清空";
                    this.checkClearInterval();
                    ClientEvents.LEFT_TIME_OUT.emit(TimeOutType.GoldRecruit);
                } else {
                    this.leftTimeLabel.string = TimeUtil.getLeftTimeStr(this.millis)+this.des;
                }
            }, 1000);
        }

        //cc.log("LeftTime onEnable");
    }

    reset() {
        this.millis = -1;
        this.leftTimeLabel.string = "时间已清空";
        this.checkClearInterval();
    }

    onDisable() {
        this.checkClearInterval();
        //cc.log("LeftTime onDisable");
    }

    onDestroy() {
        //cc.log("LeftTime onDestroy");
    }

    show() {
        if (!this.node.active) {
            this.node.active = true;
        }
    }

    hide() {
        if (this.node.active) {
            this.node.active = false;
        }
    }

    private checkClearInterval() {
        if (this.interval) {
            // cc.log("LeftTime clear...");
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    hasTime() {
        return this.millis > 0;
    }

    getMillis() {
        return this.millis;
    }

}
