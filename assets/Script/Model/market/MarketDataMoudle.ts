import {ShelvesDataModle, ShelvesType} from "./ShelvesDataModle";
import {IFloors, IMarket, IPopularityArr, IShelves} from "../../types/Response";
import {FunctionName, JsonMgr} from "../../global/manager/JsonManager";
import {DataMgr} from "../DataManager";
import {ChestRes} from "../../CustomizedComponent/ExpandFrame/ChestResManager";
import {CacheMap, FutureState} from "../../CustomizedComponent/MapShow/CacheMapDataManager";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {MapMgr} from "../../CustomizedComponent/MapShow/MapInit/MapManager";

export class IMarketModel {

    private _endExtendTime: number;
    private _id: number; //店铺id
    private _exFrequency: number;
    private _floors: IFloors[] = [];
    private _left: number = -1;
    private _right: number = -1;
    private _userId: number = -1;
    private _wallPaper: number = -1;
    private _wallDeco: ShelvesDataModle[] = [];
    private _shelves: ShelvesDataModle[] = [];
    private _popularity: number;
    private _exRewards: number = 0;
    private _name: string = "";
    private _todayRename: boolean = false;

    private floorPopularity: number = 0;
    private wallPopulartity: number = 0;
    private shelvesPopularity: number = 0;
    private isLimited: boolean = false;
    private _maxPopularity: number = 0;
    private _decoGoldProfit: number = 0;

    pullData(response: IMarket) {
        this._decoGoldProfit = response.decoGoldProfit;
        this._name = response.name;
        this._id = response.id;
        this._exFrequency = response.exFrequency;
        this._exRewards = response.exRewards;
        this.floorIsSpecial(response.floors);
        this._left = response.left;
        this._right = response.right;
        this._userId = response.userId;
        this._popularity = response.popularity;
        this._todayRename = response.todayRename;
        this._wallDeco.splice(0, this._wallDeco.length);
        response.wallDeco.forEach((value) => {
            let dataModel = this.createShelvesModel(value);
            this._wallDeco.push(dataModel);
        });
        this.sortArr(this._wallDeco);
        this.calculWallPopularity();
        this._endExtendTime = response.endExtendTime;
        this._shelves.splice(0, this._shelves.length);
        response.shelves.forEach((value) => {
            let dataModel = this.createShelvesModel(value);
            this._shelves.push(dataModel);
        });
        this.sortArr(this._shelves);
        this.calculShelvePopularity();
        this._wallPaper = response.wallPaper;
        this.initMaxPopularity();
        CacheMap.refreshCaseData();
    }

    getDecoGoldProfit() {
        return this._decoGoldProfit;
    }

    initMaxPopularity() {
        let jsonData = JsonMgr.getSceneDataByMarketId(this._exFrequency, this.getMarketId());
        this._maxPopularity = jsonData.maxPopularity;
    }

    getExpandTime() {
        return this._endExtendTime;
    }

    sortArr(arr: ShelvesDataModle[]) {
        arr.sort((a, b) => {
            let aXmlData = a.getShelfXmlData();
            let bXmlData = b.getShelfXmlData();
            if (aXmlData.mainType > bXmlData.mainType) {
                return aXmlData.mainType - bXmlData.mainType;
            }
            if (aXmlData.id > bXmlData.id) {
                return aXmlData.id - bXmlData.id;
            }
        });
    }

    refreshShelves(shelves: IShelves[]) {
        if (this._shelves) {
            shelves.forEach((value) => {
                for (let i = 0; i < this._shelves.length; i++) {
                    let data = this._shelves[i];
                    if (data.getShelvesId() === value.id) {
                        data.pullData(value);
                        break;
                    }
                }
            })
        }
    }

    getTodayName() {
        return this._todayRename;
    }

    getName() {
        return this._name;
    }

    getExpandChest() {
        if (MapMgr.getMapState() === FutureState.NORMAL) {
            if (this._endExtendTime) {
                ChestRes.backTimeInit();
            } else {
                let adInfo = DataMgr.getAdInfoById(7);
                ChestRes.setExpandSeeTime(adInfo ? adInfo.number : 0);
            }
        }
    }


    calculWallPopularity() {
        //墙上人气值
        this.wallPopulartity = 0;
        this._wallDeco.forEach((wallDeco: ShelvesDataModle) => {
            this.wallPopulartity += wallDeco.getPopularity();
        })
    }

    calculShelvePopularity() {
        //装饰品人气值
        this.shelvesPopularity = 0;
        this._shelves.forEach((shelves: ShelvesDataModle) => {
            this.shelvesPopularity += shelves.getPopularity();
        })
    }

    checkHasCaseById(id: number) {
        let result = false;
        if (this._shelves) {
            for (let i = 0; i < this._shelves.length; i++) {
                if (this._shelves[i].getShelevesXmlId() === id) {
                    result = true;
                    return result;
                }
            }
        }
        let warehouseData = DataMgr.warehouseData.getShelfAllDataVo();
        warehouseData.forEach((value) => {
            if (value.id === id) {
                result = true;
            }
        });
        return result;
    }

    getShopLv() {
        return this._id;
    }

    getPopularity() {
        return this._popularity;
    }

    //创建货架model
    createShelvesModel(value) {
        let dataModel = new ShelvesDataModle();
        dataModel.pullData(value);
        return dataModel;
    }

    //获取人气值JSON
    getMaxPopularity() {
        return this._maxPopularity;
    }

