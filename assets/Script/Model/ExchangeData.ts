import {GoldMoonShopConfig, JsonMgr, StaffConfig, StaffModConfig} from "../global/manager/JsonManager";
import {DataMgr} from "./DataManager";
import {StaffSort} from "./StaffData";
import {ClientEvents} from "../global/manager/ClientEventCenter";

/**
 * @Author whg
 * @Date 2019/5/10
 * @Desc
 */

export class ExchangeData {

    private index: number = -1; //兑换员工选中索引
    private staffConfigs: Array<ExchangeStaffData> = new Array<ExchangeStaffData>();
    private uniqueStaffIds: Array<number> = new Array<number>();

    constructor() {
        this.update();
    }


    update = () => {
        let goldMoonShopArr: IGoldMoonShop[] = JsonMgr.getJsonArr("goldMoonShop");
        let staffConfig: StaffConfig;
        let mystaffConfig = DataMgr.staffData;
        goldMoonShopArr.forEach((shopConfig: GoldMoonShopConfig) => {
            if (shopConfig.itemType !== 2) {
                let exist = 0;
                staffConfig = this.getStaffConfig(shopConfig.itemId);
                mystaffConfig.getSorted().forEach((staffData) => {
                    if (shopConfig.itemId == staffData.artResId) {
                        exist = 1;
                        return;
                    }
                })
                this.staffConfigs.push({
                    id: shopConfig.id,
                    xmlId: shopConfig.itemId,
                    hasStaffFlag: DataMgr.staffData.hasStaffByResId(staffConfig.artResId) ? 1 : 0,
                    type: 1,
                    exist: exist,
                    itemNum: shopConfig.itemNum,
                    price: shopConfig.price,
                })
            } else {
                this.staffConfigs.push({
                    id: shopConfig.id,
                    xmlId: shopConfig.itemId,
                    hasStaffFlag: 0,
                    type: 0,
                    exist: 0,
                    itemNum: shopConfig.itemNum,
                    price: shopConfig.price,
                })
            }
        });
        this.staffConfigs.sort((a: ExchangeStaffData, b: ExchangeStaffData) => {
            if (a.exist != b.exist) {
                return a.exist - b.exist;
            }
            return a.id - b.id
        });
    }


    getIndex(): number {
        return this.index;
    }

    setIndex(index: number) {
        this.index = index;
    }

    resetIndex() {
        this.index = -1;
    }

    getCurStaffPrice(): number {
        if (this.index < 0) {
            return 0;
        }
        let shopId = this.index + 1;
        return this.staffConfigs[shopId].price;
    }

    getStaffConfigByIndex(index: number): any {
        let exchangeStaffData = this.getExchangeStaffData(index);
        if (exchangeStaffData.type == 1) {
            return this.getStaffConfig(exchangeStaffData.xmlId);
        } else {
            return JsonMgr.getItem(this.staffConfigs[index].xmlId);
        }
    }

    getStaffShopId(): number {
        return this.getExchangeStaffData(this.index).id;
    }

    getExchangeStaffData(index: number): ExchangeStaffData {
        return this.staffConfigs[index];
    }

    getShopConfig(Id: number) {
        return JsonMgr.getGoldMoonShopConfig(Id);
    }

    getStaffConfig(id: number): StaffConfig {
        return JsonMgr.getStaffConfig(id);
    }

    getStaffMod(id: number): StaffModConfig {
        return JsonMgr.getStaffMod(id);
    }

    getConfigSize(): number {
        return this.staffConfigs.length;
    }
}

export enum ShowType {
    RecruitStaff, //正常招募获得员工类型
    ExchangeStaff, //兑换获得员工类型
    MustGetStaff = 2, //必得招募
}

export interface ExchangeStaffData {
    id: number;
    xmlId: number;
    hasStaffFlag: number;
    type: number;
    exist: number;
    itemNum: number;
    price: number;
}
