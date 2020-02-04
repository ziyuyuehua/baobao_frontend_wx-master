import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {CompositeDisposable} from "../../../Utils/event-kit";
import {Staff} from "../../../Model/StaffData";
import {UIUtil} from "../../../Utils/UIUtil";
import {ItemState} from "../list/StaffItem";
import {GoldMoonShopConfig, StaffConfig, JsonMgr} from "../../../global/manager/JsonManager";
import {ExchangeData, ExchangeStaffData} from "../../../Model/ExchangeData";
import {ResManager, ResMgr} from "../../../global/manager/ResManager";
import {DataMgr} from "../../../Model/DataManager";

const {ccclass, property} = cc._decorator;

@ccclass
export class ExchangeStaffItem extends cc.Component {

    @property(cc.Label)
    numLabel: cc.Label = null;

    @property(cc.Sprite)
    clickBg: cc.Sprite = null;

    @property(cc.Sprite)
    cantSelectBg: cc.Sprite = null;

    @property(cc.Sprite)
    staffIcon: cc.Sprite = null;

    @property(cc.Sprite)
    ItemIcon: cc.Sprite = null;

    @property(cc.Sprite)
    staffIconBg: cc.Sprite = null;

    // @property([cc.Sprite])
    // advantageIcons: Array<cc.Sprite> = [];

    private dispose = new CompositeDisposable();

    private curIndex: number = -1;
    private staffResId: number = -1;

    //因为scrollView复用同一个节点，所以需要单独存储key为索引index，值为ItemState状态对象
    private indexStateMap: Map<number, ItemState> = new Map<number, ItemState>();

    onLoad() {
        this.dispose.add(ClientEvents.EVENT_REFRESH_GOODSITEM.on(this.refreshItem));
        this.dispose.add(ClientEvents.STAFF_EXCHANGE_UNSELECTED.on(this.unSelect));
        this.dispose.add(ClientEvents.RECRUIT_UPDATE_EXCHANGE_STAFF.on(this.onUpdateExchangeStaff));

        this.node.on(cc.Node.EventType.TOUCH_END, this.onSelect);
    }

    start() {
        this.doRefreshItem(parseInt(this.node.name));
        if (this.curIndex == 0) { //初始化时员工列表第1个为选中的
            this.onSelect();
        }
    }

    private refreshItem = (index: number, item: cc.Node) => {
        if (item.name != this.node.name) {
            return;
        }
        this.doRefreshItem(index);
    };

    private doRefreshItem = (index: number) => {
        this.staffIcon.node.active = false;
        this.ItemIcon.node.active = false;
        this.staffIconBg.node.active = false;

        const exchangeData: ExchangeData = DataMgr.exchangeData;
        let shopConfigData: ExchangeStaffData = exchangeData.getExchangeStaffData(index);
        const shopConfig: GoldMoonShopConfig = exchangeData.getShopConfig(shopConfigData.id);
        if (shopConfig.itemType != 2) {
            const staffConfig: StaffConfig = exchangeData.getStaffConfig(shopConfig.itemId);
            if (!staffConfig) {
                return;
            }
            this.staffResId = staffConfig.artResId;
            UIUtil.asyncSetImage(this.staffIconBg, ResManager.STAFF_UI + "b" + staffConfig.star, false);
            UIUtil.asyncSetImage(this.staffIcon, Staff.getStaffAvataUrlByResId(this.staffResId), false);
            this.checkHasStaff();
        } else {
            this.cantSelectBg.node.active = false;
            let itemXml = JsonMgr.getItem(shopConfig.itemId);
            ResMgr.getItemIcon(this.ItemIcon, itemXml.icon, 0.7);
        }

        this.curIndex = index;
        let state: ItemState = this.indexStateMap.get(index);
        if (!state) {
            state = new ItemState();
            this.indexStateMap.set(index, state);
        }
        this.checkShakeByClickBg(state.normalSelected);

        UIUtil.setLabel(this.numLabel, shopConfig.price);
    };

    // private initAdvantageMinIcons(advantages: Array<number>) {
    //     Staff.initAdvantageIcon(advantages, this.advantageIcons, false, false);
    // }

    private checkHasStaff() {
        if (this.hasStaffByResId()) {
            this.cantSelectBg.node.active = true;
        } else {
            this.cantSelectBg.node.active = false;
        }
    }

    private hasStaffByResId() {
        return DataMgr.hasStaffByResId(this.staffResId);
    }

    private onUpdateExchangeStaff = (index: number) => {
        if (this.curIndex == index) {
            this.doRefreshItem(index);
        }
    };

    unSelect = (index: number) => {
        let state: ItemState = this.indexStateMap.get(index);
        if (!state) {
            return;
        }
        state.normalSelected = false;
        if (this.curIndex == index) {
            this.checkShakeByClickBg(false);
        }
    };

    onSelect = () => {
        let exchangeData: ExchangeData = DataMgr.exchangeData;
        let state: ItemState = this.indexStateMap.get(this.curIndex);
        let shopConfigData: ExchangeStaffData = exchangeData.getExchangeStaffData(this.curIndex);
        const shopConfig: GoldMoonShopConfig = exchangeData.getShopConfig(shopConfigData.id);
        let staffIndex = exchangeData.getIndex();
        // cc.log("staffIndex:" + staffIndex);
        // cc.log(" this.curIndex:" + this.curIndex);
        if (staffIndex == this.curIndex) { //避免重复选择同一个staff的操作
            return;
        }
        state.normalSelected = true;
        //this.staffBg.node.color = StaffItem.highlightColor;
        this.checkShakeByClickBg(true);
        if (shopConfig.itemType == 2) {
            ClientEvents.STAFF_EXCHANGE_SELECTED.emit(this.curIndex, false);
        } else {
            ClientEvents.STAFF_EXCHANGE_SELECTED.emit(this.curIndex, this.hasStaffByResId());
        }

    };

    private checkShakeByClickBg(active: boolean) {
        this.clickBg.node.active = active;
        if (this.cantSelectBg.node.active) {
            //如果已经拥有，则不显示选中的背景，否则叠加背景很白很难看
            this.clickBg.node.active = false;
        }
        if (active) {
            // this.node.runAction(cc.repeatForever(cc.sequence(cc.rotateTo(0.5, 3), cc.rotateTo(0.5, -3))));
            this.node.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(0.5, 1.17, 1.17), cc.scaleTo(0.5, 1.12, 1.12))));
        } else {
            this.node.stopAllActions();
        }
    }

    onDestroy() {
        this.dispose.dispose();
        cc.log("ExchangeStaffItem onDestroy");
    }

}
