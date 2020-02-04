import {GameComponent} from "../../../core/component/GameComponent";
import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {DataMgr} from "../../../Model/DataManager";
import {StaffAdvantage, StaffData} from "../../../Model/StaffData";
import {CommonUtil} from "../../../Utils/CommonUtil";
import {ButtonMgr} from "../../common/ButtonClick";
import {COUNTERTYPE, DotInst, DotVo} from "../../common/dotClient";
import {JobFilterPanel} from "./JobFilterPanel";
import {UIUtil} from "../../../Utils/UIUtil";
import {ARROW_DIRECTION, GuideMgr} from "../../common/SoftGuide";
import {topUiType} from "../../MainUiTopCmpt";

const {ccclass, property} = cc._decorator;

@ccclass
export class PostsView extends GameComponent {

    @property(cc.Prefab)
    private staffItem: cc.Prefab = null;
    @property(cc.String)
    private target = "";

    @property(cc.Node)
    private jobFilterBtn: cc.Node = null;
    @property(cc.Node)
    private backBtn: cc.Node = null;
    @property(cc.Node)
    private onekeyJobBtn: cc.Node = null;

    @property(JobFilterPanel)
    private jobFilterPanel: JobFilterPanel = null;
    @property(cc.Node)
    private jobFilterPanelMask: cc.Node = null;

    @property(cc.Layout)
    private shiLayout: cc.Layout = null;

    @property([cc.Node])
    private bgViewArr: cc.Node[] = [];

    @property([cc.Node])
    private bgViewPosArr: cc.Node[] = [];

    private softGuide: cc.Node = null;

    static url: string = "staff/list/PostsView";

    getBaseUrl() {
        return PostsView.url;
    }

    onLoad() {
        this.addEvent(ClientEvents.STAFF_ITEM_NORMAL_SELECTED.on(this.onStaffNormalSelected));
        this.addEvent(ClientEvents.STAFF_JOB_ITEM_SELECT.on(this.unSelectLastStaff));

        this.addEvent(ClientEvents.POSTS_GUIDE_STAFF.on(this.destroyPostsGuide));
        this.addEvent(ClientEvents.POSTS_GUIDE_BACK.on(this.showBackGuide));

        ButtonMgr.addClick(this.jobFilterBtn, this.showJobFilterPanel);
        ButtonMgr.addClick(this.jobFilterPanelMask, this.hideJobFilterPanel);

        ButtonMgr.addClick(this.backBtn, () => {
            DotInst.clientSendDot(COUNTERTYPE.post, "6513");
            this.closeView();
        });
        ButtonMgr.addClick(this.onekeyJobBtn, this.oneKeyJobClick);
    }

    start() {
        UIUtil.AdaptationView(this.shiLayout, this.bgViewArr, this.bgViewPosArr);
    }

    private showBackGuide = () => {
        this.destroyPostsGuide();
        GuideMgr.showSoftGuide(this.backBtn, ARROW_DIRECTION.BOTTOM, "回到\n店铺吧", (node: cc.Node) => {
            // node.x = node.x + 100;
            this.softGuide = node;
        }, true, 0, false, () => {
            this.closeView && this.closeView();
        });
    };

    private destroyPostsGuide = () => {
        this.softGuide && this.softGuide.destroy();
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
        cc.log("staffData:{}", staffData);
        this.lastStaffIndexUnSelect(staffData, index);
    };

    private showJobFilterPanel = () => {
        DotInst.clientSendDot(COUNTERTYPE.post, "6516");
        UIUtil.show(this.jobFilterPanel);
        UIUtil.showNode(this.jobFilterPanelMask);
    };

    private hideJobFilterPanel = () => {
        UIUtil.hide(this.jobFilterPanel);
        UIUtil.hideNode(this.jobFilterPanelMask);
    };

    private oneKeyJobClick = () => {
        let Dot: DotVo = {
            COUNTER: COUNTERTYPE.POST,
            PHYLUM: "6510",
        };
        DotInst.sendDot(Dot);

        // this.jobFilterPanel.show();
        // this.jobFilterPanel.onClickAll();

        let staffAdvArr = CommonUtil.getRange(StaffAdvantage.poster, StaffAdvantage.cd);
        // let str = staffAdvArr.join(",");

        ClientEvents.STAFF_JOB_WORK_ONE_KEY.emit(true, staffAdvArr);
    };

    onEnable() {
        this.onShowPlay(1, this.node.getChildByName("view"));
        DataMgr.staffData.jobState();
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.earningsChange);
        //cc.log("PostsView onEnable");
    }

    onDisable() {
        const staffData: StaffData = DataMgr.staffData;
        staffData.resetCurStaff();
        staffData.normalState();

        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -1);
        //cc.log("StaffList onDisable");
    }

    unload() {
        this.destroyPostsGuide();
    }

}
