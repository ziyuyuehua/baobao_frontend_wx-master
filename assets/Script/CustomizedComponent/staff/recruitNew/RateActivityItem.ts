import {UIUtil} from "../../../Utils/UIUtil";
import {Chance, StaffRatePanel} from "./StaffRatePanel";
import {CompositeDisposable} from "../../../Utils/event-kit";
import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {JsonMgr, StaffConfig} from "../../../global/manager/JsonManager";

const {ccclass, property} = cc._decorator;

@ccclass
export class RateActivityItem extends cc.Component {

    @property(cc.Label)
    nameLabel: cc.Label = null;
    RateActivityItem

    @property(cc.Label)
    rateLabel: cc.Label = null;

    @property(cc.Sprite)
    upImg: cc.Sprite = null;

    private dispose = new CompositeDisposable();
    doRefreshItem = (date: Chance) => {
        if (date) {
            const Config: StaffConfig = JsonMgr.getInformationAndItem(date.id);
            if (!Config) {
                cc.log("index=", date.id, Config);
                return;
            }
            this.upImg.node.active = date.stockUp;
            UIUtil.setLabel(this.nameLabel, Config.name);
            UIUtil.setLabel(this.rateLabel, this.showRate(date.chance));
        }

    };

    private showRate(rate) {
        return parseFloat(rate).toFixed(2) + "%";
    }

    onDestroy() {
        this.dispose.dispose();
        cc.log("ExchangeStaffItem onDestroy");
    }
}
