import {IReceptionHistory, IRespData, IUserTourBus, IUserTourBusDetail} from "../types/Response";
import {TourBusModel} from "./tourBus/TourBusModel";
import {ClientEvents} from "../global/manager/ClientEventCenter";
import {DataMgr} from "./DataManager";
import {UIMgr} from "../global/manager/UIManager";
import {FunctionName, JsonMgr} from "../global/manager/JsonManager";
import {StringUtil} from "../Utils/StringUtil";
import {HttpInst} from "../core/http/HttpClient";
import {NetConfig} from "../global/const/NetConfig";
import {COUNTERTYPE, DotInst} from "../CustomizedComponent/common/dotClient";
import {TextTipConst} from "../global/const/TextTipConst";

/**
 * @Author whg
 * @Date 2019/8/14
 * @Desc
 */

export class TourBusData {

    private selfBusOpen: boolean = false; //自己的巴士功能是否开启
    private busOpen: boolean = false; //巴士功能是否开启，去好友家时变成好友家的

    //分店Id -> 旅游巴士模型
    private tourBusMap: Map<number, TourBusModel> = new Map<number, TourBusModel>();

    private histories: IReceptionHistory[] = [];

    isTimeOut: boolean = false;

    clear() {
        this.tourBusMap.clear();
        this.histories = [];
    }

    fill(bus: IUserTourBus, isFriend: boolean = false) {
        // if(bus.market == 1){ //根据第一个店铺的busOpen状态判断是否开启过
        this.busOpen = bus.busOpen;
        if (!DataMgr.isInFriendHome()) {
            this.selfBusOpen = this.busOpen;
        }
        // }
        if (!this.busOpen) {
            return;
        }

        let model: TourBusModel = this.tourBusMap.get(bus.market);
        if (model) {
            this.handleNewBus(bus, model);

            model.updateBus(bus);
            ClientEvents.TOUR_NEW_BUS.emit(isFriend, this.isTimeOut);
            this.isTimeOut = false;
        } else {
            this.tourBusMap.set(bus.market, new TourBusModel(bus));
        }
    }

    //判断并处理新来的第3辆巴士
    private handleNewBus(bus: IUserTourBus, model: TourBusModel) {
        let oldBuses: IUserTourBusDetail[] = model.getWaitingBuses();
        let newBuses: IUserTourBusDetail[] = bus.buses;
        if (oldBuses.length >= 2 && newBuses.length >= 2
            && this.isNew(oldBuses, newBuses)) {
            ClientEvents.TOUR_REMOVE_OLD_BUS.emit();
        }
    }

    //判断后端给的巴士数组是否有新增加的巴士
    private isNew(oldBuses: IUserTourBusDetail[], newBuses: IUserTourBusDetail[]) {
        for (let i = 0; i < oldBuses.length; i++) {
            let oldBus: IUserTourBusDetail = oldBuses[i];
            for (let j = 0; j < newBuses.length; j++) {
                let newBus: IUserTourBusDetail = newBuses[i];
                if (oldBus.station == newBus.station
                    && oldBus.parkingTime != newBus.parkingTime) {
                    return true;
                }
            }
        }
        return false;
    }

    fillHistories(histories: IReceptionHistory[]) {
        this.histories = histories;
    }

    updateTourBus(busDetail: IUserTourBusDetail) {
        let model: TourBusModel = this.getCurTourBusModel();
        model.updateBusDetail(busDetail);
    }

    refreshTime(decr: number) {
        this.tourBusMap.forEach((model: TourBusModel) => {
            model.refreshTime(decr);
        });
    }

    checkIsOpen() {
        let inFriendHome = DataMgr.isInFriendHome();
        if (!JsonMgr.isFunctionOpen(FunctionName.tourbus, inFriendHome)
            || (inFriendHome && !this.isBusOpen())
            || (inFriendHome && !this.selfBusOpen)) {
            if (!this.selfBusOpen) {
                let openJson: IFunctionOpenJson = JsonMgr.getFunctionOpenByName(FunctionName.tourbus)
                let positionJson: IPositionJson = JsonMgr.getPositionJson(openJson.value);
                UIMgr.showTipText(StringUtil.format(JsonMgr.getTips(TextTipConst.BUS_USER_LV_LIMIT), positionJson.name + positionJson.level + "阶"));
            } else if (inFriendHome) {
                UIMgr.showTipText(TextTipConst.BUS_FRIEND_LV_LIMIT);
            }
            return false;
        }
        return true;
    }

