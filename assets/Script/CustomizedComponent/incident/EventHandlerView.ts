import { GameComponent } from "../../core/component/GameComponent";
import { UIUtil } from "../../Utils/UIUtil";
import { IncidentModel } from "../../Model/incident/IncidentModel";
import { DataMgr, COM_GIFT_TYPE } from "../../Model/DataManager";
import { ButtonMgr } from "../common/ButtonClick";
import { MapIncident } from "../map/MapItem/incident/MapIncident";
import { JsonMgr } from "../../global/manager/JsonManager";
import { Staff } from "../../Model/StaffData";
import { ResManager } from "../../global/manager/ResManager";
import { IncidentStaffAttrItem1 } from "./IncidentStaffAttrItem1";
import List from "../../Utils/GridScrollUtil/List";
import {
    StaffItemInfo,
    CalculationSpecialAdd,
    comAddSelectRole,
    comUpdateRolePos,
    autoSelectHandle,
    IncidentAnimationInter
} from "./IncidentHelp";
import { IncidentStaffItem } from "./IncidentStaffItem";
import ListItem from "../../Utils/GridScrollUtil/ListItem";
import { StaffRole } from "../staff/list/StaffRole";
import { Direction, State } from "../map/Role";
import IncidentStaffRole from "./IncidentStaffRole";
import { UIMgr } from "../../global/manager/UIManager";
import IncidentHelpView from "./IncidentHelpView";
import { HttpInst } from "../../core/http/HttpClient";
import { NetConfig } from "../../global/const/NetConfig";
import { IncidentData } from "../../Model/IncidentData";
import { TextTipConst } from "../../global/const/TextTipConst";
import { IIncident } from "../../types/Response";
import { ClientEvents } from "../../global/manager/ClientEventCenter";
import { TimeUtil } from "../../Utils/TimeUtil";
import { GuideMgr, ARROW_DIRECTION } from "../common/SoftGuide";
import IncidentView from "./IncidentView";
import IncidentAnimation from "./IncidentAnimation";
import { topUiType } from "../MainUiTopCmpt";
import { DotInst, COUNTERTYPE } from "../common/dotClient";
import { ArrowTextConst } from "../../global/const/ArrowTextConst";
import { GuideIdType, judgeSoftGuideStart } from "../../global/const/GuideConst";

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
export default class EventHandlerView extends GameComponent {
    static url: string = "incident/EventHandlerView"

    @property(cc.Layout)
    private eventLayout: cc.Layout = null;

    @property([cc.Node])
    private eventBgViewArr: cc.Node[] = [];

    @property([cc.Node])
    private eventBgViewPosArr: cc.Node[] = [];

    @property(cc.Node)
    diamondBtn: cc.Node = null;

    @property(cc.Node)
    retrunNode: cc.Node = null;

    @property(cc.Button)
    handleNode: cc.Button = null;

    @property(cc.Node)
    oneKeyNode: cc.Node = null;

    @property(cc.Label)
    eventNamelbl: cc.Label = null;

    @property(List)
    requirementEvtScroll: List = null;

    @property(List)
    scrollEvt: List = null;

    @property(cc.Prefab)
    rolePrefab: cc.Prefab = null;

    @property(cc.Node)
    selectNodeEvt: cc.Node = null;

    @property(cc.Label)
    tiplabEvt: cc.Label = null;

    @property(cc.Animation)
    smokeAnim: cc.Animation = null;

    @property(MapIncident)
    eventRoleIcon: MapIncident = null;

    @property(sp.Skeleton)
    eventSpineRole: sp.Skeleton = null;

    private _model: IncidentModel = null;
    private _staffAttrs: string[] = [];
    private _sortedStaffs: Array<Staff> = null;
    private staffItems: StaffItemInfo[] = [];
    private _helpStaffIds: number[] = [];
    private selectMaps: StaffItemInfo[] = [];
    private selectRoles: StaffRole[] = [null, null, null];
    staffRole: IncidentStaffRole = null;
    private _finish: boolean = false;    //是否完成
    private _isAniEnd: boolean = false;  //是否在播放动画期间

    oneKeyGuide: cc.Node = null;
    handleGuide: cc.Node = null;
    softGuideId: number = 0;

    getBaseUrl() {
        return EventHandlerView.url;
    }