    //人气值总和数组
    getPopularityArr(): IPopularityArr[] {
        let polularityMap: Map<number, number> = new Map<number, number>();
        let polularityArr: IPopularityArr[] = [];
        this._floors.forEach((floorVo: IFloors) => {
            if (polularityMap.get(floorVo.value)) {
                let haveNum = polularityMap.get(floorVo.value);
                polularityMap.set(floorVo.value, haveNum + 1)
            } else {
                polularityMap.set(floorVo.value, 1);
            }
        });

        let setMap = (modelVo) => {
            let xmlId = modelVo.getShelevesXmlId();
            if (polularityMap.get(xmlId)) {
                let haveNum = polularityMap.get(xmlId);
                polularityMap.set(xmlId, haveNum + 1)
            } else {
                polularityMap.set(xmlId, 1);
            }
        };

        this._wallDeco.forEach((wallVo: ShelvesDataModle) => {
            setMap(wallVo);
        });
        this._shelves.forEach((shelvesVo: ShelvesDataModle) => {
            setMap(shelvesVo);
        });

        polularityMap.forEach((value, key) => {

            let shelveJson: IDecoShopJson = JsonMgr.getDecoShopJson(key);
            if (shelveJson.Popularity > 0) {
                let arr: IPopularityArr = {
                    sheleveDecoJson: shelveJson,
                    sheleveNum: value
                };
                polularityArr.push(arr);
            }
        });
        if (this._wallPaper > 0) {
            let shelveJson: IDecoShopJson = JsonMgr.getDecoShopJson(this._wallPaper);
            if (shelveJson.Popularity) {
                let arr: IPopularityArr = {
                    sheleveDecoJson: shelveJson,
                    sheleveNum: 1
                };
                polularityArr.push(arr);
            }
        }

        return polularityArr;
    }

    //当前人气值加成
    getPopularityAdd() {
        return (this.getShelveLvJson().add * 100).toFixed(3);
    }

    getShelveLvJson() {
        let curPopularity = this.getPopularity();
        let allPopularity = this.getMaxPopularity();
        let popularityNum = Math.min(curPopularity, allPopularity);
        return JsonMgr.getShelveLvJson(popularityNum, this._id)
    }

    floorIsSpecial(floor: any) {
        this._floors.splice(0, this._floors.length);
        Object.keys(floor).map((v) => {
            this._floors.push({key: parseInt(v), value: floor[v]});
        });

        //地板人气值
        this.floorPopularity = 0;
        this._floors.forEach((FloorVo: IFloors) => {
            let xmlId = FloorVo.value;
            let descShopVo: IDecoShopJson = JsonMgr.getDecoShopJson(xmlId);
            if (!descShopVo) {
                cc.error("not found descShopVo xmlId=", xmlId); //
            }
            this.floorPopularity += descShopVo.Popularity;
        })

    }

    getFloor() {
        return this._floors;
    }

    getWallDeco() {
        return this._wallDeco;
    }

    getShelves() {
        return this._shelves;
    }

    getExFrequency() {
        return this._exFrequency;
    }

    getWallPaper() {
        return this._wallPaper;
    }

    getMarketId() {
        return this._id;
    }

    getHasGoodsCase() {
        let count = 0;
        this._shelves.forEach((value) => {
            if (value.getShelfXmlData().mainType === ShelvesType.FeaturesShelve) {
                count++;
            }
        });
        return count;
    }

    checkIsLimitWithCase() {
        if (JsonMgr.isFunctionOpen(FunctionName.decorate)) {
            if (DataMgr.checkShowDecorateRed()) {
                let limit = JsonMgr.getTrueSceneData().putShelves;
                let i = 0;
                this._shelves.forEach((value) => {
                    if (value.getShelfXmlData().mainType === ShelvesType.FeaturesShelve) {
                        i++;
                    }
                });
                this.isLimited = i < limit;
                let warehouse = DataMgr.warehouseData.getWarehouseCaseCount();
                ClientEvents.REFRESH_DECORATE_RED.emit((i < limit && warehouse > 0));
            }
        }
    }

    setLimited(result: boolean) {
        this.isLimited = result;
    }

    getIsLimited() {
        return this.isLimited;
    }

    getDecorateCount() {
        let count = 0;
        for (let i of this._shelves) {
            if (i.getShelfXmlData().mainType === ShelvesType.GroundShelve) {
                count++;
            }
        }
        count += this._wallDeco.length + 1;
        return count;
    }

    getCaseCount() {
        let count = 0;
        for (let i of this._shelves) {
            if (i.getShelfXmlData().mainType === ShelvesType.FeaturesShelve) {
                count++;
            }
        }
        return count;
    }

    //true是上限状态
    checkCaseIsLimit() {
        let limitCount = JsonMgr.getSceneDataByMarketId(this.getExFrequency(), this.getMarketId()).putShelves;
        let count = this.getCaseCount();
        return count >= limitCount;
    }

    getTrueExpandTime() {
        return this._exFrequency + 22 * (this._id - 1);
    }

    static getSaleValue(xmlData: IDecoShopJson) {
        if (xmlData.mainType === ShelvesType.FeaturesShelve) {
            let subType = xmlData.subType;
            let goodsData = JsonMgr.getGoods(subType);
            let consts = JsonMgr.getConstVal("speed");
            return Math.ceil((60 / (goodsData.value / consts) * goodsData.price[0]));
        } else {
            return xmlData.goldProduction;
        }
    }

    resetExpandTime() {
        this._endExtendTime = -1;
    }
}
