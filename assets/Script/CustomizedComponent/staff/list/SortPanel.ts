import {SortType, StaffData, StaffSort} from "../../../Model/StaffData";
import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {UIUtil} from "../../../Utils/UIUtil";
import {COUNTERTYPE, DotInst, DotVo} from "../../common/dotClient";
import {ResManager} from "../../../global/manager/ResManager";
import {DataMgr} from "../../../Model/DataManager";
import {GameComponent} from "../../../core/component/GameComponent";
import {ButtonMgr} from "../../common/ButtonClick";

const {ccclass, property} = cc._decorator;

@ccclass
export class SortPanel extends GameComponent {

    static url = "staff/list/SortPanel";

    @property(cc.Prefab)
    private staffItem: cc.Prefab = null;
    @property(cc.String)
    private target = "";

    @property(cc.Node)
    private sortTypeBtn: cc.Node = null;
    @property([cc.Toggle])
    private staffAttrToggle: Array<cc.Toggle> = [];
    @property([cc.Toggle])
    private staffAdvantageToggle: Array<cc.Toggle> = [];

    @property(cc.Node)
    private cancel: cc.Node = null;

    @property(cc.Node)
    private confirm: cc.Node = null;

    @property(cc.Node)
    private blockPanel: cc.Node = null;

    private staffSort: StaffSort = null;

    getBaseUrl() {
        return SortPanel.url;
    }

    onLoad() {
        ButtonMgr.addClick(this.sortTypeBtn, this.onSortTypeClick);
        this.staffAttrToggle.forEach((toggle: cc.Toggle) => {
            ButtonMgr.addToggle(toggle, this.onStaffAttrSelect);
        });
        this.staffAdvantageToggle.forEach((toggle: cc.Toggle) => {
            ButtonMgr.addToggle(toggle, this.onStaffAdvantageCheck);
        });

        ButtonMgr.addClick(this.blockPanel, this.closeOnly);
        ButtonMgr.addClick(this.cancel, this.closeOnly);
        ButtonMgr.addClick(this.confirm, this.confirmSort);
    }

    start() {
        if (this.node["data"]) {
            cc.log("立即执行------");
            this.confirmSort();
        }
    }

    onEnable() {
        // ClientEvents.EVENT_SHOW_MAIN_UI_TOP_SHADOW.emit(true);
        this.onShowPlay(2, this.node.getChildByName("view"));

        const staffData: StaffData = DataMgr.staffData;
        this.staffSort = new StaffSort(staffData.getStaffSort());

        this.resetSortImage();

        this.staffAttrToggle.forEach((toggle: cc.Toggle, index) => {
            toggle.isChecked = this.staffSort.attr == index;
        });

        this.staffAdvantageToggle.forEach((toggle: cc.Toggle, index) => {
            toggle.isChecked = this.staffSort.advantages.has(index + 1)
        });
    }

    private onStaffAttrSelect = (toggle: cc.Toggle) => {
        let index = this.staffAttrToggle.indexOf(toggle);

        let type = this.staffSort.type == SortType.DESC ? "0" : "1";
        let Dot: DotVo = {
            COUNTER: COUNTERTYPE.STAFF,
            PHYLUM: "6413",
            CLASSFIELD: type,
            FAMILY: index + ""
        };
        DotInst.sendDot(Dot);

        cc.log("onStaffAttrSelect index=" + index);
        this.staffSort.attr = index;
    };

    private onSortTypeClick = () => {
        cc.log("onSortTypeClick");

        let type = this.staffSort.type == SortType.DESC ? "0" : "1";
        DotInst.clientSendDot(COUNTERTYPE.staff, "6012", type);


        this.staffSort.type = (this.staffSort.type == SortType.DESC ? SortType.ASC : SortType.DESC);
        this.resetSortImage();
    };

    private resetSortImage() {
        const sortIcon: string = this.staffSort.type == SortType.DESC ? "sort_desc" : "sort_asc";
        UIUtil.asyncSetImage(this.sortTypeBtn.getComponent(cc.Sprite), ResManager.STAFF_UI + sortIcon);
    }

    private onStaffAdvantageCheck = (toggle: cc.Toggle) => {
        let index = this.staffAdvantageToggle.indexOf(toggle);
        index = index + 1;

        //cc.log("onStaffAdvantageCheck index=" + index + " isChecked=" + toggle.isChecked);
        if (toggle.isChecked) {
            this.staffSort.advantages.add(index);
        } else {
            this.staffSort.advantages.delete(index);
        }
        this.staffSort.needFilter = true;

        let sortAdvArr = this.staffSort.advantages.values();
        let str = sortAdvArr.join(",");

        let Dot: DotVo = {
            COUNTER: COUNTERTYPE.STAFF,
            PHYLUM: "6414",
            CLASSFIELD: str
        };
        DotInst.sendDot(Dot);

        cc.log("staffSort.advantages", sortAdvArr, str);
    };


    // onDestroy() {
    //     ClientEvents.EVENT_SHOW_MAIN_UI_TOP_SHADOW.emit(false);
    // }

    private confirmSort = () => {
        let staffData: StaffData = DataMgr.staffData;
        staffData.setStaffSort(this.staffSort);
        staffData.sort();
        staffData.clearSelectedStaffs(this.staffItem, this.target);
        ClientEvents.STAFF_SORT_CONFIRM.emit();

        this.closeOnly();
    };

}
