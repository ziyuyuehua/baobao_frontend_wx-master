import {GameComponent} from "../../../core/component/GameComponent";
import {JumpConst} from "../../../global/const/JumpConst";
import {TextTipConst} from "../../../global/const/TextTipConst";
import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {UIMgr} from "../../../global/manager/UIManager";
import {DataMgr} from "../../../Model/DataManager";
import {SortType, Staff, StaffAttr, StaffData, StaffSort} from "../../../Model/StaffData";
import {UIUtil} from "../../../Utils/UIUtil";
import {ButtonMgr} from "../../common/ButtonClick";
import {COUNTERTYPE, DotInst} from "../../common/dotClient";
import StaffListArrow from "../StaffListArrow";
import {DismissPanel} from "./DismissPanel";
import {ExpandPanel} from "./ExpandPanel";
import {SortPanel} from "./SortPanel";
import {StaffDetail} from "./StaffDetail";
import {TrainPanel} from "./TrainPanel";
import {JsonMgr} from "../../../global/manager/JsonManager";
import CommonInsufficient, {InsufficientType} from "../../common/CommonInsufficient";
import {ArrowTextConst} from "../../../global/const/ArrowTextConst";
import BindingGuide from "../../common/BindingGuide";
import {topUiType} from "../../MainUiTopCmpt";

const {ccclass, property} = cc._decorator;

@ccclass
export class StaffList extends GameComponent {

    @property(cc.Prefab)
    staffItem: cc.Prefab = null;
    @property(cc.String)
    private target = "";

    @property(cc.Node)
    backBtn: cc.Node = null;
    @property(cc.Button)
    dismissBtn: cc.Button = null;
    @property(cc.Button)
    confirmDismissBtn: cc.Button = null;

    @property(cc.Label)
    numLabel: cc.Label = null;

    @property(cc.Node)
    selectNode: cc.Node = null;

    @property(StaffDetail)
    staffDetail: StaffDetail = null;

    @property(cc.Node)
    sortBtn: cc.Node = null;

    @property(cc.Node)
    expandBtn: cc.Node = null;

    @property(cc.Node)
    private listBlockPanel: cc.Node = null;

    @property(cc.Node)
    private levelBtn: cc.Node = null;

    @property(cc.Node)
    private dismissBg: cc.Node = null;

    @property(cc.Button)
    private textTipBtn: cc.Button = null;

    @property(cc.Node)
    private levelUpLead: cc.Node = null;

    @property(cc.Sprite)
    private trainLead: cc.Sprite = null;

    @property(cc.Node)
    private wantGift: cc.Node = null;

    @property(cc.Node)
    private BackLead: cc.Node = null;

    @property(cc.Layout)
    private shiLayout: cc.Layout = null;

    @property([cc.Node])
    private bgViewArr: cc.Node[] = [];

    @property([cc.Node])
    private bgViewPosArr: cc.Node[] = [];

    static url: string = "staff/list/staffList";
    wantPosX: number = null;
    wantPosY: number = null;

    getBaseUrl() {
        return StaffList.url;
    }

