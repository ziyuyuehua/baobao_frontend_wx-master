/**
*@Athuor ljx
*@Date 14:40
*/
import {DataMgr} from "../../Model/DataManager";
import {IMissionItem} from "../../types/Response";
import {JsonMgr} from "../../global/manager/JsonManager";
import {ButtonMgr} from "../common/ButtonClick";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {UIMgr} from "../../global/manager/UIManager";
import BigMap from "./BigMap";
import MissionBg from "./MissionBg";
import {BigMData} from "./BigMapData";
import {ARROW_DIRECTION, GuideMgr} from "../common/SoftGuide";
import {CommonUtil} from "../../Utils/CommonUtil";
import {COUNTERTYPE, DotInst} from "../common/dotClient";

const {ccclass, property} = cc._decorator;

@ccclass

export default class MissionNode extends cc.Component {
    @property(cc.Label)
    private description: cc.Label = null;
    @property(cc.Label)
    private jindu: cc.Label = null;
    @property(cc.ProgressBar)
    private missionLoad: cc.ProgressBar = null;
    @property(cc.Sprite)
    private isOk: cc.Sprite = null;
    @property(cc.SpriteFrame)
    private notOk: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    private ok: cc.SpriteFrame = null;

    private missionData: IStoreTask = null;
    private task: IMissionItem = null;
    private completeState: boolean = false;
    private index: number = 0;

    protected start(): void {
        this._bindEvent();
    }

    private _bindEvent() {
        ButtonMgr.addClick(this.isOk.node, this.goMission);
    }

    init(index: number, taskId: number) {
        this.index = index;
        let storeTask = DataMgr.taskData.getStoreTask();
        this.task = storeTask[index];
        if(this.task){
            this.missionData = JsonMgr.getStoreTask(taskId);
            this.description.string = (index + 1) + "、" + this.missionData.taskDescribe;
            this.initCompleteBtn();
            this.initProgress();
        }else{
            cc.error("not found task index=", index);
        }
    }

    initCompleteBtn() {
        let isComplete = this.task.completed;
        if (isComplete) {
            this.isOk.spriteFrame = this.ok;
            this.isOk.node.getComponent(cc.Button).transition = cc.Button.Transition.NONE;
            this.completeState = true;
        } else {
            this.isOk.spriteFrame = this.notOk;
            this.completeState = false;
            if(BigMData.getIsAllMissionComplete()) {
                setTimeout(() => {
                    GuideMgr.showSoftGuide(this.isOk.node, ARROW_DIRECTION.BOTTOM, "开始\n任务吧", null, false, 0, false, this.goMission);
                }, 100);
            }
            BigMData.setIsAllMissionComplete();
        }
    }

    initProgress() {
        let current = this.task.current;
        let need = this.missionData.targetNum;
        let changeNeed = CommonUtil.numChange(need);
        let changeCurry = CommonUtil.numChange(current);
        if(need > current) {
            this.jindu.string = changeCurry + "/" + changeNeed;
            this.missionLoad.progress = current / need;
        } else {
            this.jindu.string = changeNeed + "/" + changeNeed;
            this.missionLoad.progress = 1;
        }
    }

    goMission = () => {
        if(!this.completeState) {
            ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true);
            DotInst.clientSendDot(COUNTERTYPE.otherMarket, "12004", this.index.toString());
            UIMgr.closeView(MissionBg.url);
            UIMgr.closeView(BigMap.url);
            ClientEvents.EVENT_OPEN_UI.emit(this.missionData.jumpPage);
        }
    };
}