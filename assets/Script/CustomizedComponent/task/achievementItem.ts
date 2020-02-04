import {HttpClient, HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {UIUtil} from "../../Utils/UIUtil";
import {CommonUtil} from "../../Utils/CommonUtil";
import {DataMgr} from "../../Model/DataManager";
import {JsonMgr} from "../../global/manager/JsonManager";
import {ResMgr} from "../../global/manager/ResManager";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {IRespData} from "../../types/Response";
import {UIMgr} from "../../global/manager/UIManager";


const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    //任务名
    @property(cc.Label)
    private taskName: cc.Label = null;
    //任务描述
    @property(cc.Label)
    private taskDescribe: cc.Label = null;
    //可获得奖杯数
    @property(cc.Label)
    private trophyLabel: cc.Label = null;
    // 进度
    @property(cc.ProgressBar)
    private ProgressBar: cc.ProgressBar = null;
    //领取按钮
    @property(cc.Button)
    private getAward: cc.Button = null;
    //按钮图
    @property(cc.Sprite)
    private getAwardImg: cc.Sprite = null;
    @property(cc.SpriteFrame)
    private sf: Array<cc.SpriteFrame> = [];
    //奖励父节点
    @property(cc.Node)
    private rewardNode: cc.Node = null;
    //道具图标
    @property(cc.Sprite)
    private thePropsImg: Array<cc.Sprite> = [];
    //道具数量
    @property(cc.Label)
    private thePropsNumber: Array<cc.Label> = [];

    private data: any = null;
    private str: string = "";

    onLoad() { }

    start() {

    }

    init = (data: any, json: any) => {
        this.data = data;
        this.taskName.string = json.taskName;
        this.taskDescribe.string = json.taskDescribe;
        this.trophyLabel.string = json.piont;
        this.ProgressBar.progress = data.current / data.target;
        if (data.receivedAward) {
            this.getAwardImg.spriteFrame = this.sf[2];
        } else {
            if (data.completed) {
                let node:cc.Node = this.node.parent.parent;
                node.getComponent("tabList").refreshRedDot();
                this.getAwardImg.spriteFrame = this.sf[1];
                this.getAward.interactable = true;
            }
        }
        this.attachmentInit(json.reward);
    }

    //附件初始化
    attachmentInit = (reward: string) => {
        let attachmentData = new Array();
        let str: string[] = reward.split(";");
        for (let a of str) {
            attachmentData.push(a.split(","))
        }

        for (let i = 0; i < (attachmentData.length > 4 ? 4 : attachmentData.length); i++) {
            let id = attachmentData[i];
            let t = JsonMgr.getInformationAndItem(id[0]);
            if (!t) {
                return;
            }
            let nodeBox:cc.Sprite = this.rewardNode.children[i].getComponent(cc.Sprite);
            ResMgr.getItemBox(nodeBox,"k" + t.color);
            ResMgr.imgTypeJudgment(this.thePropsImg[i],parseInt(id[0]));
            this.thePropsNumber[i].string =  CommonUtil.numChange(parseInt(id[1]),1)+ "";

            UIMgr.addDetailedEvent(this.rewardNode.children[i],parseInt(id[0]));
            this.rewardNode.children[i].active = true;
        }
    }
    //领取按钮
    getAttachmentBtm() {

        if (this.data.completed === true) {
            HttpInst.postData(NetConfig.RECEIVE_AWARD, [this.data.xmlId], this.refresh);
            return;
        }

    }

    //刷新数据
    refresh = (res: IRespData) => {
        ClientEvents.EVENT_TASK_GRT_PRIZE.emit(res);
        // ClientEvents.EVENT_TASK_REFRESH_LIST.emit(this.str);
    }





    // update (dt) {}
}
