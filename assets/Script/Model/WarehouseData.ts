import {NewFutureFactor} from "../global/const/StringConst";
import {ClientEvents} from "../global/manager/ClientEventCenter";
import {FunctionName, JsonMgr} from "../global/manager/JsonManager";
import {IGoodsItem, IItem, IWareHouse} from "../types/Response";
import {DataMgr} from "./DataManager";
import {mapShelvesType, ShelvesType, subShelvesType} from "./market/ShelvesDataModle";

//背包使用类型
export enum BagUseType {
    OpenGift = 1,       //打开礼包
    JumpStaff = 2,      //跳转员工
    JumpRecruit = 3,    //跳转招募
}

export class WarehouseData {
    private shelfDataVo: Map<number, IItem> = new Map<number, IItem>();     //家具
    private decorationDataVo: Map<number, IItem> = new Map<number, IItem>();  //装饰
    private floorDataVo: Map<number, IItem> = new Map<number, IItem>();   //地板
    private itemDataVo: Map<number, IItem> = new Map<number, IItem>();  //道具
    private _furnitures: number[];

    private initNewFutureSet: Map<number, number> = new Map<number, number>();
    private mainTypeSet: Map<number, number[]> = new Map<number, number[]>();
    private isEnough: boolean = false;

    getShelfNum() {
        return this.shelfDataVo.size;
    }

    initWarseHouse(response: IWareHouse) {
        if (response.itemWh.items) {
            this.updateWareItems(response.itemWh.items);
        }
        if (response.furnitures) {
            this.refreshFurniture(response);
        }
    }

    refreshFurniture(response: IWareHouse) {
        this._furnitures = response.furnitures;
        if (DataMgr.getCanShowRedPoint()) {
            this.initSet();
        }
    }

    initSet() {
        this.initNewFutureSet.clear();
        this.mainTypeSet.clear();
        this._furnitures.forEach((value) => {
            let trueValue = Math.floor(value / NewFutureFactor.FACTOR);
            if (!trueValue) {
                let xmlData = JsonMgr.getDecoShopJson(value);
                let count = this.mainTypeSet.get(xmlData.mainType);
                if (!count) {
                    this.mainTypeSet.set(xmlData.mainType, [xmlData.subType]);
                } else {
                    count.push(xmlData.subType);
                }
                this.initNewFutureSet.set(value, xmlData.mainType);
            }
        });
    }

    deleteWithMainTypeSubTypeAndId(mainType: ShelvesType, subType: subShelvesType, id: number) {
        let mainSub = this.mainTypeSet.get(mainType);
        if (mainSub) {
            let index = mainSub.indexOf(subType);
            if (index !== -1) {
                for (let i = 0; i < mainSub.length; i++) {
                    if (mainSub[i] === subType) {
                        mainSub.splice(i, 1);
                        if (mainSub.length === 0) {
                            this.mainTypeSet.delete(mainType);
                        }
                        break;
                    }
                }
            }
            this.initNewFutureSet.delete(id);
        }
    }

    deleteWithSubType(subType: subShelvesType) {
        let deleteKeyOfFutureSet: number[] = [];
        let deleteKeyOfType: number[] = [];
        let allShop = JsonMgr.getShopJson();
        this.initNewFutureSet.forEach((value, key) => {
            let xmlData: IDecoShopJson = allShop[key];
            if (subType === xmlData.subType) {
                deleteKeyOfFutureSet.push(key);
            }
        });
        this.mainTypeSet.forEach((value, key) => {
            let result = value.indexOf(subType);
            if (result !== -1) {
                deleteKeyOfType.push(key);
            }
        });
        deleteKeyOfType.forEach((value) => {
            this.mainTypeSet.delete(value);
        });
        deleteKeyOfFutureSet.forEach((value) => {
            this.initNewFutureSet.delete(value);
        });
    }

    deleteWithMainType(mainType: ShelvesType) {
        let deleteKeyOfFutureSet: number[] = [];
        let allShop = JsonMgr.getShopJson();
        this.initNewFutureSet.forEach((value, key) => {
            let xmlData: IDecoShopJson = allShop[key];
            if (mainType === xmlData.mainType) {
                deleteKeyOfFutureSet.push(key);
            }
        });
        this.mainTypeSet.delete(mainType);
        deleteKeyOfFutureSet.forEach((value) => {
            this.initNewFutureSet.delete(value);
        });
    }

    checkCase(subType: subShelvesType) {
        let arr = this.mainTypeSet.get(ShelvesType.FeaturesShelve);
        let result = true;
        if (arr) {
            result = arr.indexOf(subType) !== -1;
        } else {
            result = false;
        }
        return result;
    }

    checkHasWithMainType(mainType: ShelvesType) {
        return !!this.mainTypeSet.get(mainType);
    }

    getInitNewFutureSet() {
        return this.initNewFutureSet;
    }

    getMainTypeSet() {
        return this.mainTypeSet;
    }

