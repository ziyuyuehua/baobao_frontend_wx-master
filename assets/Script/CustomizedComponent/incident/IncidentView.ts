import { GameComponent } from "../../core/component/GameComponent";
import { HttpInst } from "../../core/http/HttpClient";
import { GuideIdType, judgeSoftGuideStart } from "../../global/const/GuideConst";
import { ItemIdConst } from "../../global/const/ItemIdConst";
import { NetConfig } from "../../global/const/NetConfig";
import { TextTipConst } from "../../global/const/TextTipConst";
import { ClientEvents } from "../../global/manager/ClientEventCenter";
import { GameManager } from "../../global/manager/GameManager";
import { FunctionName, JsonMgr } from "../../global/manager/JsonManager";
import { ResManager } from "../../global/manager/ResManager";
import { UIMgr } from "../../global/manager/UIManager";
import { DataMgr, SHARE_TYPE } from "../../Model/DataManager";
import { IncidentModel } from "../../Model/incident/IncidentModel";
import { IRespData, IUserBaseItem } from "../../types/Response";
import { CommonUtil } from "../../Utils/CommonUtil";
import { StringUtil } from "../../Utils/StringUtil";
import { TimeUtil } from "../../Utils/TimeUtil";
import { UIUtil } from "../../Utils/UIUtil";
import { BigMData } from "../BigMap/BigMapData";
import { ButtonMgr } from "../common/ButtonClick";
import dialogueView from "../common/dialogueView";
import { COUNTERTYPE, DotInst } from "../common/dotClient";
import { ARROW_DIRECTION, GuideMgr } from "../common/SoftGuide";
import GoldExchange_wx from "../exchange/goldExchange_wx";
import { topUiType } from "../MainUiTopCmpt";
import RechargeMain from "../Recharge/RechargeMain";
import { ItemPrefab } from "../staff/list/ItemPrefab";
import CrisisHandleView from "./CrisisHandleView";
import EventHandlerView from "./EventHandlerView";


const { ccclass, property } = cc._decorator;
@ccclass
export default class IncidentView extends GameComponent {

    static url: string = "incident/IncidentView_mg";

    @property(cc.Node)
    incidentNode: cc.Node = null;

    @property(cc.Node)
    shijianNode: cc.Node = null;

    @property(cc.Sprite)
    background: cc.Sprite = null;

    @property(cc.Sprite)
    eventBackground: cc.Sprite = null;

    @property(cc.ProgressBar)
    progress: cc.ProgressBar = null;

    @property(cc.Label)
    processlbl: cc.Label = null;

    @property(cc.RichText)
    descLab: cc.RichText = null;

    @property(cc.Label)
    helpLab: cc.Label = null;

    @property(cc.Label)
    incidenttiplab: cc.Label = null; //店铺危机的文本描述

    @property(cc.Label)
    eventtiplab: cc.Label = null;//事件的文本描述


    @property(cc.Node)
    incidentbeizhu: cc.Node = null;//help文字描述


    @property(cc.Label)
    helpedwarninglab: cc.Label = null;

    @property(cc.Label)
    helpMaxWarning: cc.Label = null;


    @property(cc.Node)
    rewardsNode: cc.Node = null;

    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    @property(cc.Node)
    completeNode: cc.Node = null;


    @property(cc.Node)
    completeBtn: cc.Node = null;

    @property(cc.Button)
    handleBtn: cc.Button = null;


    @property(cc.Node)
    alcomlepteNode: cc.Node = null;

    @property(cc.Node)
    alcompleteBtn: cc.Node = null;


    @property(ItemPrefab)
    alcompleteIcon: ItemPrefab = null;


    @property(cc.RichText)
    alcompleteRichTxt: cc.RichText = null;


    @property(cc.Sprite)
    helpbtnIcon: cc.Sprite = null;

    @property(cc.Sprite)
    handleIcon: cc.Sprite = null;

    @property(cc.Button)
    evthandleBtn: cc.Button = null;

    @property(cc.Label)
    friendshipLab: cc.Label = null;


    @property(cc.Label)
    private diamondLabel: cc.Label = null;

    @property(cc.Label)
    private goldLabel: cc.Label = null;

    @property(cc.Node)
    private diamondBtn: cc.Node = null;

