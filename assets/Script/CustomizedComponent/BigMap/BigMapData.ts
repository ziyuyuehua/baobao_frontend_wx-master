import {IIncident} from "../../types/Response";
import {DataMgr} from "../../Model/DataManager";

/**
*@Athuor ljx
*@Date 16:04
*/

export default class BigMapData {
    private marketDataArr: IBigMapData[];
    private static _instance: BigMapData = null;
    private isAllMissionComplete: boolean = true;

    private cacheIncident: Map<number, IIncident> = new Map<number, IIncident>();

    static instance() {
        if(BigMapData._instance == null) {
            BigMapData._instance = new BigMapData();
        }
        return BigMapData._instance;
    }

    initMarketData(response: IBigMapData[]) {
        this.marketDataArr = response;
        this.marketDataArr.sort((a, b) => {
            return a.id - b.id;
        });
    }

    getMarketDataArr() {
        return this.marketDataArr;
    }

    setIsAllMissionComplete() {
        this.isAllMissionComplete = false;
    }

    initAllMissionComplete() {
        this.isAllMissionComplete = true;
    }

    getIsAllMissionComplete() {
        return this.isAllMissionComplete;
    }

    setCacheIncident(incident: IIncident, marketId: number) {
        this.cacheIncident.set(marketId, incident);
        DataMgr.incidentData.addIncident(incident);
    }

    deleteIncident() {
        if(this.cacheIncident) {
            DataMgr.incidentData.setIsOtherMarket(false);
            this.cacheIncident.forEach((value, key) => {
                if(key !== DataMgr.getMarketId()) {
                    DataMgr.incidentData.deleteIncident(value);
                }
            });
            this.cacheIncident.clear();
        }
    }

    getCacheIncident() {
        return this.cacheIncident;
    }

}

export const BigMData = BigMapData.instance();

export interface IBigMapData {
    busNum: number;
    hasProfitBubble: boolean;
    id: number;
    incidentNum: number;
    crisisNum: number;
    name: string;
}