    deleteOneItem(xmlData: IDecoShopJson) {
        this.initNewFutureSet.delete(xmlData.id);
        let count = this.mainTypeSet.get(xmlData.mainType);
        if (count.length - 1 <= 0) {
            this.mainTypeSet.delete(xmlData.mainType)
        } else {
            let index = count.indexOf(xmlData.subType);
            count.splice(index, 1);
        }
    }

    //更新仓库item
    updateWareItems(items: IItem[]) {
        let decoShopXmlData = JsonMgr.getOneKind("decoShop");
        this.shelfDataVo.clear();
        this.decorationDataVo.clear();
        this.floorDataVo.clear();
        this.itemDataVo.clear();
        items.forEach((itemVo: IItem) => {
            switch (itemVo.type) {
                case "decoShop":
                    let decoshopXmlJson: IDecoShopJson = decoShopXmlData[itemVo.id];
                    switch (decoshopXmlJson.mainType) {
                        case ShelvesType.FeaturesShelve:    //家具
                            this.shelfDataVo.set(itemVo.id, itemVo);
                            break;
                        case ShelvesType.GroundShelve:      //地面装饰
                        case ShelvesType.WallShelve:     //墙面装饰
                            this.decorationDataVo.set(itemVo.id, itemVo);
                            break;
                        case ShelvesType.FloorShelve:   //地板
                        case ShelvesType.WallPaperShelve:    //墙纸
                            this.floorDataVo.set(itemVo.id, itemVo);
                            break;
                    }
                    break;
                case "item":
                    this.itemDataVo.set(itemVo.id, itemVo);
                    break;
            }
        });
        ClientEvents.WAREHOUSE_UPDATE_WAREHOUSE.emit();
        if (DataMgr.getCanShowRedPoint()) {
            DataMgr.checkMapCanExpand();
            DataMgr.iMarket.checkIsLimitWithCase();
        }
    }


    getXmlDataByData(xmlData: IDecoShopJson) {
        let mainType = xmlData.mainType;
        switch (mainType) {
            case ShelvesType.FeaturesShelve:    //家具
                return this.shelfDataVo.get(xmlData.id);

            case ShelvesType.GroundShelve:      //地面装饰
            case ShelvesType.WallShelve:     //墙面装饰
                return this.decorationDataVo.get(xmlData.id);
            case ShelvesType.FloorShelve:   //地板
            case ShelvesType.WallPaperShelve:    //墙纸
                return this.floorDataVo.get(xmlData.id);
        }
    }

    //货物主类型和子类型获取
    getDecorationDataVO(mainType: mapShelvesType, subType?: subShelvesType) {
        switch (mainType) {
            case mapShelvesType.ShelfType:
                if (subType) {
                    return this.getDataBySubType(this.shelfDataVo, subType);
                }
                return this.shelfDataVo;
            case mapShelvesType.DecorationType:
                if (subType) {
                    return this.getDataBySubType(this.decorationDataVo, subType);
                }
                return this.decorationDataVo;
            case mapShelvesType.floorType:
                if (subType) {
                    return this.getDataBySubType(this.floorDataVo, subType);
                }
                return this.floorDataVo;
        }
    }

    getDataByMainTypeAndSubType(mainType: ShelvesType, xmlId: number) {
        let dataMap: Map<number, IItem>;
        switch (mainType) {
            case ShelvesType.FeaturesShelve:
                dataMap = this.shelfDataVo;
                break;
            case ShelvesType.WallShelve:
            case ShelvesType.GroundShelve:
                dataMap = this.decorationDataVo;
                break;
            case ShelvesType.FloorShelve:
            case ShelvesType.WallPaperShelve:
                dataMap = this.floorDataVo;
                break;
        }
        return dataMap.get(xmlId);
    }

    //通过自类型获取
    getDataBySubType(dataVo: Map<number, IItem>, subType: subShelvesType) {
        let subShelfMap: Map<number, IItem> = new Map<number, IItem>();
        let decoShopXmlData = JsonMgr.getOneKind("decoShop");
        dataVo.forEach((itemVo: IItem) => {
            let decoshopXmlJson: IDecoShopJson = decoShopXmlData[itemVo.id];
            if (decoshopXmlJson.subType == subType) {
                subShelfMap.set(itemVo.id, itemVo);
            }
        });
        return subShelfMap;
    }

    //获取全部家具数据
    getShelfAllDataVo() {
        return this.shelfDataVo;
    }

    //获取家具数据
    getShelfDataVo(shelfId: number) {
        return this.shelfDataVo.get(shelfId);
    }

    //获取全部家具数据
    getAllDecaroDataVo() {
        return this.decorationDataVo;
    }

    //获取家具数据
    getDecaroDataVo(shelfId: number) {
        let decoShopXmlData = JsonMgr.getOneKind("decoShop");
        let decoshopXmlJson: IDecoShopJson = decoShopXmlData[shelfId];
        switch (decoshopXmlJson.mainType) {
            case ShelvesType.FeaturesShelve:    //家具
                return this.decorationDataVo.get(shelfId);
            case ShelvesType.GroundShelve:      //地面装饰
            case ShelvesType.WallShelve:     //墙面装饰
                return this.decorationDataVo.get(shelfId);
            case ShelvesType.FloorShelve:   //地板
            case ShelvesType.WallPaperShelve:    //墙纸
                return this.floorDataVo.get(shelfId);
        }
    }