    onLoad() {
        this.addEvent(ClientEvents.STAFF_ITEM_DISMISS_SELECTED.on(this.onStaffSelected));
        this.addEvent(ClientEvents.STAFF_ITEM_NORMAL_SELECTED.on(this.onStaffNormalSelected));
        this.addEvent(ClientEvents.STAFF_SORT_AGAIN.on(this.doSort));
        this.addEvent(ClientEvents.STAFF_SORT_CONFIRM.on(this.updateStaffCapacity));
        this.addEvent(ClientEvents.STAFF_DISMISS_CONFIRM.on(this.onConfirmDismiss));
        this.addEvent(ClientEvents.STAFF_JOB_ITEM_SELECT.on(this.unSelectLastStaff));
        this.addEvent(ClientEvents.STAFF_UPDATE_CAPACITY.on(this.updateStaffCapacity));

        ButtonMgr.addClick(this.sortBtn, this.openSortPanel);
        ButtonMgr.addClick(this.expandBtn, this.openExpandPanel);
        ButtonMgr.addClick(this.backBtn, this.onBackBtnClick);
        ButtonMgr.addClick(this.dismissBtn.node, this.changeDismissState);
        ButtonMgr.addClick(this.confirmDismissBtn.node, this.openDismissPanel);
        ButtonMgr.addClick(this.textTipBtn.node, this.tipHandler);
        ButtonMgr.addClick(this.BackLead, this.onBackBtnClick);
        ButtonMgr.addClick(this.levelUpLead, () => {
            ClientEvents.OPEN_STAFF_LEVEL.emit();
        });
        ButtonMgr.addClick(this.wantGift, () => {
            ClientEvents.OPEN_FAVOR_DETAIL.emit();
        });
        this.dispose.add(ClientEvents.CLEAN_SOFT_LEAD.on(this.hideLevelUpSoftLead));
        this.dispose.add(ClientEvents.UPDATE_POP.on(this.wantGiftState));
        this.dispose.add(ClientEvents.SHOW_BACK_SOFT.on(() => {
            if (DataMgr.getUserLv() < Number(JsonMgr.getConstVal("goHomeGuideArrow"))) {
                this.BackLead.active = true;
                this.BackLead.getComponent(BindingGuide).loadLabText(ArrowTextConst.BACK_TO_SHOP);
            }
        }));
        this.showSoftLead();
        this.wantGiftState();
        this.wantPosX = this.wantGift.x;
        this.wantPosY = this.wantGift.y;
    }

    start() {
        UIUtil.hide(this.confirmDismissBtn);
        UIUtil.AdaptationView(this.shiLayout, this.bgViewArr, this.bgViewPosArr);
    }

    hideLevelUpSoftLead = () => {
        this.levelUpLead.active = false;
        this.BackLead.active = false;
    };

    wantGiftState = () => {
        let staffIndex = DataMgr.staffData.getCurStaff();
        let staff = DataMgr.staffData.getSortedStaff(Math.max(staffIndex, 0));
        this.wantGift.active = DataMgr.canBreak(staff);
        let action = cc.repeatForever(cc.sequence(cc.moveTo(0.5, this.wantGift.x, 40),
            cc.moveTo(0.5, this.wantGift.x, 50)));
        if (this.wantGift.active) {
            this.wantGift.stopAllActions();
            this.wantGift.runAction(action);
        } else {
            this.wantGift.stopAllActions();
        }
    };


    //软引导
    showSoftLead = () => {
        let staffIndex = DataMgr.staffData.getCurStaff();
        let staff = DataMgr.staffData.getSortedStaff(Math.max(staffIndex, 0));
        //升级引导
        if (staff && DataMgr.getUserLv() < Number(JsonMgr.getConstVal("guideArrow"))) {
            //未引导过且能升级
            this.levelUpLead.active = this.hasItemLevelUpStaff(staff);
            this.levelUpLead.getComponent(BindingGuide).loadLabText(ArrowTextConst.STAFF_UPGRADE);
            if (this.levelUpLead.active) {
                this.BackLead.active = false;
            }
        } else {
            this.levelUpLead.active = false;
        }
        // /**
        //  训练引导
        //  **/
        // if (DataMgr.getGuideCompleteTimeById(ArrowType.StaffTraining) <= 0) {
        //     if (this.curStaffData.level > Number(JsonMgr.getConstVal("trainOpenLv")) && StarNum > 3) {
        //         this.trainLead.node.active = true;
        //         let moveSpr = this.trainLead.node.getComponent(cc.Sprite);
        //         if (this.trainLead.node.active) {
        //             let active1 = cc.repeatForever(cc.sequence(cc.moveTo(0.5, moveSpr.node.x, -40),
        //                 cc.moveTo(0.5, moveSpr.node.x, -60)));
        //             moveSpr.node.stopAllActions();
        //             moveSpr.node.runAction(active1);
        //         } else {
        //             moveSpr.node.stopAllActions();
        //         }
        //     } else {
        //         this.trainLead.node.active = false;
        //     }
        // }
    };

    doSort = () => {
        this.openSort();
    };


    hasItemLevelUpStaff(staff: Staff): boolean {
        if (staff.isMaxLevel()) {
            return false;
        }
        let nextLevelNeedExp: number = JsonMgr.getStaffLevelConfig(staff.level).exp;
        let needExp: number = nextLevelNeedExp - staff.exp;
        return DataMgr.warehouseData.getAllCanAddExp() > needExp;
    }

