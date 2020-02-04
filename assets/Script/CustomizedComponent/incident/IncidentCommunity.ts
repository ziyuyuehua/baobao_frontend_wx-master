// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import IncidentSpecilAddItem from "./IncidentSpecilAddItem";
import List from "../../Utils/GridScrollUtil/List";
import { UIUtil } from "../../Utils/UIUtil";
import { GameComponent } from "../../core/component/GameComponent";
import { IncidentModel } from "../../Model/incident/IncidentModel";
import { DataMgr } from "../../Model/DataManager";
import { JsonMgr } from "../../global/manager/JsonManager";
import { IncidentStaffAttrItem1 } from "./IncidentStaffAttrItem1";
import { IncidentStaffItem } from "./IncidentStaffItem";
import {
    StaffItemInfo,
    CalculationSpecialAdd,
    comAddSelectRole,
    autoSelectHandle,
    IncidentAnimationInter
} from "./IncidentHelp";
import { Staff } from "../../Model/StaffData";
import ListItem from "../../Utils/GridScrollUtil/ListItem";
import { AssistanceInfoVO, IAssist } from "../../types/Response";
import { ClientEvents } from "../../global/manager/ClientEventCenter";
import { UIMgr } from "../../global/manager/UIManager";
import { ButtonMgr } from "../common/ButtonClick";
import { TimeUtil } from "../../Utils/TimeUtil";
import { StaffRole } from "../staff/list/StaffRole";
import { Direction, State } from "../map/Role";
import IncidentStaffRole from "./IncidentStaffRole";
import { HttpInst } from "../../core/http/HttpClient";
import { NetConfig } from "../../global/const/NetConfig";
import IncidentHelpView from "./IncidentHelpView";
import { StringUtil } from "../../Utils/StringUtil";
import { TextTipConst } from "../../global/const/TextTipConst";
import CommunityActive from "../communityActivity/CommunityActive";
import IncidentAnimation from "./IncidentAnimation";
import { topUiType } from "../MainUiTopCmpt";
import { DotInst, COUNTERTYPE } from "../common/dotClient";


const { ccclass, property } = cc._decorator;

@ccclass
export default class IncidentCommunity extends GameComponent {
    static url: string = "incident/IncidentCommunity";

    @property([IncidentSpecilAddItem])
    incidentspecials: IncidentSpecilAddItem[] = [];

    @property(cc.Node)
    specialShow: cc.Node = null;

    @property(cc.Node)
    selectNode: cc.Node = null;

    @property(cc.Label)
    communitytitle: cc.Label = null;

    @property(cc.ProgressBar)
    progress: cc.ProgressBar = null;

    @property(cc.Sprite)
    relationShip: cc.Sprite = null;

    @property(cc.Node)
    progressBar: cc.Node = null;

    @property(cc.ProgressBar)
    delayprogress: cc.ProgressBar = null;

    @property(cc.Node)
    delayprogressBar: cc.Node = null;

    @property(List)
    attrsScroll: List = null;

    @property(List)
    scroll: List = null;

    @property(cc.Label)
    progresslbl: cc.Label = null;

    @property(cc.Label)
    communityDes: cc.Label = null;


    @property(cc.Label)
    frequencyAssistance: cc.Label = null;

    @property(cc.Label)
    recoveryTimelbl: cc.Label = null;

    @property(cc.Node)
    quickNode: cc.Node = null;

    @property(cc.Sprite)
    roleIcon: cc.Sprite = null;

    @property(cc.Node)
    specialTips: cc.Node = null;

    @property(List)
    addSpecialScroll: List = null;

    @property(cc.Button)
    handleButton: cc.Button = null;

    @property(cc.Node)
    tipNode: cc.Node = null;

    @property(cc.Layout)
    incidentSpecialsLayout: cc.Layout = null;

    @property(cc.Prefab)
    incidentSpecialsPrefab: cc.Prefab = null;

    @property(cc.Layout)
    private shiLayout: cc.Layout = null;

