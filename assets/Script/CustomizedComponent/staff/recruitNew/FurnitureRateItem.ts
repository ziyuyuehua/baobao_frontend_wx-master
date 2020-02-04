import {UIUtil} from "../../../Utils/UIUtil";
import {JsonMgr, StaffConfig} from "../../../global/manager/JsonManager";
import {CompositeDisposable} from "../../../Utils/event-kit";
import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {StaffRatePanel} from "./StaffRatePanel";

const {ccclass, property} = cc._decorator;

@ccclass
export class FurnitureRateItem extends cc.Component {
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
        if (index >= StaffRatePanel.rateData.furnitureList.length) {
            return;
        }
        this.doRefreshItem(index);
    };

    onLoad() {
        this.dispose.add(ClientEvents.EVENT_REFRESH_GOODSITEM.on(this.refreshItem));
    }

    doRefreshItem = (index: number) => {
        const furnitureData = StaffRatePanel.rateData.furnitureList[index];
        const furnitureConfig: StaffConfig = JsonMgr.getInformationAndItem(furnitureData.id);
        UIUtil.setLabel(this.nameLabel, furnitureConfig.name);
        const rate: string = this.showRate(furnitureData.chance);

        UIUtil.setLabel(this.rateLabel, rate);
    };

    private showRate(rate) {
        return parseFloat(rate).toFixed(2) + "%";
    }

    onDestroy() {
        this.dispose.dispose();
        cc.log("ExchangeStaffItem onDestroy");
    }

}