    updateOpenView(openType: number, openLv: number) {
        switch (openType) {
            case JumpConst.STAFFBIDVIEW:
                UIMgr.closeView(TrainPanel.url);
                this.openDismissView();
                break;

            case JumpConst.STAFFLEVELVIEW:
                this.openMinLvUpView();
                this.node.getComponent(StaffListArrow).loadStaffListArrow();
                break;

            case JumpConst.STAFFLEVELVIEWNEAR:
                this.openNearLvView(openLv);
                this.node.getComponent(StaffListArrow).loadStaffListArrow();
                break;
        }
    }

    setTipButtonStatus(status) {
        this.textTipBtn.node.active = status;
    }

    openDismissView() {
        this.sortByDefault();
        setTimeout(() => {
            this.changeDismissState();
        }, 100);
    }

    openMinLvUpView() {
        this.sortByDefault();
        DataMgr.staffData.defaultSelect = DataMgr.staffData.getMinLvStaffID();
    }

    openNearLvView(Lv: number) {
        this.sortByDefault();
        DataMgr.staffData.defaultSelect = DataMgr.staffData.getNearLvStaffNindx(Lv);
    }

    private onStaffSelected = (selected: boolean, index: number) => {
        let staffData: StaffData = DataMgr.staffData;
        staffData.onSelectStaff(selected, index);
        let size = staffData.selectStaffsSize();

        this.selectNode.getChildByName("selectNum").getComponent(cc.Label).string = size + StaffData.SEPARATOR + StaffData.getMaxFireNum();

        if (staffData.isDismissState()) {
            this.confirmDismissBtn.interactable = size > 0;
        }

    };

    private unSelectLastStaff = (staffId: number) => {
        if (staffId > 0) {
            return;
        }
        let staffData: StaffData = DataMgr.staffData;
        this.lastStaffIndexUnSelect(staffData, -1);
    };

    private lastStaffIndexUnSelect(staffData: StaffData, curIndex: number) {
        let staffIndex = staffData.getCurStaff();
        if (staffIndex >= 0) { //如果存在上一个选中的，则发出通知事件令上一个变成未选中状态
            ClientEvents.STAFF_ITEM_NORMAL_UNSELECTED.emit(staffIndex);
        }
        staffData.setCurStaff(curIndex);
    }

    private onStaffNormalSelected = (index: number) => {
        let staffData: StaffData = DataMgr.staffData;
        this.lastStaffIndexUnSelect(staffData, index);
        if (staffData.isNormalState()) {
            this.staffDetail.show();
        }
        //DONE staffDetail、foodPanel和levelPanel改成监听选中员工事件来解耦合了
        this.showSoftLead();
        this.wantGiftState();
    };

    private onConfirmDismiss = () => {
        this.sort();
        this.onBackBtnClick();
    };

    private sortByDefault() {
        const staffData: StaffData = DataMgr.staffData;
        if (staffData.isNormalState()) {
            const staffSort: StaffSort = new StaffSort(staffData.getStaffSort());
            staffSort.attr = StaffAttr.level;
            staffSort.type = SortType.DESC;
            if (staffData.isFilter()) {
                staffSort.advantages.clear(); //重置一下筛选全部员工
                staffSort.needFilter = true;
            }
            staffData.setStaffSort(staffSort);

            this.sort(staffData);
        }
    }

    private sort(staffDataRef?: StaffData) {
        let staffData: StaffData = staffDataRef ? staffDataRef : DataMgr.staffData;
        staffData.sort();

        let staffSize: number = staffData.getSortedSize();
        this.updateStaffCapacity();
        if (staffSize <= 0) {
            this.staffDetail.hide();
        } else if (staffSize > 0) {
            this.clearSelectedStaffs(staffData);
        }
    }

    private openSort() {
        UIMgr.showView(SortPanel.url, this.node, true);
    };

    private openSortPanel = () => {
        DotInst.clientSendDot(COUNTERTYPE.staff, "6008");
        UIMgr.showView(SortPanel.url, this.node);

    };

