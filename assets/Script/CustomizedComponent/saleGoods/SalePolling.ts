import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {TimeUtil} from "../../Utils/TimeUtil";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {DataMgr} from "../../Model/DataManager";
import {JsonMgr} from "../../global/manager/JsonManager";
import {IRespData} from "../../types/Response";
import {CacheMap} from "../MapShow/CacheMapDataManager";

export default class AllPolling {

    inter: number = 0;

    initInterval = () => {
        this.stopInterva();
        let interval = parseInt(JsonMgr.getConstVal("interval"));
        // interval = 5;
        this.inter = setInterval(this.saleGoods, TimeUtil.secondMillisecond(interval));
    };

    stopInterva = () => {
        clearInterval(this.inter);
    };

    saleGoods = () => {
        if(!DataMgr.hasUser()) return;
        // cc.log("polling running...");
        HttpInst.postData(NetConfig.POLLING, [], (response: IRespData) => {
            if (response.redDots) {
                DataMgr.setRedData(response.redDots);
                ClientEvents.UPDATE_MAINUI_RED.emit(response.redDots);
            }
            if (response.replenishPoll) {
                ClientEvents.EVENT_UPDATE_MAIN_NUM.emit(response.replenishPoll);
            }
            if (response.shelves) {
                CacheMap.checkHasSaleGoods();
            }
            if (response.SellGoodsGoal) {
                ClientEvents.UPDATE_BANNER_PLAY.emit();
            }
            if (response.orderManager) {
                DataMgr.orderData.setOrderList(response.orderManager);
                // if (response.orderManager.orders.length === 0 && response.orderManager.refreshTime > 0) {
                //     ClientEvents.UPDATE_ORDER_STATUS.emit();
                // }
                if (response.orderManager.new) {
                    ClientEvents.REFRESH_NEWDAY_ORDER.emit();
                }
            }
            DataMgr.incidentData.clearExpire();
        });
    }
}

export interface SaleGoodsData {
    goodsId: number;
    sumSaleDiamond: number;
    sumSaleGold: number;
    sumSaleNum: number;
}






