import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {UIMgr} from "../../../global/manager/UIManager";
import {DataMgr} from "../../../Model/DataManager";
import {Staff, StaffAttr, StaffData} from "../../../Model/StaffData";
import {HashSet} from "../../../Utils/dataStructures/HashSet";
import {CompositeDisposable} from "../../../Utils/event-kit";
import {UIUtil} from "../../../Utils/UIUtil";
import {COUNTERTYPE, DotInst, DotVo} from "../../common/dotClient";
import StaffComDetail from "../../common/StaffComDetail";
import {NumberItem} from "./NumberItem";
import {ARROW_DIRECTION, GuideMgr} from "../../common/SoftGuide";
import {ResManager} from "../../../global/manager/ResManager";
import {ActionMgr} from "../../common/Action";
import {PostsView} from "./PostsView";
import {TextTipConst} from "../../../global/const/TextTipConst";

const {ccclass, property} = cc._decorator;

@ccclass
export class StaffItem extends cc.Component {

    static highlightColor: cc.Color = new cc.Color(219, 234, 157);

    @property(cc.Label)
    starLabel: cc.Label = null;

    @property(cc.Sprite)
    staffBg: cc.Sprite = null;

    @property(cc.Sprite)
    clickBg: cc.Sprite = null;

    @property(cc.Sprite)
    staffIcon: cc.Sprite = null;

    @property(cc.Sprite)
    selectBg: cc.Sprite = null;

    @property(cc.Sprite)
    cantSelectBg: cc.Sprite = null;

    @property(cc.Sprite)
    uniqueBg: cc.Sprite = null;

    @property(cc.Sprite)
    jobBg: cc.Sprite = null;

    @property([cc.Sprite])
    advantageIcons: Array<cc.Sprite> = [];

    @property(cc.Node)
    starList: cc.Node = null;
    @property([cc.Sprite])
    starIcons: Array<cc.Sprite> = [];

    @property(cc.Node)
    attrShow: cc.Node = null;

    @property(cc.Sprite)
    newIcon: cc.Sprite = null;

    @property(cc.Sprite)
    marketIdIcon: cc.Sprite = null;

    @property(cc.Sprite)
    HeadIcon: cc.Sprite = null;

    @property(cc.Node)
    favorStar: cc.Node = null;

    private dispose = new CompositeDisposable();

    private curIndex: number = -1;
    private curStaffId: number = -1;

    indexs: Array<number> = [];

    private isStartTouch: boolean = false;  //是否开始长按
    private touchTime: number = 0;    //长按计时
    private isShowDetail: boolean = false;   //长按时间是否触发

    //因为scrollView复用同一个节点，所以需要单独存储key为索引index，值为ItemState状态对象
    private indexStateMap: Map<number, ItemState> = new Map<number, ItemState>();

    private curPos = null;

    private softGuide: cc.Node = null;

