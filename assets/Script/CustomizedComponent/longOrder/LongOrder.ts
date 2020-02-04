/**
 * @author Lizhen
 * @date 2019/8/7
 * @Description:
 */
import {LongOrderInfoData} from "../../Model/LongOrderInfoData";
import {DataMgr} from "../../Model/DataManager";
import {LongOrderItem} from "./LongOrderItem";
import {UIUtil} from "../../Utils/UIUtil";
import {ILongOrderInfo} from "../../types/Response";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {UIMgr} from "../../global/manager/UIManager";
import {TextTipConst} from "../../global/const/TextTipConst";
import {GameComponent} from "../../core/component/GameComponent";
import {JsonMgr} from "../../global/manager/JsonManager";
import {topUiType} from "../MainUiTopCmpt";
import {COUNTERTYPE, DotInst} from "../common/dotClient";
import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;

@ccclass()
export class LongOrder extends GameComponent {
    static url: string = "Prefab/longOrder/LongOrder";
    @property(cc.Node)
    movieNode: cc.Node = null;

    @property(cc.Node)
    bg: cc.Node = null;

    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;
    @property(cc.Node)
    cailiao: cc.Node = null;
    @property(cc.Node)
    decpNode: cc.Node = null;

    @property(cc.Node)
    otherMsgTips: cc.Node = null;

    private longOrderData: LongOrderInfoData = null;
    private itemArr: cc.Node[] = [];

    getItemArr = () => {
        return this.itemArr;
    };

    private carIndex: number = 0;  //选中的订单车


    load() {
        this.initData();
        this.initView();
        this.initListener();
    }

    onEnable() {
        this.onShowPlay(1, this.movieNode);
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.ordinary);
        DataMgr.setClickTaskJumpMap(0);
    }

    onDisable(): void {
        UIMgr.closeBackMapCenter();
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -1);
        ClientEvents.LONG_ORDER_CAR_GO.emit(DataMgr.longOrderInfoData.goCar);
    }

    initListener() {
        this.addEvent(ClientEvents.EVENT_REFUSE_ORDER_PANEL.on(this.refuseItem));

        this.cailiao.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            DotInst.clientSendDot(COUNTERTYPE.longOrder, "8505", "510005");
            this.showTip(510005);
        });
        this.decpNode.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            DotInst.clientSendDot(COUNTERTYPE.longOrder, "8505", "510006");
            this.showTip(510006);
        });
        this.cailiao.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            this.hideTips();
        });
        this.decpNode.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            this.hideTips();
        });
        this.cailiao.on(cc.Node.EventType.TOUCH_MOVE, (event: cc.Event.EventTouch) => {
            this.hideTips();
        });
        this.decpNode.on(cc.Node.EventType.TOUCH_MOVE, (event: cc.Event.EventTouch) => {
            this.hideTips();
        });
    }

    showTip = (data) => {
        let itemData: IItemModJson = JsonMgr.getItemMod(data);
        this.otherMsgTips.getChildByName("caseName").getComponent(cc.Label).string = itemData.name;
        this.otherMsgTips.getChildByName("description").getComponent(cc.Label).string = itemData.description;
        this.otherMsgTips.active = true;
        if (data == 510005) {
            this.otherMsgTips.setPosition(cc.v2(90, 145));
        } else {
            this.otherMsgTips.setPosition(cc.v2(170, 145));
        }
    }

    hideTips() {
        this.otherMsgTips.active = false;
    }

    initView() {
        this.createItem();
    }

    initData() {
        DataMgr.longOrderInfoData.goCar = 0;
        this.longOrderData = DataMgr.longOrderInfoData;
    }

    createItem() {
        if (this.itemArr.length == this.longOrderData.orderList.length) return;
        let orderData: ILongOrderInfo = this.longOrderData.orderList[this.itemArr.length];
        UIUtil.dynamicLoadPrefab(LongOrderItem.url, (pre: cc.Node) => {
            if (!this.itemArr) return;
            pre.parent = this.bg;
            this.itemArr.push(pre);
            let component: LongOrderItem = pre.getComponent(pre.name);
            component.init(orderData, this.itemArr.length - 1, this.createItem.bind(this));
        });
    }

    refuseItem = (carIndex: number) => {
        this.carIndex = carIndex;
        this.longOrderData = DataMgr.longOrderInfoData;
        let orderData: ILongOrderInfo = this.longOrderData.orderList[this.carIndex];
        let component: LongOrderItem = this.itemArr[this.carIndex].getComponent(this.itemArr[this.carIndex].name);
        component.init(orderData, this.carIndex, this.createItem.bind(this));
    }

    showSmingPanel() {
        UIMgr.showTextTip(TextTipConst.LongOrderDesTip);
    }

    getBaseUrl() {
        return LongOrder.url;
    }

    closeCurView() {
        for (let i = 0; i < this.itemArr.length; i++) {
            this.itemArr[i].destroy();
        }
        DotInst.clientSendDot(COUNTERTYPE.longOrder, "8506")
        UIMgr.closeView(LongOrder.url, true, true);
    }
}
