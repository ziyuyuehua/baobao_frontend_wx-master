import {CompositeDisposable} from "../../Utils/event-kit";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {NetConfig} from "../../global/const/NetConfig";
import {HttpInst} from "../../core/http/HttpClient";
import {COUNTERTYPE, DotInst} from "../common/dotClient";
import MainUiArrow from "../mainUiArrow";
import {DataMgr} from "../../Model/DataManager";
import {JsonMgr} from "../../global/manager/JsonManager";
import {UIMgr} from "../../global/manager/UIManager";
import {IMissionItem} from "../../types/Response";
import {ButtonMgr} from "../common/ButtonClick";
import {MFData} from "../MoneyFlyTest/MoneyFlyData";
import task from "./task";
import {UIUtil} from "../../Utils/UIUtil";


const {ccclass, property} = cc._decorator;

@ccclass
export default class MainUiTask extends cc.Component {

    @property(cc.Label)
    private taskDescribe: cc.Label = null;
    @property(cc.Label)
    private taskProgress: cc.Label = null;
    @property(cc.Label)
    private taskProgress1: cc.Label = null;
    @property(cc.Animation)
    private completeAnimation: cc.Animation = null;
    @property(cc.Node)
    private specialBtn: cc.Node = null;
    private dispose = new CompositeDisposable();
    private json: any = null;
    private MainTask: IMissionItem = null;
    private isShowPos: boolean = false;

    onLoad() {
        this.dispose.add(ClientEvents.EVENT_REFRESH_MAIN_UI_TASK.on(this.refreshTask));
        this.refreshTask();
    }

    start() {
        ButtonMgr.addClick(this.specialBtn, () => {
            UIMgr.showView(task.url, null);
        })
    }

