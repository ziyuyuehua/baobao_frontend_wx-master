import {ButtonMgr} from "../common/ButtonClick";
import {DataMgr} from "../../Model/DataManager";
import {TimeUtil} from "../../Utils/TimeUtil";
import {TourBusModel} from "../../Model/tourBus/TourBusModel";
import {UIUtil} from "../../Utils/UIUtil";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {GameComponent} from "../../core/component/GameComponent";
import {UIMgr} from "../../global/manager/UIManager";
import {TourBusTipsView} from "./TourBusTipsView";
import {TourBusItem} from "./TourBusItem";
import {IReceptionHistory, IRespData} from "../../types/Response";
import List from "../../Utils/GridScrollUtil/List";
import {NetConfig} from "../../global/const/NetConfig";
import {HttpInst} from "../../core/http/HttpClient";
import {TextTipConst} from "../../global/const/TextTipConst";
import {topUiType} from "../MainUiTopCmpt";
import {JsonMgr} from "../../global/manager/JsonManager";

const {ccclass, property} = cc._decorator;

@ccclass
export class TourBusView extends GameComponent {

    @property(cc.Node)
    private block: cc.Node = null;
    @property(cc.Button)
    private closeBtn: cc.Button = null;
    @property(cc.Button)
    private openBtn: cc.Button = null;

    @property(cc.Label)
    private nextTimeLab: cc.Label = null;

    @property(cc.Label)
    private tourNumLab: cc.Label = null;
    @property(cc.Label)
    private saleUpLab: cc.Label = null;

    @property(cc.Label)
    private lastTimeLab: cc.Label = null;
    @property(cc.Label)
    private firstTimeLab: cc.Label = null;
    @property(cc.Label)
    private saleDownLab: cc.Label = null;

    @property(cc.Node)
    private notTourNode: cc.Node = null;
    @property(cc.Node)
    private hasTourNode: cc.Node = null;

    @property(cc.Button)
    private tourNumBtn: cc.Button = null;
    @property(cc.Button)
    private saleUpBtn: cc.Button = null;
    @property(cc.Node)
    private saleUpTips: cc.Node = null;

    @property(cc.Node)
    private saleUpTipsMask: cc.Node = null;

    @property(cc.Button)
    private tipsViewBtn: cc.Button = null;
    @property(cc.Button)
    private tipsViewBtn2: cc.Button = null;

    @property(cc.Label)
    private noHelpLab: cc.Label = null;
    @property(List)
    private helpList: List = null;

    @property(cc.Node)
    private descNode: cc.Node = null;
    @property(cc.Label)
    private notOpenLab: cc.Label = null;

    @property(cc.Node)
    private friendHelpNode: cc.Node = null;
    @property(cc.Sprite)
    private notOpenImg: cc.Sprite = null;

    private interval = null;

    static url: string = "tourBus/TourBusView";

    //动态加载预设的路径
    getBaseUrl(): string {
        return TourBusView.url;
    }

    onLoad() {
        this.addEvent(ClientEvents.TOUR_NEW_BUS.on(this.refreshView));

        ButtonMgr.addClick(this.block, this.closeOnly);
        ButtonMgr.addClick(this.closeBtn.node, this.closeOnly);
        ButtonMgr.addClick(this.openBtn.node, this.openFunction);

        ButtonMgr.addClick(this.saleUpBtn.node, this.showSaleUp);
        ButtonMgr.addClick(this.saleUpTipsMask, this.hideSaleUp);

        ButtonMgr.addClick(this.tourNumBtn.node, this.showTipsView);
        ButtonMgr.addClick(this.tipsViewBtn.node, this.showTipsView);
        ButtonMgr.addClick(this.tipsViewBtn2.node, this.showTipsView);
    }

    private openFunction = () => {
        DataMgr.tourBusData.isTimeOut = true;
        HttpInst.postData(NetConfig.TOUR_OPEN_FUNCTION, [true],
            (response: IRespData) => {
                this.closeOnly();
                setTimeout(() => {
                    ClientEvents.TOUR_OPEN_BUS.emit();
                }, 800);
            });
    };

