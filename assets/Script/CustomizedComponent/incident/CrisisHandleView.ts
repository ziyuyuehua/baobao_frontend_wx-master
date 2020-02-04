import { GameComponent } from "../../core/component/GameComponent";
import { HttpInst } from "../../core/http/HttpClient";
import { NetConfig } from "../../global/const/NetConfig";
import { TextTipConst } from "../../global/const/TextTipConst";
import { ClientEvents } from "../../global/manager/ClientEventCenter";
import { UIMgr } from "../../global/manager/UIManager";
import { COM_GIFT_TYPE, DataMgr } from "../../Model/DataManager";
import { IncidentModel } from "../../Model/incident/IncidentModel";
import { IncidentData } from "../../Model/IncidentData";
import { Staff } from "../../Model/StaffData";
import { IIncident } from "../../types/Response";
import List from "../../Utils/GridScrollUtil/List";
import ListItem from "../../Utils/GridScrollUtil/ListItem";
import { StringUtil } from "../../Utils/StringUtil";
import { TimeUtil } from "../../Utils/TimeUtil";
import { UIUtil } from "../../Utils/UIUtil";
import { ButtonMgr } from "../common/ButtonClick";
import { Direction, State } from "../map/Role";
import { StaffRole } from "../staff/list/StaffRole";
import incidentAddSpecialInfo from "./incidentAddSpecialInfo";
import IncidentAnimation from "./IncidentAnimation";
import {
    autoSelectHandle,
    CalculationSpecialAdd,
    comAddSelectRole,
    IncidentAnimationInter,
    StaffItemInfo
} from "./IncidentHelp";
import IncidentHelpView from "./IncidentHelpView";
import { IncidentStaffAttrItem1 } from "./IncidentStaffAttrItem1";
import { IncidentStaffItem } from "./IncidentStaffItem";
import IncidentStaffRole from "./IncidentStaffRole";
import IncidentView from "./IncidentView";
import { topUiType } from "../MainUiTopCmpt";
import { DotInst, COUNTERTYPE } from "../common/dotClient";
import { ARROW_DIRECTION, GuideMgr } from "../common/SoftGuide";
import { JsonMgr } from "../../global/manager/JsonManager";
import { GuideIdType } from "../../global/const/GuideConst";

// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class CrisisHandleView extends GameComponent {
    static url: string = "incident/CrisisHandleView"

    @property(cc.Layout)
    private incidentLayout: cc.Layout = null;

    @property([cc.Node])
    private bgViewArr: cc.Node[] = [];

    @property([cc.Node])
    private bgViewPosArr: cc.Node[] = [];

    @property(cc.Node)
    specialShow: cc.Node = null;

    @property(cc.Layout)
    sepcialLayout: cc.Layout = null;

    @property(cc.Prefab)
    SpecialsPrefab: cc.Prefab = null;

    @property(cc.Node)
    specialTipNode: cc.Node = null;

    @property(cc.Node)
    tui1: cc.Node = null;

    @property(cc.Node)
    tui2: cc.Node = null;

    @property(cc.Node)
    specialTips: cc.Node = null;

    @property(List)
    addSpecialScroll: List = null;

    @property(cc.Node)
    closeNode: cc.Node = null;

    @property(cc.Button)
    goDealNode: cc.Button = null;

    @property(IncidentStaffRole)
    staffRole: IncidentStaffRole = null;

    @property(cc.Label)
    tiplabprocess: cc.Label = null;

    @property(cc.Node)
    maxprocessNode: cc.Node = null;

    @property(cc.Node)
    helpCompleNode: cc.Node = null;


    @property(cc.Label)
    maxprocesslbl: cc.Label = null;

    @property(cc.Node)
    completeNode: cc.Node = null;

    @property(cc.Node)
    completeBtn: cc.Node = null;

    @property(cc.Node)
    completeShow: cc.Node = null;

    @property(cc.Node)
    completeShowDiamond: cc.Node = null;

    @property(cc.Node)
    completeShowHelp: cc.Node = null;

    @property(cc.Label)
    tipLab: cc.Label = null;

    @property(List)
    requirementScroll: List = null;

    @property(List)
    scroll: List = null;

    @property(cc.Prefab)
    rolePrefab: cc.Prefab = null;

    @property(cc.Node)
    selectNode: cc.Node = null;

    @property(cc.Node)
    oneKeyNode: cc.Node = null;

    @property(cc.Label)
    tipLabFriend: cc.Label = null;

    @property([cc.Animation])
    cristisSpines: cc.Animation[] = [];


    private _model: IncidentModel = null;
    private selectMaps: StaffItemInfo[] = [];
    private _sortedStaffs: Array<Staff> = null;
    private staffItems: StaffItemInfo[] = [];
    private _staffAttrs: string[] = null;
    private _helpStaffIds: number[] = [];

    private selectRoles: StaffRole[] = [null, null, null];
    //选择武将的三个位置
    private selectPoints: cc.Vec2[] = [cc.v2(-80, -80), cc.v2(0, -80), cc.v2(80, -80)];
    private _finish: boolean = false;    //是否完成
    private isUpdateItem: boolean = true;   //是否刷新
    private oneKeyGuide: cc.Node = null;
    private DealGuide: cc.Node = null;
    private softGuideId: number = 0;

    onLoad() {
        ButtonMgr.addClick(this.specialShow, this.updateSpecialState);
        ButtonMgr.addClick(this.specialTipNode, this.updateSpecialState);
        ButtonMgr.addClick(this.closeNode, this.closeHandler);
        ButtonMgr.addClick(this.goDealNode.node, this.DealHandler);
        ButtonMgr.addClick(this.completeShowDiamond, this.diamondHandler);
        ButtonMgr.addClick(this.completeShowHelp, this.helpHandler);
        ButtonMgr.addClick(this.completeBtn, this.completeHandler);
        ButtonMgr.addClick(this.oneKeyNode, this.oneKeySelectHandler);

        this.addEvent(ClientEvents.INCIDENT_HELPCALLBACK.on(() => {
            this.completeShow.active = false;
            this.initTypeState();
        }));
        this.addEvent(ClientEvents.STAFF_UPDATE_STAFF.on(this.staffInfoUpdate));
        this.addEvent(ClientEvents.INCIDENT_CLEANFATIGUECALLBACK.on(() => {
            let conf = this._model.conf;
            this.initStaffItems(conf.staffLevel, this._staffAttrs);   //员工列表
        }));
        this.addEvent(ClientEvents.CRISIS_ANI_END_UPDATE.on(this.actionEndHandler));
        this.addEvent(ClientEvents.CLOSE_INCIDNT_ANI.on(() => {
            this.closeView();
        }))

    }

    onEnable() {
        DataMgr.friendshipUiTop = true;
        DataMgr.UiTop = true;
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.friendship);
        DataMgr.increaseTopUiNum();
    }

    onDisable() {
        DataMgr.friendshipUiTop = false;
        DataMgr.decrTopUiNum();
        DataMgr.UiTop = false;
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -2);
    }

    start() {
        UIUtil.AdaptationView(this.incidentLayout, this.bgViewArr, this.bgViewPosArr);
        if (this.node['data'] == null) {
            this._model = new IncidentModel();
            this._model.init(DataMgr.activityModel.getIncident());
        } else {
            this._model = <IncidentModel>this.node['data'].incident;
        }
        if (!DataMgr.isInSelfHome()) {
            this._helpStaffIds = <number[]>(this.node['data'].helps) || [];
        }
        this.updateSpecialAdd();
        this.setIncidentStaff();
        this._staffAttrs = DataMgr.staffData.getSortedAttr(this._model.conf.staffAttrs);
        this.setStaffNeedAttrs(this._model.conf.staffLevel, this._staffAttrs);
        this.initStaffItems(this._model.conf.staffLevel, this._staffAttrs);
        this.completeShow.active = false;
        this.goDealNode.interactable = false;
        this.showOneGuideView();
    }

    showOneGuideView() {
        if (DataMgr.isInFriendHome()) {
            return;
        }
        let curSoftGuide = JsonMgr.getSoftGuideJsoById(GuideIdType.FunCrisis, 4);
        let endSoftGuide = JsonMgr.getSoftGuideJsoById(GuideIdType.FunCrisis, 5);
        if (curSoftGuide && DataMgr.getGuideCompleteTimeById(endSoftGuide.id) <= 0) {
            DotInst.clientSendDot(COUNTERTYPE.softGuide, "19060");
            GuideMgr.showSoftGuide(this.oneKeyNode, ARROW_DIRECTION.BOTTOM, curSoftGuide.displayText, (node: cc.Node) => {
                this.oneKeyGuide = node;
            }, false, 0, false, this.oneKeySelectHandler);
        }
    }

    //关闭
    closeHandler = () => {
        HttpInst.postData(NetConfig.INCIDENT_DETAIL, [DataMgr.getCurUserId(), this._model.getId()], (res: any) => {
            if (res.state == 4) { //  完成、过期
                UIMgr.showTipText(TextTipConst.INCIDENT_COMPLETE);
                DataMgr.incidentData.clearExpire();
                this.closeView();
                return;
            }
            if (res.state == 3) {
                if (this._model.getIsIncident()) {
                    if (DataMgr.isInSelfHome()) {//在自己家
                        UIMgr.showTipText(TextTipConst.INCIDENT_OVERSELFHOMEWARNING);
                    } else {//在他人家
                        UIMgr.showTipText(TextTipConst.INCIDENT_OVERFRIENDHOMEWARNING);
                    }
                    DataMgr.incidentData.clearExpire();
                    this.closeView();
                    return;
                }
                UIMgr.showTipText(TextTipConst.INCIDENT_FINISH);
                DataMgr.incidentData.clearExpire();
                this.closeView();
                return;

            }

            if (DataMgr.isInFriendHome()) {
                let model = DataMgr.incidentData.updateIncident(res.incident);
                let detail = {
                    incident: model,
                    helps: res.helpStaffIds
                };
                UIMgr.showView(IncidentView.url, null, detail, null, true);
            } else {
                let model = DataMgr.incidentData.updateIncident(res.incident);
                let detail = {
                    incident: model,
                    helps: res.helps
                };
                UIMgr.showView(IncidentView.url, null, detail, null, true);
            }
            this.closeView();

        });
    }

    //处理
    DealHandler = () => {
        if (this.getSelectCount() == 0) {
            return;
        }

        if (this.selectMaps.length <= 0) {
            UIMgr.showTipText(TextTipConst.INCIDENT_SELECT_TIPS);
            return;
        }

        UIMgr.showMask();

        //危机、事件处理
        let keys: number[] = [];

        for (let i = 0; i < this.selectMaps.length; ++i) {
            keys.push(this.selectMaps[i].staff.staffId);
        }

        let inFriendHome: boolean = DataMgr.isInFriendHome();
        let serviceMethod: [string, string] = inFriendHome ? NetConfig.INCIDENT_HELP : NetConfig.INCIDENT_SOLVE;
        let params: Array<any> = inFriendHome ? [DataMgr.getCurUserId(), this._model.getId(), keys] : [this._model.getId(), keys];

        this.isUpdateItem = false;
        HttpInst.postData(serviceMethod, params, (res: any) => {

            if (this.softGuideId > 0 && DataMgr.getGuideCompleteTimeById(this.softGuideId) <= 0) {
                HttpInst.postData(NetConfig.SOFT_LED_INFO, [this.softGuideId], (response) => {
                });
            }

            if (this.DealGuide) {
                this.DealGuide.active = false;
            }
            let incidentData: IncidentData = DataMgr.incidentData;

            if (res.state == 4) {//  完成、过期
                UIMgr.showTipText(TextTipConst.INCIDENT_COMPLETE);
                incidentData.clearExpire();
                this.closeView();
                return;
            }

            if (res.state == 3 && res.incident == null) {
                if (this._model.getIsIncident()) {
                    if (DataMgr.isInSelfHome()) {//在自己家
                        UIMgr.showTipText(TextTipConst.INCIDENT_OVERSELFHOMEWARNING);
                    } else {//在他人家
                        UIMgr.showTipText(TextTipConst.INCIDENT_OVERFRIENDHOMEWARNING);
                    }
                    DataMgr.incidentData.clearExpire();
                    this.closeView();
                    return;
                }

                UIMgr.showTipText(TextTipConst.INCIDENT_COMPLETE);
                incidentData.clearExpire();
                this.closeView();
                return;
            }

            let result = <IIncident>res.incident;
            this._model.init(result);
            DotInst.clientSendDot(COUNTERTYPE.incidentCrisis, "4506", this._model.getId() + "", this._model.getLastProgress() + "", DataMgr.iMarket.getShopLv() + "");

            if (DataMgr.isInFriendHome()) {//好友家
                this._helpStaffIds = res.helpStaffIds;
                ClientEvents.HANDLE_FRIENDS_HOME.emit(2);
                if (incidentData.isComplete(result)) {
                    incidentData.deleteIncident(result);
                    this.playResultAnim(true);
                } else if (result.helped) {
                    this.playResultAnim(true);
                } else {
                    this.playResultAnim(false);
                }

            } else {
                if (incidentData.isComplete(result)) {
                    let str = ""
                    let reward = this._model.getRewards();
                    for (let index = 0; index < reward.length; index++) {
                        if (index == reward.length - 1) {
                            str += reward[index].xmlId
                        } else {
                            str += reward[index].xmlId + ","
                        }
                    }
                    DotInst.clientSendDot(COUNTERTYPE.incidentCrisis, "4508", this._model.getId() + "", str, DataMgr.iMarket.getShopLv() + "");
                    ClientEvents.REFRESH_BIG_MAP_THING_DANGER.emit();
                    DataMgr.incidentData.setIsOtherMarket(false);
                    incidentData.deleteIncident(result);
                    this.playResultAnim(true);
                } else {
                    DataMgr.activityModel.setIncident(result);
                    let model = incidentData.updateIncident(result);
                    ClientEvents.INCIDENT_REFRESHVIEW.emit(this._model.conf.getType());
                    this.refreshModel(model);
                    this.playResultAnim(false);
                }
            }
        });
    }

    //播放动画
    playResultAnim(finish: boolean) {
        this.isUpdateItem = true;
        this._finish = finish;
        let sendData: IncidentAnimationInter = {
            _model: this._model,
            staffIds: this.selectMaps,
            _finish: finish
        };
        UIMgr.showView(IncidentAnimation.url, null, sendData);
    }

    //动画播放完回调
    actionEndHandler = () => {
        UIMgr.hideMask();
        if (!this._finish) {
            this.clearSelectCommond();
            this.staffInfoUpdate();
        }
        if (this._finish) {
            if (DataMgr.isInFriendHome()) {//好友家
                UIMgr.showDelayCommonGiftView(COM_GIFT_TYPE.help);
            } else {
                UIMgr.showDelayCommonGiftView(COM_GIFT_TYPE.crisis);
            }
        }
    }

    //刷新
    staffInfoUpdate = () => {
        if (this.isUpdateItem) {
            let conf = this._model.conf;
            this.initStaffItems(conf.staffLevel, this._staffAttrs);   //员工列表
        }
    }


    //钻石解决
    diamondHandler = () => {
        let obj = {
            helpType: 2,
            incident: this._model
        }
        UIMgr.showView(IncidentHelpView.url, null, obj);
    }

    //求助好友
    helpHandler = () => {
        let helpval = this._model.getMaxHelpDegree() / 100 * this._model.conf.getDegree() - this._model.getHelpProcess();
        if (helpval >= this._model.getLastProgress()) {
            UIMgr.showTipText(TextTipConst.INCIDENT_CRISISINSUFFICIENTWARNING);
            return;
        }
        let obj = {
            helpType: 1,
            incident: this._model
        }
        UIMgr.showView(IncidentHelpView.url, null, obj);
    }

    //快速完成
    completeHandler = () => {
        this.completeShow.active = !this.completeShow.active;
    }

    //tip
    updateSpecialState = () => {
        if (!this.specialTips.active) {
            this.specialTips.active = true;
            this.addSpecialScroll.numItems = this._model.getSpecialAdd().length;
            this.addSpecialScroll.scrollTo(0);
        } else {
            this.specialTips.active = false;
        }
    }

    //一键选择
    oneKeySelectHandler = () => {
        if (this.staffRole.getCurrentProgress() <= 0) {
            if (this.getSelectCount() == 0) {
                UIMgr.showTipText(TextTipConst.INCIDENT_INCIDENTOVER);
            } else {
                if (this.getSelectCount() == this._model.conf.staffMaxNum) {
                    UIMgr.showTipText(TextTipConst.INCIDENT_MAX_STAFF);
                } else {
                    UIMgr.showTipText(TextTipConst.STAFFENOUGH);
                }
            }
            return;
        }

        autoSelectHandle(this.scroll, this.staffRole.getProgressCol(), true, this._model, this.clearSelect, this.staffItems, this.addSelectRole, this.updateSpecialAdd);
        this.showDealGuide();
    }

    showDealGuide() {
        if (DataMgr.isInFriendHome()) {
            return;
        }
        if (this.oneKeyGuide) this.oneKeyGuide.active = false;
        let endSoftGuide = JsonMgr.getSoftGuideJsoById(GuideIdType.FunCrisis, 5);
        if (endSoftGuide && DataMgr.getGuideCompleteTimeById(endSoftGuide.id) <= 0) {
            DotInst.clientSendDot(COUNTERTYPE.softGuide, "19061");
            GuideMgr.showSoftGuide(this.goDealNode.node, ARROW_DIRECTION.BOTTOM, endSoftGuide.displayText, (node: cc.Node) => {
                this.softGuideId = endSoftGuide.id;
                this.DealGuide = node;
            }, false, 0, false, this.DealHandler);
        }
    }

    //列表设置事件
    onListAddSpecialRender(item: cc.Node, idx: number) {
        let addSpecialIItem: incidentAddSpecialInfo = item.getComponent(incidentAddSpecialInfo);
        addSpecialIItem.init(this._model.getSpecialAdd()[idx]);
    }

    getBaseUrl() {
        return CrisisHandleView.url;
    }

    //更新危机特殊加成
    updateSpecialAdd = () => {
        this.setSpecialState(this._model.conf.getSpecialAdd.length > 0);
        let staffAttrs = DataMgr.staffData.getSortedAttr(this._model.conf.staffAttrs);
        let isInHome = true;
        if (DataMgr.isInFriendHome()) {
            isInHome = false;
        }

        let attrisval = CalculationSpecialAdd(this._model, this.sepcialLayout, this.SpecialsPrefab, staffAttrs, this.selectMaps, isInHome);

        if (this.staffRole != null) {
            if (DataMgr.isInFriendHome()) {
                let maxVal = this.getHelpNum();
                attrisval = Math.min(Math.floor(maxVal), attrisval);
                // this.helpCompleNode.active = attrisval / this._model.getConfDegree() >= 0.3;
            }
            this.staffRole.setCurrentProgress(this._model.getSubProgressPercent(attrisval));
            this.tiplabprocess.string = this._model.getSubProgressPrecentNnm(attrisval) + "";
        }
    }

    //特殊加成显示状态
    setSpecialState(state) {
        this.tui1.active = state;
        this.tui2.active = state;
        this.specialShow.active = state;
    }

    //设置协助员工
    setIncidentStaff() {
        this.tiplabprocess.string = this._model.getLastProgress() + "";
        this.staffRole.initIncidentModel(this._model);
        this.staffRole.setTwinkleEffect(true);
        this.initTypeState();
    }

    //设置文字
    initTypeState() {
        //判断是否求助过好友
        let isHelpMax = this._model.getHelpMax();
        this.tipLab.node.parent.active = DataMgr.isInSelfHome();
        this.tipLabFriend.node.active = DataMgr.isInFriendHome();
        //设置可帮助
        if (DataMgr.isInSelfHome()) {
            this.maxprocessNode.active = false;

            this.completeNode.active = !isHelpMax;  //
            this.completeBtn.active = !isHelpMax;

            let time = TimeUtil.getTimeBySecond(this._model.conf.getFatigueTime());
            this.tipLab.string = (time.h == 0 ? "" : (time.h + "小时")) + (time.m == 0 ? "" : (time.m + "分钟"));
            this.tipLab.node.parent.active = this.tipLab.string.length != 0;
        } else {
            this.completeNode.active = false;
            this.completeBtn.active = false;

            this.maxprocessNode.active = true;

            let helpnum = this.getHelpNum() / this._model.conf.getDegree() * 100;
            this.maxprocesslbl.string = StringUtil.format("可帮忙处理{0}%", IncidentModel.formatProgress(helpnum));
        }
    }

    getHelpNum() {
        let isHelpMax = this._model.getHelpMax();
        let limitDegree = Math.floor(this._model.getMaxHelpDegree() / 100 * this._model.conf.getDegree());
        let value = Math.max(0, limitDegree - this._model.getHelpProcess());
        let surplusHelpDegree = isHelpMax ? this._model.getLastProgress() : value;
        return surplusHelpDegree;
    }

    //设置要求
    setStaffNeedAttrs(needLevel: number, attrs: string[]) {
        this.requirementScroll.numItems = attrs.length + (needLevel ? 1 : 0);
        this.requirementScroll.scrollTo(0);
    }

    //要求列表设置
    onListVRender(item: cc.Node, idx: number) {
        let rewardItem: IncidentStaffAttrItem1 = item.getComponent(IncidentStaffAttrItem1);
        if (idx == 0) {
            if (this._model.conf.staffLevel != 0) {
                rewardItem.initLevel(this._model.conf.staffLevel);
            } else {
                rewardItem.initAttr1(this._staffAttrs[0]);
            }

        } else {
            let index: number = this._model.conf.staffLevel != 0 ? idx - 1 : idx;
            rewardItem.initAttr1(this._staffAttrs[index]);
        }
    }

    //设置员工列表
    initStaffItems(needLevel: number, attrs: string[]) {
        //todo 排序列表
        this.staffItems.splice(0, this.staffItems.length);
        if (DataMgr.isInFriendHome()) {
            this._sortedStaffs = DataMgr.staffData.getSortedByStaffAttr(needLevel, attrs, this._helpStaffIds, true, false, this._model);
        } else {
            this._sortedStaffs = DataMgr.staffData.getSortedByStaffAttr(needLevel, attrs, [], true, false, this._model);
        }

        for (let i = 0; i < this._sortedStaffs.length; ++i) {
            let info = new StaffItemInfo();
            this.staffItems.push(info);

            info.staff = this._sortedStaffs[i];
            info.isSelect = false;
            info.notype = IncidentStaffItem.getNotType(info.staff, this._model, this.getIncidentHelps(), this._staffAttrs);
        }

        this.scroll.numItems = this._sortedStaffs.length;
        this.scroll.scrollTo(0);
    }

    //员工列表设置
    onListRoleRender(item: cc.Node, idx: number) {
        let rewardItem: IncidentStaffItem = item.getComponent(IncidentStaffItem);
        let staff = this._sortedStaffs[idx];
        rewardItem.initStaff(staff, this._model.conf.staffLevel, this._staffAttrs, this);
        rewardItem.setItemIndex(idx);
        rewardItem.setUpNodeState(this._model);
        let info: StaffItemInfo = null;
        for (let i = 0; i < this.staffItems.length; ++i) {
            if (this.staffItems[i].staff.staffId == staff.staffId) {
                info = this.staffItems[i];
                break;
            }
        }
        info.notype.id = rewardItem.notType.id;
        info.notype.num = rewardItem.notType.id;
        info.listId = item.getComponent(ListItem).listId;
        rewardItem.isSelect = info.isSelect;
    }

    getIncidentHelps() {
        return this._helpStaffIds;
    }

    getIsAssist() {
        return this._model.getIsAssist();
    }

    updateSelectStaff(staffItem: IncidentStaffItem, isSelect: boolean) {
        let item: StaffItemInfo = null;
        for (let i = 0; i < this.staffItems.length; ++i) {
            if (this.staffItems[i].staff.staffId == staffItem.getStaffId()) {
                item = this.staffItems[i];
                break;
            }
        }


        item.notype.id = staffItem.notType.id;
        item.notype.num = staffItem.notType.num;
        if (isSelect) {
            item.isSelect = true;
            this.addSelectRole(item);
        } else {
            item.isSelect = false;
            this.deleteSelectRole(item);
        }

        this.updateSpecialAdd();
    }

    addSelectRole = (staffItemInfo: StaffItemInfo) => {
        let staff = staffItemInfo.staff;
        for (let i = 0; i < this.selectRoles.length; ++i) {
            if (this.selectRoles[i] != null && this.selectRoles[i].getStaff().staffId == staff.staffId) {
                return;
            }
        }
        let pos = this.getEmptyIndex();
        let role = comAddSelectRole(staffItemInfo, this._model, this.selectRoles, this.selectMaps, this.rolePrefab, this.selectNode, () => {
            this.updateRolePos();
            this.updateHandleButton();
        })
        let count = this.getSelectCount();

        let str: string = "";
        for (let i = 0; i < this.selectMaps.length; ++i) {
            if (i == this.selectMaps.length - 1) {
                str += this.selectMaps[i].staff.staffId
            } else {
                str += this.selectMaps[i].staff.staffId + ",";
            }
        }
        DotInst.clientSendDot(COUNTERTYPE.incidentCrisis, "4503", str, this._model.getId() + "", DataMgr.iMarket.getShopLv() + "")


        for (let i = 0; i < this.selectRoles.length; ++i) {
            if (this.selectRoles[i] != null) {
                this.cristisSpines[i].node.position = new cc.Vec2(this.selectRoles[i].node.position.x, this.cristisSpines[i].node.position.y);
            }
            this.addRoleEffect(staff, pos, count);
        }
    }

    //找空模型Index
    getEmptyIndex(): number {
        for (let index = 0; index < this.selectRoles.length; ++index) {
            if (this.selectRoles[index] == null) {
                return index;
            }
        }
        return -1;
    }

    //更新角色位置
    updateRolePos() {
        let count = 0;
        for (let i = 0; i < this.selectRoles.length; ++i) {
            if (this.selectRoles[i] != null) {
                ++count;
            }
        }

        if (count == 1) {
            for (let i = 0; i < this.selectRoles.length; ++i) {
                if (this.selectRoles[i] != null) {
                    this.selectRoles[i].node.position = this.selectPoints[1];
                    break;
                }
            }
        } else if (count == 2) {
            let ccTemp = 0;
            for (let i = 0; i < this.selectRoles.length; ++i) {
                if (this.selectRoles[i] != null) {
                    let pos = this.selectPoints[ccTemp == 0 ? 0 : 2];
                    this.selectRoles[i].node.position = new cc.Vec2(pos.x * 0.5, pos.y);
                    ++ccTemp;
                }
            }
        } else if (count == 3) {
            for (let i = 0; i < this.selectRoles.length; ++i) {
                if (this.selectRoles[i] != null) {
                    this.selectRoles[i].node.position = this.selectPoints[i];
                }
            }
        }
    }

    //更新危机按钮
    updateHandleButton() {
        this.goDealNode.interactable = this.getSelectCount() > 0;
    }

    getSelectCount() {
        let count: number = 0;
        for (let i = 0; i < this.selectRoles.length; ++i) {
            if (this.selectRoles[i] != null) {
                ++count;
            }
        }

        return count;
    }

    //增加特效
    addRoleEffect(staff: Staff, pos: number, count: number) {
        let tempStaff = staff;
        let roletemp = this.selectRoles[pos];
        let index = count - 1;
        let spine = this.cristisSpines[index];

        spine.node.active = true;
        spine.play(spine.getClips()[0].name);

        this.scheduleOnce(() => {
            spine.node.active = false;
            roletemp.init(staff, Direction.RIGHT, false, null, null, State.IDLE, null, true, true);

        }, 0.2);
    }

    //删除选中角色
    deleteSelectRole(staffInfo: StaffItemInfo) {
        let staff = staffInfo.staff;
        DotInst.clientSendDot(COUNTERTYPE.incidentCrisis, "4504", staff.xmlId + "", this._model.getId() + "", DataMgr.iMarket.getShopLv() + "")

        for (let i = 0; i < this.selectRoles.length; i++) {
            let role = this.selectRoles[i];
            if (role == null) {
                continue;
            }
            if (role.getStaff().staffId == staff.staffId) {
                this.selectRoles[i] = null;
                role.node.destroy();
                break;
            }
        }

        for (let i = 0; i < this.selectMaps.length; ++i) {
            if (this.selectMaps[i].staff.staffId == staffInfo.staff.staffId) {
                this.selectMaps.splice(i, 1);
            }
        }

        this.updateRolePos();
        this.updateHandleButton();
        if (this.selectMaps.length <= 0) {
            if (this.DealGuide) {
                this.DealGuide.active = false;
                this.DealGuide.destroy();
                this.DealGuide = null;
            }
            this.showOneGuideView();
        }
    }

    //是否有当前选中员工
    hasCurrentStaff(staffid: number) {
        for (let i = 0; i < this.selectMaps.length; ++i) {
            if (this.selectMaps[i].staff.staffId == staffid)
                return true;
        }
        return false;
    }

    //清空
    clearSelectCommond() {
        this.clearSelect(this.scroll);
    }

    clearSelect = (scroll: List) => {
        while (this.selectMaps.length > 0) {
            this.selectMaps[0].isSelect = false;
            if (this.selectMaps[0].listId >= 0) {
                let itemNode = scroll.getItemByListId(this.selectMaps[0].listId);
                if (itemNode != null) {
                    let item: IncidentStaffItem = itemNode.getComponent(IncidentStaffItem);
                    if (item != null && item.isSelect) {
                        item.isSelect = false;
                    } else {
                        this.selectMaps.splice(0, 1);
                    }
                } else {
                    this.selectMaps.splice(0, 1);
                }
            } else {
                this.selectMaps.splice(0, 1);
            }
        }
        this.deleteAllSelect();

    }

    deleteAllSelect() {
        for (let i = 0; i < this.selectRoles.length; i++) {
            if (this.selectRoles[i] != null) {
                this.selectRoles[i].node.destroy();
                this.selectRoles[i] = null;
            }
        }
    }

    getIncidentModel() {
        return this._model;
    }

    refreshModel(model: IncidentModel) {
        this._model = model;
        this.staffRole.refreshModel(this._model);
        this.staffRole.initIncidentModel(this._model);
        this.tiplabprocess.string = this._model.getLastProgress() + "";
    }
}
