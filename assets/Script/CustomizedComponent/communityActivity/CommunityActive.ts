import {GameComponent} from "../../core/component/GameComponent";
import {HttpInst} from "../../core/http/HttpClient";
import {JumpConst} from "../../global/const/JumpConst";
import {NetConfig} from "../../global/const/NetConfig";
import {RedConst} from "../../global/const/RedConst";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {JsonMgr} from "../../global/manager/JsonManager";
import {UIMgr} from "../../global/manager/UIManager";
import {ActiVityState, ActiVityType, IncitientBoxState} from "../../Model/activity/ActivityModel";
import {DataMgr} from "../../Model/DataManager";
import {IncidentConf} from "../../Model/incident/jsonconfig/IncidentConf";
import {Reward} from "../../Utils/CommonUtil";
import {TimeUtil} from "../../Utils/TimeUtil";
import {UIUtil} from "../../Utils/UIUtil";
import ActiveShop from "../active/ActiveShop";
import ActivityIntegral from "../active/ActivityIntegral";
import {ButtonMgr} from "../common/ButtonClick";
import IncidentCommunity from "../incident/IncidentCommunity";
import CommunityGiftItem from "./CommunityGiftItem";
import CommunityRank from "./CommunityRank";
import {topUiType} from "../MainUiTopCmpt";
import {DotInst, COUNTERTYPE} from "../common/dotClient";
import COMMUNITY_ACTIVE_SHOP = ClientEvents.COMMUNITY_ACTIVE_SHOP;
import {TextTipConst} from "../../global/const/TextTipConst";
// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommunityActive extends GameComponent {
    static url: string = "CommunityActivity/CommunityActive";

    @property(cc.Node)
    aniNode: cc.Node = null;

    @property(cc.Node)
    returnBtn: cc.Node = null;

    @property(cc.Node)
    upDetail: cc.Node = null;

    @property(cc.Node)
    canInditient: cc.Node = null;

    @property(cc.Node)
    rankBtn: cc.Node = null;

    @property(cc.Node)
    taskBtn: cc.Node = null;

    @property(cc.Node)
    giftBtn: cc.Node = null;

    @property(cc.Node)
    getGiftBtn: cc.Node = null;

    @property(cc.Node)
    haveGetBtns: cc.Node = null;

    @property(cc.Node)
    ClosegiftBtn: cc.Node = null;

    @property(cc.Sprite)
    activityUrl: cc.Sprite = null;

    @property(cc.Sprite)
    incilientUrl: cc.Sprite = null;

    @property(cc.Label)
    incilientTitle: cc.Label = null;

    @property(cc.Label)
    incilientDesc: cc.Label = null;

    @property(cc.Sprite)
    activityBtn: cc.Sprite = null;

    @property(cc.ProgressBar)
    actiProgress: cc.ProgressBar = null;

    @property(cc.Label)
    actiProgressLab: cc.Label = null;

    @property(cc.Label)
    timeLabel: cc.Label = null;

    @property(cc.Node)
    boxNode: cc.Node = null;

    @property(cc.Layout)
    boxlayout: cc.Layout = null;

    @property(cc.Prefab)
    boxprefab: cc.Prefab = null;

    @property(cc.Node)
    noOpen2: cc.Node = null;

    @property(cc.Node)
    OpenNode: cc.Node = null;

    @property(cc.Sprite)
    boxRedPoint: cc.Sprite = null;

    @property(cc.Node)
    helpRedPoint: cc.Node = null;

    @property(cc.Node)
    activityRedPoint: cc.Node = null;

    @property(cc.Node)
    taskRed: cc.Node = null;

    @property(cc.Node)
    lastTerm: cc.Node = null;

    @property(cc.Node)
    tipBtn: cc.Node = null;


    private leftTime: number = 0;
    private notices: any[] = [];
    private noticesItem: any = null;
    private i: number;

    getBaseUrl() {
        return CommunityActive.url
    }

    onEnable() {
        this.onShowPlay(1, this.aniNode);
        DataMgr.UiTop = true;
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.gold);
        DataMgr.increaseTopUiNum();
    }

    onDisable(): void {
        DataMgr.decrTopUiNum();
        DataMgr.UiTop = false;
        if (DataMgr.friendshipUiTop) {
            ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.friendship);
        } else {
            ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -2);
        }
    }


    onLoad() {
        ButtonMgr.addClick(this.returnBtn, this.closeView);
        ButtonMgr.addClick(this.upDetail, this.onJump);
        ButtonMgr.addClick(this.lastTerm, this.openAcitveShop)
        ButtonMgr.addClick(this.canInditient, this.openInditientView);
        ButtonMgr.addClick(this.rankBtn, this.openRankView);
        ButtonMgr.addClick(this.giftBtn, this.openGiftView);
        ButtonMgr.addClick(this.haveGetBtns, this.openGiftView);
        ButtonMgr.addClick(this.boxNode, this.closeGiftView);
        ButtonMgr.addClick(this.taskBtn, this.openTaskHandler);
        ButtonMgr.addClick(this.activityBtn.node, this.openActivityShopOrta);
        ButtonMgr.addClick(this.getGiftBtn, this.getGiftHandler);
        ButtonMgr.addClick(this.tipBtn, this.tipHandler);
        ButtonMgr.addClick(this.helpRedPoint, this.openInditientView);
        this.addEvent(ClientEvents.EVENT_COMMUNITY_RED.on((ble: boolean) => {
            this.taskRed.active = ble;
        }));
        this.addEvent(ClientEvents.UPDATE_MAINUI_RED.on(this.updateRedStatus));
        this.addEvent(ClientEvents.UPDATE_COMMUNITY_PRO.on(this.setView));
        this.addEvent(ClientEvents.COMMUNITY_ACTIVE_SHOP.on(this.updateRed));
        this.updateRedStatus(DataMgr.getRedData());
        this.taskRed.active = DataMgr.taskData.communityBle;
        this.upStaff();
    }

    tipHandler = () => {
        UIMgr.showTextTip(TextTipConst.communityTip);
    };

    updateRed = () => {
        this.updateRedStatus(DataMgr.getRedData());
    };

    updateRedStatus = (redDatas: number[]) => {
        HttpInst.postData(NetConfig.ASSIST_ENTRANCE, [], (response) => {
            DataMgr.fillActivityModel(response);
            if(!this.activityRedPoint) return;
            this.activityRedPoint.active = redDatas.indexOf(RedConst.ACTIVITY_SHOP) !== -1 || redDatas.indexOf(RedConst.ACTIVITY_GOAL) !== -1;
            this.helpRedPoint.active = redDatas.indexOf(RedConst.ASSIST_DETAIL) !== -1 && response.entrance.maxAssistanceNum;
            this.setRedAction(this.helpRedPoint);
        });
    };

    setRedAction(redSprite: cc.Node) {
        let moveSpr: cc.Node = redSprite.getChildByName("remove");
        if (redSprite.active) {
            let active1 = cc.repeatForever(cc.sequence(cc.moveTo(0.5, moveSpr.x, 10),
                cc.moveTo(0.5, moveSpr.x, 0)));
            moveSpr.stopAllActions();
            moveSpr.runAction(active1);
        } else {
            moveSpr.stopAllActions();
        }
    }

    openActivityShopOrta = () => {
        let type = DataMgr.activityModel.getZiJumpType();
        if (type == ActiVityType.CommunityShop) {
            DotInst.clientSendDot(COUNTERTYPE.communityActive, "3504");
            let xmlid = DataMgr.activityModel.getNowShopInfo();
            DataMgr.activityModel.setIsLast(false);
            UIMgr.showView(ActiveShop.url, null, {XmlId: xmlid});
        } else if (type == ActiVityType.CommunityTarget) {
            UIMgr.showView(ActivityIntegral.url);
        }
    };

    //up角色详情s
    upStaff = () => {
        DotInst.clientSendDot(COUNTERTYPE.communityActive, "3502");
        HttpInst.postData(NetConfig.NOTICE_LIST, [], (response) => {
            if(!this.forData) return;
            response.notices.sort((a, b) => {
                return a.priority - b.priority
            });
            this.notices = response.notices;
            this.forData();
        });
    };

    forData = () => {
        let size: number = this.notices.length;
        if (size <= 0) {
            return;
        }
        for (let i = 0; i < size; i++) {
            if (this.notices[i].frontSkipPos == 190) {
                this.noticesItem = this.notices[i];
                this.i = i;
                break;
            }
        }
        if (this.noticesItem) {
            this.upDetail.active = true;
        }
    };


    onJump = () => {
        ClientEvents.EVENT_OPEN_UI.emit(JumpConst.ANNOUNCEVIEWCUXIAO, this.i);
    };

    //打开上期活动商店
    openAcitveShop = () => {
        DotInst.clientSendDot(COUNTERTYPE.communityActive, "3501");
        let xmlid = DataMgr.activityModel.getLastShopInfo();
        DataMgr.activityModel.setIsLast(true);
        UIMgr.showView(ActiveShop.url, null, {XmlId: xmlid});
    }

    //参与协助
    openInditientView = () => {
        DotInst.clientSendDot(COUNTERTYPE.communityActive, "3506");
        HttpInst.postData(NetConfig.ASSIST_DETAIL, [], (res: any) => {
            if (!DataMgr.incidentData.hasIncident(res.assistance.incident)) {
                DataMgr.incidentData.addIncident(res.assistance.incident);
            } else {
                DataMgr.incidentData.updateIncident(res.assistance.incident);
            }
            DataMgr.activityModel.setIncident(res.assistance.incident);
            DataMgr.activityModel.setAssistInfo(res.assistance.info);
            DataMgr.activityModel.setMembers(res.assistance.members);
            UIMgr.showView(IncidentCommunity.url, null);
        });
        this.closeView();
    }


    //今日全员排行
    openRankView = () => {
        DotInst.clientSendDot(COUNTERTYPE.communityActive, "3503");
        UIMgr.showView(CommunityRank.url);
    }

    //奖励
    openGiftView = () => {
        DotInst.clientSendDot(COUNTERTYPE.communityActive, "3507");
        this.boxNode.active = true;
    }

    //领取奖励
    getGiftHandler = () => {
        DotInst.clientSendDot(COUNTERTYPE.communityActive, "3508", DataMgr.activityModel.getServerIncidentId() + "");
        HttpInst.postData(NetConfig.ASSIST_REWARD, [DataMgr.activityModel.getServerIncidentId()], (response) => {
            DataMgr.activityModel.setIncitentVo(response.assistanceIncident);
            this.setBoxState();
        })
    }

    closeGiftView = () => {
        this.boxNode.active = false;
    }

    //任务
    openTaskHandler = () => {
        DotInst.clientSendDot(COUNTERTYPE.communityActive, "3505");
        ClientEvents.EVENT_OPEN_UI.emit(JumpConst.DAILTASKVIEW);
    }

    onDestroy() {
        this.dispose.dispose();
        UIUtil.clearUrlImpMap();
    }

    start() {
        //判断是否显示上期商店按钮
        if (DataMgr.activityModel.getLastTermActivity == null) {
            this.lastTerm.active = false;
        } else {
            this.lastTerm.active = true;
        }
        //根据主活动设置url
        let activityJson: IActivityJson = DataMgr.activityModel.getActivityJson();
        UIUtil.loadUrlImg(activityJson.url, this.activityUrl);
        //判断有没有开启 根据协助活动
        let IncitentActivityState = DataMgr.activityModel.getIncitentActivityState();
        let state = IncitentActivityState == ActiVityState.START || IncitentActivityState == ActiVityState.OVER;
        if (DataMgr.activityModel.getServerIncidentId() == 0) {
            state = false;
        }

        this.noOpen2.active = state;
        this.OpenNode.active = !state;
        this.timeLabel.node.active = state;
        this.activityBtn.node.active = state;
        this.canInditient.getComponent(cc.Button).interactable = state;
        if (state) {
            this.setView();
        }
    }

    setView = () => {
        let IncitentActivityState = DataMgr.activityModel.getIncitentActivityState();
        //根据子活动设置开启哪个
        let assistanceJson: IAssistanceJson = DataMgr.activityModel.getAssistanveJson();
        UIUtil.loadUrlImg(assistanceJson.rewardIconUrl, this.activityBtn);
        //设置图片和文字
        UIUtil.loadUrlImg(assistanceJson.sceneUrl, this.incilientUrl);
        // this.incilientTitle.string = assistanceJson.title;
        // this.incilientDesc.string = assistanceJson.word;
        //设置协助进度
        this.setProgeress();

        //设置宝箱奖励
        this.updateGift();
        //设置宝箱状态
        this.setBoxState();
        //设置time
        if (IncitentActivityState == ActiVityState.START) {
            this.leftTime = DataMgr.activityModel.getIncitentLeftTime();
            this.unscheduleAllCallbacks();
            this.setTimelab();
            this.schedule(() => {
                this.leftTime -= 1000;
                this.setTimelab();
            }, 1)
        } else if (IncitentActivityState == ActiVityState.OVER) {
            this.timeLabel.string = "活动已结束";
            this.canInditient.getComponent(cc.Button).interactable = false;
        }
        this.setLastTermState();
    }

    //设置协助进度
    setProgeress = () => {
        let cur = DataMgr.activityModel.getCurIndicient();
        let max = DataMgr.activityModel.getMaxIndicient();
        let totalDegree = DataMgr.activityModel.getTotalMember();
        let maxNum = JsonMgr.getConstVal('assistanceMaxNum');
        let realDegree = totalDegree - (maxNum - max) * 0.05 * totalDegree;
        // let costValue = JsonMgr.getConstVal("assistanceDegree");
        // let costFunc = new Function("degree", "assistanceMaxNum", 'num', "return " + costValue);
        // let realDegree = costFunc(totalDegree, maxNum, max);
        cc.log("CurIndicient:" + cur);
        cc.log("MaxIndicient:" + max);
        this.actiProgress.progress = cur / realDegree;
        this.actiProgressLab.string = cur + "/" + realDegree;
    }

    setLastTermState() {
        this.lastTerm.active = DataMgr.activityModel.getLastTermActivity() != null
    }

    //设置时间文本
    setTimelab = () => {
        if (this.leftTime <= 0) {
            this.unscheduleAllCallbacks();
            this.canInditient.getComponent(cc.Button).interactable = false;
            this.timeLabel.string = "活动已结束";
        } else {
            this.timeLabel.string = TimeUtil.getTimeHouseStr(this.leftTime) + "后活动结束";
        }
    }

    //设置礼物
    updateGift() {
        this.boxlayout.node.removeAllChildren();
        let incidentId = DataMgr.activityModel.getIncidentId();
        const conf: IncidentConf = JsonMgr.getIncidentById(incidentId);
        let rewards: Reward[] = conf.getRewards();
        for (let index = 0; index < rewards.length; index++) {
            let node = cc.instantiate(this.boxprefab);
            let giftItem: CommunityGiftItem = node.getComponent(CommunityGiftItem);
            giftItem.updateItem(rewards[index].xmlId)
            this.boxlayout.node.addChild(node);
        }
        //加一个神秘箱子
        let node = cc.instantiate(this.boxprefab);
        let giftItem: CommunityGiftItem = node.getComponent(CommunityGiftItem);
        giftItem.updateMysicBox();
        this.boxlayout.node.addChild(node);
    }

    //设置箱子
    setBoxState() {
        let boxState = DataMgr.activityModel.getBoxState();
        this.giftBtn.active = true;
        this.boxRedPoint.node.active = boxState == IncitientBoxState.REWARD;
        if (boxState == IncitientBoxState.REWARD || boxState == IncitientBoxState.RECEIVED) {
            this.giftBtn.active = false;
        }
        this.getGiftBtn.active = boxState == IncitientBoxState.REWARD;
        this.haveGetBtns.active = boxState == IncitientBoxState.RECEIVED;
    }


    // update (dt) {}
}
