import {GameComponent} from "../../core/component/GameComponent";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {FunctionName, JsonMgr} from "../../global/manager/JsonManager";
import {ResMgr} from "../../global/manager/ResManager";
import {UIMgr} from "../../global/manager/UIManager";
import {DataMgr} from "../../Model/DataManager";
import {IMissionItem} from "../../types/Response";
import {CompositeDisposable} from "../../Utils/event-kit";
import {ButtonMgr} from "../common/ButtonClick";
import CommonSimItem, {SetBoxType} from "../common/CommonSimItem";
import positionTaskItem from "./positionTaskItem";
import upgradeReward from "./upgradeReward";
import {GuideIdType, judgeSoftGuideStart} from "../../global/const/GuideConst";
import {ARROW_DIRECTION, GuideMgr} from "../common/SoftGuide";
import {COUNTERTYPE, DotInst} from "../common/dotClient";

const {ccclass, property} = cc._decorator;

@ccclass
export default class bossTask extends GameComponent {
    static url: string = "task/task";
    @property(cc.Sprite)
    curPosBg: cc.Sprite = null;        //当前职位背景图
    @property(cc.Sprite)
    curPosRole: cc.Sprite = null;      //当前职位背景图
    @property(cc.Sprite)
    curPosBadge: cc.Sprite = null;     //当前职位徽章
    @property(cc.Node)
    badgeStar1: cc.Node = null;        //徽章星1
    @property(cc.Node)
    badgeStar2: cc.Node = null;        //徽章星2
    @property(cc.Sprite)
    curPosPai: cc.Sprite = null;       //当前职位牌
    @property(cc.Node)
    nextPositionNode: cc.Node = null;  //下一职位节点
    @property(cc.Label)
    nextPosition: cc.Label = null;     //下一职位Lab
    @property(cc.Node)
    starNode: cc.Node = null;          //星级
    @property(cc.Node)
    cai: cc.Node = null;               //彩
    @property(cc.Node)
    hui: cc.Node = null;               //灰
    @property(cc.Node)
    giftNode: cc.Node = null;          //奖励节点
    @property(cc.Layout)
    giftLayout: cc.Layout = null;      //奖励layOut
    @property(cc.Layout)
    taskLayOut: cc.Layout = null;      //任务进度layOut
    @property(cc.Node)
    taskNode: cc.Node = null;          //任务节点
    @property(cc.Node)
    maxLevelNode: cc.Node = null;      //最大等级节点
    @property(cc.Node)
    promoteBtn: cc.Node = null;        //晋升按钮
    @property(cc.Prefab)
    taskItem: cc.Prefab = null;        //任务item
    @property(cc.Prefab)
    awardItem: cc.Prefab = null;       //奖励item
    @property(cc.Node)
    randomStaffIcon: cc.Node = null;   //随机员工
    @property(cc.Node)
    upUnlock: cc.Node = null;          //解锁功能节点
    @property(cc.Layout)
    openLayOut: cc.Layout = null;      //解锁功能layout
    @property(cc.Node)
    openBtnItem: cc.Node = null;       //解锁功能item

    curRank: number = 0;
    curLevel: number = 0;
    curPositionJson: IPositionJson = null;
    dispose: CompositeDisposable = new CompositeDisposable();
    openArr: IFunctionOpenJson[] = [];

    // onLoad () {}

    start() {
        this.updateView();
        ButtonMgr.addClick(this.promoteBtn, this.upgradePosition);
        this.initGuide();
    }

    getPromoteBtn = () => {
        return this.promoteBtn;
    };

    initGuide() {
        let curSoftGuide: ISoftGuideJson = JsonMgr.getSoftGuideJsoById(GuideIdType.position, 2);
        if (curSoftGuide && judgeSoftGuideStart(curSoftGuide)) {
            DotInst.clientSendDot(COUNTERTYPE.softGuide, "19003");
            GuideMgr.showSoftGuide(this.promoteBtn, ARROW_DIRECTION.TOP, curSoftGuide.displayText, (node: cc.Node) => {
            }, false, 0, false, this.upgradePosition);
        }
    }

    //刷新当前等级相关
    updateView = () => {
        this.promoteBtn.getComponent(cc.Button).interactable = true;
        let curPositionId: number = DataMgr.userData.getPositionId();
        this.curPositionJson = JsonMgr.getPositionJson(curPositionId);
        this.curRank = this.curPositionJson.rank;
        this.curLevel = this.curPositionJson.level;
        let drop = this.curPositionJson.drop;
        ResMgr.setPositionIcon(this.curPosBg, this.curPositionJson.positionBg);            //职位背景
        ResMgr.setPositionIcon(this.curPosBadge, this.curPositionJson.positionIcon);       //职位图标
        ResMgr.setPositionIcon(this.curPosPai, this.curPositionJson.positionTitle);        //职位标题
        let roleIconArr = this.curPositionJson.positionIconBig.split(";");
        //性别
        let roleImg: string = DataMgr.userData.getSex() == 1 ? roleIconArr[0].split(",")[1] : roleIconArr[1].split(",")[1];
        ResMgr.setPositionIcon(this.curPosRole, roleImg);   //职位角色大图
        this.badgeStar1.active = this.curRank < 5;
        this.badgeStar2.active = this.curRank >= 5;
        for (let i = 2; i <= 10; i++) {
            this.badgeStar1.getChildByName("star" + i).active = false;
            this.badgeStar2.getChildByName("star" + i).active = false;
        }
        for (let i = 2; i <= this.curLevel; i++) {
            if (this.curRank < 5) {
                this.badgeStar1.getChildByName("star" + i).active = true;
            } else {
                this.badgeStar2.getChildByName("star" + i).active = true;
            }
        }
        let allLevelInRank: number = JsonMgr.getPositionJsonByRank(this.curRank).length;
        this.starNode.removeAllChildren();
        for (let i = 1; i <= allLevelInRank; i++) {
            if (i <= this.curLevel) {
                let node = cc.instantiate(this.cai);
                this.starNode.addChild(node);
            } else {
                let node = cc.instantiate(this.hui);
                this.starNode.addChild(node);
            }
        }
        //不是最高阶段显示下一阶段名
        let nextRankJson: IPositionJson = JsonMgr.getNextRankPositionFirstJson(this.curRank + 1);
        if (nextRankJson) {
            this.nextPosition.string = nextRankJson.name;
        } else {
            this.nextPositionNode.active = false;
        }
        //未达到满级
        if (this.curPositionJson.nextId) {
            DataMgr.taskData.positionTasks.sort((a: IMissionItem, b: IMissionItem) => {
                let jsonA: IPositionTask = JsonMgr.getPositionTaskInfo(a.xmlId);
                let jsonB: IPositionTask = JsonMgr.getPositionTaskInfo(b.xmlId);
                return jsonA.taskSort - jsonB.taskSort;
            });
            this.updateTaskView(DataMgr.taskData.positionTasks);
            if (drop)
                this.updateAward(drop);
        } else {
            this.giftNode.active = false;
            this.taskNode.active = false;
            this.promoteBtn.active = false;
            this.maxLevelNode.active = true;
        }
    }

