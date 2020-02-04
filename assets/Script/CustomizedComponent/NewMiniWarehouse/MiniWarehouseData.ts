/**
 *@Athuor ljx
 *@Date 22:40
 */
import {DataMgr} from "../../Model/DataManager";
import {IItem} from "../../types/Response";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {NodeType} from "../MapShow/CacheMapDataManager";
import {WarehouseData} from "../../Model/WarehouseData";
import {ShelvesType} from "../../Model/market/ShelvesDataModle";
import {JsonMgr} from "../../global/manager/JsonManager";
import {ButtonMgr} from "../common/ButtonClick";
import {ResolveData, ResolveGetData} from "./ResolveCommonNode";

export enum MiniWareChooseType {
    SHELF = "Shelves",
    DECORATE = "Decorate",
    FLOOR_AND_WALLPAPER = "FloorAndWallPaper"
}

export enum MiniGuideState {
    CASE,
    DECORATE
}

class MiniWarehouseData {

    private static _instance: MiniWarehouseData = null;

    static instance() {
        if (this._instance == null) {
            MiniWarehouseData._instance = new MiniWarehouseData();
        }
        return MiniWarehouseData._instance;
    }

    private nowChooseAllData: Map<number, IItem> = new Map<number, IItem>();
    private showData: Array<IItem> = new Array<IItem>();
    //父选项
    private chooseState: MiniMainTypeChoose = {type: null, node: null, zIndex: null};
    //子选项
    private chooseType: MiniChooseType = {type: null, node: null};
    private chooseState2: MiniMainTypeChoose = {type: null, node: null, zIndex: null};
    private chooseType2: MiniChooseType = {type: null, node: null};
    private nodeType: NodeType;

    private guideState: MiniGuideState = 0;
    private saveHasShow: boolean = false;
    private isJump: boolean = false;
    private noThingDo: number = 0;

    private saleMap: Map<number, ResolveData> = new Map<number, ResolveData>();

    addSaleToMap(xmlId: number, count: number = 1) {
        let saleData = this.saleMap.get(xmlId);
        if(saleData) {
            saleData.count += count;
            if(saleData.count <= 0) {
                this.saleMap.delete(xmlId);
            }
        } else {
            this.saleMap.set(xmlId, {id: xmlId, count: 1, xmlData: JsonMgr.getDecoShopJson(xmlId)});
        }
    }

    getSaleData(xmlData: number): ResolveData {
        return this.saleMap.get(xmlData);
    }

    getSaleArr(): ResolveData[] {
        let arr: ResolveData[] = [];
        this.saleMap.forEach((value) => {
            arr.push(value);
        });
        return arr;
    }

    getPushSaleArr(): any[] {
        let arr: any[] = [];
        this.saleMap.forEach((value) => {
            arr.push({xmlId: value.id, number: value.count});
        });
        return arr;
    }

    getSaleSize() {
        return this.saleMap.size;
    }

    getResolveGetDataArr(): ResolveGetData[] {
        let arr: Map<number, {count}> = new Map<number, {count}>();
        let jsonM = JsonMgr;
        this.saleMap.forEach((value) => {
            let decoXmlData: IDecoShopJson = value.xmlData;
            let resolve = decoXmlData.resolveReward.split(",");
            let id = parseInt(resolve[0]);
            let count = parseInt(resolve[1]);
            let data = arr.get(id);
            let allCount = value.count * count;
            if(data) {
                data.count += allCount;
            } else {
                arr.set(id, {count: allCount});
            }
        });
        let getDataArr: ResolveGetData[] = [];
        arr.forEach((value, key) => {
            let itemXmlData = jsonM.getInformationAndItem(key);
            getDataArr.push({xmlData: itemXmlData, count: value.count});
        });
        return getDataArr;
    }

    clearSaleMap() {
        this.saleMap.clear();
    }

    resetNoThingDo = () => {
        this.noThingDo = 0;
    };

    noThingDoAdd() {
        this.noThingDo += .5;
        return this.noThingDo >= 3;
    }

    clearCb() {
        ButtonMgr.setCb(null);
    }

    setIsJump(isJump: boolean) {
        this.isJump = isJump;
    }

    setClickCb() {
        ButtonMgr.setCb(this.resetNoThingDo);
    }

    getIsJump() {
        return this.isJump;
    }

    setSaveHasShow(bool: boolean) {
        this.saveHasShow = bool;
    }

    getSaveHasShow() {
        return this.saveHasShow;
    }

    setGuideState(state: MiniGuideState) {
        this.guideState = state;
    }

    getGuideState() {
        return this.guideState;
    }

    initState() {
        this.guideState = 0;
        this.saveHasShow = false;
        this.isJump = false;
    }

    setChooseState(state: MiniMainTypeChoose, state2: MiniMainTypeChoose, backSprite: cc.SpriteFrame, showSpriteFrame: cc.SpriteFrame) {
        this.setChoose(this.chooseState, state, backSprite, showSpriteFrame);
        this.setChoose(this.chooseState2, state2, backSprite, showSpriteFrame);
    }

