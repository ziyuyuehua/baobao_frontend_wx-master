import {GameComponent} from "../../core/component/GameComponent";
import {HttpInst} from "../../core/http/HttpClient";
import {ItemIdConst} from "../../global/const/ItemIdConst";
import {NetConfig} from "../../global/const/NetConfig";
import {TextIncidentConst, TextTipConst} from "../../global/const/TextTipConst";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {FunctionName, JsonMgr} from "../../global/manager/JsonManager";
import {ResMgr} from "../../global/manager/ResManager";
import {UIMgr} from "../../global/manager/UIManager";
import {DataMgr} from "../../Model/DataManager";
import {IncidentModel} from "../../Model/incident/IncidentModel";
import {IncidentData} from "../../Model/IncidentData";
import {Staff} from "../../Model/StaffData";
import {AssistanceInfoVO, IIncident} from "../../types/Response";
import {MathCalc} from "../../Utils/MathCalc";
import {StringUtil} from "../../Utils/StringUtil";
import {TimeUtil} from "../../Utils/TimeUtil";
import CommonInsufficient, {InsufficientType} from "../common/CommonInsufficient";
import {LevelPanel} from "../staff/list/LevelPanel";
import {TrainPanel} from "../staff/list/TrainPanel";
import CrisisHandleView from "./CrisisHandleView";
import EventHandlerView from "./EventHandlerView";
import IncidentCommunity from "./IncidentCommunity";
import {DotInst, COUNTERTYPE} from "../common/dotClient";
import {topUiType} from "../MainUiTopCmpt";


const {ccclass, property} = cc._decorator;


enum BackEnum {
    Back_Accelerate = 0, //加速
    Back_SeekHelp = 1,//求助
    Back_ImmediateSolution = 2,//立即解决
    Back_QuPeiYang = 3,//去培养
    Back_LiJiXiaoChu = 4,//立即消除
    Back_QuShengJi = 5,//去升级
    Back_AccelerateAndRecovery //加速并恢复
}

@ccclass
export default class IncidentHelpView extends GameComponent {

    static url: string = "incident/IncidentHelpView";
    @property(cc.RichText)
    descLab: cc.RichText = null;

    @property(cc.RichText)
    costLab: cc.RichText = null;

    @property(cc.Node)
    newblock: cc.Node = null;

    @property(cc.Sprite)
    currencySprite: cc.Sprite = null;

    //加速 求助 立即解决
    @property([cc.Node])
    backgrounds: cc.Node[] = [];

    @property(cc.Button)
    quickBtn: cc.Button = null;

    @property(cc.Node)
    helpPanel: cc.Node = null;


    private _incident: IncidentModel = null;
    private _assist: AssistanceInfoVO = null;
    private helpType: number = 0;
    private _isCostEnough: boolean = false;
    private _needCost: number = 0;

    private _staffData: Staff = null;
    private _type: number = 0;

    onLoad() {
        this.helpType = Number(this.node['data'].helpType);
        let incidentMod = this.node['data'];
        this._incident = incidentMod.incident;
        if (this.helpType == 3 || this.helpType == 4) {//社区协助
            this._assist = incidentMod.assistInfo;
        }

        if (this.helpType == 5 || this.helpType == 6 || this.helpType == 7 || this.helpType == 8) {
            this._staffData = incidentMod.staff;
        }

        if (this.helpType == 7 || this.helpType == 8) {
            this._type = incidentMod.type;
        }
    }


    backgroundclick() {
        this.closeView();
    }

    onDestroy() {
        this.newblock.off(cc.Node.EventType.TOUCH_END, this.backgroundclick, this);
        // this.dispose.dispose();
    }

