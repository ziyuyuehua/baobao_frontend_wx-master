import {UIUtil} from "../../../Utils/UIUtil";
import {JsonMgr, StaffConfig} from "../../../global/manager/JsonManager";
import {CompositeDisposable} from "../../../Utils/event-kit";
import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {Chance, StaffRatePanel} from "./StaffRatePanel";
import {ItemState} from "../list/StaffItem";
import {DataMgr} from "../../../Model/DataManager";

const {ccclass, property} = cc._decorator;

@ccclass
export class StaffRateItem extends cc.Component {
    @property(cc.Label)
    private nameLabel: cc.Label = null;
    @property(cc.Label)
    private rateLabel: cc.Label = null;
    private dispose = new CompositeDisposable();

    start() {
        this.doRefreshItem(parseInt(this.node.name));
    }

    onLoad() {
        this.dispose.add(ClientEvents.EVENT_REFRESH_GOODSITEM.on(this.refreshItem));
    }

    private refreshItem = (index: number, item: cc.Node) => {
        if (item.name != this.node.name) {
            return;
        }
        if (index >= StaffRatePanel.rateData.staffRateList.length) {
            return;
        }
        this.doRefreshItem(index);
    };

    doRefreshItem = (index: number) => {
        const staffData = StaffRatePanel.rateData.staffRateList[index];
        const staffConfig: StaffConfig = JsonMgr.getStaff(staffData.id);
        if (!staffConfig) {
            return;
        }
        UIUtil.setLabel(this.nameLabel, staffConfig.name);
        const rate: string = this.showRate(staffData.chance);
        UIUtil.setLabel(this.rateLabel, rate);
    };

    private showRate(rate) {
        return parseFloat(rate).toFixed(2) + "%";
    }

    onDestroy() {
        cc.log("StaffRateItem onDestroy");
        this.dispose.dispose();
    }


}
