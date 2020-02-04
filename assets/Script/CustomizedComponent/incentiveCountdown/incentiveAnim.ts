import {GameComponent} from "../../core/component/GameComponent";


const {ccclass, property} = cc._decorator;

@ccclass
export default class IncentiveAnim extends GameComponent {

    static url = "incentiveCountdown/incentiveAnim";
    // private arrString: string[] = null;
    // private idx: number = 0;
    // private isGold: boolean = false;

    protected getBaseUrl(): string {
        return IncentiveAnim.url;
    }

    @property(cc.Animation)
    private anim: cc.Animation = null;
    @property(cc.Animation)
    private anim1: cc.Animation = null;
    // @property(sp.Skeleton)
    // private sk: sp.Skeleton = null;
    // @property(cc.Node)
    // private flyingMoney:cc.Node = null;

    onLoad() {
        let isDiam = this.node["data"];
        this.anim.on("stop", () => {
            // this.palySkeleton();
            this.closeOnly();
        });
        this.anim1.on("stop", () => {
            // this.palySkeleton();
            this.closeOnly();
        });
        /*this.sk.setCompleteListener(() => {
            if (DataMgr.checkInPowerGuide()) {
                ClientEvents.UP_POWER_GUIDE.emit(7);
            }
            // this.sk.node.active = false;
            DataMgr.isIncentive = false;
            this.closeOnly();
        });
        let isDiam: boolean = false;
        let arr: ICommonRewardInfo[] = data.reward;
        this.arrString = [];
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].xmlId == -3) {
                isDiam = true;
            }
            if (arr[i].xmlId == -2) {
                this.isGold = true;
            }
        }*/
        // this.idx = 0;
        // this.arrString[0] = isDiam ? "促销的热闹景象吸引了大批游客，赚翻啦！" : "促销声势浩大，很多人慕名而来！";
        // this.arrString[1] = CommonUtil.putRewardTogether(data.reward);
        if (isDiam) {
            this.anim.play();
        } else {
            this.anim1.play();
            // this.palySkeleton();
        }
    }

    // palySkeleton = () => {
    //     this.sk.node.active = true;
    //     this.sk.setAnimation(0, "animation", false);
    //     this.initTips();
    // };
    //
    // initTips = () => {
    //     if (this.idx === 0) {
    //         UIMgr.showTipText(this.arrString[this.idx]);
    //         this.arrString.splice(0,1);
    //     } else {
    //         UIMgr.showTipText(null,this.arrString[0]);
    //     }
    //     this.scheduleOnce(() => {
    //         this.idx++;
    //         if (this.idx <= 1) {
    //             this.initTips();
    //         }
    //     }, .8);
    // }
}
