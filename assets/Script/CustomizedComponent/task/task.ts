import {GameComponent} from "../../core/component/GameComponent";
import {TextTipConst} from "../../global/const/TextTipConst";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {FunctionName, JsonMgr} from "../../global/manager/JsonManager";
import {UIMgr} from "../../global/manager/UIManager";
import {DataMgr, GET_ANI_TYPE} from "../../Model/DataManager";
import {TaskData} from "../../Model/taskData";
import {ButtonMgr} from "../common/ButtonClick";
import {COUNTERTYPE, DotInst, DotVo} from "../common/dotClient";
import {topUiType} from "../MainUiTopCmpt";
import BtnEffect from "./BtnEffect";
import DailyTasks from "./dailyTasks";
import TargetTasks from "./targetTasks";
import bossTask from "./bossTask";
import PowerGuide from "../PowerGuide/PowerGuide";


const {ccclass, property} = cc._decorator;

@ccclass
export default class Task extends GameComponent {
    static url = 'task/task';
    private id: number = 0;
    @property(cc.Button)
    private btnNode: Array<cc.Button> = [];
    @property(cc.Node)
    private pageNode: Array<cc.Node> = [];
    @property(cc.Node)
    private redDot: Array<cc.Node> = [];
    @property(cc.Node)
    private helpTips: cc.Node = null;
    @property(cc.Node)
    private helpTips1: cc.Node = null;
    @property(cc.Node)
    private aniNode: cc.Node = null;

    @property(cc.Node)
    private bossNode: cc.Node = null;

    @property(cc.Node)
    private dailyNode: cc.Node = null;

    @property(cc.Node)
    private taskNode: cc.Node = null;

    @property(cc.Node)
    private closeNode: cc.Node = null;

    onLoad() {
        this.addEvent(ClientEvents.EVENT_TASK_TAB_RED_DOT.on(this.refreshRedDot));
        this.addEvent(ClientEvents.CLOSE_TASK_VIEW.on(this.shutDownTaskBtn));
        this.addEvent(ClientEvents.MOVE_CLOSE_BTN.on(() => {
            this.initRedDot();
        }))
        this.initRedDot();
        // HttpInst.postData(NetConfig.SHOW_SELL_GOAL, [], (resp: IRespData) => {
        //     DataMgr.taskData.setGoal(resp);
        //     this.redDot[2].active = resp.goal.hasDrawCnt < resp.goal.completeCnt;
        // });
        ButtonMgr.addClick(this.helpTips, () => {
            UIMgr.showTextTip(TextTipConst.TaskTip);
        });
        ButtonMgr.addClick(this.helpTips1, () => {
            UIMgr.showTextTip(TextTipConst.POSITION_RODE);
        });
        ButtonMgr.addClick(this.dailyNode, this.dailyBtn);
        ButtonMgr.addClick(this.bossNode, this.bossBtn);
        this.taskNode.active = false;
        ButtonMgr.addClick(this.taskNode, this.targetBtn);
        ButtonMgr.addClick(this.closeNode, this.shutDownTaskBtn);
    }