    setChoose(chooseState: MiniMainTypeChoose, state: MiniMainTypeChoose, backSprite: cc.SpriteFrame, showSpriteFrame: cc.SpriteFrame) {
        if(chooseState.type) {
            let newNode = chooseState.node.getChildByName("new");
            if(newNode) {
                ClientEvents.REFRESH_NEWSTATE.emit();
            }
            this.changeChooseStateType(chooseState, chooseState.zIndex, backSprite);
        }
        chooseState.type = state.type;
        chooseState.node = state.node;
        chooseState.zIndex = state.zIndex;
        this.changeChooseStateType(chooseState, 5, showSpriteFrame);
        this.setNowChooseAllData(chooseState);
    }

    getChooseState() {
        return this.chooseState;
    }

    getChooseState2() {
        return this.chooseState2;
    }

    getAllDataLength() {
        return this.showData.length;
    }

    sortAllData() {
        let allXmlData = JsonMgr.getShopJson();
        this.showData.sort((a, b) => {
            let xmlDataA: IDecoShopJson = allXmlData[a.id];
            let xmlDataB: IDecoShopJson = allXmlData[b.id];
            return xmlDataA.warehouseSort - xmlDataB.warehouseSort;
        });
    }

    setShowData(chooseType1: MiniChooseType, chooseType2: MiniChooseType) {
        if ((this.chooseType && this.chooseType.node == chooseType1.node) || (this.chooseType2 && this.chooseType2.node == chooseType1.node)) {
            return;
        }
        this.changeChooseType(this.chooseType, chooseType1);
        this.changeChooseType(this.chooseType2, chooseType2);
        this.resetShowData(chooseType1);
    }

    resetShowData(chooseType1) {
        if (this.nowChooseAllData) {
            this.showData.splice(0, this.showData.length);
            let decoXmlData: IDecoShopJson = DataMgr.jsonDatas.decoShopJsonData;
            this.nowChooseAllData.forEach((value, key) => {
                let data: IItem;
                let xmlData: IDecoShopJson = decoXmlData[key];
                if (chooseType1.type) {
                    if (this.chooseState.type == MiniWareChooseType.SHELF ? chooseType1.type == xmlData.subType : chooseType1.type == xmlData.mainType) {
                        data = value;
                    }
                } else {
                    data = value;
                }
                data && this.showData.push(data);
            });
            this.sortAllData();
        }
    }

    changeChooseType(chooseType: MiniChooseType, changeType: MiniChooseType) {
        if(chooseType.node) {
            let newNode = chooseType.node.getChildByName("new");
            if(newNode) {
                newNode.active = false;
                if(this.chooseState.type === MiniWareChooseType.SHELF) {
                    DataMgr.warehouseData.deleteWithSubType(chooseType.type);
                } else {
                    DataMgr.warehouseData.deleteWithMainType(chooseType.type);
                }
                ClientEvents.REFRESH_NEWSTATE.emit();
            }
            this.changeChooseTypeBtn(chooseType);
        }
        chooseType.type = changeType.type;
        chooseType.node = changeType.node;
        this.changeChooseTypeBtn(chooseType);
    }

    changeChooseStateType(chooseState: MiniMainTypeChoose, zIndex: number, sprite: cc.SpriteFrame) {
        chooseState.node.zIndex = zIndex;
        let btn = chooseState.node.getComponent(cc.Sprite);
        btn.spriteFrame = sprite;
    }

    changeChooseTypeBtn(chooseType: MiniChooseType) {
        let btn = chooseType.node.getComponent(cc.Button);
        this.changeBtnSprite(btn);
    }

    setNowChooseAllData(chooseState: MiniMainTypeChoose) {
        let wareData = this.getWareDataByChooseType(chooseState.type);
        this.nowChooseAllData = wareData.nowAllData;
        this.nodeType = wareData.nodeType;
    }

    getWareDataByChooseType(type: MiniWareChooseType) {
        let warehouseData: WarehouseData = DataMgr.warehouseData;
        let nodeType: NodeType;
        let nowAllData: Map<number, IItem>;
        switch (type) {
            case MiniWareChooseType.SHELF:
                nodeType = NodeType.SHELF;
                nowAllData = warehouseData.getShelfAllDataVo();
                break;
            case MiniWareChooseType.DECORATE:
                nodeType = NodeType.WALL;
                nowAllData = warehouseData.getAllDecaroDataVo();
                break;
            case MiniWareChooseType.FLOOR_AND_WALLPAPER:
                nodeType = NodeType.FLOOR;
                nowAllData = warehouseData.getAllFloorDataVo();
                break;
        }
        return {nodeType: nodeType, nowAllData: nowAllData};
    }