    private updateStaffCapacity = () => {
        let staffData: StaffData = DataMgr.staffData;
        let staffSize: number = staffData.getSortedSize();
        UIUtil.setLabel(this.numLabel, staffSize + StaffData.SEPARATOR + staffData.getCapacity());
    };

    private onBackBtnClick = () => {
        // cc.dynamicAtlasManager.showDebug(true);
        DotInst.clientSendDot(COUNTERTYPE.staff, "6010");


        let staffData: StaffData = DataMgr.staffData;
        if (staffData.isNormalState()) {
            this.closeView();
        } else {
            staffData.normalState();
            UIUtil.visible(this.dismissBtn, DataMgr.canDismissStaff());
            this.dismissBtn.interactable = true;
            UIUtil.hide(this.confirmDismissBtn);

            //从解雇状态返回，需要清除掉之前选中解雇的员工状态
            this.clearSelectedStaffs(staffData);

            this.selectNode.active = false;

            this.changeDismissModel(false);
            if (UIMgr.lastOpenUrl != "") {
                UIMgr.showView(UIMgr.lastOpenUrl);
                UIMgr.lastOpenUrl = "";
            }
        }
    };

    private clearSelectedStaffs(staffData: StaffData) {
        staffData.clearSelectedStaffs(this.staffItem, this.target);
    }

    private changeDismissState = () => {
        if (!this.dismissBtn.interactable) {
            return;
        }

        DotInst.clientSendDot(COUNTERTYPE.staff, "6004");
        const staffData: StaffData = DataMgr.staffData;
        staffData.dismissState();
        this.lastStaffIndexUnSelect(staffData, -1);

        //进入解雇状态，需要清除掉之前的员工状态
        this.clearSelectedStaffs(staffData);

        this.dismissBtn.interactable = false;
        UIUtil.show(this.confirmDismissBtn);
        this.confirmDismissBtn.interactable = false;

        this.selectNode.active = true;

        this.changeDismissModel(true);
    };

    private changeDismissModel(isDismiss: boolean) {
        // ClientEvents.EVENT_SHOW_MAIN_UI_TOP_SHADOW.emit(true);
        this.listBlockPanel.active = isDismiss;
        this.dismissBg.active = isDismiss;
        if (isDismiss) {
            this.backBtn.x = -200;
            this.backBtn.width = 220;
        } else {
            this.backBtn.x = -0;
            this.backBtn.width = 400;
        }
    }

    private openDismissPanel = () => {
        const staffData: StaffData = DataMgr.staffData;
        if (staffData.isDismissState()) {
            if (staffData.selectStaffsSize() > 0) {
                UIMgr.showView(DismissPanel.url);
            }
        }
    };

    private openExpandPanel = () => {
        DotInst.clientSendDot(COUNTERTYPE.staff, "6015");
        if (DataMgr.getDiamond() < 100) {
            UIMgr.showView(CommonInsufficient.url, null, InsufficientType.Diamond);
        } else {
            UIMgr.showView(ExpandPanel.url);
        }
    };

    onEnable() {
        this.onShowPlay(1, this.node.getChildByName("view"));
        UIUtil.visible(this.dismissBtn, DataMgr.canDismissStaff());
        this.fillStaffSortData();
        //cc.log("StaffList onEnable");
        DataMgr.UiTop = true;
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.ordinary);
        DataMgr.increaseTopUiNum();
    }

    private fillStaffSortData() {
        //DataMgr.getStaffData().normalState();
        const staffData: StaffData = DataMgr.staffData;
        const staffSize: number = staffData.getSortedSize();
        UIUtil.setLabel(this.numLabel, staffSize + StaffData.SEPARATOR + staffData.getCapacity());
        this.sortByDefault();
    }

    onDisable() {
        const staffData: StaffData = DataMgr.staffData;
        staffData.resetCurStaff();
        staffData.normalState();
        DataMgr.UiTop = false;
        DataMgr.decrTopUiNum();
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -1);
        //cc.log("StaffList onDisable");
    }

    private tipHandler = () => {
        DotInst.clientSendDot(COUNTERTYPE.staff, "6014");
        UIMgr.showTextTip(DataMgr.staffData.isNormalState() ? TextTipConst.StaffTip : TextTipConst.PostTip)

    }
}
