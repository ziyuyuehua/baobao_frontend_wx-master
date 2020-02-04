import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {ExchangeData, ShowType} from "../../../Model/ExchangeData";
import {NetConfig} from "../../../global/const/NetConfig";
import {HttpInst} from "../../../core/http/HttpClient";
import {DiamondPanel} from "./DiamondPanel";
import {UIUtil} from "../../../Utils/UIUtil";
import {Type} from "../../common/CommonBtn";
import CommoTips from "../../common/CommonTips";
import {COUNTERTYPE, DotInst, DotVo} from "../../common/dotClient";
import {DataMgr} from "../../../Model/DataManager";
import {UIMgr} from "../../../global/manager/UIManager";
import {ItemIdConst} from "../../../global/const/ItemIdConst";
import {IRespData} from "../../../types/Response";
import {RecruitResult} from "../../../Model/RecruitData";
import {GameComponent} from "../../../core/component/GameComponent";
import {topUiType} from "../../MainUiTopCmpt";

const {ccclass, property} = cc._decorator;

@ccclass
export class ExchangePanel extends GameComponent {

    @property(cc.Prefab)
    private exchangeStaffItem: cc.Prefab = null;
    @property(cc.String)
    private target = "";

    @property(cc.Button)
    private backBtn: cc.Button = null;

    @property(cc.Button)
    exchangeBtn: cc.Button = null;

    @property(cc.Prefab)
    tip: cc.Prefab = null;

    static url: string = "staff/recruit/exchangePanel";

    getBaseUrl() {
        return ExchangePanel.url;
    }

    private itemNum: number = 0;

    onLoad() {
        this.addEvent(ClientEvents.STAFF_EXCHANGE_SELECTED.on(this.onExchangeStaffSelected));
        this.backBtn.node.on("click", this.onBackBtnClick);
        this.exchangeBtn.node.on("click", this.onExchangeBtnClick);
    }


    start() {

    }

    onExchangeStaffSelected = (index: number, hasStaff: boolean) => {
        let exchangeData: ExchangeData = DataMgr.exchangeData;
        this.lastIndexUnSelect(exchangeData, index);
        this.exchangeBtn.interactable = true;
        if (hasStaff || this.notEnoughItem(index)) {
            this.exchangeBtn.interactable = false;
        }
    };

    private lastIndexUnSelect(exchangeData: ExchangeData, curIndex: number) {
        const index = exchangeData.getIndex();
        if (index >= 0) { //如果存在上一个选中的，则发出通知事件令上一个变成未选中状态
            ClientEvents.STAFF_EXCHANGE_UNSELECTED.emit(index);
        }
        exchangeData.setIndex(curIndex);
    }

    onEnable() {
        DataMgr.initExchangeData();
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.goldMoonShop);
        this.onShowPlay(2, this.node.getChildByName("view"));
        this.refresh();
    }

    private onExchangeBtnClick = () => {
        if (!this.exchangeBtn.interactable) {
            return;
        }
        const exchangeData: ExchangeData = DataMgr.exchangeData;
        const staffShopId: number = exchangeData.getStaffShopId();
        DotInst.clientSendDot(COUNTERTYPE.recruit, "8006", staffShopId + "")
        // cc.log("ExchangeBtn click", staffShopId);
        HttpInst.postData(
            NetConfig.exchangeUseGoldMoon,
            [staffShopId],
            (response: IRespData) => {
                if (response.recruit) {
                    let recruitResult = new RecruitResult(response.recruit);
                    if (recruitResult.isStaff()) {
                        DataMgr.staffData.update(recruitResult.staff);
                        DataMgr.initExchangeData();
                    }
                    this.refresh();
                    UIMgr.showView(DiamondPanel.url, null, null, (node: cc.Node) => {
                        node.getComponent(DiamondPanel).showRecruitResultList([recruitResult], ShowType.ExchangeStaff);
                    });
                }
            });
    };

    refresh() {
        this.resetSelectIndex();
        this.refreshItemList();
    }

    private resetSelectIndex() {
        DataMgr.exchangeData.resetIndex();
    }

    private getExchangeDataSize() {
        return DataMgr.exchangeData.getConfigSize();
    }

    private getCurStaffPrice() {
        return DataMgr.exchangeData.getCurStaffPrice();
    }

    private refreshItemList() {
        ClientEvents.EVENT_REFRESH_FINALLY_SCROLLVIEW.emit(this.exchangeStaffItem, this.getExchangeDataSize(), this.target);
    }

    onDisable(): void {
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.ordinary);
    }

    private notEnoughItem(index) {
        this.itemNum = DataMgr.getItemNum(100401);
        cc.log("StaffPrice:" + DataMgr.exchangeData.getExchangeStaffData(index).price);
        return this.itemNum < DataMgr.exchangeData.getExchangeStaffData(index).price;
    }

    private onBackBtnClick = () => {
        UIMgr.closeView(ExchangePanel.url);
    };


}