    @property([cc.Node])
    private bgViewArr: cc.Node[] = [];

    @property([cc.Node])
    private bgViewPosArr: cc.Node[] = [];

    @property(cc.Prefab)
    rolePrefab: cc.Prefab = null;

    @property(cc.Node)
    closeNode: cc.Node = null;

    @property(cc.Node)
    oneKeyNode: cc.Node = null;

    @property(cc.Node)
    tui1: cc.Node = null;

    @property(cc.Node)
    tui2: cc.Node = null;

    @property(cc.Sprite)
    incidnetBg: cc.Sprite = null;

    @property([cc.Animation])
    cristisSpines: cc.Animation[] = [];

    private _model: IncidentModel = null;
    private _helpStaffIds: number[] = [];
    private _staffAttrs: string[] = null;
    private staffItems: StaffItemInfo[] = [];
    private _sortedStaffs: Array<Staff> = null;
    private selectMaps: StaffItemInfo[] = [];
    isAssistanceInfo: boolean = false;
    private _assistInfo: AssistanceInfoVO = null;
    communitytipNodePos: cc.Vec2 = null;
    assistHandleValue: number = 0;
    updaterecoveryTimeTimer: number = 0;
    private selectRoles: StaffRole[] = [null, null, null];
    staffRole: IncidentStaffRole = null;
    private _finish: boolean = false;    //是否完成
    private selectPoints: cc.Vec2[] = [cc.v2(-80, -80), cc.v2(0, -80), cc.v2(80, -80)];

    private _isCanTouch: boolean = true;    //是否点击

    totalAssistan: number = 0;

    onLoad() {
        ButtonMgr.addClick(this.specialShow, this.specialAdditionCallback);
        ButtonMgr.addClick(this.closeNode, this.closeHandler);
        ButtonMgr.addClick(this.handleButton.node, this.handleHandler);
        ButtonMgr.addClick(this.oneKeyNode, this.oneKeyHnadler);
        ButtonMgr.addClick(this.quickNode, this.quickRecoverHandler);
        this.addEvent(ClientEvents.INCIDENT_ASSISTRECOVERYYIME.on(this.quickUpdateAssistance));
        this.addEvent(ClientEvents.INCIDENT_ASSISTRECOVERYYIMEHANDLE.on(this.quickUpdateAssistanceHandle));
        this.addEvent(ClientEvents.STAFF_UPDATE_STAFF.on(() => {
            let conf = this._model.conf;
            this.initCommunityStaffItems(conf.staffLevel, this._staffAttrs);   //员工列表
        }));
        this.addEvent(ClientEvents.INCIDENT_CLEANFATIGUECALLBACK.on(() => {
            let conf = this._model.conf;
            this.initCommunityStaffItems(conf.staffLevel, this._staffAttrs);   //员工列表
        }));
        this.addEvent(ClientEvents.CRISIS_ANI_END_UPDATE.on(this.actionEndHandler))
    }

    closeHandler = () => {
        this.closeView();
        HttpInst.postData(NetConfig.ASSIST_ENTRANCE, [], (response) => {
            DataMgr.fillActivityModel(response);
            UIMgr.showView(CommunityActive.url, null, null, null, true);
        });
    };