    @property(cc.Node)
    private goldBtn: cc.Node = null;
    @property(cc.Node)
    private itemBtn: cc.Node = null;

    @property([cc.Node])
    private topUiBg: cc.Node[] = [];

    @property(cc.Node)
    private shareNode: cc.Node = null;

    private _model: IncidentModel = null;
    private _lastTime: number = 0;

    private updateTimer: number = 0;
    private helps: IUserBaseItem[] = [];
    private helpStaffIds: number[] = [];

    onLoad() {
        this._model = <IncidentModel>(this.node['data'].incident);
        if (this._model.getIsIncident()) {
            if (DataMgr.isInFriendHome()) {
                this.helpStaffIds = <number[]>this.node['data'].helps || [];
            } else {
                this.helps = <IUserBaseItem[]>(this.node['data'].helps) || [];
            }
            this.addEvent(ClientEvents.INCIDENT_REFRESHVIEW.on(this.refreshIncident.bind(this)));
        } else {
            this.helps = <IUserBaseItem[]>(this.node['data'].helps) || [];

            this.addEvent(ClientEvents.LV_UP_ANIM.on(this.levelUp));
        }
        ButtonMgr.addClick(this.shareNode, this.shareHandler);
        this.addEvent(ClientEvents.WAREHOUSE_UPDATE_WAREHOUSE.on(this.refreshItemNum));
        this.addEvent(ClientEvents.EVENT_REFRESH_GOLD.on(this.setTopUI));
        this.addEvent(ClientEvents.DIALO_END_SEND.on(() => {
            if (this._model.getIsIncident()) {
                let curSoftGuide = JsonMgr.getSoftGuideJsoById(GuideIdType.FunCrisis, 3);
                let endSoftGuide = JsonMgr.getSoftGuideJsoById(GuideIdType.FunCrisis, 5);
                if (curSoftGuide && DataMgr.getGuideCompleteTimeById(endSoftGuide.id) <= 0) {
                    DotInst.clientSendDot(COUNTERTYPE.softGuide, "19059");
                    this.showCrisisGuide(curSoftGuide);
                }
            } else {
                let curSoftGuide = JsonMgr.getSoftGuideJsoById(GuideIdType.FunEvent, 3);
                let endSoftGuide = JsonMgr.getSoftGuideJsoById(GuideIdType.FunEvent, 5);
                if (curSoftGuide && DataMgr.getGuideCompleteTimeById(endSoftGuide.id) <= 0) {
                    DotInst.clientSendDot(COUNTERTYPE.softGuide, "19025");
                    this.showHanldGuide(curSoftGuide);
                }
            }
        }))
        this.setTopUI();
        this.refreshItemNum();
    }

    showCrisisGuide(curSoftGuide) {
        GuideMgr.showSoftGuide(this.handleBtn.node, ARROW_DIRECTION.TOP, curSoftGuide.displayText, (node: cc.Node) => {
            this.evthandleNode = node;
        }, false, 0, false, () => {
            this.handleHandler();
        });
    }

    showHanldGuide(curSoftGuide) {
        GuideMgr.showSoftGuide(this.evthandleBtn.node, ARROW_DIRECTION.TOP, curSoftGuide.displayText, (node: cc.Node) => {
            this.evthandleNode = node;
        }, false, 0, false, () => {
            this.handleHandler();
        });
    }

    shareHandler = () => {
        if (this._model.getIsEvent) {
            DotInst.clientSendDot(COUNTERTYPE.share, "14002");
        } else {
            DotInst.clientSendDot(COUNTERTYPE.share, "14001");
        }
        let shareJs: IShareJson = JsonMgr.getShareJsonByType(SHARE_TYPE.event);
        GameManager.WxServices.shareGame(shareJs.word, shareJs.pictrue);
    };

    levelUp() {
        this.showGuideView();
    }


    refreshIncident(type: number) {
        if (type == 1) {//事件
            this._model.init(DataMgr.activityModel.getIncident());
            this.refreshModel(this._model);
        }
    }

    refreshItemNum = () => {
        let friendshipNum = DataMgr.getItemNum(ItemIdConst.FRIEND_POINT);
        UIUtil.setLabel(this.friendshipLab, friendshipNum);
    };


