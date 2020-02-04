/**
 * @author Lizhen
 * @date 2019/8/7
 * @Description: 长途订单信息
 */
import {ILongOrder, ILongOrderBox, ILongOrderInfo, ILongOrderReward} from "../types/Response";
import {HttpInst} from "../core/http/HttpClient";
import {NetConfig} from "../global/const/NetConfig";
import {DataMgr} from "./DataManager";
import {OrderType} from "../CustomizedComponent/longOrder/LongOrderItem";

export class LongOrderInfoData {
    private _orderList: ILongOrderInfo[];
    private _goCar:number = 0;//每次进入长途订单界面刷新 最多为3

    init(data: ILongOrder) {
        this._orderList = data.orderList;
    }

    get orderList(): ILongOrderInfo[] {
        return this._orderList;
    }


    get goCar(): number {
        return this._goCar;
    }

    set goCar(value: number) {
        this._goCar = value;
    }
}