    getAllFloorDataVo() {
        return this.floorDataVo;
    }

    //获取地板数据
    getFloorDataVo(goodsId: number): IGoodsItem {
        return this.floorDataVo.get(goodsId);
    }

    //判断是不是有这个墙纸
    judgeIsHaveWall(id) {
        if (this.getFloorDataVo(id)) {
            return 1;
        }
        return 0;
    }

    //获取当前某个货架/墙纸数量
    getDecojsonNum(decoId: number) {
        let decoNum: number = 0;
        let shelfData = this.shelfDataVo.get(decoId);
        if (shelfData) {
            decoNum += shelfData.num
        }
        let decordata = this.decorationDataVo.get(decoId);
        if (decordata) {
            decoNum += decordata.num
        }
        let floorData = this.floorDataVo.get(decoId);
        if (floorData) {
            decoNum += floorData.num
        }
        return decoNum;
    }

    //获取全部item数据
    getAllItemDataVo() {
        return this.itemDataVo;
    }

    //获取区别item数据（数组类型）
    getAllItemDataArr(): IItem[] {
        let itemArr: IItem[] = [];
        this.itemDataVo.forEach((value) => {
            itemArr.push(value);
        });
        return itemArr;
    }

    //获取item数据
    getItemDataVo(itemId: number): IItem {
        return this.itemDataVo.get(itemId);
    }

    //获取item数量（itemid）
    getItemNum = (itemId: number): number => {
        if (itemId < 0) {
            return DataMgr.getCurrencyNum(itemId);
        }
        let itemData = JsonMgr.getInformationAndItem(itemId);
        if (itemData && itemData.type == 22) {
            return DataMgr.getActivityItemNum(itemId);
        }
        let itemObj: IItem = this.itemDataVo.get(itemId);
        return itemObj ? itemObj.num : 0;
    };

    getAllCanAddExp() {
        let canAddExp: number = 0;
        this.itemDataVo.forEach((value) => {
            if (JsonMgr.getItem(value.id).type == 3) {
                canAddExp = canAddExp + (Number(JsonMgr.getItem(value.id).value) * value.num);
            }
        });
        return canAddExp;
    }

    getAllCanAddFavor() {
        let canAddExp: number = 0;
        this.itemDataVo.forEach((value) => {
            if (JsonMgr.getItem(value.id).type == 9) {
                canAddExp = canAddExp + (Number(JsonMgr.getItem(value.id).value) * value.num);
            }
        });
        return canAddExp;
    }

    /**
     * 货架主类型
     * 货架id
     * 增加的数量  减少的话是负数
     */
    updateShelfVo(mainType: ShelvesType, xmlId: number, addNum: number) {
        switch (mainType) {
            case ShelvesType.FeaturesShelve:    //家具
                this.updateMapVo(this.shelfDataVo, xmlId, addNum);
                break;
            case ShelvesType.GroundShelve:      //地面装饰
            case ShelvesType.WallShelve:     //墙面装饰
                this.updateMapVo(this.decorationDataVo, xmlId, addNum);
                break;
            case ShelvesType.FloorShelve:   //地板
            case ShelvesType.WallPaperShelve:    //墙纸
                this.updateMapVo(this.floorDataVo, xmlId, addNum);
                break;
        }
    }

    //更新map
    updateMapVo(sheflMap, xmlId, addNum: number) {
        let sheflVo: IItem = sheflMap.get(xmlId);
        if (sheflVo) {
            sheflVo.num += addNum;
            if (sheflVo.num <= 0) {
                sheflMap.delete(xmlId);
            }
        }
    }

    getWareDataByType(dataMap: Map<number, IItem>, chooseType: ShelvesType, chooseType2?: ShelvesType): Map<number, IItem> {
        let map: Map<number, IItem> = new Map<number, IItem>();
        let decoXml = DataMgr.jsonDatas.decoShopJsonData;
        dataMap.forEach((value, key) => {
            let xmlData: IDecoShopJson = decoXml[key];
            if (xmlData.mainType == chooseType || (chooseType2 && xmlData.mainType == chooseType2)) {
                map.set(key, value);
            }
        });
        return map;
    }

    getIsEnough() {
        return this.isEnough;
    }

    getWarehouseCaseCount() {
        let count = 0;
        let allDecoShop = JsonMgr.getShopJson();
        this.getShelfAllDataVo().forEach((value) => {
            let xmlData: IDecoShopJson = allDecoShop[value.id];
            if (xmlData.mainType === ShelvesType.FeaturesShelve) {
                count++;
            }
        });
        return count;
    }
}

export interface TypeNew {
    count: number;
    subType: number
}