    setTopUI = () => {
        const userData = DataMgr.userData;
        UIUtil.setLabel(this.goldLabel, CommonUtil.numChange(userData.gold)); //金币
        UIUtil.setLabel(this.diamondLabel, CommonUtil.numChange(userData.diamond)); //钻石
    };

    evthandleNode: cc.Node = null;

    start() {
        // this.dispose.add(ClientEvents.UPDATE_ACCELERATE_TIME.on(this.updateTime));
        let isIncident = this._model.getIsIncident();
        this.helpbtnIcon.node.active = false;
        this.handleIcon.node.active = true;
        if (isIncident) {//危机
            this.shijianNode.active = false;
            this.incidentNode.active = true;
            this.topUiBg[1].active = true;
            this.topUiBg[0].active = false;
            this.itemBtn.active = true;
            this.initShopCrisis();
        } else if (this._model.getIsEvent()) {//事件
            this.topUiBg[1].active = false;
            this.itemBtn.active = false;
            this.topUiBg[0].active = true;
            this.incidentNode.active = false;
            this.shijianNode.active = true;
            this.initEvent();
        }
        this.initGuide();
        this.addClick();
        ClientEvents.HIDE_MAIN_SOFT_GUIDE.emit();
    }

    initGuide() {
        if (this._model.getIsIncident()) {
            let softGuide = JsonMgr.getSoftGuideJsoById(GuideIdType.FunCrisis, 2);
            if (softGuide && DataMgr.getGuideCompleteTimeById(softGuide.id) <= 0) {
                HttpInst.postData(NetConfig.SOFT_LED_INFO, [softGuide.id], (response) => {
                    let diaJson: IOptionalTutorialsTextJson = JsonMgr.getOptionalTutorialsJson(softGuide.optionId)
                    DotInst.clientSendDot(COUNTERTYPE.softGuide, "19058", diaJson.text);
                    UIMgr.showView(dialogueView.url, null, softGuide.optionId);
                });
            } else {
                this.showGuideView();
            }
        } else {
            let softGuide = JsonMgr.getSoftGuideJsoById(GuideIdType.FunEvent, 2);
            if (softGuide && DataMgr.getGuideCompleteTimeById(softGuide.id) <= 0) {
                HttpInst.postData(NetConfig.SOFT_LED_INFO, [softGuide.id], (response) => {
                    let diaJson: IOptionalTutorialsTextJson = JsonMgr.getOptionalTutorialsJson(softGuide.optionId)
                    DotInst.clientSendDot(COUNTERTYPE.softGuide, "19024", diaJson.text);
                    UIMgr.showView(dialogueView.url, null, softGuide.optionId);
                });
            } else {
                this.showGuideView();
            }
        }
    }

    addClick() {
        ButtonMgr.addClick(this.goldBtn, this.goldExchangeBtn);
        ButtonMgr.addClick(this.diamondBtn, this.diamondExchangeBtn);
    }

    diamondExchangeBtn = () => {
        // UIMgr.showView(RechargeMain.url, null, null, null, true);
        ClientEvents.EVENT_POPUP_DIAMOND_EXCHANGE.emit();
        // UIMgr.showDiamondExchange();
    };
    goldExchangeBtn = () => {
        if (!JsonMgr.isFunctionOpen(FunctionName.GoldExchange)) {
            let openJson: IFunctionOpenJson = JsonMgr.getFunctionOpenByName(FunctionName.GoldExchange);
            if (openJson.openType == 1) {
                UIMgr.showTipText("金币兑换将于等级" + openJson.value + "级后开启");
                return;
            } else if (openJson.openType == 2) {
                let positionJson: IPositionJson = JsonMgr.getPositionJson(openJson.value);
                UIMgr.showTipText("金币兑换将于职位达到【" + positionJson.name + positionJson.level + "阶】后开启");
                return;
            }
        }
        HttpInst.postData(NetConfig.GET_EXCHANGE_GOLD, [], (response: IRespData) => {
            UIMgr.showView(GoldExchange_wx.url, cc.director.getScene(), response);
        });
    };