    onLoad() {
        this.dispose.add(ClientEvents.EVENT_REFRESH_GOODSITEM.on(this.refreshItem));
        this.dispose.add(ClientEvents.STAFF_ITEM_NORMAL_UNSELECTED.on(this.unSelect));
        this.dispose.add(ClientEvents.STAFF_JOB_ITEM_SELECT.on(this.checkAndSelect));
        this.dispose.add(ClientEvents.STAFF_UPDATE_STAFF.on(this.onUpdateStaff));
        this.dispose.add(ClientEvents.POSTS_GUIDE_STAFF.on(this.showPostsGuide));
        this.dispose.add(ClientEvents.UPDATE_STAFF_ITEM.on(this.updateFavor));
        this.node.on(cc.Node.EventType.TOUCH_START, this.onStartTime);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onSelect);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onMove);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.cancleTip);
    }

    updateFavor = () => {
        let staffData: StaffData = DataMgr.staffData;
        let staff: Staff = staffData.getSortedStaff(this.curIndex);
        this.favorStar.active = DataMgr.canBreak(staff);
    };

    start() {
        this.doRefreshItem(parseInt(this.node.name));
        const staffData: StaffData = DataMgr.staffData;
        if (!staffData.isDismissState() && this.curIndex == staffData.defaultSelect) { //初始化时员工列表第1个为选中的
            staffData.defaultSelect = 0; //重置为默认选中第1个
            this.onSelect(false);
        }
    }

    onUpdateStaff = (staffIds: HashSet<number>) => {
        if (!staffIds.has(this.curStaffId)) {
            return;
        }
        this.doRefreshItem(this.curIndex);
    };

    addIndexs(index: number) {
        this.indexs.push(index);
    }

    checkAndSelect = (staffId: number) => {
        if (this.curStaffId == staffId) {
            this.onSelect(false);
            ClientEvents.EVENT_SCROLLVIEW_SCROLL_TO_INDEX.emit(this.curIndex);
        } else {
            let staffData: StaffData = DataMgr.staffData;
            let index = staffData.findSortedIndex(staffId);
            if (index < 0) {
                return;
            }
            for (let i = 0; i < this.indexs.length; i++) {
                if (this.indexs[i] == index) {
                    ClientEvents.EVENT_SCROLLVIEW_SCROLL_TO_INDEX.emit(index);
                    setTimeout(() => {
                        this.onSelect(false);
                    }, 500);
                    break;
                }
            }
        }
    };

    unSelect = (index: number) => {
        let state: ItemState = this.indexStateMap.get(index);
        if (!state) {
            return;
        }
        //cc.log("normal state unselect! " + index);
        state.normalSelected = false;
        if (this.curIndex == index) {
            this.checkShakeByClickBg(false);
        }
    };

    onStartTime = (event) => {
        this.curPos = event.currentTarget.position;
        this.isStartTouch = true;
        this.isShowDetail = false;
        this.touchTime = 0;

        //this.onSelect();
    };

    onMove = (event) => {
        let startPos = event.currentTouch._startPoint;
        let endPos = event.currentTouch._point;
        let xCha: number = Math.abs(endPos.x) - Math.abs(startPos.x);
        let yCha: number = Math.abs(endPos.y) - Math.abs(startPos.y);
        if (Math.abs(yCha) > 10 || Math.abs(xCha) > 10) {
            this.isStartTouch = false;
        }
    };

    cancleTime = () => {
        this.isStartTouch = false;
    };

    cancleTip = (event) => {
        if (event.currentTouch) {
            this.isStartTouch = false;
        }
    };

    //isSelf代表是否是用户点击后触发的选中，因为还有可能是岗位的关联staffId触发的
    //默认的点击触发会导致isSelf的值其实是一个TouchEvent
    onSelect = (isSelf: boolean = true) => {
        this.cancleTime();
        if (this.isShowDetail) {
            return;
        }
        let staffData: StaffData = DataMgr.staffData;
        let state: ItemState = this.indexStateMap.get(this.curIndex);
        if (staffData.isDismissState()) {
            let isSelected = !state.selected;
            if (isSelected && staffData.isMaxSelectCount()) {
                return;
            }
            let staff: Staff = staffData.getSortedStaff(this.curIndex);
            if (staff.inWork() || staff.isUnique()) {
                return;
            }
            state.selected = isSelected;
            this.selectBg.node.active = state.selected;

            ClientEvents.STAFF_ITEM_DISMISS_SELECTED.emit(state.selected, this.curIndex);
        }

        //把isDismissState()放到上面判断，因为单选选择if判断出现重复就不往下执行了
        let staffIndex = staffData.getCurStaff();
        this.destroyPostsGuide();
        if (staffIndex == this.curIndex) { //避免重复选择同一个staff的操作
            if (staffData.isJobState() && isSelf) {
                ClientEvents.STAFF_ITEM_JOB_SELECTED.emit(this.curStaffId);
            }
            return;
        } else {
            if (staffData.isJobState() && isSelf) {
                let staff: Staff = staffData.getSortedStaff(this.curIndex);
                if (staff.inWork() && !staff.inDuty()) {
                    UIMgr.showTipText(TextTipConst.JOBWORKTIP);
                    return;
                }
            }
        }

        //cc.log("normal state onselect! " + this.curIndex);
        state.normalSelected = true;
        this.checkShakeByClickBg(true);
        UIUtil.hide(this.newIcon);

        ClientEvents.STAFF_ITEM_NORMAL_SELECTED.emit(this.curIndex, isSelf);
    };

    private destroyPostsGuide() {
        this.softGuide && this.softGuide.destroy();
    }

    private showPostsGuide = (staffIndex: number) => {
        this.destroyPostsGuide();
        if (staffIndex < 0 || this.curIndex != staffIndex) {
            // cc.log(staffIndex, "!=", this.curIndex);
            return;
        }
        GuideMgr.showSoftGuide(this.node, ARROW_DIRECTION.BOTTOM, "就决定\n是ta上岗了", (node: cc.Node) => {
            this.softGuide = node;
        }, true, 0, false, this.onSelect);
    };

    private refreshItem = (index: number, item: cc.Node) => {
        if (item.name != this.node.name) {
            return;
        }
        //cc.log("staffItem refreshItem", item.name, this.node.name);
        this.doRefreshItem(index);
    };

    private doRefreshItem = (index: number) => {
        //cc.log("staffItem doRefreshItem", index, this.node.name);
        let staffData: StaffData = DataMgr.staffData;
        let staff: Staff = staffData.getSortedStaff(index);

        this.HeadIcon.node.active = false;//DataMgr.getOpenStaffView() == 0 && staff.isCanLv();
        if (!staff) {
            cc.log("index=", index, staff);
            return;
        }
        this.curIndex = index;
        if (!UIMgr.getView(PostsView.url)) {
            this.updateFavor();
        }
        this.curStaffId = staff.staffId;
        let state: ItemState = this.indexStateMap.get(index);
        if (!state) {
            state = new ItemState();
            this.indexStateMap.set(index, state);
        }
        this.selectBg.node.active = state.selected;
        this.checkShakeByClickBg(state.normalSelected);
        //UIUtil.setLabel(this.starLabel, this.node.name+"/"+this.curIndex+"/"+this.curStaffId/*+"/"+staff.staffId*/);
        //UIUtil.setLabel(this.starLabel, staff.staffId);
        //UIUtil.show(this.starLabel);

        UIUtil.asyncSetImage(this.staffBg, staff.getStarBorderUrl(), false);
        UIUtil.asyncSetImage(this.staffIcon, staff.getAvatarUrl(), false);

        this.initAdvantageMinIcons(staff);
        this.checkIsUnique(staff);
        this.checkInWork(staff);
        this.checkAttrShow(staffData, staff);
        this.checkIsNew(staff);
    };

    private checkIsNew(staff: Staff) {
        UIUtil.visible(this.newIcon, staff.getIsNew());
        staff.notNew();
    }

    private checkShakeByClickBg(active: boolean) {
        if (active && !DataMgr.staffData.isNormalState()) {
            return;
        }
        this.clickBg.node.active = active;
        if (this.clickBg.node.active) {
            this.node.runAction(ActionMgr.breathe());
        } else {
            this.node.stopAllActions();
        }
    }

    private checkIsUnique(staff: Staff) {
        UIUtil.visible(this.uniqueBg, /*staff.isUnique()*/false);
    }

    private checkInWork(staff: Staff) {
        let staffData = DataMgr.staffData;
        let isJobState = staffData.isJobState();
        UIUtil.hideNode(this.marketIdIcon.node.parent);
        this.checkShowCantSelect(staff);
        let inWork = staff.inWork();
        if (inWork) {
            UIUtil.asyncSetImage(this.jobBg, staff.getJobIconUrl());
            if (DataMgr.hasSubMarket() && isJobState) {
                UIUtil.showNode(this.marketIdIcon.node.parent);
                UIUtil.asyncSetImage(this.marketIdIcon, ResManager.STAFF_UI + "lv" + staff.postsId);
            }
        }
        //cc.log("checkInWork inWork=", inWork, staff.staffId);
        UIUtil.visible(this.jobBg, inWork);
        if (isJobState && inWork) {
            let jobType = Staff.staffAttr2JobType(staffData.getJobAttr());
            UIUtil.visible(this.selectBg, staff.positionId == jobType);
        }
    }

    private checkShowCantSelect(staff: Staff) {
        const staffData: StaffData = DataMgr.staffData;
        if (staffData.isNormalState()) {
            UIUtil.hide(this.cantSelectBg);
        } else if (staffData.isJobState()) {
            let jobType = Staff.staffAttr2JobType(staffData.getJobAttr());
            UIUtil.visible(this.cantSelectBg, staff.inWork() && staff.positionId != jobType);
        } else if (staffData.isDismissState()) {
            UIUtil.visible(this.cantSelectBg, staff.inWork() || staff.isUnique());
            //this.staffBg.setState(cc.Sprite.State.GRAY);
            //this.staffIcon.setState(cc.Sprite.State.GRAY);
        }
    }

    private initAdvantageMinIcons(staff: Staff) {
        Staff.initAdvantageIcon(staff.getAdvantages(), this.advantageIcons, false);
    }

    private checkAttrShow(staffData: StaffData, staff: Staff) {
        let sortAttr: StaffAttr = staffData.getSortAttr();
        if (sortAttr == StaffAttr.star) {
            this.starList.active = true;
            this.attrShow.active = false;
            this.addStarSprite(staff.star);
        } else {
            let isJobState: boolean = staffData.isJobState();
            this.starList.active = false;
            this.attrShow.active = true;

            let attrIcon: cc.Sprite = this.attrShow.getChildByName("attrIcon").getComponent(cc.Sprite);
            let scaleVal: number = sortAttr == StaffAttr.level ? 0.9 : sortAttr == StaffAttr.power ? 0.75 : 0.85;
            attrIcon.node.setScale(scaleVal, scaleVal);
            UIUtil.asyncSetImage(attrIcon, Staff.getAttrIconUrl(sortAttr, isJobState));

            let numberItem: NumberItem = this.attrShow.getChildByName("numberItem").getComponent(NumberItem);
            numberItem.setNum(staff.getAttrValue(sortAttr, isJobState));
        }
    }

    private addStarSprite(star: number) {
        Staff.initStarIcon(star, this.starIcons);
    }

    onDestroy() {
        this.dispose.dispose();
        this.softGuide && this.softGuide.destroy();
        this.node.stopAllActions();
        cc.log("StaffItem onDestroy");
    }

    update(dt) {
        if (this.isStartTouch) {
            this.touchTime++;
            if (this.touchTime >= 20) {
                this.isShowDetail = true;
                this.isStartTouch = false;
                if (DataMgr.staffData.isJobState()) {
                    DotInst.clientSendDot(COUNTERTYPE.post, "6511", this.curStaffId + "");
                }
                DotInst.clientSendDot(COUNTERTYPE.staff, "6009");
                UIMgr.showView(StaffComDetail.url, cc.director.getScene(), null, (node: cc.Node) => {
                    node.getComponent(StaffComDetail).initView(this.curStaffId);
                });
            }
        }
    }

}

export class ItemState {
    selected: boolean = false;
    normalSelected: boolean = false;
}
