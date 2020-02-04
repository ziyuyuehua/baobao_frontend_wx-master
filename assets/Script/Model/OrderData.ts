import {IFreeOrderList, IOrderInfo} from "../types/Response";
import {FunctionName, JsonMgr} from "../global/manager/JsonManager";
import {CommonUtil, Reward} from "../Utils/CommonUtil";
import {DataMgr} from "./DataManager";
import {HttpInst} from "../core/http/HttpClient";
import {NetConfig} from "../global/const/NetConfig";
import {ClientEvents} from "../global/manager/ClientEventCenter";

export default class orderData {
    private orderList: IFreeOrderList = null;
    private isClick: boolean = false;

    setOrderList(data) {
        this.orderList = data;
    }

    getOrderList() {
        return this.orderList;
    }

    setOrderClick(isClick: boolean) {
        this.isClick = isClick;
    }

    checkOrderClick() {
        return this.isClick;
    }

    isCanCompleted() {
        let isOpen: boolean = JsonMgr.isFunctionOpen(FunctionName.order);
        if (!isOpen) return false;
        let isCan: boolean = false;
        if (this.orderList.orders.length > 0) {
            let temp: INewOrderJson = JsonMgr.getNewOrder(this.orderList.orders[0]);
            let cost: Reward[] = CommonUtil.toRewards(temp.cost);
            let conVal = JsonMgr.getConstVal("oderCostUpNumPercent");
            let addCost: Reward[] = CommonUtil.toRewards(conVal);
            let needNum: number = 0;
            if (this.orderList.completeNumber > addCost[0].xmlId) {
                needNum = Math.floor(cost[0].number * (1 + addCost[0].number / 100));
            } else {
                needNum = cost[0].number;
            }
            let gold: number = DataMgr.userData.gold;
            isCan = gold >= needNum;
        } else {
            isCan = false;
        }
        ClientEvents.REFRESH_ORDER_BUBBLE.emit(isCan);
    }
}