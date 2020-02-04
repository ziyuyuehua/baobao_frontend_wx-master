import {UIUtil} from "../../../Utils/UIUtil";
import {Base, JsonMgr} from "../../../global/manager/JsonManager";
import {CompositeDisposable} from "../../../Utils/event-kit";
import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {DataMgr} from "../../../Model/DataManager";

const {ccclass, property} = cc._decorator;

@ccclass
export class MustFurnitureRateItem extends cc.Component {
    @property(cc.Label)
    private nameLabel: cc.Label = null;
    @property(cc.Label)
    private rateLabel: cc.Label = null;

    private furnitureDatalist: Base[] = [];
    private dispose = new CompositeDisposable();


    start() {
        this.doRefreshItem(parseInt(this.node.name));
    }

    private refreshItem = (index: number, item: cc.Node) => {
        if (!item.name || item.name != this.node.name || index > this.furnitureDatalist.length) {
            return;
        }
        this.doRefreshItem(index);
    };

    onLoad() {
        this.furnitureDatalist = DataMgr.getFurnitureMustBaseData();
        this.dispose.add(ClientEvents.EVENT_REFRESH_GOODSITEM.on(this.refreshItem));
    }

    doRefreshItem = (index: number) => {
        const furnitureData = this.furnitureDatalist[index];
        if (furnitureData.propId) {
            const furnitureConfig: IDecoShopJson = JsonMgr.getInformationAndItem(furnitureData.propId);
            UIUtil.setLabel(this.nameLabel, furnitureConfig.name);
            let staffRate = 1 * furnitureData.weight / this.furnitureDatalist.length * 100;
            const rate: string = this.showRate(staffRate);
            UIUtil.setLabel(this.rateLabel, rate);
        }
    };

    private showRate(rate) {
        return parseFloat(rate).toFixed(2) + "%";
    }

    onDestroy() {
        this.dispose.dispose();
        cc.log("MustFurnitureRateItem onDestroy");
    }

}