    start() {
        let curNum = 0;
        let needNum = 0;
        this.quickBtn.interactable = true;
        for (let i = 0; i < this.backgrounds.length; ++i) {
            this.backgrounds[i].active = false;
        }
        this.setBackRoundPos(19);
        this.helpPanel.active = true;
        if (this.helpType == 1) { //请求帮助
            this.descLab.string = JsonMgr.getTips(TextTipConst.IncidentHelpTip);
            this.backgrounds[BackEnum.Back_SeekHelp].active = true;
            let needStr = JsonMgr.getConstVal("pointCost");
            let needArr = needStr.split(',');
            needNum = Number(needArr[1]);
            curNum = DataMgr.warehouseData.getItemNum(Number(needArr[0]));

            let item = JsonMgr.getItem(ItemIdConst.FRIEND_POINT); //友情点

            if (item != null) {
                ResMgr.getItemIcon(this.currencySprite, item.icon);
            }

            this.quickBtn.interactable = (curNum >= needNum);

        } else if (this.helpType == 2) {//
            ResMgr.imgTypeJudgment(this.currencySprite, -3);
            let costValue = JsonMgr.getConstVal("incidentCost");
            let calc = new MathCalc();
            let degree = costValue;
            let expr = calc.parse(degree);
            expr.scope = {
                degree: this._incident.getCurProgress(),
                maxdegree: this._incident.conf.getDegree(),
                max: Math.max
            };
            needNum = Math.floor(expr.eval());
            curNum = DataMgr.userData.diamond;
            // console.log('需要花费  ===>', needNum);
            let str = '';
            if (this._incident.getIsIncident()) {
                let progress: number = this._incident.getLastProgressPercent();
                progress *= 100;
                str = StringUtil.format(JsonMgr.getTips(TextTipConst.IncidentHelpTip2), IncidentModel.formatProgress(progress));
            } else if (this._incident.getIsEvent()) {
                str = '使用钻石可以立刻完成随机事件';
            }
            this.descLab.string = str;
            this.backgrounds[BackEnum.Back_ImmediateSolution].active = true;
        } else if (this.helpType == 3 || this.helpType == 4) {//协助次数加速恢复
            this.tickAssistTime = 0;
            ResMgr.imgTypeJudgment(this.currencySprite, -3);
            let costValue = JsonMgr.getConstVal("assistanceTimeCost");
            //let costFunc = new Function("time", "return " + costValue);

            let calc = new MathCalc();
            let degree = costValue;
            let expr = calc.parse(degree);
            expr.scope = {time: this._assist.recoveryTime / 1000};
            let r = expr.eval();
            needNum = r;
            if (needNum < 1.0) {
                needNum = 1.0;
            }

            needNum = Math.floor(needNum);
            curNum = DataMgr.userData.diamond;
            this.updateAssistTime();
            if (this.helpType == 3) {
                this.backgrounds[BackEnum.Back_Accelerate].active = true;
            } else {
                this.backgrounds[BackEnum.Back_AccelerateAndRecovery].active = true;
            }

        } else if (this.helpType == 5) {//解决疲劳
            this.tickCountTime = 0;
            ResMgr.imgTypeJudgment(this.currencySprite, -3);
            let costValue = JsonMgr.getConstVal("clearFatigueCost");
            needNum = costValue;
            curNum = DataMgr.userData.diamond;
            this.updateFatigueTime();
            this.backgrounds[BackEnum.Back_LiJiXiaoChu].active = true;
        } else if (this.helpType == 6) {//等级不足升级
            this.setBackRoundPos(0);
            this.helpPanel.active = false;
            this.descLab.string = StringUtil.format(JsonMgr.getTips(TextTipConst.INCIDENTLEVELNOTTXT), this._staffData.getName());
            this.backgrounds[BackEnum.Back_QuShengJi].active = true;
            this._isCostEnough = true;
            return;
        } else if (this.helpType == 7) {//属性不足，但是可以通过升等级进行属性加成
            this.setBackRoundPos(0);
            this.helpPanel.active = false;
            let attributeStr = TextIncidentConst.getAttributeTxt(this._type);
            this.descLab.string = StringUtil.format(JsonMgr.getTips(TextTipConst.INCIDENTUPGRADELEVELATTRIBUTETXT), this._staffData.getName(), attributeStr);
            this.backgrounds[BackEnum.Back_QuShengJi].active = true;
            this._isCostEnough = true;
            return;
        } else if (this.helpType == 8) {//属性不足，升级属性
            this.setBackRoundPos(10);
            this.helpPanel.active = false;
            let attributeStr = TextIncidentConst.getAttributeTxt(this._type);
            this.descLab.string = StringUtil.format(JsonMgr.getTips(TextTipConst.INCIDENTUPGRADENOLEVELATTRIBUTETXT), this._staffData.getName(), attributeStr);
            this.backgrounds[BackEnum.Back_QuPeiYang].active = true;
            this._isCostEnough = true;
            return;
        }
        this._isCostEnough = curNum >= needNum ? true : false;

        this._needCost = needNum - curNum;
        let needStr = "<color=#ffffff>" + needNum + "</c>";
        // if (this._isCostEnough) {
        //     needStr = "<color=#27d22b>" + curNum + "<color=#27d22b>/" + needNum + "</c>";
        // } else {
        //     needStr = "<color=#e70f0f>" + curNum + "<color=#90583a>/" + needNum + "</c>";
        // }


        this.costLab.string = needStr;
    }

