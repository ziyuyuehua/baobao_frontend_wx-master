import {UIUtil} from "../../../Utils/UIUtil";
import {Base, JsonMgr, StaffConfig} from "../../../global/manager/JsonManager";
import {CompositeDisposable} from "../../../Utils/event-kit";
import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {Chance, StaffRatePanel} from "./StaffRatePanel";
import {DataMgr} from "../../../Model/DataManager";

const {ccclass, property} = cc._decorator;

@ccclass
export class GoldStaffRateItem extends cc.Component {
    @property(cc.Label)
    private nameLabel: cc.Label = null;
    @property(cc.Label)
    private rateLabel: cc.Label = null;

    private dispose = new CompositeDisposable();


    start() {
        this.doRefreshItem(parseInt(this.node.name));
    }

    private refreshItem = (index: number, item: cc.Node) => {
        if (item.name != this.node.name) {
            return;
        }
        if (index >= StaffRatePanel.staffLength.length) {
            return;
        }
        this.doRefreshItem(index);
    };

    onLoad() {
        this.dispose.add(ClientEvents.EVENT_REFRESH_GOODSITEM.on(this.refreshItem));
    }

    doRefreshItem = (index: number) => {
        let starRate = DataMgr.getStarRate();
        let starLength = DataMgr.getStarLength();
        let staffChance: Base = StaffRatePanel.staffLength[index];
        const staffConfig: StaffConfig = JsonMgr.getStaff(staffChance.propId);
        if (!staffConfig) {
            return;
        }
        let staffItemRate = 0;
        switch (staffConfig.star) {
            case 6:
                staffItemRate = starRate.uniqueStarStaffAllRate / starLength.uniqueStarStaff;
                break;
        }
        UIUtil.setLabel(this.nameLabel, staffConfig.name);
        UIUtil.setLabel(this.rateLabel, this.showRate(staffItemRate));
    };

    private showRate(rate) {
        return parseFloat(rate).toFixed(2) + "%";
    }

    onDestroy() {
        cc.log("GoldStaffRateItem onDestroy");
        this.dispose.dispose();
    }

}