    showGuideView() {
        if (this._model.getIsIncident()) {
            let curSoftGuide = JsonMgr.getSoftGuideJsoById(GuideIdType.FunCrisis, 3);
            let endSoftGuide = JsonMgr.getSoftGuideJsoById(GuideIdType.FunCrisis, 5);
            if (curSoftGuide && DataMgr.getGuideCompleteTimeById(endSoftGuide.id) <= 0) {
                DotInst.clientSendDot(COUNTERTYPE.softGuide, "19059");
                this.showCrisisGuide(curSoftGuide);
                return;
            }
        } else {
            let curSoftGuide = JsonMgr.getSoftGuideJsoById(GuideIdType.FunEvent, 3);
            let endSoftGuide = JsonMgr.getSoftGuideJsoById(GuideIdType.FunEvent, 5);
            if (curSoftGuide && DataMgr.getGuideCompleteTimeById(endSoftGuide.id) <= 0) {
                DotInst.clientSendDot(COUNTERTYPE.softGuide, "19025");
                this.showHanldGuide(curSoftGuide);
                return;
            }
        }

        let curSoftGuide = JsonMgr.getSoftGuideJsoById(GuideIdType.event, 3);
        if (curSoftGuide && judgeSoftGuideStart(curSoftGuide)) {
            DotInst.clientSendDot(COUNTERTYPE.softGuide, "19016");
            GuideMgr.showSoftGuide(this.evthandleBtn.node, ARROW_DIRECTION.TOP, curSoftGuide.displayText, (node: cc.Node) => {
                this.evthandleNode = node;
            }, false, 0, false, () => {
                this.handleHandler();
            });
            return;
        }

        if (this.evthandleNode != null) {
            this.evthandleNode.active = false;
            this.evthandleNode.destroy();
            this.evthandleNode = null;
        }
    }


