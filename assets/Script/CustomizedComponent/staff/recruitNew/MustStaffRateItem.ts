import {UIUtil} from "../../../Utils/UIUtil";
import {Base, JsonMgr, StaffConfig} from "../../../global/manager/JsonManager";
import {CompositeDisposable} from "../../../Utils/event-kit";
import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {DataMgr} from "../../../Model/DataManager";

const {ccclass, property} = cc._decorator;

@ccclass
export class MustStaffRateItem extends cc.Component {
    @property(cc.Label)
    private nameLabel: cc.Label = null;
    @property(cc.Label)
    private rateLabel: cc.Label = null;

    private dispose = new CompositeDisposable();
    private staffDatalist: Base[] = [];

    start() {
        this.doRefreshItem(parseInt(this.node.name));
    }

    onLoad() {
        this.staffDatalist = DataMgr.getStaffMustBaseData();
        this.dispose.add(ClientEvents.EVENT_REFRESH_GOODSITEM.on(this.refreshItem));
    }

    private refreshItem = (index: number, item: cc.Node) => {
        if (!item.name || item.name != this.node.name || index >= this.staffDatalist.length) {
            return;
        }
        this.doRefreshItem(index);
    };

    doRefreshItem = (index: number) => {
        const staffData = this.staffDatalist[index];
        if (staffData.propId) {
            const staffConfig: StaffConfig = JsonMgr.getInformationAndItem(staffData.propId);
            UIUtil.setLabel(this.nameLabel, staffConfig.name);
            let staffRate = 1 * staffData.weight / this.staffDatalist.length * 100;
            const rate: string = this.showRate(staffRate);
            UIUtil.setLabel(this.rateLabel, rate);
        }
    };

    private showRate(rate) {
        return parseFloat(rate).toFixed(2) + "%";
    }

    onDestroy() {
        cc.log("MustStaffRateItem onDestroy");
        this.dispose.dispose();
    }

}
