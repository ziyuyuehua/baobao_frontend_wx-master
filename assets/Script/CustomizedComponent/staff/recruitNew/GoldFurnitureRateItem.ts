import {UIUtil} from "../../../Utils/UIUtil";
import {Base, JsonMgr, StaffConfig} from "../../../global/manager/JsonManager";
import {CompositeDisposable} from "../../../Utils/event-kit";
import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {Chance, StaffRatePanel} from "./StaffRatePanel";
import {DataMgr} from "../../../Model/DataManager";

const {ccclass, property} = cc._decorator;

@ccclass
export class GoldFurnitureRateItem extends cc.Component {
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
        // cc.log("index:" + index);
        this.doRefreshItem(index);
    };

    onLoad() {
        this.dispose.add(ClientEvents.EVENT_REFRESH_GOODSITEM.on(this.refreshItem));
    }

    doRefreshItem = (index: number) => {
        let starRate = DataMgr.getStarRate();
        let starLength = DataMgr.getStarLength();
        let staffChance: Base = StaffRatePanel.FurnitureLength[index];
        const furnitureConfig: IDecoShopJson = JsonMgr.getDecoShopJson(staffChance.propId);
        // cc.log("id:" + staffChance.propId);
        let furnitureItemRate = 0;
        switch (furnitureConfig.color) {
            case 3:
                furnitureItemRate = starRate.threeStarFurnitureAllRate / starLength.threeStarFurniture;
                break;
            case 4:
                furnitureItemRate = starRate.fourStarFurnitureAllRate / starLength.fourStarFurniture;
                break;
            case 5:
                furnitureItemRate = starRate.fiveStarFurnitureAllRate / starLength.fiveStarFurniture;
                break;
            case 6:
                furnitureItemRate = starRate.uniqueStarFurnitureAllRate / starLength.uniqueStarFurniture;
                break;
        }
        UIUtil.setLabel(this.nameLabel, furnitureConfig.name);
        UIUtil.setLabel(this.rateLabel, this.showRate(furnitureItemRate));
    };

    private showRate(rate) {
        return parseFloat(rate).toFixed(2) + "%";
    }

    onDestroy() {
        cc.log("GoldFurnitureRateItem onDestroy");
        this.dispose.dispose();
    }
}