    setBackRoundPos(posY) {
        for (let index = 0; index < this.backgrounds.length; index++) {
            this.backgrounds[index].y = posY;
        }
    }

    updateAssistTime() {
        if (this._assist.recoveryTime <= 0) {
            this.closeView();
        } else {
            if (this.helpType == 3) {
                this.descLab.string = StringUtil.format(JsonMgr.getTips(TextTipConst.IncidentRecoveryTip), TimeUtil.getTimeHouseStr(this._assist.recoveryTime));
            } else if (this.helpType == 4) {
                this.descLab.string = StringUtil.format(JsonMgr.getTips(TextTipConst.IncidentRecoveryTipRecovery), TimeUtil.getTimeHouseStr(this._assist.recoveryTime));
            }

        }

    }

    updateFatigueTime() {
        let fatigueTime = this._staffData.fatigueCd - DataMgr.getServerTime();
        if (fatigueTime <= 0) {
            this._staffData.fatigueCd = 0;
            ClientEvents.INCIDENT_CLEANFATIGUECALLBACK.emit();
            this.closeView();
        } else {
            let lastTimeStr = TimeUtil.getTimeHouseStr(this._staffData.fatigueCd - DataMgr.getServerTime());
            this.descLab.string = StringUtil.format(JsonMgr.getTips(TextTipConst.INCIDENTFATIQUEREFRESH), this._staffData.getName(), lastTimeStr);
        }
    }

    //关闭
    cancelHandler() {
        this.closeOnly();
    }