    onLoad() {
        ButtonMgr.addClick(this.diamondBtn, this.diamondHandler);
        ButtonMgr.addClick(this.retrunNode, this.closeHandler);
        ButtonMgr.addClick(this.handleNode.node, this.handleHandler);
        ButtonMgr.addClick(this.oneKeyNode, this.oneKeyHandler);
        this.addEvent(ClientEvents.STAFF_UPDATE_STAFF.on(this.staffInfoUpdate));
        this.addEvent(ClientEvents.INCIDENT_CLEANFATIGUECALLBACK.on(() => {
            let conf = this._model.conf;
            this.initStaffEvtItems(conf.staffLevel, this._staffAttrs);   //员工列表
        }));
        this.addEvent(ClientEvents.CRISIS_ANI_END_UPDATE.on(this.actionEndHandler));
        this.addEvent(ClientEvents.CLOSE_INCIDNT_ANI.on(() => {
            this.closeView();
        }))
    }

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

    //钻石解决
    diamondHandler = () => {
        let obj = {
            helpType: 2,
            incident: this._model
        }
        UIMgr.showView(IncidentHelpView.url, null, obj);
    }

    //处理
    handleHandler = () => {
        if (this.getSelectCount() == 0) {
            return;
        }

        if (this.selectMaps.length <= 0) {
            UIMgr.showTipText(TextTipConst.INCIDENT_SELECT_TIPS);
            return;
        }
        UIMgr.showMask();
        this._isAniEnd = true;
        //危机、事件处理
        let keys: number[] = [];

        for (let i = 0; i < this.selectMaps.length; ++i) {
            keys.push(this.selectMaps[i].staff.staffId);
        }
        let inFriendHome: boolean = DataMgr.isInFriendHome();
        let serviceMethod: [string, string] = inFriendHome ? NetConfig.INCIDENT_HELP : NetConfig.INCIDENT_SOLVE;
        let params: Array<any> = inFriendHome ? [DataMgr.getCurUserId(), this._model.getId(), keys] : [this._model.getId(), keys];

        HttpInst.postData(serviceMethod, params, (res: any) => {
            DotInst.clientSendDot(COUNTERTYPE.incidentCrisis, "4505", this._model.getId() + "", DataMgr.iMarket.getShopLv() + "");

            if (this.softGuideId > 0 && DataMgr.getGuideCompleteTimeById(this.softGuideId) <= 0) {
                HttpInst.postData(NetConfig.SOFT_LED_INFO, [this.softGuideId], (response) => {
                });
            }
            //隐藏箭头
            if (this.oneKeyGuide != null) {
                this.oneKeyGuide.active = false;
            }

            if (this.handleGuide != null) {
                this.handleGuide.active = false;
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
            if (DataMgr.isInFriendHome()) {//好友家
                this._helpStaffIds = res.helpStaffIds;
                if (incidentData.isComplete(result)) {
                    incidentData.deleteIncident(result);
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
                    DotInst.clientSendDot(COUNTERTYPE.incidentCrisis, "4507", this._model.getId() + "", str, DataMgr.iMarket.getShopLv() + "");
                    ClientEvents.REFRESH_BIG_MAP_THING_DANGER.emit();
                    DataMgr.incidentData.setIsOtherMarket(false);
                    incidentData.deleteIncident(result);
                    this.playResultAnim(true);
                } else {
                    DataMgr.activityModel.setIncident(result);
                    let model = incidentData.updateIncident(result);
                    ClientEvents.INCIDENT_REFRESHVIEW.emit(this._model.conf.getType());
                    this._model = model
                    this.playResultAnim(false);
                }
            }
        });
    }

    playResultAnim(finish: boolean) {
        this._finish = finish;
        let sendData: IncidentAnimationInter = {
            _model: this._model,
            staffIds: this.selectMaps,
            _finish: finish
        }
        UIMgr.showView(IncidentAnimation.url, null, sendData);
    }

    actionEndHandler = () => {
        UIMgr.hideMask();
        this._isAniEnd = false;
        if (!this._finish) {
            this.clearSelectCommond();
            this.staffInfoUpdate();
        }
        if (this._finish) {
            if (DataMgr.isInFriendHome()) {//好友家
                UIMgr.showDelayCommonGiftView(COM_GIFT_TYPE.help);
            } else {
                UIMgr.showDelayCommonGiftView(COM_GIFT_TYPE.event);
            }
        }
    }

    //刷新
    staffInfoUpdate = () => {
        if (!this._isAniEnd) {
            let conf = this._model.conf;
            this.initStaffEvtItems(conf.staffLevel, this._staffAttrs);   //员工列表
        }
    }

    //一键选择
    oneKeyHandler = () => {
        autoSelectHandle(this.scrollEvt, null, false, this._model, this.clearSelect, this.staffItems, this.addSelectRole, this.updateSpecialAdd);
    }

    start() {
        UIUtil.AdaptationView(this.eventLayout, this.eventBgViewArr, this.eventBgViewPosArr);
        if (this.node['data'] == null) {
            this._model = new IncidentModel();
            this._model.init(DataMgr.activityModel.getIncident());
        } else {
            this._model = <IncidentModel>this.node['data'].incident;
        }
        if (!DataMgr.isInSelfHome()) {
            this._helpStaffIds = <number[]>(this.node['data'].helps) || [];
        }
        this._staffAttrs = DataMgr.staffData.getSortedAttr(this._model.conf.staffAttrs);
        this.updateRight();
        let conf = this._model.conf;
        this.initStaffEvtAttrs(conf.staffLevel, this._staffAttrs);  //要求
        this.initStaffEvtItems(conf.staffLevel, this._staffAttrs);  //员工
        this.initTypeState();
        this.showGuideView();
        this.handleNode.interactable = false;
    }

    //更新右边
    updateRight() {
        let showConf = JsonMgr.getIncidentShowById(this._model.getShowId());
        this.eventNamelbl.string = showConf.getName();
        this.eventSpineRole.node.active = false;
        let modId = showConf.getMod()
        if (modId > 0) {
            this.eventRoleIcon.node.active = false;
            this.eventSpineRole.node.active = true;
            let resUrl = Staff.getLowStaffSpineUrl(modId);
            this.initSpine(resUrl);
        } else {
            this.eventRoleIcon.node.active = true;
            this.eventSpineRole.node.active = false;
            this.eventRoleIcon.initImage(ResManager.INCIDENT_BACKGROUND + showConf.getTargetPic(), true);
        }
    }

    //设置spine
    initSpine(url) {
        cc.loader.loadRes(url, sp.SkeletonData, null, this.onComplete);
    }

    onComplete = (err: Error, res: sp.SkeletonData) => {
        if (err) {
            cc.error(err);
            return;
        }
        if (!this.eventSpineRole) {
            return;
        }

        this.eventSpineRole.skeletonData = res;

        let showConf = JsonMgr.getIncidentShowById(this._model.getShowId());
        let action: IRoleAction = JsonMgr.getRoleAction(showConf.getAction());
        let face: IRoleFaceJson = JsonMgr.getRoleFace(showConf.getFace());
        this.eventSpineRole.setAnimation(0, action.action, true);
        this.eventSpineRole.setSkin(face.face);
        // this.eventSpineRole.node.active = true;
    };

    //更新要求滑动列表
    initStaffEvtAttrs(needLevel: number, attrs: string[]) {
        this.requirementEvtScroll.numItems = attrs.length + (needLevel ? 1 : 0);
        this.requirementEvtScroll.scrollTo(0);
    }

    //要求滑动列表设置
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

    //更新员工列表
    initStaffEvtItems(needLevel: number, attrs: string[]) {
        this._sortedStaffs = DataMgr.staffData.getSortedByStaffAttr(needLevel, attrs, [], true, false, this._model);
        this.staffItems.splice(0, this.staffItems.length);
        for (let i = 0; i < this._sortedStaffs.length; ++i) {
            let info = new StaffItemInfo();
            this.staffItems.push(info);

            info.staff = this._sortedStaffs[i];
            info.isSelect = false;
            info.notype = IncidentStaffItem.getNotType(info.staff, this._model, this.getIncidentHelps(), this._staffAttrs);
        }
        this.scrollEvt.numItems = this._sortedStaffs.length;
        this.scrollEvt.scrollTo(0);
    }

    getIncidentHelps() {
        return this._helpStaffIds;
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

    //=======================列表设置的一些方法 start
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

    getIncidentModel() {
        return this._model
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
        this.clearSelect(this.scrollEvt);
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

    //=======================列表设置的一些方法 end

    //更新事件特殊加成
    updateSpecialAdd = () => {
        let staffAttrs = DataMgr.staffData.getSortedAttr(this._model.conf.staffAttrs);
        let attrisval = CalculationSpecialAdd(this._model, null, null, staffAttrs, this.selectMaps);
    }

    //增加
    addSelectRole = (staffItemInfo: StaffItemInfo) => {
        let staff = staffItemInfo.staff;
        DotInst.clientSendDot(COUNTERTYPE.incidentCrisis, "4501", staff.xmlId + "", this._model.getId() + "", DataMgr.iMarket.getShopLv() + "")
        for (let i = 0; i < this.selectRoles.length; ++i) {
            if (this.selectRoles[i] != null && this.selectRoles[i].getStaff().staffId == staff.staffId) {
                return;
            }
        }
        let role = comAddSelectRole(staffItemInfo, this._model, this.selectRoles, this.selectMaps, this.rolePrefab, this.selectNodeEvt, () => {
            this.updateRoolePos();
            this.updateHandleButton();
        })
        this.smokeAnim.node.position = new cc.Vec2(role.node.position.x, this.smokeAnim.node.position.y);
        this.smokeAnim.node.active = true;
        this.smokeAnim.play(this.smokeAnim.getClips()[0].name);
        this.scheduleOnce(() => {
            this.smokeAnim.node.active = false;

            role.init(staff, Direction.RIGHT, false, null, null, State.IDLE, null, true, true);
        }, 0.3);
        if (this.selectRoles.length > 0) {
            this.showGuideView();
        }
    }

    //删除
    deleteSelectRole = (staffInfo: StaffItemInfo) => {
        let staff = staffInfo.staff;
        DotInst.clientSendDot(COUNTERTYPE.incidentCrisis, "4502", staff.xmlId + "", this._model.getId() + "", DataMgr.iMarket.getShopLv() + "")
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

        //更新角色位置
        this.updateRoolePos();
        this.updateHandleButton();

        this.showGuideView();
    }

    //更新角色位置
    updateRoolePos() {
        comUpdateRolePos(this.selectRoles);
    }

    //更新危机按钮
    updateHandleButton() {
        this.handleNode.interactable = this.getSelectCount() > 0;
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

    //疲劳时间
    initTypeState() {
        let time = TimeUtil.getTimeBySecond(this._model.conf.getFatigueTime());
        this.tiplabEvt.string = (time.h == 0 ? "" : (time.h + "小时")) + (time.m == 0 ? "" : (time.m + "分钟"));
        this.tiplabEvt.node.parent.active = this.tiplabEvt.string.length != 0;
        // this.completeNode.active = false;

    }

    showGuideView() {
        if (this.handleGuide != null) {
            this.handleGuide.active = false;
        }

        if (this.oneKeyGuide != null) {
            this.oneKeyGuide.active = false;
        }

        if (this.getSelectCount() > 0) {
            if (this.oneKeyGuide != null) {
                this.oneKeyGuide.active = false;
            }
            if (this.handleGuide != null) {
                this.handleGuide.active = true;
            } else {
                let endSoftGuide = JsonMgr.getSoftGuideJsoById(GuideIdType.FunEvent, 5);
                if (endSoftGuide && DataMgr.getGuideCompleteTimeById(endSoftGuide.id) <= 0) {
                    DotInst.clientSendDot(COUNTERTYPE.softGuide, "19027");
                    GuideMgr.showSoftGuide(this.handleNode.node, ARROW_DIRECTION.BOTTOM, endSoftGuide.displayText, (node: cc.Node) => {
                        this.softGuideId = endSoftGuide.id;
                        this.handleGuide = node;
                    }, false, 0, false, this.handleHandler);
                } else {
                    let curSoftGuide = JsonMgr.getSoftGuideJsoById(GuideIdType.event, 5);
                    if (curSoftGuide && judgeSoftGuideStart(curSoftGuide)) {
                        DotInst.clientSendDot(COUNTERTYPE.softGuide, "19018");
                        GuideMgr.showSoftGuide(this.handleNode.node, ARROW_DIRECTION.BOTTOM, endSoftGuide.displayText, (node: cc.Node) => {
                            this.softGuideId = endSoftGuide.id;
                            this.handleGuide = node;
                        }, false, 0, false, this.handleHandler);
                    }
                }
            }
        } else {
            if (this.handleGuide != null) {
                this.handleGuide.active = false;
            }
            if (this.oneKeyGuide != null) {
                this.oneKeyGuide.active = true;
            } else {
                let curSoftGuide = JsonMgr.getSoftGuideJsoById(GuideIdType.FunEvent, 4);
                let endSoftGuide = JsonMgr.getSoftGuideJsoById(GuideIdType.FunEvent, 5);
                if (curSoftGuide && DataMgr.getGuideCompleteTimeById(endSoftGuide.id) <= 0) {
                    DotInst.clientSendDot(COUNTERTYPE.softGuide, "19026");
                    GuideMgr.showSoftGuide(this.oneKeyNode, ARROW_DIRECTION.BOTTOM, curSoftGuide.displayText, (node: cc.Node) => {
                        this.oneKeyGuide = node;
                    });
                } else {
                    let curSoftGuide = JsonMgr.getSoftGuideJsoById(GuideIdType.event, 4);
                    if (curSoftGuide && judgeSoftGuideStart(curSoftGuide)) {
                        DotInst.clientSendDot(COUNTERTYPE.softGuide, "19017");
                        GuideMgr.showSoftGuide(this.oneKeyNode, ARROW_DIRECTION.BOTTOM, curSoftGuide.displayText, (node: cc.Node) => {
                            this.oneKeyGuide = node;
                        });
                    }
                }
            }
        }
    }

    onEnable() {
        DataMgr.UiTop = true;
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.gold);
        DataMgr.increaseTopUiNum();
    }

    onDisable() {
        DataMgr.decrTopUiNum();
        DataMgr.UiTop = false;
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -2);
    }


    // update (dt) {}
}