    checkHasNew(type: MiniWareChooseType) {
        let warehouse = DataMgr.warehouseData;
        switch (type) {
            case MiniWareChooseType.SHELF:
                return warehouse.checkHasWithMainType(ShelvesType.FeaturesShelve);
            case MiniWareChooseType.DECORATE:
                let result1 = warehouse.checkHasWithMainType(ShelvesType.GroundShelve);
                let result2 = warehouse.checkHasWithMainType(ShelvesType.WallShelve);
                return result1 || result2;
            case MiniWareChooseType.FLOOR_AND_WALLPAPER:
                let result3 = warehouse.checkHasWithMainType(ShelvesType.FloorShelve);
                let result4 = warehouse.checkHasWithMainType(ShelvesType.WallPaperShelve);
                return  result4 || result3;
        }
    }

    refreshData() {
        this.setNowChooseAllData(this.chooseState);
        this.resetShowData(this.chooseType);
        ClientEvents.REFRESH_MINIWAREHOUSE.emit();
    }

    getShowData(index: number) {
        return this.showData[index];
    }

    changeBtnSprite(btn: cc.Button) {
        let temp = btn.normalSprite;
        btn.normalSprite = btn.pressedSprite;
        btn.hoverSprite = btn.pressedSprite;
        btn.pressedSprite = temp;
    }

    updateMiniItem(xmlData: IDecoShopJson, index?: number, count: number = 1) {
        if (index >= 0) {
            let data = this.showData[index];
            data.num += count;
            if (data.num <= 0) {
                this.showData.splice(index, 1);
                this.nowChooseAllData.delete(xmlData.id);
                ClientEvents.REFRESH_MINIWAREHOUSE.emit();
            }
        } else {
            this.showData.push({id: xmlData.id, stacking: xmlData.stacking, num: count, type: "decoShop"});
            ClientEvents.REFRESH_MINIWAREHOUSE.emit();
        }
        this.sortAllData();
    }

    downItemCountById(xmlData: IDecoShopJson, count: number = -1) {
        for(let i  = 0; i < this.showData.length; i++) {
            let data = this.showData[i];
            if(data.id === xmlData.id) {
                data.num += count;
                if(data.num <= 0) {
                    this.showData.splice(i, 1);
                    this.nowChooseAllData.delete(xmlData.id);
                    ClientEvents.REFRESH_MINIWAREHOUSE.emit();
                    return;
                }
            }
        }
    }

    checkIsNowType(xmlData: IDecoShopJson) {
        let itemType: MiniWareChooseType;
        switch (xmlData.mainType) {
            case ShelvesType.FeaturesShelve:
                itemType = MiniWareChooseType.SHELF;
                break;
            case ShelvesType.GroundShelve:
            case ShelvesType.WallShelve:
                itemType = MiniWareChooseType.DECORATE;
                break;
            case ShelvesType.FloorShelve:
            case ShelvesType.WallPaperShelve:
                itemType = MiniWareChooseType.FLOOR_AND_WALLPAPER;
                break;
        }
        return itemType;
    }

    backItemToMiniWare(xmlData: IDecoShopJson, count: number) {
        let chooseType = this.checkIsNowType(xmlData);
        let key = xmlData.id;
        if (chooseType == this.chooseState.type) {
            let key = xmlData.id;
            let data = this.nowChooseAllData.get(key);
            if (data) {
                data.num += count;
                if (data.num <= 0) {
                    let index: number;
                    for (let i = 0; i < this.showData.length; i++) {
                        if (this.showData[i].id == xmlData.id) {
                            index = i;
                        }
                    }
                    this.showData.splice(index, 1);
                    this.nowChooseAllData.delete(key);
                }
                ClientEvents.REFRESH_MINIWAREHOUSE.emit();
            } else {
                let iData = this.setIItem(xmlData, count);
                this.nowChooseAllData.set(key, iData);
                if(this.chooseType.type === 0 || xmlData.mainType === ShelvesType.FeaturesShelve && xmlData.subType === this.chooseType.type || xmlData.mainType !== ShelvesType.FeaturesShelve) {
                    this.showData.push(iData);
                }
                ClientEvents.REFRESH_MINIWAREHOUSE.emit();
            }
        } else {
            let wareData = this.getWareDataByChooseType(chooseType).nowAllData;
            let data = wareData.get(key);
            if (data) {
                data.num += count;
                if (data.num <= 0) {
                    wareData.delete(key);
                }
            } else {
                let iData = this.setIItem(xmlData, count);
                wareData.set(key, iData);
            }
        }
        this.sortAllData();
    }

    setIItem(xmlData: IDecoShopJson, count: number): IItem {
        return {
            id: xmlData.id,
            num: count,
            stacking: xmlData.stacking,
            type: "decoShop"
        }
    }

    clearData() {
        this.chooseState = {type: null, node: null, zIndex: null};
        this.chooseType = {type: null, node: null};
        this.chooseState2 = {type: null, node: null, zIndex: null};
        this.chooseType2 = {type: null, node: null};
        this.nodeType = null;
    }

    getShowDataLen() {
        return this.showData.length;
    }
}


export const MiniData = MiniWarehouseData.instance();

export interface MiniChooseType {
    type: number;
    node: cc.Node;
}

export interface MiniMainTypeChoose {
    type: MiniWareChooseType;
    node: cc.Node;
    zIndex: number;
}