    onEnable() {
        this.onShowPlay(1, this.aniNode, () => {
            if (DataMgr.checkInPowerGuide()) {
                // this.node.parent.group = "guideLayer";
                let boss: bossTask = this.pageNode[4].getComponent(bossTask);
                UIMgr.showView(PowerGuide.url, null, null, (node: cc.Node) => {
                    node.getComponent(PowerGuide).setNodeToPowerGuide(boss.getPromoteBtn(), () => {
                        boss.upgradePosition();
                        DotInst.clientSendDot(COUNTERTYPE.powerGuide, "208");
                        // this.node.parent.group = "default";
                    }, 15, true, false);
                }, null, 10000);
            }
        });
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.ordinary);
    }

    setSwitch(type: number) {
        this.switch(type);
    }


    initRedDot = () => {
        let data: TaskData = DataMgr.taskData;
        this.redDot[0].active = data.dailyBle || data.targetBle;
        this.redDot[1].active = data.targetBle;
        this.redDot[4].active = data.positionBle;
        if (data.positionBle) {
            this.bossBtn()
        } else {
            if (data.dailyBle || data.targetBle) {
                this.redDot[0].active = false;
                this.closeNode.x = 0;
                return;
            } else {
                this.bossBtn();
            }
        }

    };

    refreshRedDot = (str: string, ble: boolean) => {
        let TipsNode: cc.Node = UIMgr.tipsView;
        switch (str) {
            case "daily":
            case "target":
                if (TipsNode && TipsNode.active) {
                    return;
                }
                this.redDot[0].active = ble && this.id != 0;
                // if (this.pageNode[0].getComponent(DailyTasks) !== null) {
                //     this.pageNode[0].getComponent(DailyTasks).init();
                // }
                break;
            // case "target":
            //     if (TipsNode && TipsNode.active) {
            //         return;
            //     }
            //     this.redDot[1].active = ble && this.id != 1;
            //     if (this.pageNode[1].getComponent(TargetTasks) !== null) {
            //         this.pageNode[1].getComponent(TargetTasks).init();
            //     }
            //     break;
            case "position":
                if (this.pageNode[4].active) {
                    if (TipsNode && TipsNode.active) {
                        return;
                    }
                    this.redDot[4].active = ble && this.id != 4;
                    // if (this.pageNode[4].getComponent(bossTask) !== null) {
                    //     this.pageNode[4].getComponent(bossTask).updateView();
                    // }
                }
                break;
        }
    };

    bossBtn = () => {
        this.switch(4);
        let data: TaskData = DataMgr.taskData;
        this.redDot[4].active = false;
        this.redDot[1].active = data.targetBle;
        this.redDot[0].active = data.dailyBle || data.targetBle;
        if (data.positionBle) {
            this.closeNode.x = -160;
        } else {
            this.closeNode.x = 0;
        }
    }

    //日常
    dailyBtn = () => {
        DataMgr.setPlayAnimation(true);
        DotInst.clientSendDot(COUNTERTYPE.position, "160003"); //升职打点
        this.switch(0);
        let data: TaskData = DataMgr.taskData;
        this.redDot[1].active = data.targetBle;
        this.redDot[4].active = data.positionBle;
        this.redDot[0].active = false;
        this.closeNode.x = 0;
    }

    //目标
    targetBtn = () => {
        DotInst.clientSendDot(COUNTERTYPE.task, "5004");
        this.switch(1);
        let data: TaskData = DataMgr.taskData;
        this.redDot[0].active = data.dailyBle || data.targetBle;
        this.redDot[4].active = data.positionBle;
        this.redDot[1].active = false;
    }

    switch = (id: number) => {
        this.id = id;
        this.btnNode.forEach((item: cc.Button, index: number) => {
            if (index === id) {
                item.node.zIndex = 1;
                item.interactable = false;
                return;
            }
            let node: BtnEffect = item.node.getComponent(BtnEffect);
            node.setting();
            item.interactable = true;
        });
        // if (this.ble) {
        //     this.btnNode[0].node.active = false;
        // }
        this.pageNode.forEach((item: cc.Node, index: number) => {
            if (index === id) {
                item.active = true;
                return;
            }
            item.active = false;
        })
    };


    shutDownTaskBtn = () => {
        DataMgr.setPlayAnimation(true);
        DotInst.clientSendDot(COUNTERTYPE.position, "160002"); //升职打点
        UIMgr.closePanel();
        this.closeView();
    }

    onDisable() {
        if (DataMgr.UiTop && !DataMgr.friendshipUiTop) {
            ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.gold);
        } else if (DataMgr.friendshipUiTop && DataMgr.UiTop) {
            ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.friendship);
        } else {
            ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -1);
        }
        this.dispose.dispose();
    }

    getBaseUrl() {
        return Task.url;
    }
}
