import { ISellTaskInfo, ISellCompanyInfo, ISellInfo, IGoal } from "../types/Response";
import {JsonMgr} from "../global/manager/JsonManager";

const { ccclass, property } = cc._decorator;

@ccclass
export class SellTaskData {

    private sellData: IGoal = null;
    private index: number = -1; //兑换公司选中索引
    private idex: number = -1;
    private pageId: number = 1;
    private exchangeTime: number = 0;

    setSellData(res: ISellInfo) {
        this.sellData = res.SellGoodsGoal;
    }

    getSellData(): IGoal {
        return this.sellData;
    }

    getIndex(): number {
        return this.index;
    }

    setIndex(index: number) {
        this.index = index;
    }

    setpeopleId(idex: number) {
        this.idex = idex;
    }

    resetIndex() {
        this.index = -1;
    }

    resetPage() {
        this.pageId = 1;
    }

    setComPage(compageId: number) {
        this.pageId = compageId;
    }

    setExchangeTime(times: number) {
        this.exchangeTime = times;
    }

    getExchangeTime(): number {
        return this.exchangeTime;
    }

    getComPage(): number {
        return this.pageId;
    }

    //角色ID（兑换传回后端）
    getpeopleId(): number {
        return this.idex;
    }

    isEnought(): boolean{
        return this.sellData.hasDrawCnt < this.sellData.completeCnt && this.sellData.hasDrawCnt < this.getSellTimes();
    }

    getSellTimes(): number {
        let limitData = JsonMgr.getJsonArr("sellLimit",
            (sellLimitData: SellLimitData) => sellLimitData.sceneLevel == this.sellData.sceneLevel);
        if(!limitData || limitData.length <= 0){
            return -1;
        }
        return limitData[limitData.length-1].stage;
    }
}

export interface SellCompanyData {
    id: number;
    name: string;
    num: number;
    type: boolean;
}
