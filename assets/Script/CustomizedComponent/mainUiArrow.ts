import { MapJumpArr } from "../global/const/JumpConst";
import { ClientEvents } from "../global/manager/ClientEventCenter";
import { UIMgr } from "../global/manager/UIManager";
import { DataMgr } from "../Model/DataManager";
import { CompositeDisposable } from "../Utils/event-kit";
import CommonGiftView from "./common/CommonGiftView";
import ExpandFrame from "./ExpandFrame/ExpandFrame";
import IncidentView from "./incident/IncidentView";
import UpgradePopover from "./upgradePopover";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MainUiArrow extends cc.Component {

    @property(cc.Node)
    private StockDividend: cc.Node = null;

    @property(cc.Node)
    private mainTask: cc.Node = null;

    @property(cc.Node)
    private arrow: Array<cc.Node> = [];

    @property(cc.Node)
    private zhuangxiuRed: cc.Node = null;

    private dispose = new CompositeDisposable();

    private state: boolean = true;

    onLoad() {

        this.dispose.add(ClientEvents.UPDATE_MAINUI_RED.on(this.resetArrow));
        this.dispose.add(ClientEvents.HIDE_MAINUI_ARR.on(this.hideRed));
        this.dispose.add(ClientEvents.CHANGE_ARR_BY_STATE.on(this.changeArrowByState));
        this.dispose.add(ClientEvents.HIDE_JUMP_ARROW.on(() => {
            DataMgr.setClickTaskJumpMap(0);
            this.resetArrow();
        }));
        this.resetArrow();
    }


    resetArrow = () => {
        if (this.state) {
            this.arrow.forEach((item: cc.Node) => {
                if (item) {
                    item.active = false;
                }
            }, this);
            if (DataMgr.getCanShowRedPoint() || DataMgr.checkInPowerGuide()) return;
            if (MapJumpArr.indexOf(DataMgr.getClickTaskJumpMap()) != -1) {
                return;
            }
            let node: cc.Node = UIMgr.getView(CommonGiftView.url);
            if (node) {
                return;
            }
            let node2: cc.Node = UIMgr.getView(ExpandFrame.url);
            if (node2) {
                return;
            }
            let node7: cc.Node = UIMgr.getView(IncidentView.url);
            if (node7) {
                return;
            }
            // let node6: cc.Node = UIMgr.getView(UpgradePopover.url);
            // if (node6) {
            //     return;
            // }
            // let node5: cc.Node = UIMgr.getARROrdeNode();
            // if (node5 && node5.active) {
            //     return;
            // }
            // let node3: cc.Node = cc.find("Canvas/mask");
            // if (node3 && node3.active) {
            //     return;
            // }
            //可领任务奖励
            if (this.mainTask.active) {
                // this.arrow[1].active = true;
                return;
            }
            //不可领任务
            // this.arrow[5].active = true;
        }
    };

    hideRed = () => {
        this.arrow.forEach((item: cc.Node) => {
            if (item) {
                item.active = false;
            }
        }, this);
    };

    changeArrowByState = (state: boolean) => {
        this.arrow.forEach((value) => {
            if(value) {
                this.state = state;
                value.active = state;
            }
        });
    };

    onDestroy() {
        this.dispose.dispose();
    }
}