    //晋升奖励
    updateAward(drop: string) {
        let awardArr = drop.split(";");
        this.giftLayout.node.removeAllChildren();
        for (let i = 0; i < awardArr.length; i++) {
            let xmlId: number = Number(awardArr[i].split(",")[0]);
            let num: number = Number(awardArr[i].split(",")[1]);
            let node = cc.instantiate(this.awardItem);
            let awardItem: CommonSimItem = node.getComponent(CommonSimItem);
            awardItem.node.setScale(1.2);
            if (JsonMgr.isStaffRandom(xmlId)) {
                awardItem.updateItem(xmlId, num, SetBoxType.Staff);
            } else {
                awardItem.updateItem(xmlId, num, SetBoxType.Item);
            }
            this.giftLayout.node.addChild(node);
        }
    }

    //晋升任务进度
    updateTaskView(missions) {
        if (!this.taskNode) return;
        for (let i in missions) {
            if (!(missions[i].completed)) {
                this.taskNode.active = true;
                this.promoteBtn.active = false;
                this.giftNode.active = false;
                this.upUnlock.active = false;
                this.taskLayOut.node.removeAllChildren();
                for (let i = 0; i < missions.length; i++) {
                    let node = cc.instantiate(this.taskItem);
                    let taskItem: positionTaskItem = node.getComponent(positionTaskItem);
                    taskItem.initTaskItem(missions[i]);
                    this.taskLayOut.node.addChild(node);
                }
                return;
            }
        }
        this.taskNode.active = false;
        this.promoteBtn.active = true;
        this.giftNode.active = true;
        let nextPositionId: number = this.curPositionJson.nextId;
        this.openArr = JsonMgr.getFunctionOpenByPositionId(nextPositionId, 2);
        if (this.openArr.length > 0) {
            this.upUnlock.active = true;
            this.initFunctionOpen(this.openArr);
        }
    }

    initFunctionOpen(openFunctionJsonArr: IFunctionOpenJson[]) {
        this.openLayOut.node.removeAllChildren();
        for (let i = 0; i < openFunctionJsonArr.length; i++) {
            let node = cc.instantiate(this.openBtnItem);
            ResMgr.setAccessPathIcon(node.getChildByName("icon").getComponent(cc.Sprite), openFunctionJsonArr[i].icon, true);
            this.openLayOut.node.addChild(node);
        }
    }

    upgradePosition = () => {
        this.promoteBtn.getComponent(cc.Button).interactable = false;
        DataMgr.setPlayAnimation(false);
        DotInst.clientSendDot(COUNTERTYPE.position, "160001", this.curPositionJson.id.toString()); //升职打点
        HttpInst.postData(NetConfig.UPGRADE_POSITION, [], (res) => {
            if (DataMgr.userData.positionId == 400304) {
                ClientEvents.SHOW_MOVIE_BUBBLE.emit();
            }
            this.promoteBtn.active = false;
            //DataMgr.taskData.setTaskData(res.missionInfo);
            let upPositionId: number = DataMgr.userData.getPositionId();
            let upRank: number = JsonMgr.getPositionJson(upPositionId).rank;
            if (this.curRank == upRank) {
                //职位小提升
                cc.log("职位小提升");
            } else {
                //职位大提升
                cc.log("职位大提升");
            }
            if (res.reward) {
                let str: string = "";
                for (let i in res.reward) {
                    if (Number(i) < res.reward.length - 1) {
                        str = str + res.reward[i].xmlId + "," + res.reward[i].num + ";";
                    } else {
                        str = str + res.reward[i].xmlId + "," + res.reward[i].num;      //最后一个末尾不加分号
                    }
                }
                UIMgr.showTipText(null, str, null);
            }
            this.updateView();
            ClientEvents.EVENT_FUNCTION_OPEN.emit();
            UIMgr.showView(upgradeReward.url, null, {openArr: this.openArr, rewardStaff: res.receiveStaffs});
            ClientEvents.UPDATE_TASK_BTN.emit();
            ClientEvents.MOVE_CLOSE_BTN.emit();
        });
    }

    protected getBaseUrl(): string {
        return bossTask.url;
    }

}