    onEnable() {
        this.onShowPlay(1, this.node.getChildByName("view"));
        this.refreshView();
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.earningsChange);
    }

    onDisable() {
        this.checkClearInterval();
        UIMgr.closeBackMapCenter();
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -1);
    }

    private showSaleUp = () => {
        UIUtil.showNode(this.saleUpTips);
        UIUtil.showNode(this.saleUpTipsMask);
    };

    private hideSaleUp = () => {
        UIUtil.hideNode(this.saleUpTips);
        UIUtil.hideNode(this.saleUpTipsMask);
    };

    private showTipsView = () => {
        // UIMgr.showView(TourBusTipsView.url, null, this);
        UIMgr.showTextTip(TextTipConst.BusTip)
    };

    private refreshView = () => {
        let isOpenBus = DataMgr.tourBusData.isBusOpen();
        UIUtil.visible(this.closeBtn, isOpenBus);
        UIUtil.visible(this.openBtn, !isOpenBus);
        UIUtil.visibleNode(this.descNode, isOpenBus);
        UIUtil.visible(this.notOpenLab, !isOpenBus);
        UIUtil.visibleNode(this.friendHelpNode, isOpenBus);
        UIUtil.visible(this.notOpenImg, !isOpenBus);
        if (isOpenBus) {
            const model: TourBusModel = this.getCurTourBusModel();
            this.refreshLabel(model);
            this.addInterval(model);
            this.refreshHelpList();
        }
    };

    refreshLabel(model: TourBusModel = null) {
        if (!model) {
            model = this.getCurTourBusModel();
        }
        let receptionNum = model.getReceptionNum();
        let hasReception = receptionNum > 0;
        if (hasReception) {
            UIUtil.setLabel(this.tourNumLab, model.getTourNum() + "人");
            UIUtil.setLabel(this.saleUpLab, model.getSaleUp());

            UIUtil.setLabel(this.lastTimeLab, TimeUtil.getLeftTimeStr(model.getLastLeftTime()));

            let moreReception: boolean = receptionNum > 1;
            if (moreReception) {
                UIUtil.setLabel(this.firstTimeLab, TimeUtil.getLeftTimeStr(model.getFirstLeftTime()));
                UIUtil.setLabel(this.saleDownLab, model.getSaleDown());
            }
            UIUtil.visibleNode(this.firstTimeLab.node.parent, moreReception);
        }

        UIUtil.visibleNode(this.hasTourNode, hasReception);
        UIUtil.visibleNode(this.notTourNode, !hasReception);
    }

    private addInterval(model: TourBusModel) {
        this.refreshLeftTime(model);
        if (model.hasLeftTime()) {
            this.checkClearInterval();
            this.interval = setInterval(this.refreshLeftTime, 500);
        }
    }

    private refreshLeftTime = (busModel: TourBusModel = null) => {
        let model = busModel ? busModel : this.getCurTourBusModel();
        let leftTime = model.getLeftTime();
        if (leftTime > 0) {
            UIUtil.setLabel(this.nextTimeLab, TimeUtil.getLeftTimeStr(leftTime));
        } else {
            // 不放在这里是因为不打开面板，后台也需要刷新出一辆新巴士，所以放在TourBusModel里面
            // HttpInst.postData(NetConfig.TOUR_GET_BUSES, [], this.refreshView);
        }

        let lastLeftTime = model.getLastLeftTime();
        if (lastLeftTime > 0) {
            UIUtil.setLabel(this.lastTimeLab, TimeUtil.getLeftTimeStr(lastLeftTime));
        } else if (lastLeftTime != -1 && model.canRefreshLast) {
            model.updateReceptionTime();
            model.canRefreshLast = false;

            this.hideSaleUp();
            this.refreshLabel(this.getCurTourBusModel());
        }

        let firstLeftTime = model.getFirstLeftTime();
        if (firstLeftTime > 0) {
            UIUtil.setLabel(this.firstTimeLab, TimeUtil.getLeftTimeStr(firstLeftTime));
        } else if (firstLeftTime != -1 && model.canRefreshFirst) {
            model.updateReceptionTime();
            model.canRefreshFirst = false;

            this.refreshLabel(this.getCurTourBusModel());
        }
    };

    private getCurTourBusModel(): TourBusModel {
        return DataMgr.tourBusData.getCurTourBusModel();
    }

    private checkClearInterval() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    private refreshHelpList() {
        let histories: IReceptionHistory[] = DataMgr.tourBusData.getHistories();
        let helpHistoryNum = histories.length;
        let hasHelpHistory = helpHistoryNum > 0;
        if (hasHelpHistory) {
            this.helpList.numItems = histories.length;
        }
        UIUtil.visible(this.helpList, hasHelpHistory);
        UIUtil.visible(this.noHelpLab, !hasHelpHistory);
    }

    //绑定到List滑动列表的刷新方法
    private onListRender(item: cc.Node, idx: number) {
        let histories: IReceptionHistory[] = DataMgr.tourBusData.getHistories();
        if (histories.length <= 0) {
            return;
        }

        let tourBusItem: TourBusItem = item.getComponent(TourBusItem);
        tourBusItem.initItem(histories[idx]);
    }

}