    refreshTask = () => {
        this.specialBtn.active = false;
        this.node.opacity = 255;
        let taskData = DataMgr.taskData;

        // if (JsonMgr.getConstVal("taskPanelCollectLevel") <= DataMgr.getUserLv() && taskData.dailyTasks.length === 0) {
        //     // this.node.active = false;
        //     let positiontask: IMissionItem[] = taskData.positionTasks;
        //     for (let item of positiontask) {
        //         if (!item.completed) {
        //             this.MainTask = item;
        //             this.json = JsonMgr.getPositionTaskInfo(this.MainTask.xmlId);
        //         }
        //     }
        //     return;
        // }

        this.isShowPos = false;
        if (JsonMgr.getConstVal("dailyTaskFistLevel") > DataMgr.userData.positionId) {   //日常任务未解锁
            this.node.active = (taskData.dailyTasks.length !== 0 || taskData.targetTasks.length !== 0 || taskData.positionTasks.length !== 0);
            if (taskData.targetTasks[0] && taskData.targetTasks[0].completed) {
                this.MainTask = taskData.targetTasks[0];
                this.json = JsonMgr.getMainTask(this.MainTask.xmlId);
            } else if (taskData.dailyTasks[0] && taskData.dailyTasks[0].completed) {
                this.MainTask = taskData.dailyTasks[0];
                this.json = JsonMgr.getDailyTask(this.MainTask.xmlId);
            } else if (taskData.positionBle) {  //隐藏主界面任务条  显示升职条
                cc.log("去升职1");
                this.isShowPos = true;
                this.specialBtn.active = true;
                this.node.opacity = 0;
            } else if (taskData.positionTasks.length > 0) {
                let positiontask: IMissionItem[] = taskData.positionTasks;
                let unFinishPositionTasks: IMissionItem[] = [];
                for (let item of positiontask) {
                    if (!item.completed) {
                        unFinishPositionTasks.push(item);
                    }
                }
                if (unFinishPositionTasks.length > 0) {
                    unFinishPositionTasks.sort((a: IMissionItem, b: IMissionItem) => {
                        let jsonA: IPositionTask = JsonMgr.getPositionTaskInfo(a.xmlId);
                        let jsonB: IPositionTask = JsonMgr.getPositionTaskInfo(b.xmlId);
                        return jsonA.taskSort - jsonB.taskSort;
                    });
                    this.MainTask = unFinishPositionTasks[0];
                    this.json = JsonMgr.getPositionTaskInfo(this.MainTask.xmlId);
                }
            } else if (taskData.targetTasks[0]) {
                this.MainTask = taskData.targetTasks[0];
                this.json = JsonMgr.getMainTask(this.MainTask.xmlId);

            } else if (taskData.dailyTasks[0]) {
                this.MainTask = taskData.dailyTasks[0];
                this.json = JsonMgr.getDailyTask(this.MainTask.xmlId);
            }
        } else {
            this.node.active = taskData.dailyTasks.length !== 0 || taskData.positionTasks.length !== 0;
            if (taskData.dailyTasks[0] && taskData.dailyTasks[0].completed) {
                this.MainTask = taskData.dailyTasks[0];
                this.json = JsonMgr.getDailyTask(this.MainTask.xmlId);
            } else if (taskData.targetTasks[0] && taskData.targetTasks[0].completed) {
                this.MainTask = taskData.targetTasks[0];
                this.json = JsonMgr.getMainTask(this.MainTask.xmlId);
            } else if (taskData.positionBle) {
                cc.log("去升职2");
                this.specialBtn.active = true;
                this.node.opacity = 0;
            } else if (taskData.dailyTasks[0]) {
                this.MainTask = taskData.dailyTasks[0];
                this.json = JsonMgr.getDailyTask(this.MainTask.xmlId);
            } else if (taskData.positionTasks.length > 0) {
                let positiontask: IMissionItem[] = taskData.positionTasks;
                let unFinishPositionTasks: IMissionItem[] = [];
                for (let item of positiontask) {
                    if (!item.completed) {
                        unFinishPositionTasks.push(item);
                    }
                }
                if (unFinishPositionTasks.length > 0) {
                    unFinishPositionTasks.sort((a: IMissionItem, b: IMissionItem) => {
                        let jsonA: IPositionTask = JsonMgr.getPositionTaskInfo(a.xmlId);
                        let jsonB: IPositionTask = JsonMgr.getPositionTaskInfo(b.xmlId);
                        return jsonA.taskSort - jsonB.taskSort;
                    })
                    this.MainTask = unFinishPositionTasks[0];
                    this.json = JsonMgr.getPositionTaskInfo(this.MainTask.xmlId);
                }
            }
            // else if (taskData.targetTasks[0]) {
            //     this.MainTask = taskData.targetTasks[0];
            //     this.json = JsonMgr.getMainTask(this.MainTask.xmlId);
            // }
        }
        // let size = taskData.targetTasks.length;
        // for (let i = 0; i < size; i++) {
        //     let data = taskData.targetTasks[i];
        //     if (!data.receivedAward) {
        //         this.MainTask = data;
        //         break;
        //     }
        // }
        if (!this.MainTask) {
            cc.log("全部主线任务都做完了");
            return;
        }
        DataMgr.taskData.setMainTaskJson(this.json);
        if (this.isShowPos) {
            DataMgr.taskData.setMainTaskIsCom(false);
        } else {
            DataMgr.taskData.setMainTaskIsCom(this.MainTask.completed);
        }
        this.taskDescribe.string = this.json.taskDescribe;
        this.taskProgress.string = this.MainTask.current + "";
        let targetNum: number = this.json.targetNum;
        this.taskProgress1.string = "/" + targetNum;
        if (this.MainTask.current >= targetNum) {
            UIUtil.show(this.completeAnimation);
            UIUtil.asyncPlayAnim(this.completeAnimation, "platform/animation/MainUITaskTx");
            this.taskProgress.node.color = new cc.Color(18, 143, 13);
        } else {
            UIUtil.hide(this.completeAnimation);
            this.taskProgress.node.color = new cc.Color(207, 73, 20);
        }
    };

    onTaskBtn() {
        this.node.parent.parent.getComponent(MainUiArrow).hideRed();
        let targetNum: number = this.json.targetNum;
        ClientEvents.HIDE_MAIN_SOFT_GUIDE.emit();
        if (this.MainTask.current >= targetNum) {
            let task = DataMgr.taskData;
            task.taskXmlId = this.MainTask.xmlId;
            DotInst.clientSendDot(COUNTERTYPE.mainPage, "2013", this.MainTask.xmlId + "");
            MFData.setStartPos(this.node.convertToWorldSpaceAR(cc.v2(0, 0)));
            HttpInst.postData(NetConfig.RECEIVE_AWARD, [this.MainTask.xmlId], this.refresh);
        } else {
            DotInst.clientSendDot(COUNTERTYPE.mainPage, "2014", this.MainTask.xmlId + "");
            // ClientEvents.HIDE_TIP_REND.emit();
            ClientEvents.EVENT_OPEN_UI.emit(this.json.jumpPage, {taskId: this.MainTask.xmlId}, false);
        }
    }


    refresh = (res: any) => {
        this.scheduleOnce(() => {
            this.unscheduleAllCallbacks();
            DataMgr.judgeStartSoftGuideJson();
        }, 0.1);
        if (res.errorMsg) {
            UIMgr.showTipText(res.errorMsg);
        }
    };


    onDestroy() {
        this.dispose.dispose();
    }

    // update (dt) {}
}