    onEnable() {
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.gold);
        DataMgr.increaseTopUiNum();
        if (!DataMgr.isInFriendHome()) {
            ClientEvents.EVENT_HIDE_MAIN_UI_TOP.emit(false);
        } else {
            ClientEvents.EVENT_HIDE_FRIEND_UI_TOP.emit(false);
        }
    }

    onDisable() {
        DataMgr.decrTopUiNum();
        if (!DataMgr.isInFriendHome()) {
            ClientEvents.EVENT_HIDE_MAIN_UI_TOP.emit(true);
        } else {
            ClientEvents.EVENT_HIDE_FRIEND_UI_TOP.emit(true);
        }
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -2);
    }

    initEvent() {//事件

        ResManager.setIncidentBackground(this.eventBackground, this._model.showConf.getBackground());
        let rewards = this._model.getRewards();//额外奖励
        this.initRewards(rewards);

        this._lastTime = this._model.getLeftTime();
        this.updateTimeStr();
    }

    updateProgress() {
        let percent = this._model.getLastProgressPercent();
        cc.log('curprogress ===', percent);
        if (this.progress != null)
            this.progress.progress = percent;

        if (this.processlbl != null) {
            this.processlbl.string = this._model.getLastProgressPercentStr();
        }
    }

    initShopCrisis() {//店铺危机
        //this.staffRole.initIncidentModel(this._model);
        ResManager.setIncidentBackground(this.background, this._model.showConf.getBackground());
        this.updateProgress();
        this.descLab.string = this._model.showConf.getTalk();//危机描述
        if (DataMgr.isInSelfHome()) {
            let rewards = this._model.getRewards();//额外奖励
            this.initRewards(rewards);
        }
        this.initSelfInfo();
    }

    initSelfInfo() {
        let isInSelfHome = DataMgr.isInSelfHome();
        this.helpLab.node.active = isInSelfHome;

        this.incidenttiplab.node.active = isInSelfHome;
        this.helpMaxWarning.node.active = !isInSelfHome;
        this.handleBtn.interactable = true;
        if (isInSelfHome) {
            this.alcomlepteNode.active = false;
            this.completeNode.active = true;
            this._lastTime = this._model.getLeftTime();
            this.updateTimeStr();
            if (this.helps.length > 0) {
                this.incidentbeizhu.active = true;
                this.helpLab.string = this.getHelpNameStr() + '已帮忙处理' + this._model.getHelpPercent();
            } else {
                //this.helpLab.string = "";
                this.incidentbeizhu.active = false
            }
        } else {

            this.helpbtnIcon.node.active = true;
            this.handleIcon.node.active = false;

            this.alcomlepteNode.active = true;
            this.completeNode.active = false;
            this.incidentbeizhu.active = false;
            if (this._model != null && this._model.gethelped()) {//已经帮助过了
                this.helpedwarninglab.node.active = true;
                this.alcompleteBtn.active = true;
                this.completeBtn.active = false;
            } else {
                this.alcompleteBtn.active = false;
                this.completeBtn.active = true;
                this.helpMaxWarning.node.active = true;
                let helpnum = this.getHelpNum() / this._model.conf.getDegree() * 100;
                if (!this._model.getHelpMax()) {
                    this.handleBtn.interactable = helpnum != 0;
                }

                this.helpMaxWarning.string = StringUtil.format("可帮忙处理{0}%", helpnum.toFixed(0));

            }

            let helprewards = this._model.conf.getHelpRewards();
            if (helprewards != null) {
                let strs: string[] = helprewards.split(',');

                let val0: number = <number><unknown>(strs[0]);
                let val1: number = <number><unknown>(strs[1]);

                let item = JsonMgr.getItem(val0);
                if (item != null) {
                    this.alcompleteIcon.init(item, val1, false);
                    this.alcompleteIcon.activeTip();
                }

                this.alcompleteRichTxt.string = " x" + val1;


            }


        }
    }


    getHelpNum() {
        let isHelpMax = this._model.getHelpMax();
        let limitDegree = Math.floor(this._model.getMaxHelpDegree() / 100 * this._model.conf.getDegree());
        let value = Math.max(0, limitDegree - this._model.getHelpProcess());
        return isHelpMax ? this._model.getLastProgress() : value;
    }


    refreshModel(model: IncidentModel) {
        this._model = model;
        this.updateProgress();
        //this.staffRole.refreshModel(this._model);
    }

    updateTimeStr() {
        let lastTimeStr = TimeUtil.getTimeSecondStr(this._lastTime);
        let isIncident = this._model.getIsIncident();
        if (isIncident) {
            this.incidenttiplab.string = '危机解决前店铺收益会持续降低(' + lastTimeStr + ")";
        } else if (this._model.getIsEvent()) {
            this.eventtiplab.string = '剩余时间' + lastTimeStr;
        }

    }

    initRewards(rewards) {
        for (let i = 0; i < rewards.length; i++) {
            let reward = rewards[i];
            let item: ItemPrefab = cc.instantiate(this.itemPrefab).getComponent(ItemPrefab);
            let itemData = JsonMgr.getInformationAndItem(reward.xmlId);
            item.init(itemData, reward.num, false);
            item.activeTip();
            this.rewardsNode.addChild(item.node);
        }
    }

    curPos: cc.Vec2 = null;


    //关闭
    closeHandler() {
        BigMData.deleteIncident();
        this.closeView();
    }

    //前往处理
    handleHandler() {
        if (this._model.getIsIncident()) {
            UIMgr.showView(CrisisHandleView.url, null, this.node["data"], null, true)
        } else if (this._model.getIsEvent()) {
            UIMgr.showView(EventHandlerView.url, null, this.node["data"], null, true)
        }
        this.closeOnly();
    }

    tipHandler() {

        let str: TextTipConst = null;
        if (this._model.getIsIncident()) {
            str = TextTipConst.IncidentTip;
        } else if (this._model.getIsEvent()) {
            str = TextTipConst.IncidentEventTip;
        }
        UIMgr.showTextTip(str);
    }

    getHelpNameStr() {
        let str = '';
        let len = this.helps.length > 3 ? 3 : this.helps.length;
        for (let i = 0; i < len; i++) {
            if (i > 0) {
                str += ' ';
            }
            str += this.helps[i].nickName
        }
        return str;
    }

    getBaseUrl() {
        return IncidentView.url;
    }

    update(dt) {
        if (DataMgr.isInSelfHome() == false) {
            return;
        }
        this.updateTimer += dt;
        if (this.updateTimer >= 1 && this._lastTime > 0) {
            this.updateTimer = 0;
            this._lastTime -= 1;
            this.updateTimeStr();
        }
    }
}
