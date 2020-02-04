import { StaffData, StaffSort } from "../../../Model/StaffData";
import { ClientEvents } from "../../../global/manager/ClientEventCenter";
import { DataMgr } from "../../../Model/DataManager";
import { ButtonMgr } from "../../common/ButtonClick";
import { DotInst, COUNTERTYPE } from "../../common/dotClient";

const { ccclass, property } = cc._decorator;

@ccclass
export class JobFilterPanel extends cc.Component {

    @property(cc.Prefab)
    private staffItem: cc.Prefab = null;
    @property(cc.String)
    private target = "";

    @property([cc.Toggle])
    private staffAdvantageToggle: Array<cc.Toggle> = [];

    private staffSort: StaffSort = null;

    onLoad() {
        this.staffAdvantageToggle.forEach((toggle: cc.Toggle) => {
            ButtonMgr.addToggle(toggle, this.onStaffAdvantageCheck);
        });
    }

    onEnable() {
        const staffData: StaffData = DataMgr.staffData;
        this.staffSort = new StaffSort(staffData.getStaffSort());

        this.staffAdvantageToggle.forEach((toggle: cc.Toggle, index) => {
            toggle.isChecked = this.staffSort.advantages.has(index + 1)
        });
    }

    private onStaffAdvantageCheck = (toggle: cc.Toggle) => {
        let index = this.staffAdvantageToggle.indexOf(toggle);
        index = index + 1;

        //cc.log("JobFilterPanel onStaffAdvantageCheck index=" + index + " isChecked=" + toggle.isChecked);
        //let staffData: StaffData = DataMgr.getStaffData();
        if (toggle.isChecked) {
            DotInst.clientSendDot(COUNTERTYPE.post, "6518", index + "", "1")
            this.staffSort.advantages.add(index);
        } else {
            DotInst.clientSendDot(COUNTERTYPE.post, "6518", index + "", "0")
            this.staffSort.advantages.delete(index);
        }
        this.staffSort.needFilter = true;
        //cc.log("JobFilterPanel staffSort.advantages", this.advantages.values());

        this.confirmSort();
    };

    private confirmSort = () => {
        let staffData: StaffData = DataMgr.staffData;
        staffData.setStaffSort(this.staffSort);

        staffData.sort();
        staffData.clearSelectedStaffs(this.staffItem, this.target);

        ClientEvents.STAFF_SORT_CONFIRM.emit();

        // this.hide();
    };

}