    onEnable() {
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.ordinary);
    }

    onDisable() {
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -1);
    }

    //加速
    quickRecoverHandler = () => {
        DotInst.clientSendDot(COUNTERTYPE.communityActive, "3526");
        let obj = {
            helpType: 3,
            incident: this._model,
            assistInfo: this._assistInfo
        };
        UIMgr.showView(IncidentHelpView.url, null, obj);
    };

    //一键
    oneKeyHnadler = () => {
        autoSelectHandle(this.scroll, this.delayprogress, true, this._model, this.clearSelect, this.staffItems, (value: StaffItemInfo) => {
            DotInst.clientSendDot(COUNTERTYPE.communityActive, "3525", value.staff.xmlId + "");
            this.addSelectRole(value)
        }, this.updateSpecialAssistAddtion);
    };

    quickUpdateAssistanceHandle = () => {
        this._assistInfo = DataMgr.activityModel.getAssistInfo();
        this.handleHandler();
    };

    handleHandler = () => {
        if (!this._isCanTouch) {
            return
        }
        this._isCanTouch = false;
        if (this.getSelectCount() == 0) {
            return;
        }

        if (this.selectMaps.length <= 0) {
            UIMgr.showTipText(TextTipConst.INCIDENT_SELECT_TIPS);
            return;
        }

        //危机、事件处理
        let keys: number[] = [];

        for (let i = 0; i < this.selectMaps.length; ++i) {
            keys.push(this.selectMaps[i].staff.staffId);
        }

        let currentAssistan = this._assistInfo.assistanceCount;
        if (currentAssistan <= 0) {
            let obj = {
                helpType: 4,
                incident: this._model,
                assistInfo: this._assistInfo
            };
            this._isCanTouch = true;
            UIMgr.showView(IncidentHelpView.url, null, obj);
            return;
        }

        HttpInst.postData(NetConfig.ASSIST_HANDLE, [this._model.getId(), keys], (res: any) => {
            let result = <IAssist>res.assistance;
            {

                if (res.state) {
                    UIMgr.showTipText(TextTipConst.INCIDENT_COMPLETE);
                    this.closeView();
                    return;
                }

                DataMgr.activityModel.setIncident(result.incident);
                DataMgr.activityModel.setAssistInfo(result.info);
                DataMgr.activityModel.setMembers(result.members);
                // let handleValue = result.incident.process - this._model.getCurProgress();
                this.assistHandleValue = result.incident.process - this._model.getCurProgress();
                let model = DataMgr.incidentData.updateIncident(result.incident);


                this._assistInfo = result.info;

                this.refreshAssistModel(model);
                this.playResultAnim(false);
            }

        });
    };

    playResultAnim(finish: boolean) {
        this._finish = finish;
        let sendData: IncidentAnimationInter = {
            _model: this._model,
            staffIds: this.selectMaps,
            _finish: finish
        };
        UIMgr.showView(IncidentAnimation.url, null, sendData);
    }

    actionEndHandler = () => {
        this._isCanTouch = true;
        for (let i = 0; i < this.selectRoles.length; ++i) {
            if (this.selectRoles[i] != null) {
                this.selectRoles[i].setState(State.IDLE);
            }
        }
        this.updateSpecialAssistAddtion();

        if (this.assistHandleValue > 0) {

            let keys: string = "";

            for (let i = 0; i < this.selectMaps.length; ++i) {
                if (i == this.selectMaps.length - 1) {
                    keys += this.selectMaps[i].staff.staffId
                } else {
                    keys += this.selectMaps[i].staff.staffId + ","
                }
            }
            DotInst.clientSendDot(COUNTERTYPE.communityActive, "3524", this.assistHandleValue + "", keys);
            UIMgr.showTipText(StringUtil.format(JsonMgr.getTips(TextTipConst.ASSIST_SOLVE_TXT), this.assistHandleValue));
            this.assistHandleValue = 0;
        }
        UIMgr.showCommTipText();
    };

    refreshAssistModel(model: IncidentModel) {
        this._model = model;

        //this.community.progress.progress = this._model.getCurrentProcessPercent();
        //this.community.delayprogress.progress = this.community.progress.progress;

        this.progresslbl.string = this._model.getCurrentValueAndProgressPercentStr();
        this.updateAssistanceCount();
        // this.clearSelectCommond();

    }

    quickUpdateAssistance = () => {

        this._assistInfo = DataMgr.activityModel.getAssistInfo();

        this.updateAssistanceCount();
    };

    getBaseUrl() {
        return IncidentCommunity.url;
    }

    start() {
        UIUtil.AdaptationView(this.shiLayout, this.bgViewArr, this.bgViewPosArr);

        this._model = new IncidentModel();
        this._model.init(DataMgr.activityModel.getIncident());
        this._assistInfo = DataMgr.activityModel.getAssistInfo();


        this.communitytipNodePos = this.tipNode.position;
        this.assistHandleValue = 0;


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

        this.specialTips.active = false;    //附加属性


        let conf = this._model.conf;
        this.totalAssistan = JsonMgr.getConstVal("assistanceNum");
        this.initCommunityAttrs(conf.staffLevel, this._staffAttrs);
        this.initCommunityStaffItems(conf.staffLevel, this._staffAttrs);
        this.updateSpecialAssistAddtion();
        this.delayprogress.progress = this.progress.progress;
        this.delayprogressBar.active = true;
        this.isAssistanceInfo = false;
        let assistanceJson: IAssistanceJson = JsonMgr.getAssistanceJsonbyId(this._model.getShowId());
        if (assistanceJson != null) {
            this.communityDes.string = assistanceJson.title;
            //危机描述
            UIUtil.loadUrlImg(assistanceJson.url, this.roleIcon);
            UIUtil.loadUrlImg(assistanceJson.solveBg, this.incidnetBg);
        }

        this.updateAssistanceCount();
        this.handleButton.interactable = false;
    }

    //特殊加成
    specialAdditionCallback = () => {
        if (!this.specialTips.active) {
            this.specialTips.active = true;
            this.addSpecialScroll.numItems = this._model.getSpecialAdd().length;
            this.addSpecialScroll.scrollTo(0);
        } else {
            this.specialTips.active = false;
        }
    };

    //特殊加成
    updateSpecialAssistAddtion = () => {
        this.setSpecialState(this._model.conf.getSpecialAdd.length > 0);
        let attrisval = CalculationSpecialAdd(this._model, this.incidentSpecialsLayout, this.incidentSpecialsPrefab, this._staffAttrs, this.selectMaps);

        this.assistHandleValue = attrisval;
        // let values = this.selectMaps;

        this.progress.progress = this._model.getAdditionProgressPercent(attrisval);
        // if (this.delayprogress.progress == this.progress.progress) {
        this.delayprogressBar.active = this.delayprogress.progress == this.progress.progress;
        // } else {
        //     this.delayprogressBar.active = false;
        // }
        //this.community.delayprogressBar.active = false;
        this.progresslbl.string = this._model.getAssistProgressPercentStr(attrisval);
    }

    //特殊加成显示状态
    setSpecialState = (state) => {
        this.tui1.active = state;
        this.tui2.active = state;
        this.specialShow.active = state;
    }

    //要求
    initCommunityAttrs(needLevel: number, attrs: string[]) {
        this.attrsScroll.numItems = attrs.length + (needLevel ? 1 : 0);
        this.attrsScroll.scrollTo(0);
    }

    //要求设置
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

    //员工列表
    initCommunityStaffItems(needLevel: number, attrs: string[]) {
        //todo 排序列表
        this.staffItems.splice(0, this.staffItems.length);
        this._sortedStaffs = DataMgr.staffData.getSortedByStaffAttr(needLevel, attrs, [], false, true, this._model);

        for (let i = 0; i < this._sortedStaffs.length; ++i) {
            let info: StaffItemInfo = null;

            info = new StaffItemInfo();
            this.staffItems.push(info);

            info.staff = this._sortedStaffs[i];
            info.isSelect = false;
            info.notype = IncidentStaffItem.getNotType(info.staff, this._model, this.getIncidentHelps(), this._staffAttrs);
        }

        this.scroll.numItems = this._sortedStaffs.length;
        this.scroll.scrollTo(0);
    }

    //列表设置
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

    updateAssistanceCount() {
        if(!this._assistInfo) return;
        let currentAssistan = this._assistInfo.assistanceCount;
        let totalAssistan = JsonMgr.getConstVal("assistanceNum");
        this.frequencyAssistance.string = "可协助次数" + currentAssistan + "/" + totalAssistan;


        if (currentAssistan >= totalAssistan) {
            this.quickNode.active = false;
            this.recoveryTimelbl.node.active = false;

            // let pos = new cc.Vec2(this.communitytipNodePos.x, this.communitytipNodePos.y);
            // pos.x += this.node.width * 0.35;
            // this.tipNode.position = pos;
        } else {
            this.quickNode.active = true;
            this.recoveryTimelbl.node.active = true;
            this.updaterecoveryTimeTimer = 0;

            this.updateAssistanceRecovtime();
            // this.tipNode.position = this.communitytipNodePos;


        }

    }

    getIncidentHelps() {
        return this._helpStaffIds;
    }


    //提示
    updateAssistanceRecovtime() {
        if (this._assistInfo.recoveryTime <= 0) {
            return;
        }
        let lastTimeStr = TimeUtil.getTimeHouseStr(this._assistInfo.recoveryTime);

        this.recoveryTimelbl.string = "(" + lastTimeStr + "后回复一次)";
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

        this.updateSpecialAssistAddtion();
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

    };

    deleteAllSelect() {
        for (let i = 0; i < this.selectRoles.length; i++) {
            if (this.selectRoles[i] != null) {
                this.selectRoles[i].node.destroy();
                this.selectRoles[i] = null;
            }
        }
    }

    //=======================列表设置的一些方法 end

    //增加
    addSelectRole = (staffItemInfo: StaffItemInfo) => {
        let staff = staffItemInfo.staff;
        DotInst.clientSendDot(COUNTERTYPE.communityActive, "3522", staff.xmlId + "");
        for (let i = 0; i < this.selectRoles.length; ++i) {
            if (this.selectRoles[i] != null && this.selectRoles[i].getStaff().staffId == staff.staffId) {
                return;
            }
        }
        let pos = this.getEmptyIndex();
        let role = comAddSelectRole(staffItemInfo, this._model, this.selectRoles, this.selectMaps, this.rolePrefab, this.selectNode, () => {
            this.updateRoolePos();
            this.updateHandleButton();
        });
        let count = this.getSelectCount();

        for (let i = 0; i < this.selectRoles.length; ++i) {
            if (this.selectRoles[i] != null) {
                this.cristisSpines[i].node.position = new cc.Vec2(this.selectRoles[i].node.position.x, this.cristisSpines[i].node.position.y);
            }
            this.addRoleEffect(staff, pos, count);
        }
    };

    //找空模型Index
    getEmptyIndex(): number {
        for (let index = 0; index < this.selectRoles.length; ++index) {
            if (this.selectRoles[index] == null) {
                return index;
            }
        }
        return -1;
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
            roletemp.updateUpState(staff);
        }, 0.2);
    }


    //更新角色位置
    updateRoolePos() {
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

    updateHandleButton() {
        this.handleButton.interactable = this.getSelectCount() > 0;
    }

    //删除
    deleteSelectRole = (staffInfo: StaffItemInfo) => {
        let staff = staffInfo.staff;
        DotInst.clientSendDot(COUNTERTYPE.communityActive, "3523", staff.xmlId + "");
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
    };

    update(dt) {
        if (this._model == null) return;

        let currentAssistan = this._assistInfo.assistanceCount;

        if (currentAssistan >= this.totalAssistan) {
            return;
        }


        this.updaterecoveryTimeTimer += dt;
        if (this.updaterecoveryTimeTimer >= 1 && this._assistInfo.recoveryTime > 0) {
            this.updaterecoveryTimeTimer = 0;
            this._assistInfo.recoveryTime -= 1000;
            this.updateAssistanceRecovtime();

            this.isAssistanceInfo = false;
        }


        if (this._assistInfo.recoveryTime <= 0 && !this.isAssistanceInfo) {
            this.isAssistanceInfo = true;


            HttpInst.postData(NetConfig.ASSIST_ASSISTANCEINFO, [], (res: any) => {
                let result = <AssistanceInfoVO>res;
                DataMgr.activityModel.setAssistInfo(result);
                this.isAssistanceInfo = false;

                this.updateAssistanceCount();
            });

        }
    }

}