    //前往处理
    helpHandler() {
        // this.closeComponent();

        if (this._isCostEnough == false) {

            if (this.helpType == 2 || this.helpType == 3 || this.helpType == 4 || this.helpType == 5) {
                UIMgr.showView(CommonInsufficient.url, null, InsufficientType.Diamond);

                this.closeOnly();
                return;
            }

            UIMgr.showTipText('资源不足');
            return;
        }
        if (this.helpType == 3) {//
            DotInst.clientSendDot(COUNTERTYPE.communityActive, "3527", this.costLab.string);
            HttpInst.postData(NetConfig.ASSIST_QUICKRECOVER, [], (res: any) => {
                if (res.state) {
                    UIMgr.showTipText(TextTipConst.INCIDENT_COMPLETE);
                    UIMgr.closeView(CrisisHandleView.url);
                    UIMgr.closeView(EventHandlerView.url);
                    UIMgr.closeView(IncidentCommunity.url);
                    this.closeOnly();
                    return;
                }


                let result = <AssistanceInfoVO>res.assistanceInfo;
                DataMgr.activityModel.setAssistInfo(result);
                ClientEvents.INCIDENT_ASSISTRECOVERYYIME.emit();
                this.closeOnly();
            });
            return;
        }

        if (this.helpType == 4) {
            HttpInst.postData(NetConfig.ASSIST_QUICKRECOVER, [], (res: any) => {

                if (res.state) {
                    UIMgr.showTipText(TextTipConst.INCIDENT_COMPLETE);
                    UIMgr.closeView(CrisisHandleView.url);
                    UIMgr.closeView(EventHandlerView.url);
                    UIMgr.closeView(IncidentCommunity.url);
                    this.closeOnly();
                    return;
                }

                let result = <AssistanceInfoVO>res;
                let model = DataMgr.activityModel.setAssistInfo(result);
                ClientEvents.INCIDENT_ASSISTRECOVERYYIMEHANDLE.emit();
                this.closeOnly();
            });
            return;
        }

        if (this.helpType == 5) {
            HttpInst.postData(NetConfig.INCIDENT_CLEANFATIGUE, [this._staffData.staffId], (res: any) => {
                this._staffData.fatigueCd = 0;
                ClientEvents.INCIDENT_CLEANFATIGUECALLBACK.emit();
                this.closeOnly();
            });

            return;
        }

        if (this.helpType == 6) {//升级界面
            UIMgr.showView(LevelPanel.url);
            this.closeView();
            return;
        }

        if (this.helpType == 7) {//属性不足，但是可以通过升等级进行属性加成
            this.closeOnly();
            UIMgr.showView(LevelPanel.url);
            return;
        }

        if (this.helpType == 8) {//属性不足，不能通过升级属性
            let favorOpenLv: number = Number(JsonMgr.getConstVal("trainOpenLv"));
            UIMgr.showView(TrainPanel.url);
            this.closeOnly();
            return;
        }

        let netReqStr = NetConfig.INCIDENT_SEEK_HELP;
        if (this.helpType == 2) {
            netReqStr = NetConfig.INCIDENT_QUICK_SOLVE;
        }
        HttpInst.postData(netReqStr, [this._incident.getId()], (res: any) => {

            if (this.helpType == 1) {
                UIMgr.showTipText(TextTipConst.INCIDENT_FIREND_HELPED);

            }
            let result = <IIncident>res.incident;
            let incidentData: IncidentData = DataMgr.incidentData;
            if (res.state == 4) { //  完成、过期
                UIMgr.showTipText(TextTipConst.INCIDENT_COMPLETE);
                incidentData.clearExpire();
                UIMgr.closeView(CrisisHandleView.url);
                UIMgr.closeView(EventHandlerView.url);
                UIMgr.closeView(IncidentCommunity.url);
                this.closeView();
                return;
            }

            if (res.state == 3) {
                if (this._incident != null) {
                    let conf = JsonMgr.getIncidentById(this._incident.getXmlId());
                    if (conf && conf.getType() == 1) {
                        if (DataMgr.isInSelfHome()) {//在自己家
                            UIMgr.showTipText(TextTipConst.INCIDENT_OVERSELFHOMEWARNING);
                        } else {//在他人家
                            UIMgr.showTipText(TextTipConst.INCIDENT_OVERFRIENDHOMEWARNING);
                        }
                        DataMgr.incidentData.clearExpire();
                        UIMgr.closeView(CrisisHandleView.url);
                        UIMgr.closeView(EventHandlerView.url);
                        UIMgr.closeView(IncidentCommunity.url);
                        this.closeView();
                        return;
                    }
                }
                UIMgr.showTipText(TextTipConst.INCIDENT_FINISH);
                DataMgr.incidentData.clearExpire();
                return;

            }

            if (incidentData.isComplete(result)) {
                ClientEvents.REFRESH_BIG_MAP_THING_DANGER.emit();
                DataMgr.incidentData.setIsOtherMarket(false);
                incidentData.deleteIncident(result);
            } else {
                incidentData.updateIncident(result)
            }

            if (this.helpType == 1) {
                //  ClientEvents.INCIDENT_FRIENDHOMEHELP.emit();
                ClientEvents.INCIDENT_HELPCALLBACK.emit();
            }
            if (this.helpType == 2) {//事件
                UIMgr.showDelayCommonGiftView();
                UIMgr.closeView(CrisisHandleView.url);
                UIMgr.closeView(EventHandlerView.url);
            }

            this.closeView();
        });
    }

    getBaseUrl() {
        return IncidentHelpView.url;
    }


    tickCountTime: number = 0;
    tickAssistTime: number = 0;

    update(dt) {
        if (this.helpType == 5) {//疲劳递归
            this.tickCountTime += dt;
            if (this.tickCountTime >= 1) {
                this.tickCountTime -= 1;

                this.updateFatigueTime();
            }

        } else if (this.helpType == 3 || this.helpType == 4) {
            this.tickAssistTime += dt;
            if (this.tickAssistTime >= 1.0) {
                this.tickAssistTime -= 1.0;
                this.updateAssistTime();
            }
        }

    }
}
