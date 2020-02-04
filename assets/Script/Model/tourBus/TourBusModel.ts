import {IReception, IUserTourBus, IUserTourBusDetail} from "../../types/Response";
import {DataMgr} from "../DataManager";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {TimeUtil} from "../../Utils/TimeUtil";
import {FunctionName, JsonMgr} from "../../global/manager/JsonManager";

/**
 * @Author whg
 * @Date 2019/8/14
 * @Desc
 */

export class TourBusModel {

    private tourBus:IUserTourBus = null;

    private leftMillis: number = -1;

    private firstTourLeftMillis: number = -1;
    private secondTourLeftMillis: number = -1;

    canRefreshFirst: boolean = false;//是否在第一批游客离开后刷新，避免重复刷新
    canRefreshLast: boolean = false; //是否在最后一批游客离开后刷新，避免重复刷新

    constructor(bus:IUserTourBus){
        this.updateBus(bus);
    }

    refreshTime(decr: number){
        if(!this.tourBus || !JsonMgr.isFunctionOpen(FunctionName.tourbus)){
            return;
        }
        //if(this.leftMillis > 0){
            this.leftMillis -= decr;
            if(this.leftMillis < 0){
                this.leftMillis = -1;
                DataMgr.tourBusData.isTimeOut = true;
                HttpInst.postData(NetConfig.TOUR_GET_BUSES, []);
            }
        //}

        if(this.firstTourLeftMillis > 0){
            this.canRefreshFirst = true;
            this.firstTourLeftMillis -= decr;
            if(this.firstTourLeftMillis < 0){
                //设置为-2是因为面板有刷新需求且仅刷新一次
                this.firstTourLeftMillis = -2;
            }
        }

        if(this.secondTourLeftMillis > 0){
            this.canRefreshLast = true;
            this.secondTourLeftMillis -= decr;
            if(this.secondTourLeftMillis < 0){
                //设置为-2是因为面板有刷新需求且仅刷新一次
                this.secondTourLeftMillis = -2;
            }
        }
    }

    hasLeftTime(){
        return this.leftMillis > 0 || this.firstTourLeftMillis > 0 || this.secondTourLeftMillis > 0;
    }

    getLeftTime(): number{
        return this.leftMillis;
    }
    getFirstLeftTime(){
        return this.firstTourLeftMillis;
    };
    getLastLeftTime(): number{
        return this.secondTourLeftMillis;
    }

    getWaitingBuses(): IUserTourBusDetail[]{
        if(!this.tourBus){
            return [];
        }
        return this.tourBus.buses.filter(this.isWaiting)
    }

    private isWaiting = (busDetail: IUserTourBusDetail) => {
        return busDetail.status == 0;
    };
    private isReception = (busDetail: IUserTourBusDetail) => {
        return busDetail.status == 1;
    };

    updateBus(tourBus: IUserTourBus){
        this.tourBus = tourBus;
        if(!tourBus){
            return;
        }

        let serverTime: number = DataMgr.getServerTime();
        this.leftMillis = tourBus.nextTravelingTime - serverTime;
        if(this.leftMillis <= 0){
            cc.log("nextTravelingTime =", TimeUtil.format(tourBus.nextTravelingTime));
            this.leftMillis = 30000;
        }

        this.updateReceptionTime(serverTime);
    }

    updateReceptionTime(serverTime: number = -1){
        if(serverTime == -1){
            serverTime = DataMgr.getServerTime();
        }
        let receptionArr: IReception[] = this.getReceptionArr();
        if(receptionArr.length >= 2){
            this.firstTourLeftMillis = receptionArr[0].endTime - serverTime;
            this.secondTourLeftMillis = receptionArr[receptionArr.length-1].endTime - serverTime;
        }else if(receptionArr.length == 1){
            this.secondTourLeftMillis = receptionArr[0].endTime - serverTime;
        }
    }

    //当前接待的观光团数目，过滤掉过期的
    getReceptionNum(){
        return this.getReceptionArr().length;
    }

    updateBusDetail(bus: IUserTourBusDetail){
        let index: number = this.getIndexByStation(bus.station);
        this.tourBus.buses[index] = bus;
    }

    private getIndexByStation(station){
        return station % 100 - 1;
    }

    getTourBusNum(): number{
        if(!this.tourBus) return 0;
        return this.tourBus.buses.length;
    }

    getTourNum(): number{
        if(!this.tourBus) return 0;
        let receptionArr: IReception[] = this.getReceptionArr();
        return receptionArr.map((reception: IReception) => reception.travellerNum)
            .reduce((sum: number, num: number) => sum + num, 0);
    }

    getSaleUp(): string{
        let saleUp = this.calcSaleUp(this.getTourNum());
        return saleUp + "%";
    }

    private calcSaleUp(tourNum: number): string{
        return (Math.log10(0.05*tourNum+1)/5.45 * 100).toFixed(1);
    }

    getSaleDown(): string{
        let receptionArr: IReception[] = this.getReceptionArr();
        let tourNum = receptionArr
            .map((reception: IReception) => reception.travellerNum)
            .reduce((sum: number, num: number) => sum + num, 0);
        let saleDown = this.calcSaleUp(tourNum - receptionArr[0].travellerNum);
        return saleDown + "%";
    }

    //目前已经接待的观光团，过滤掉过期的
    getReceptionArr(): IReception[]{
        if(!this.tourBus) return [];
        let serverTime: number = DataMgr.getServerTime();
        return this.tourBus.receptions
            .filter((reception: IReception) => reception.endTime > serverTime);
    }

}
