import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {JsonMgr} from "../../global/manager/JsonManager";
import {UIMgr} from "../../global/manager/UIManager";
import {DataMgr} from "../../Model/DataManager";
import {TaskData} from "../../Model/taskData";
import {IMissionItem} from "../../types/Response";
import {CommonUtil} from "../../Utils/CommonUtil";
import CommonSimItem from "../common/CommonSimItem";
import {COUNTERTYPE, DotInst} from "../common/dotClient";
import Task from "./task";
import CommunityActive from "../communityActivity/CommunityActive";
import {MFData} from "../MoneyFlyTest/MoneyFlyData";


const {ccclass, property} = cc._decorator;

@ccclass
export default class TaskItem extends cc.Component {
    @property(cc.Node)
    private red: cc.Node = null;
    @property(cc.Prefab)
    private commFiveItem: cc.Prefab = null;
    @property(cc.Node)
    private attachmentNode: cc.Node = null;
    //任务名
    @property(cc.Label)
    private taskName: cc.Label = null;

    @property(cc.Label)
    private taskType: cc.Label = null;
    //进度
    @property(cc.ProgressBar)
    private ProgressBar: cc.ProgressBar = null;
    //进度
    @property(cc.Label)
    private ProgressBarLabel: cc.Label = null;
    //描述
    @property(cc.Label)
    private taskDescribe: cc.Label = null;
    //按钮背景
    @property(cc.Sprite)
    private toTravelToImg: cc.Sprite = null;
    @property(cc.Sprite)
    private toTravelToWz: cc.Sprite = null;
    @property(cc.Button)
    private toTravelTo: cc.Button = null;
    @property(cc.Sprite)
    private iconBg: Array<cc.Sprite> = [];
    @property(cc.Sprite)
    private icon: Array<cc.Sprite> = [];
    @property(cc.Label)
    private iconNum: Array<cc.Label> = [];
    //按钮图片
    @property(cc.SpriteFrame)
    private sf: Array<cc.SpriteFrame> = [];

    private data: IMissionItem = null;
    private json: any = null;
    private str: string = "";


    init = (data) => {
        this.data = data;
        let str: string = DataMgr.getTaskType(this.data.xmlId);
        switch (str) {
            case "daily":
                this.taskType.string = "日常";
                this.json = JsonMgr.getDailyTask(this.data.xmlId);
                let str: string = "";
                let Lv = DataMgr.getUserLv();
                let dailyMissionExp: number = JsonMgr.getLevel(Lv, "dailyTaskExp");
                let dailyTaskGold: number = JsonMgr.getLevel(Lv, "dailyTaskGold");

                if (dailyTaskGold && dailyTaskGold > 0) {
                    str = str + ";-2," + dailyTaskGold * this.json.expRatio;
                }
                if (dailyMissionExp && dailyMissionExp > 0) {
                    str = str + ";-1," + dailyMissionExp * this.json.expRatio;
                }
                this.attachmentInit(this.json.reward + str);
                break;
            case "target":
                this.taskType.string = "目标";
                this.json = JsonMgr.getMainTask(this.data.xmlId);
                this.attachmentInit(this.json.reward);
                break;
            case "community":
                this.taskType.string = "社区";
                this.json = JsonMgr.getActivityTask(this.data.xmlId);
                this.attachmentInit(this.json.reward);
                break;
        }
        if (!this.json.jumpPage) {
            if (!this.data.completed) {
                this.toTravelTo.node.active = false;
            }
        }
        if (this.data.completed) {
            this.toTravelToImg.spriteFrame = this.sf[0];
            this.toTravelToWz.spriteFrame = this.sf[1];
            this.red.active = this.data.completed && DataMgr.getCanShowRedPoint();
        }
        if (this.json.unclockLevel > DataMgr.userData.positionId && !this.data.completed) {
            this.node.active = false;
            return;
        }
        if (this.data.receivedAward === true) {
            this.node.active = false;
            return;
        }
        if (!this.json) {
            return;
        }
        this.taskName.string = this.json.taskName;
        this.taskDescribe.string = this.json.taskDescribe;
        let targetNum: number = this.json.targetNum;
        this.ProgressBar.progress = this.data.current / targetNum;
        this.ProgressBarLabel.string = this.data.current + "/" + targetNum;

    };

    //附件初始化
    attachmentInit = (reward: string) => {
        let attachmentData = [];
        let str = reward.split(";");
        for (let a of str) {
            attachmentData.push(a.split(","))
        }
        for (let i = 0; i < (attachmentData.length > 4 ? 4 : attachmentData.length); i++) {
            let id = attachmentData[i];
            let t = JsonMgr.getInformationAndItem(id[0]);
            if (!t) {
                return;
            }
            let node: cc.Node = cc.instantiate(this.commFiveItem);
            this.attachmentNode.addChild(node);
            let comfive: CommonSimItem = node.getComponent(CommonSimItem);
            comfive.setDotId(5006);
            comfive.setTaskId(this.data.xmlId);
            comfive.updateItem(parseInt(id[0]), parseInt(id[1]));
            // ResMgr.getItemBox(this.iconBg[i], "k" + t.color, 0.5);
            // ResMgr.imgTypeJudgment(this.icon[i], parseInt(id[0]));
            // this.iconNum[i].string = CommonUtil.numChange(parseInt(id[1]), 1) + "";
            // UIMgr.addDetailedEvent(this.iconBg[i].node, parseInt(id[0]));
            // this.iconBg[i].node.active = true;
        }
    };

    toTravelToBtn() {
        // switch (this.str) {
        //     case "daily":
        if (this.data.completed) {
            let task = DataMgr.taskData;
            task.taskXmlId = this.data.xmlId;
            DotInst.clientSendDot(COUNTERTYPE.task, "5001", task.taskXmlId + "");
            MFData.setStartPos(this.node.convertToWorldSpaceAR(cc.v2(0, 0)));
            HttpInst.postData(NetConfig.RECEIVE_AWARD, [this.data.xmlId], this.refresh);
            return;
        }
        this.jump();
        //     break;
        // case "target":
        //     if (this.data.completed) {
        //         let task = DataMgr.taskData;
        //         task.taskXmlId = this.data.xmlId;
        //         HttpInst.postData(NetConfig.RECEIVE_AWARD, [this.data.xmlId], this.refresh);
        //         return;
        //     }
        //     this.jump();
        //     break;
        // default:
        //     cc.log(this.str);
        //     break;
        // }
    }

    //刷新数据
    refresh = (res: any) => {
        if (res.errorMsg) {
            UIMgr.showTipText(res.errorMsg);
        }
        ClientEvents.EVENT_TASK_REFRESH_LIST.emit("daily");
        CommonUtil.showRedDot();
    };

    jump = () => {
        UIMgr.closeView(Task.url, true, true);
        UIMgr.closeView(CommunityActive.url, true, true);
        //打开进货需要的类型
        DataMgr.setChoseOpenGoodsType(-2);
        DotInst.clientSendDot(COUNTERTYPE.task, "5002", this.data.xmlId + "");
        ClientEvents.EVENT_OPEN_UI.emit(this.json.jumpPage, {taskId: this.data.xmlId}, false);
    }

    // update (dt) {}
}