    isBusOpen() {
        return this.busOpen;
    }

    getFirstWaitingBusByMarketId(marketId: number): IUserTourBusDetail {
        let waitingBuses: IUserTourBusDetail[] = this.getWaitingBusesByMarketId(marketId)
            .sort(TourBusData.ascParkingTime);
        return waitingBuses.length > 0 ? waitingBuses[0] : null;
    }

    getFirstWaitingBus(): IUserTourBusDetail {
        return this.getFirstWaitingBusByMarketId(DataMgr.getCurMarketId());
    }

    //按照停留时间升序排序
    static ascParkingTime = (a: IUserTourBusDetail, b: IUserTourBusDetail) => a.parkingTime - b.parkingTime;

    getWaitingBuses(): IUserTourBusDetail[] {
        return this.getWaitingBusesByMarketId(DataMgr.getCurMarketId());
    }

    getWaitingBusesByMarketId(marketId: number): IUserTourBusDetail[] {
        return this.getTourBusModelByMarketId(marketId).getWaitingBuses();
    }

    getTourNum(): number {
        return this.getCurTourBusModel().getTourNum();
    }

    getCurTourBusModel(): TourBusModel {
        return this.getTourBusModelByMarketId(DataMgr.getCurMarketId());
    }

    getTourBusModelByMarketId(marketId: number): TourBusModel {
        let model: TourBusModel = this.tourBusMap.get(marketId);
        if (!model) {
            model = new TourBusModel(null);
            this.tourBusMap.set(marketId, model);
            return model;
        }
        return model;
    }

    getHistories(): IReceptionHistory[] {
        return this.histories;
    }

    receptionFirstWaitingBus(marketId: number, cb: Function = null) {
        let firstWaitingBus: IUserTourBusDetail = this.getFirstWaitingBusByMarketId(marketId);
        if (firstWaitingBus) {
            this.reception(firstWaitingBus, cb);
        }
    }

    reception(waitingBus: IUserTourBusDetail, cb: Function = null) {
        if (!DataMgr.tourBusData.checkIsOpen()) {
            return;
        }

        let station = waitingBus.station;
        let travellerNum = waitingBus.travellerNum;

        let inFriendHome: boolean = DataMgr.isInFriendHome();
        let serviceMethod: [string, string] = inFriendHome ? NetConfig.TOUR_VISITOR_RECEPTION : NetConfig.TOUR_RECEPTION;
        let params: Array<any> = inFriendHome ? [DataMgr.getCurUserId(), station] : [station];

        HttpInst.postData(serviceMethod, params, (response: IRespData) => {
            // cc.log(serviceMethod, response);
            cb && cb();

            if(!response || !response.receptionNum || !response.receptionIgnoreNum) return;
            if (DataMgr.isInFriendHome()) {
                DotInst.clientSendDot(COUNTERTYPE.friend, "10210", (response.receptionNum - response.receptionIgnoreNum).toString());
            }

            let receptionNum = response.receptionNum ? response.receptionNum : travellerNum;
            let receptionIgnoreNum = response.receptionIgnoreNum ? response.receptionIgnoreNum : 0;
            let realReceptionNum = receptionNum - receptionIgnoreNum;
            if (realReceptionNum <= 0) {
                UIMgr.showTipText((inFriendHome ? "自家" : "") + TextTipConst.BUS_RECEPTION_IGNORE);
            } else {
                UIMgr.showTipText(StringUtil.format(JsonMgr.getTips(inFriendHome ? TextTipConst.BUS_HELP_RECEPTION : TextTipConst.BUS_RECEPTION), realReceptionNum));
                ClientEvents.TOUR_ADD_BUS_CUSTOMER.emit(3);
            }
            if (inFriendHome) {
                ClientEvents.HANDLE_FRIENDS_HOME.emit(1);
            }
        });
    }

}
