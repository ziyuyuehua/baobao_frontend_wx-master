import {TextIncidentConst, TextTipConst} from "../../global/const/TextTipConst";
import {FunctionName, JsonMgr} from "../../global/manager/JsonManager";
import {ResManager, ResMgr} from "../../global/manager/ResManager";
import {UIMgr} from "../../global/manager/UIManager";
import {EffectiveType, Effects, EffectType} from "../../Model/BuffData";
import {DataMgr} from "../../Model/DataManager";
import {IncidentModel} from "../../Model/incident/IncidentModel";
import {Staff, StaffAttr} from "../../Model/StaffData";
import {CommonUtil} from "../../Utils/CommonUtil";
import {StringUtil} from "../../Utils/StringUtil";
import {TimeUtil} from "../../Utils/TimeUtil";
import {UIUtil} from "../../Utils/UIUtil";
import {ActionMgr} from "../common/Action";
import {COUNTERTYPE, DotInst, DotVo} from "../common/dotClient";
import StaffComDetail from "../common/StaffComDetail";
import CrisisHandleView from "./CrisisHandleView";
import EventHandlerView from "./EventHandlerView";
import IncidentCommunity from "./IncidentCommunity";
import IncidentHelpView from "./IncidentHelpView";

const {ccclass, property} = cc._decorator;


export class ConditionType {
    id: number = -1;
    num: number = 0;

    constructor() {

    }

    isConditionCan() {
        return this.id == -1;
    }

    isLevelNot() {
        return this.id == 999;
    }

    isHelped() {
        return this.id == 888;
    }

    isFatigue() {
        return this.id == 777;
    }
}

@ccclass
export class IncidentStaffItem extends cc.Component {


    @property(cc.Prefab)
    attrItemPrefab: cc.Prefab = null;

    @property(cc.Sprite)
    staffBg: cc.Sprite = null;

    @property(cc.Sprite)
    roleIcon: cc.Sprite = null;

    @property(cc.Sprite)
    clickBg: cc.Sprite = null;

    @property(cc.Node)
    selectNode: cc.Node = null;

    @property([cc.Sprite])
    staffIcons: cc.Sprite[] = [];

    @property([cc.Label])
    condionslbls: cc.Label[] = [];

    @property(cc.Sprite)
    conditionPanel: cc.Sprite = null;

    @property([cc.Sprite])
    conditions: cc.Sprite[] = [];


    @property(cc.Sprite)
    condition00: cc.Sprite = null;

    @property(cc.Sprite)
    condition01: cc.Sprite = null;

    @property(cc.Sprite)
    condition02: cc.Sprite = null;

    @property(cc.Sprite)
    grayBackground: cc.Sprite = null;

    @property(cc.Node)
    upNode: cc.Node = null;

    @property(cc.Node)
    upNode2: cc.Node = null;

    @property(cc.Node)
    zhuanAddNode: cc.Node = null;

    @property([cc.Sprite])
    specialAddIcon: cc.Sprite[] = [];

    private _staff: Staff = null;

    private _isSelect: boolean = false;

    private _delegate: CrisisHandleView | EventHandlerView | IncidentCommunity = null;
    private _showAttrs: string[] = [];
    private _needLevel: number = 0;

    private _orginPos: cc.Vec2 = null;

    public notType: ConditionType = new ConditionType();

    private _isInSelfHome: boolean = false;


    private isStartTouch: boolean = false;  //是否开始长按
    private touchTime: number = 0;    //长按计时
    private isShowDetail: boolean = false;   //长按时间是否触发

    private curPos = null;


    private _staffsIndex: number = 0;

    onLoad() {
        this._isSelect = false;
        this.node.on(cc.Node.EventType.TOUCH_END, this.onSelect);
        this._orginPos = this.staffIcons[0].node.position;      //原始位置
        this._isInSelfHome = DataMgr.isInSelfHome();

        this.node.on(cc.Node.EventType.TOUCH_START, this.onStartTime);

        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onMove);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.cancleTip);
    }

    start() {
    }

    setUpNodeState(modelVO: IncidentModel) {
        let assUp: IAssistanceUpJson = this._staff.judgeIsUpStaff();
        this.upNode.active = modelVO.getIsAssist() && assUp != null && assUp.addPercent == 50;
        this.upNode2.active = modelVO.getIsAssist() && assUp != null && assUp.addPercent == 100;
        this.upNode.stopAllActions();
        if (this.upNode.active) {
            ActionMgr.SwingAction(this.upNode, true, 3);
        }
        this.upNode2.stopAllActions();
        if (this.upNode2.active) {
            ActionMgr.SwingAction(this.upNode2, true, 3);
        }

    }

    onStartTime = (event) => {
        this.curPos = event.currentTarget.position;
        this.isStartTouch = true;
        this.isShowDetail = false;
        this.touchTime = 0;

        //this.onSelect();
    }

    onMove = (event) => {
        let startPos = event.currentTouch._startPoint;
        let endPos = event.currentTouch._point;
        let xCha: number = Math.abs(endPos.x) - Math.abs(startPos.x);
        let yCha: number = Math.abs(endPos.y) - Math.abs(startPos.y);
        if (Math.abs(yCha) > 10 || Math.abs(xCha) > 10) {
            this.isStartTouch = false;
        }
    }

    cancleTime = () => {
        this.isStartTouch = false;
    }

    cancleTip = (event) => {
        if (event.currentTouch) {
            this.isStartTouch = false;
        }
    }


    setItemIndex(idx: number) {
        this._staffsIndex = idx;
    }

    initStaff(staff: Staff, needLevel: number, attrs: string[], delegate: CrisisHandleView | EventHandlerView | IncidentCommunity) {

        this._orginPos = this.staffIcons[0].node.position;      //原始位置
        this._isInSelfHome = DataMgr.isInSelfHome();

        this._staff = staff;
        this._needLevel = needLevel;
        this._showAttrs = attrs;
        this._delegate = delegate;

        this.initStaffAttrData();
        UIUtil.asyncSetImage(this.staffBg, staff.getStarBorderUrl(), false);
        UIUtil.asyncSetImage(this.roleIcon, staff.getAvatarUrl());
        this.initStaffAttrItems();

        this.updateSelectState();

    }


    static getNotType(staff: Staff, model: IncidentModel, helps: number[], showAttris: string[]) {
        let needlevel = model.conf.staffLevel;
        let isAssist = model.getIsAssist()

        let notType: ConditionType = new ConditionType();
        //等级要求
        for (let i = 0; i < showAttris.length; i++) {
            let strs = showAttris[i].split(',');
            let needId = Number(strs[0]);
            let needNum = Number(strs[1]);
            //智力，体力，亲和，灵敏->口才
            let staffNum = staff.attrValues()[needId];

            let effct: Effects = null
            if (model.getIsIncident()) {
                effct = DataMgr.getBuffData().getEffects(EffectiveType.CRISIS, [staff.xmlId]);
            } else if (model.getIsAssist()) {
                effct = DataMgr.getBuffData().getEffects(EffectiveType.ASSISTANCE, [staff.xmlId]);
            }
            if (effct && CommonUtil.isEmpty(effct.effects)) {
                staffNum = effct.getAttribute(staff.xmlId, needId, staffNum);
            }

            if (staffNum < needNum) {
                if (needNum > notType.num) {
                    notType.id = needId;
                    notType.num = needNum;
                }
            }
        }
        if (!isAssist && staff.isFatigue() && DataMgr.isInSelfHome()) {//疲劳
            notType.id = 777;
            notType.num = 0;
        } else if (staff.level < needlevel) {
            notType.id = 999;
            notType.num = needlevel;
        }
        else if (!DataMgr.isInSelfHome()) {
            for (let i = 0; i < helps.length; ++i) {
                if (helps[i] == staff.staffId) {
                    notType.id = 888;
                    notType.num = 0;
                    break;
                }
            }
        }

        return notType;
    }

    initStaffAttrData() {
        this.notType.id = -1;
        this.notType.num = 0;
        //等级要求
        for (let i = 0; i < this._showAttrs.length; i++) {
            let strs = this._showAttrs[i].split(',');
            let needId = Number(strs[0]);
            let needNum = Number(strs[1]);
            //智力，体力，亲和，灵敏->口才
            let staffNum = this._staff.attrValues()[needId];
            let effct: Effects = null
            let model = this._delegate.getIncidentModel();
            if (model.getIsIncident()) {
                effct = DataMgr.getBuffData().getEffects(EffectiveType.CRISIS, [this._staff.xmlId]);
            } else if (model.getIsAssist()) {
                effct = DataMgr.getBuffData().getEffects(EffectiveType.ASSISTANCE, [this._staff.xmlId]);
            }
            if (effct && CommonUtil.isEmpty(effct.effects)) {
                staffNum = effct.getAttribute(this._staff.xmlId, needId, staffNum);
            }

            if (staffNum < needNum) {
                if (needNum > this.notType.num) {
                    this.notType.id = needId;
                    this.notType.num = needNum;
                }
            }
        }
        if (!this._delegate.getIsAssist() && this._staff.isFatigue() && this._isInSelfHome) {
            this.notType.id = 777;
            this.notType.num = 0;
        } else if (this._staff.level < this._needLevel) {
            this.notType.id = 999;
            this.notType.num = this._needLevel;
        }
        else if (!this._isInSelfHome) {
            let helps = this._delegate.getIncidentHelps();
            for (let i = 0; i < helps.length; ++i) {
                if (helps[i] == this._staff.staffId) {
                    this.notType.id = 888;
                    this.notType.num = 0;
                    break;
                }
            }
        }
        this.initConditionLab();
    }

    getIncidentStaffItemInfo() {
        if (this.condition00.node.active) {//疲劳
            let lastTimeStr = TimeUtil.getTimeHouseStr(this._staff.fatigueCd - DataMgr.getServerTime());
            return StringUtil.format(JsonMgr.getTips(TextTipConst.STAFFFATIGUETXT), this._staff.getName(), lastTimeStr, TextIncidentConst.getGenderTaTxt(this._staff.getGender()));
        } else if (this.condition02.node.active) {//等级不足
            return StringUtil.format(JsonMgr.getTips(TextTipConst.STAFFLEVELINSUFFICIENT), this._staff.getName());
        } else if (this.condition01.node.active) {//已经帮助过其他人了
            return StringUtil.format(JsonMgr.getTips(TextTipConst.STAFFHELPED));
        }
        else {//属性不足
            let attributeStr = TextIncidentConst.getAttributeTxt(this.notType.id);
            return StringUtil.format(JsonMgr.getTips(TextTipConst.STAFFATTRIBUTEINSUFFICIENT), this._staff.getName(), attributeStr, TextIncidentConst.getGenderTaTxt(this._staff.getGender()), attributeStr);
        }
        return "";
    }

    initConditionLab() {
        for (let i = 0; i < this.conditions.length; ++i) {
            this.conditions[i].node.active = false;
        }
        this.condition00.node.active = false;
        this.condition01.node.active = false;
        this.condition02.node.active = false;
        //todo 帮助的时候 不用疲劳 用帮助次数
        if (this.notType.isFatigue()) {//疲劳
            this.conditionPanel.node.active = true;
            this.condition00.node.active = true;
            this.grayBackground.node.active = true;
            //UIUtil.setImageGray(this.roleIcon);
            //UIUtil.setImageGray(this.staffBg);

        }
        else {
            if (!this._isInSelfHome) {
                let helps = this._delegate.getIncidentHelps();
                for (let i = 0; i < helps.length; ++i) {
                    if (helps[i] == this._staff.staffId) {
                        this.conditionPanel.node.active = true;
                        this.condition01.node.active = true;
                        //UIUtil.setImageGray(this.roleIcon);
                        //UIUtil.setImageGray(this.staffBg);
                        this.grayBackground.node.active = true;
                        return;
                    }
                }
            }

            let conditionCan = this.notType.isConditionCan();
            this.conditionPanel.node.active = !conditionCan;
            if (false == conditionCan) {
                if (this.notType.isLevelNot()) {
                    this.condition02.node.active = true;
                } else if (this.notType.isHelped()) {
                    this.condition01.node.active = true;
                }
                else {
                    this.conditions[this.notType.id].node.active = true;
                }
                //UIUtil.setImageGray(this.roleIcon);
                //UIUtil.setImageGray(this.staffBg);
                this.grayBackground.node.active = true;
            } else {
                this.grayBackground.node.active = false;
                //UIUtil.setImageNormal(this.roleIcon);
                //UIUtil.setImageNormal(this.staffBg);
            }
        }
    }


    initStaffAttrItems() {
        let count: number = 0;
        let index: number = 0;
        //等级要求
        if (this._needLevel != 0) {
            let tmp: number = index++;
            UIUtil.asyncSetImage(this.staffIcons[tmp], Staff.getAttrIconUrl(StaffAttr.level));
            this.condionslbls[tmp].string = this._staff.level.toString();
            ++count;
        }

        this.setZhuanshuState(false);
        for (let i = 0; i < this._showAttrs.length; i++) {
            if (count >= 2) {
                cc.log("员工属性太多");
                break;
            }
            let strs = this._showAttrs[i].split(',');
            let needId = Number(strs[0]);
            let staffNum = this._staff.attrValues()[needId];

            let model = this._delegate.getIncidentModel();
            let effct: Effects = null;
            let ziColor = new cc.Color(129, 77, 52);
            let addEndStaffNum: number = staffNum;   //加成后的值
            if (model.getIsIncident()) {
                effct = DataMgr.getBuffData().getEffects(EffectiveType.CRISIS, [this._staff.xmlId]);
            } else if (model.getIsAssist()) {
                effct = DataMgr.getBuffData().getEffects(EffectiveType.ASSISTANCE, [this._staff.xmlId]);
            }
            if (effct && CommonUtil.isEmpty(effct.effects)) {
                addEndStaffNum = effct.getAttribute(this._staff.xmlId, needId, staffNum);
            }
            if (staffNum != addEndStaffNum) {
                this.setZhuanshuState(true);
                ziColor = new cc.Color(27, 168, 50);
                staffNum = addEndStaffNum;
            } else {
                if (effct && CommonUtil.isEmpty(effct.effects)) {
                    let list: Array<IDecoEffectJson> = effct.effects[this._staff.xmlId];
                    if (list && list.length > 0) {
                        for (let nid = 0; nid < list.length; nid++) {
                            if (list[nid].effectType == EffectType.INCIDENT && (model.getIsIncident() || model.getIsAssist())) {
                                this.setZhuanshuState(true);
                            } else if (list[nid].effectType == EffectType.CRISIS && model.getIsIncident()) {
                                this.setZhuanshuState(true);

                            }
                        }
                    }
                }
            }

            for (let nid = 0; nid < this.specialAddIcon.length; nid++) {
                if (this.specialAddIcon[nid]) {
                    this.specialAddIcon[nid].node.active = false
                }
            }

            if (model.getIsIncident()) {
                let specialAdd = model.conf.getSpecialAdd;
                if (specialAdd && specialAdd.length > 0) {
                    for (let index = 0; index < specialAdd.length; index++) {
                        let strs = specialAdd[index].split(',');

                        let iconUrl: string = "";
                        switch (strs[0]) {
                            case "1":
                                //性别
                                let gender = Number(strs[1]);
                                if (gender == this._staff.getGender()) {
                                    iconUrl = ResManager.getIncidentSpecialUrl() + "incident_" + (gender ? "nan" : "nv");
                                }
                                break;
                            case "2":
                                //角色
                                let roleId = Number(strs[1]);
                                if (roleId == this._staff.xmlId) {
                                    iconUrl = ResManager.getIncidentSpecialUrl() + "incident_juese";
                                }
                                break;
                            case "3":
                                let fitjob = Number(strs[1]);
                                if (fitjob == this._staff.getSuggestId()) {
                                    iconUrl = ResManager.getIncidentSpecialUrl() + "incident_jian";
                                }
                                break;
                            case "4":
                                let favorLevel = Number(strs[1]);
                                if (favorLevel <= this._staff.favorLevel) {
                                    iconUrl = ResManager.getIncidentSpecialUrl() + "incident_haogandu";
                                }
                                break;
                            case "5":
                                let advanType = Number(strs[1]);
                                if (this._staff.isHaveAdvantages(advanType)) {
                                    iconUrl = Staff.getStaffAdvantageMinIconUrl(advanType)
                                }
                                break;
                        }
                        if (iconUrl != "") {
                            this.specialAddIcon[index].node.active = true;
                            UIUtil.asyncSetImage(this.specialAddIcon[index], iconUrl, false);
                        }
                    }
                }
            }


            let attribute = JsonMgr.getAttributeById(needId);
            let temp: number = index++;
            //icon
            ResMgr.getBigAttributeIcon(this.staffIcons[temp], attribute.attributeIcon);
            this.condionslbls[temp].node.color = ziColor
            this.condionslbls[temp].string = staffNum.toString();
            ++count;
            //this.attrShow.addChild(node);
        }

        if (count == 1) {
            this.staffIcons[0].node.position = new cc.Vec2(this.node.width * 0.4, this.staffIcons[0].node.position.y);
            this.staffIcons[1].node.active = false;
        } else {
            this.staffIcons[1].node.active = true;
            this.staffIcons[0].node.position = this._orginPos;

        }
    }

    setZhuanshuState(state) {
        this.zhuanAddNode.active = state;
        if (state) {
            let action = cc.repeatForever(cc.sequence(cc.fadeTo(1.5, 0), cc.fadeTo(1.5, 255)));
            this.zhuanAddNode.stopAllActions();
            this.zhuanAddNode.runAction(action);
        }
    }

    get isSelect() {
        return this._isSelect;
    }

    set isSelect(isSelect: boolean) {
        if (this._isSelect == isSelect)
            return;
        this._isSelect = isSelect;
        this.updateSelectState();
        this._delegate.updateSelectStaff(this, this._isSelect);
    }

    updateSelectState() {
        this.selectNode.active = this._isSelect;
    }

    onSelect = () => {

        this.cancleTime();

        if (this.isShowDetail) {
            return;
        }
        let model = this._delegate.getIncidentModel();
        //条件不足
        if (this.notType.isConditionCan() == false) {
            if (this.notType.isFatigue()) {
                let obj = {
                    helpType: 5,
                    incident: model,
                    staff: this._staff
                }

                UIMgr.showView(IncidentHelpView.url, null, obj);
                return;
            }

            if (this.notType.isHelped()) {
                UIMgr.showTipText(this.getIncidentStaffItemInfo());
                return;
            }

            DataMgr.setChooseStaffIndex(this._staffsIndex);

            if (this.notType.isLevelNot()) {//等级不足
                let obj = {
                    helpType: 6,
                    incident: model,
                    staff: this._staff,
                };
                UIMgr.showView(IncidentHelpView.url, null, obj);
                return;
            }

            let favorOpenLv: number = Number(JsonMgr.getConstVal("trainOpenLv"));
            if (this._staff.level < favorOpenLv) {//可以通过升级来进行属性增强
                if (!JsonMgr.isFunctionOpen(FunctionName.staffInfo)) {
                    let funcJson: IFunctionOpenJson = JsonMgr.getFunctionOpenByName(FunctionName.staffInfo);
                    if (funcJson.openType == 2) {
                        let postJson: IPositionJson = JsonMgr.getPositionJson(funcJson.value);
                        let str = "将于店长职位[" + postJson.name + postJson.level + "]阶之后解锁员工升级";
                        UIMgr.showTipText(str);
                    }
                    return
                }
                let obj = {
                    helpType: 7,
                    incident: model,
                    staff: this._staff,
                    type: this.notType.id
                };
                UIMgr.showView(IncidentHelpView.url, null, obj);
                return;
            }

            let obj = {
                helpType: 8,
                incident: model,
                staff: this._staff,
                type: this.notType.id
            };
            UIMgr.showView(IncidentHelpView.url, null, obj);
            return;

            // UIMgr.showTipText(this.getIncidentStaffItemInfo());
            // //UIMgr.showTipText("条件不足");
            // return;
        }

        if (model.getIsIncident() && DataMgr.isInSelfHome()) {
            if (this._isSelect == false && this._delegate.getSelectCount() >= model.conf.staffMaxNum) {
                UIMgr.showTipText(TextTipConst.INCIDENT_MAX_STAFF);
                return;
            }
        }

        if (model.getIsIncident()) {
            if (this._delegate.staffRole.getCurrentProgress() <= 0 && this._delegate.getSelectCount() == 0) {
                UIMgr.showTipText(TextTipConst.INCIDENT_INCIDENTOVER);
                return;
            }

            if (this._delegate.staffRole.getCurrentProgress() <= 0 && !this._delegate.hasCurrentStaff(this._staff.staffId)) {
                UIMgr.showTipText(TextTipConst.STAFFENOUGH);
                return;
            }

            if (DataMgr.isInFriendHome() && !this._delegate.hasCurrentStaff(this._staff.staffId)) {
                this._delegate.clearSelectCommond();
            }

        } else if (model.getIsAssist()) {
            if (this._isSelect == false && this._delegate.getSelectCount() >= model.conf.staffMaxNum) {
                UIMgr.showTipText(TextTipConst.INCIDENT_MAX_STAFF);
                return;
            }
            // if (!this._delegate.hasCurrentStaff(this._staff.staffId)) {
            //     this._delegate.clearSelectCommond();
            // }
        } else {
            if (!this._delegate.hasCurrentStaff(this._staff.staffId)) {
                this._delegate.clearSelectCommond();
            }

        }
        this._isSelect = !this._isSelect;
        this.updateSelectState();
        this._delegate.updateSelectStaff(this, this._isSelect);
    }


    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_END, this.onSelect);
        // this.dispose.dispose();
    }

    getStaffId() {
        return this._staff.staffId;
    }

    getGender() {
        return this._staff.getGender();
    }

    getJobIconUrl() {
        return this._staff.getJobIconUrl();
    }

    getName() {
        return this._staff.getName();
    }

    getAvatarUrl() {
        return this._staff.getAvatarUrl();
    }

    getStaff() {
        return this._staff;
    }

    getIsConditionCan() {
        return this.notType.isConditionCan();
    }

    getSuggestId() {
        return this._staff.getSuggestId();
    }

    isHaveAdvantages(type: number): boolean {
        return this._staff.isHaveAdvantages(type);
    }

    getStaffAdvantageMinIconUrl(type: number) {
        return Staff.getStaffAdvantageMinIconUrl(type);
    }

    getStar() {
        return this._staff.star;
    }

    getfavorLevel() {
        return this._staff.favorLevel;
    }

    update(dt) {

        if (this.isStartTouch) {
            this.touchTime++;
            if (this.touchTime >= 20) {
                this.isShowDetail = true;
                this.isStartTouch = false;

                let Dot: DotVo = {
                    COUNTER: COUNTERTYPE.STAFF,
                    PHYLUM: "6410",
                };
                DotInst.sendDot(Dot);

                UIMgr.showView(StaffComDetail.url, null, null, (node: cc.Node) => {
                    node.getComponent(StaffComDetail).initView(this._staff.staffId);
                });
            }
        }
    }

}

