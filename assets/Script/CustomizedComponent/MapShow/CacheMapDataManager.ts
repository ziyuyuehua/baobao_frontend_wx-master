import {IShelves} from "../../types/Response";
import {CommonUtil} from "../../Utils/CommonUtil";
import {FutureFather} from "./FutureItem/FutureFather";
import {HashSet} from "../../Utils/dataStructures/HashSet";
import {ChangePosition} from "./Utils/changeTrueOrUse";
import Floors from "./FutureItem/Floors";
import {MapMgr} from "./MapInit/MapManager";
import {DataMgr} from "../../Model/DataManager";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {UIMgr} from "../../global/manager/UIManager";
import {ShelvesDataModle, ShelvesType} from "../../Model/market/ShelvesDataModle";
import ShelvesBubble from "./FutureItem/ShelvesBubble";
import {JsonMgr} from "../../global/manager/JsonManager";
import {ExpUtil} from "./Utils/ExpandUtil";
import MarketState from "../NewMiniWarehouse/MarketState";
import Shelves from "./FutureItem/Shelves";
import {CASHIER_POS} from "../map/MapPeople";
import {JobType} from "../../Model/StaffData";
import WallDeco from "./FutureItem/WallDeco";
import {UIUtil} from "../../Utils/UIUtil";

enum DataType {
    SHELF,
    WALL
}

export enum WallFactor {
    WallFactor = 1000000
}

export enum NodeType {
    SHELF = "Shelves",
    WALL = "WallDeco",
    HIGHLIGHT = "highlight",
    FLOOR = "Floors",
    OUT_WALL = "outWall",
    WALLPAPER = "Wallpaper",
    WALL_HIGHLIGHT = "wallHighlight"
}

export enum FutureState {
    NORMAL,
    DECORATE,
    GROUND,
    ACCESS,
    Stranger,
    SPECIAL_MOVE,
    EXPAND
}

export enum OutWallUrl {
    OUT_1 = "outWall_01",
    OUT_2 = "outWall_02",
    OUT_3 = "outWall_03",
    OUT_4 = "outWall_04",
    OUT_5 = "outWall_05",
}

export default class CacheMapDataManager {

    static Default_CloseGrid = [
        cc.v2(22, 23),
        cc.v2(22, 22),
        cc.v2(17, 23),
        cc.v2(17, 22),

    ];

    static DoorCloseGrid = [
        cc.v2(20, 23),
        cc.v2(19, 23),
        cc.v2(20, 22),
        cc.v2(19, 22)
    ];

    private mapItemMap: Map<number, CacheCaseData> = new Map<number, CacheCaseData>();
    private floorDataMap = new Map<number, FloorKeyValue>();
    private futureNodePool: cc.NodePool = new cc.NodePool();
    private wallNodePool: cc.NodePool = new cc.NodePool();
    private highlightNodePool: cc.NodePool = new cc.NodePool();
    private floorNodePool: cc.NodePool = new cc.NodePool();
    private wallHighlightPool: cc.NodePool = new cc.NodePool();
    private shelfCloseGrid: Map<number, cc.Vec2> = new Map<number, cc.Vec2>();
    private wallCloseGrid: Map<number, WallCloseGridData> = new Map<number, WallCloseGridData>();
    private influenceGrid: Map<number, IInfluence> = new Map<number, IInfluence>();
    private futureChangeData = new Map<number, SendData>();
    private futureDeleteData = new Map<number, SendData>();
    private floorChangeDataMap: Map<number, number> = new Map();
    private chosenItem: FutureFather = null;
    private chosenFloor: Floors = null;
    private scaleValue: number = 1.4;
    private hasMove: boolean = false;
    private decorateState: boolean = false;
    private caseCount: number = 0;
    private truePopularityValue: number = 0;
    private maxNode: number = 0;
    private nowUseNode: number = 0;
    private hasLocked: boolean = false;
    private nowPopularity: number = 0;
    private usePercentLimit: number = 0;
    private mapArea: HashSet<cc.Vec2> = new HashSet();
    private mapItemPopularityState: boolean = false;
    private guideCasePos: cc.Vec2 = null;
    private newShelfArr: ShelvesDataModle[] = [];
    private newWallArr: ShelvesDataModle[] = [];

    initData() {
        this.usePercentLimit = JsonMgr.getConstVal("crowdedShopThreshold") / 100;
    }

    getHasMove() {
        return this.hasMove;
    }

    setHasMove(hasMove: boolean) {
        this.hasMove = hasMove;
    }

    setScaleValue(value: number) {
        this.scaleValue = value;
    }

    getScaleValue() {
        return this.scaleValue;
    }

    setChosenItem(script: FutureFather) {
        this.chosenItem = script;
    }

    getFutureNode(prefab: cc.Prefab, type: string): cc.Node {
        switch (type) {
            case NodeType.SHELF:
                return CommonUtil.checkEnough(this.futureNodePool, prefab);
            case NodeType.WALL:
                return CommonUtil.checkEnough(this.wallNodePool, prefab);
            case NodeType.HIGHLIGHT:
                return CommonUtil.checkEnough(this.highlightNodePool, prefab);
            case NodeType.FLOOR:
                return CommonUtil.checkEnough(this.floorNodePool, prefab);
            case NodeType.WALL_HIGHLIGHT:
                return CommonUtil.checkEnough(this.wallHighlightPool, prefab);
        }
    }

    setPopularityBubbleState(state: boolean) {
        this.mapItemPopularityState = state;
    }

    getPopularityBubbleState() {
        return this.mapItemPopularityState;
    }

    //填充缓存地图数据
    fillData(array: IShelves[], type: DataType) {
        const isShelf: boolean = (type === DataType.SHELF);
        let caseData: CacheCaseData;
        for (let data of array) {
            caseData = this.mapItemMap.get(data.id);
            if (isShelf) {
                caseData.CaseData = <IShelves>data;
            } else {
                caseData.WallData = <IShelves>data;
            }
        }
    }

    /**
     * 家具数据map的管理模块
     */
    addItemDataMapOne(key: number, cacheCaseData: CacheCaseData) {
        this.mapItemMap.set(key, cacheCaseData);
    }

    deleteItemDataMapOne(key: number) {
        this.mapItemMap.delete(key);
    }

    getDataFromMap(key: number): CacheCaseData {
        return this.mapItemMap.get(key);
    }

    getShelfCount() {
        this.caseCount = 0;
        this.mapItemMap.forEach((value) => {
            let caseData = value.CaseData;
            if (caseData && value.xmlData.mainType == ShelvesType.FeaturesShelve) {
                this.caseCount++;
            }
        });
    }

    showAllPopularityBubble() {
        this.mapItemMap.forEach((value) => {
            if (value.xmlData.mainType !== ShelvesType.CheckoutShelve) {
                value.Node.getComponent(FutureFather).showPopularityBubble();
            }
        });
    }

    hideAllPopularityBubble() {
        this.mapItemMap.forEach((value) => {
            value.Node.getComponent(FutureFather).hidePopularityBubble();
        });
    }

    checkIsMax() {
        let expandTime = DataMgr.iMarket.getExFrequency();
        let maxCount = JsonMgr.getScenePutShelves(expandTime);
        if (this.caseCount >= maxCount) {
            return false;
        } else {
            this.caseCount++;
            this.checkCase();
            return true;
        }
    }

    isBackCase(mainType: number) {
        if (mainType == ShelvesType.FeaturesShelve) {
            this.caseCount--;
            this.checkCase();
        }
    }

    getCaseCount() {
        return this.caseCount;
    }

    checkCase() {
        let maxCount = JsonMgr.getTrueSceneData().putShelves;
        DataMgr.iMarket.setLimited(this.caseCount < maxCount);
    }

    getShelfReversal(key: number) {
        return this.getDataFromMap(key).CaseData.reversal;
    }

    getWallReversal(key: number) {
        return this.getDataFromMap(key).WallData.reversal;
    }

    updateChangeData = (cachePos: cc.Vec2, showPos: cc.Vec2, reversal: boolean, isWall: boolean = false, offset?: number, cacheOffset?: number) => {
        let cacheKey = CommonUtil.posToKey(cachePos);
        let newKey = CommonUtil.posToKey(showPos);
        let cacheDeleteKey: number;
        let setNewKey: number;
        if (isWall) {
            cacheDeleteKey = cacheKey + cacheOffset;
            setNewKey = newKey + offset;
        } else {
            cacheDeleteKey = cacheKey;
            setNewKey = newKey;
        }
        let mapDatas = this.mapItemMap.get(cacheDeleteKey);
        let changData = this.futureChangeData.get(cacheDeleteKey);
        //修改缓存数据
        let caseData = isWall ? mapDatas.WallData : mapDatas.CaseData;
        let oldReversal = caseData.reversal;
        caseData.reversal = reversal;
        caseData.x = showPos.x;
        caseData.y = showPos.y;

        this.deleteItemDataMapOne(cacheDeleteKey);
        this.addItemDataMapOne(setNewKey, mapDatas);

        //修改改变数据
        if (!changData) {
            changData = {
                oldKey: caseData.id,
                newKey: newKey,
                xmlId: mapDatas.xmlData.id,
                isReversal: reversal,
                oldReversal: oldReversal
            };
        } else {
            changData.isReversal = reversal;
            changData.newKey = newKey;
            this.futureChangeData.delete(cacheDeleteKey);
        }
        this.setChangeMapData(setNewKey, changData);
    };

    updateWallDataMap = (direction: boolean, xmlData: IDecoShopJson, mapPos: cc.Vec2, cacheKey: number, node: cc.Node, offset: number, cacheOffset: number, cb: Function) => {
        let showPos = cc.v2(mapPos.x - 1, mapPos.y - 1);
        let nowKey = CommonUtil.posToKey(showPos);
        let cachePos = CommonUtil.keyToPos(cacheKey);
        cb && cb(nowKey);
        let caseData = this.mapItemMap.get(cacheKey + cacheOffset);
        if (!caseData) {
            let itemData: IShelves = {
                id: 0,
                reversal: direction,
                x: showPos.x,
                y: showPos.y,
                xmlId: xmlData.id
            };
            let wallData: CacheCaseData = {xmlData: xmlData, WallData: itemData, Node: node};
            this.addItemDataMapOne(nowKey + offset, wallData);
            let changeData = {
                oldKey: 0,
                newKey: nowKey,
                xmlId: xmlData.id,
                isReversal: direction,
                oldReversal: wallData.WallData.reversal
            };
            this.setChangeMapData(nowKey + offset, changeData);
            return;
        }
        if (!cachePos.equals(showPos) || direction !== caseData.WallData.reversal) {
            this.updateChangeData(cachePos, showPos, direction, true, offset, cacheOffset);
        }
    };

    setDeleteData = (key: number, isWall: boolean = false) => {
        let mapData = this.getDataFromMap(key);
        let keys;
        let caseData: IShelves;
        if (isWall) {
            caseData = mapData.WallData;
            keys = caseData.reversal ? caseData.id + WallFactor.WallFactor : caseData.id;
        } else {
            caseData = mapData.CaseData;
            keys = caseData.id;
        }
        this.futureDeleteData.set(keys, {
            oldKey: caseData.id,
            xmlId: mapData.xmlData.id,
            newKey: 0,
            isReversal: caseData.reversal,
            oldReversal: caseData.reversal,
        });
    };

    getFutureChangeData(key: number) {
        return this.futureChangeData.get(key);
    }

    deleteFutureChangeData(key: number) {
        this.futureChangeData.delete(key);
    }

    changeToDecorate = () => {
        ClientEvents.SWITCH_DECORATE.emit(false);
        ClientEvents.HIDE_MAINUI_REDBUBBLE.emit();
        MapMgr.setMapState(FutureState.DECORATE);
        ClientEvents.GO_FRIEND_HOME.emit();
        this.initLimitGridData();
        this.decorateState = true;
        ClientEvents.MAP_CLEAR_PEOPLE.emit();
        this.mapItemMap.forEach((value) => {
            let script: FutureFather = this.getScript(value);
            script && script.decorateMode();
            let bubbleScript = value.Node.getComponent(ShelvesBubble);
            bubbleScript && bubbleScript.decorateHideBubble();
        });
    };

    changeToSpecialMove = () => {
        ClientEvents.SWITCH_DECORATE.emit(false);
        ClientEvents.HIDE_MAINUI_REDBUBBLE.emit();
        MapMgr.setMapState(FutureState.SPECIAL_MOVE);
        ClientEvents.GO_FRIEND_HOME.emit();
        this.initLimitGridData();
        ClientEvents.MAP_CLEAR_PEOPLE.emit();
        this.mapItemMap.forEach((value) => {
            let script: FutureFather = this.getScript(value);
            script && script.specialMoveMode();
            let bubbleScript = value.Node.getComponent(ShelvesBubble);
            bubbleScript && bubbleScript.decorateHideBubble();
        });
    };

    changeToGround = () => {
        this.mapItemMap.forEach((value) => {
            let node: cc.Node = value.Node;
            node.active = !node.active;
        });
    };

    leaveDecorate = () => {
        ClientEvents.BACK_HOME.emit();
        ClientEvents.SWITCH_DECORATE.emit(true);
        UIMgr.hideAllPopularityBubble();
        MapMgr.setMapState(FutureState.NORMAL);
        this.decorateState = false;
        this.mapItemMap.forEach((value) => {
            let script: FutureFather = this.getScript(value);
            script && script.leaveDecorate();
            let bubbleScript = value.Node.getComponent(ShelvesBubble);
            bubbleScript && bubbleScript.leaveDecorateShowBubble();
        });
    };

    getScript = (value: CacheCaseData) => {
        return value.Node.getComponent(FutureFather);
    };

    updateMap(cacheKey: number, useWidth: number, useHeight: number, itemInMapPos: cc.Vec2, direction: boolean, xmlData: IDecoShopJson, node: cc.Node, cb: Function) {
        let showPos = ChangePosition.trueUseOrShowUse(useWidth, direction, itemInMapPos, null);
        let cachePos = CommonUtil.keyToPos(cacheKey);
        let nowKey = CommonUtil.posToKey(showPos);
        let data = this.getDataFromMap(cacheKey);
        cb && cb(nowKey);
        if (!data) {
            let itemData: IShelves = {
                id: 0,
                reversal: direction,
                x: showPos.x,
                y: showPos.y,
                xmlId: xmlData.id,
                goldIncome: 0,
            };
            let cacheData: CacheCaseData = {xmlData: xmlData, Node: node, CaseData: itemData};
            this.addItemDataMapOne(nowKey, cacheData);
            this.setChangeMapData(nowKey, {
                oldKey: 0,
                newKey: nowKey,
                xmlId: xmlData.id,
                isReversal: direction,
                oldReversal: cacheData.CaseData.reversal,
            });
            return;
        }
        if (!showPos.equals(cachePos)) {
            this.updateChangeData(cachePos, showPos, direction);
        } else {
            if (data.CaseData.reversal != direction) {
                this.updateChangeData(cachePos, showPos, direction);
            }
        }
    }

    removeLandFuture(cachePos: cc.Vec2) {
        let cacheKey = CommonUtil.posToKey(cachePos);
        let data = this.getDataFromMap(cacheKey);
        if (data) {
            if (data.CaseData.id != 0) {
                this.setDeleteData(cacheKey);
            }
            if (this.getFutureChangeData(cacheKey)) {
                this.deleteFutureChangeData(cacheKey);
            }
            this.deleteItemDataMapOne(cacheKey);
        }
    }

    refreshCaseData() {
        if (this.mapItemMap) {
            let shelves = DataMgr.iMarket.getShelves();
            shelves.forEach((value) => {
                let data = this.mapItemMap.get(value.getShelvesId());
                if (data) {
                    let caseData = data.CaseData;
                    if (caseData) {
                        data.CaseData = value.getShelvesData();
                    }
                }
            });
        }
    }

    getAllCaseMoney() {
        this.mapItemMap.forEach((value) => {
            let caseData = value.CaseData;
            if (caseData) {
                value.Node.getComponent(ShelvesBubble).moneyBubbleHide();
            }
        });
    }

    getCaseData = (): CaseDetailData[] => {
        let dataArr: CaseDetailData[] = [];
        this.mapItemMap.forEach((value) => {
            let caseData = value.CaseData;
            if (caseData && value.xmlData.mainType === ShelvesType.FeaturesShelve) {
                let reversal = caseData.reversal;
                let id = caseData.id;
                let xmlData = value.xmlData;
                let width = xmlData.acreage[0];
                let useGrid: cc.Vec2[] = [];
                for (let i = 0; i < width; i++) {
                    useGrid.push(cc.v2(reversal ? caseData.x + 1 : caseData.x - i, reversal ? caseData.y - i : caseData.y + 1));
                }
                dataArr.push({
                    id: id,
                    hasSelling: true,
                    reversal: reversal,
                    usePos: useGrid
                });
            }
        });
        return dataArr;
    };

    getChangeDataArr() {
        let itemArray = new Array<SendData>();
        this.futureChangeData.forEach((value: SendData) => {
            itemArray.push(value);
        });
        return itemArray;
    }

    getFutureDeleteArr(itemArray: SendData[]) {
        this.futureDeleteData.forEach((value) => {
            itemArray.push(value);
        });
    }

    upFuture = (datas: ShelvesDataModle[], isFuture: boolean) => {
        let newShelfArr: ShelvesDataModle[] = [];
        let newWallArr: ShelvesDataModle[] = [];
        if (datas) {
            for (let i of datas) {
                let shelfData = i.getShelvesData();
                let data: CacheCaseData;
                if (isFuture) {
                    data = this.mapItemMap.get(shelfData.id);
                } else {
                    let baseKey = CommonUtil.posToKey(cc.v2(shelfData.x, shelfData.y));
                    let offset = shelfData.reversal ? (shelfData.x + 1) * WallFactor.WallFactor : (shelfData.y + 1) * WallFactor.WallFactor;
                    let key = baseKey + offset;
                    data = this.mapItemMap.get(key);
                }
                if (data) {
                    isFuture ? data.CaseData = this.setData(shelfData) : data.WallData = this.setWallData(shelfData);
                } else {
                    isFuture ? newShelfArr.push(i) : newWallArr.push(i);
                }
            }
        }
        this.newShelfArr = newShelfArr.length ? newShelfArr : this.newShelfArr;
        this.newWallArr = newWallArr.length ? newWallArr : this.newWallArr;
    };

    getNewShelfArr() {
        return this.newShelfArr;
    }

    getNewWallArr() {
        return this.newWallArr;
    }

    clearNewArr() {
        this.newShelfArr.splice(0, this.newShelfArr.length);
        this.newWallArr.splice(0, this.newWallArr.length);
    }

    setWallData(itemData: IShelves) {
        return {
            id: itemData.id,
            reversal: itemData.reversal,
            x: itemData.x,
            xmlId: itemData.xmlId,
            y: itemData.y,
            startTime: itemData.startTime ? itemData.startTime : undefined
        };
    }

    setData = (itemData: IShelves) => {
        return {
            id: itemData.id,
            reversal: itemData.reversal,
            x: itemData.x,
            xmlId: itemData.xmlId,
            y: itemData.y,
            goldIncome: typeof (itemData.goldIncome) === "number" ? itemData.goldIncome : undefined,
            sumExp: typeof (itemData.sumExp) === "number" ? itemData.sumExp : undefined,
            startTime: itemData.startTime ? itemData.startTime : undefined
        };
    };

    upDateMapItemAllData() {
        this.upFuture(DataMgr.iMarket.getShelves(), true);
        this.upFuture(DataMgr.iMarket.getWallDeco(), false);
    }

    //收取所有同种类的家具的收益

    collectKindCaseMoney(subType: number, node: cc.Prefab) {
        this.mapItemMap.forEach((value) => {
            let aniNode = MapMgr.getMoneyAniNode(node);
            let xmlData = value.xmlData;
            if (xmlData.subType === subType) {
                let caseData = value.CaseData;
                let node = value.Node;
                node.active = true;
                node.getComponent(ShelvesBubble).collectHideMoneyBubble(aniNode, node.scaleX);
                caseData.goldIncome = 0;
            }
        });
    }

    /**
     * 家具数据map管理模块结束
     */

    /**
     * 地板数据管理块
     */

    setFloorData(key: number, value: number) {
        this.floorDataMap.set(key, {key: key, value: value});
    }

    setFloorDataByPos(pos: cc.Vec2, value: number) {
        let key = CommonUtil.posToKey(pos);
        this.floorDataMap.set(key, {key: key, value: value});
        this.floorChangeDataMap.set(key, value);
    }

    getOneFloorData(pos: cc.Vec2) {
        return this.floorDataMap.get(CommonUtil.posToKey(pos));
    }

    getFloorChangeData() {
        let data = Object.create(null);
        this.floorChangeDataMap.forEach((value: any, key: any) => {
            data[key] = value;
        });
        return JSON.stringify(data);
    }

    getMapAndFloorCount(map: Map<number, number>, xmlId: number, count: number) {
        let data = DataMgr.jsonDatas.decoShopJsonData;
        let defaultId = MapMgr.getDefaultNum();
        this.floorDataMap.forEach((value, key) => {
            if (value.value === xmlId) {
                let position = CommonUtil.keyToPos(key);
                MapMgr.changeOneNodeFloor(position, data[defaultId]);
                this.setFloorDataByPos(position, defaultId);
                map.set(key, MapMgr.getDefaultNum());
                count++;
            }
        });
        return count;
    }

    getChangeAllCount(xmlId: number, count: number, backMap: Map<number, number>) {
        this.floorDataMap.forEach((value) => {
            let id = value.value;
            if (id == xmlId) {
                count++;
            }
            if (id !== xmlId && id !== MapMgr.getDefaultNum()) {
                let counts = backMap.get(id);
                counts = counts ? counts + 1 : 1;
                backMap.set(id, counts);
            }
        });
        return count;
    }

    oneSetChangeFloor(xmlId: number) {
        this.floorDataMap.forEach((value, key) => {
            value.value = xmlId;
            this.floorChangeDataMap.set(key, value.value);

        });
    }

    getChangeFloorData() {
        return this.floorChangeDataMap;
    }

    getFloorData() {
        return this.floorDataMap;
    }

    getGroundCloseGrid() {
        return this.shelfCloseGrid;
    }

    clearNowFloor() {
        this.floorDataMap.forEach((value, key) => {
            let pos = CommonUtil.keyToPos(key);
            MapMgr.clearOneFloorSpriteFrame(pos);
        });
    }

    /**
     * 设置已被占用区域板块，包括墙上跟地面
     */

    setShelfCloseGrid(useHeight: number, useWidth: number, direction: boolean, showPos: cc.Vec2, surface: number) {
        for (let a = 0; a < useHeight; a++) {
            for (let j = 0; j < useWidth; j++) {
                let pos = cc.v2(showPos.x - (!direction ? j : a),
                    showPos.y - (!direction ? a : j));
                this.setShelfGrid(pos);
            }
        }
        for (let i = 0; i < surface; i++) {
            for (let j = 0; j < useWidth; j++) {
                let pos: cc.Vec2;
                if (i === 1) {
                    pos = cc.v2(showPos.x - (direction ? useHeight : j),
                        showPos.y - (direction ? j : 1));
                    this.pushInfluenceGrid(pos);
                    continue;
                }
                pos = cc.v2(showPos.x + (direction ? 1 : -j),
                    showPos.y + (direction ? -j : 1));
                this.pushInfluenceGrid(pos);
            }
        }
    }

    deleteShelfCloseGrid(pos: cc.Vec2) {
        this.shelfCloseGrid.delete(CommonUtil.posToKey(pos));
    }

    isOnShelfClose(pos: cc.Vec2) {
        return !!this.shelfCloseGrid.get(CommonUtil.posToKey(pos));
    }

    setShelfGrid(pos: cc.Vec2) {
        this.shelfCloseGrid.set(CommonUtil.posToKey(pos), pos);
    }

    pushInfluenceGrid(pos: cc.Vec2) {
        let key = CommonUtil.posToKey(pos);
        let count = this.influenceGrid.get(key);
        if (!count) {
            this.influenceGrid.set(key, {count: 1});
            this.nowUseNode += 1;
        } else {
            count.count++;
        }
    }

    setChangeMapData(key: number, data: SendData) {
        this.futureChangeData.set(key, data);
    };

    checkInCloseAndInfluence(cb: Function, showPos: cc.Vec2, node: cc.Node) {
        let key = CommonUtil.posToKey(showPos);
        let result = false;
        let count = this.influenceGrid.get(key);
        if (count) {
            result = true;
            cb(result, node);
        }
    }

    deleteInfluences(pos: cc.Vec2) {
        let key = CommonUtil.posToKey(pos);
        let count = this.influenceGrid.get(key);
        if (count) {
            if (count.count - 1 <= 0) {
                this.influenceGrid.delete(key);
                this.nowUseNode -= 1;
            } else {
                count.count--;
            }
        }
    }

    checkWallCachePos(width: number, height: number, landScape: boolean, pos: cc.Vec2, landValue: number, highLightArr: cc.Node[], red: cc.SpriteFrame, green: cc.SpriteFrame) {
        let result = true;
        for (let i = 0; i < width; i++) {
            let positionKey = CommonUtil.posToKey(CacheMapDataManager.wallPosition(landScape, pos, i)) + landValue * WallFactor.WallFactor;
            let sprite = highLightArr[i].getComponent(cc.Sprite);
            let data = this.wallCloseGrid.get(positionKey);
            if (data) {
                sprite.spriteFrame = red;
                result = false;
            } else {
                sprite.spriteFrame = green;
            }
        }
        return result;
    }

    static wallPosition(landScape: boolean, position: cc.Vec2, i: number): cc.Vec2 {
        return landScape
            ? cc.v2(position.x - i - 1, position.y - 1)
            : cc.v2(position.x - 1, position.y - i - 1)
    };

    deleteWallCloseGrid = (position: cc.Vec2, width: number, landScape: boolean, landValue: number) => {
        for (let i = 0; i < width; i++) {
            let key = CommonUtil.posToKey(CacheMapDataManager.wallPosition(landScape, position, i)) + landValue * WallFactor.WallFactor;
            this.wallCloseGrid.delete(key);
        }
    };

    setWallCloseGrid(width: number, landScape: boolean, position: cc.Vec2, landValue: number) {
        for (let i = 0; i < width; i++) {
            let key = CommonUtil.posToKey(CacheMapDataManager.wallPosition(landScape, position, i));
            this.wallCloseGrid.set(key + landValue * WallFactor.WallFactor, {pos: position, landValue: landValue});
        }
    }

    removeHighLight = (arr: cc.Node[]) => {
        if (arr.length > 0) {
            for (let i of arr) {
                this.backHighlightToPool(i);
            }
            arr.splice(0, arr.length);
        }
    };

    setDefaultCloseGrid() {
        CacheMapDataManager.Default_CloseGrid.forEach((value) => {
            let key = CommonUtil.posToKey(value);
            this.shelfCloseGrid.set(key, value);
        });
        CacheMapDataManager.DoorCloseGrid.forEach((value) => {
            let key = CommonUtil.posToKey(value);
            this.shelfCloseGrid.set(key, value);
        });
        for (let i = 0; i < 6; i++) {
            this.pushInfluenceGrid(cc.v2(22 - i, 21));
        }
    }

    clearWallCloseGrid() {
        this.wallCloseGrid.clear();
    }

    /**
     * 被占用方块板块结束
     */

    /**
     * 轮训的售卖检测
     */

    checkHasSaleGoods = () => {
        if (this.mapItemMap) {
            if (MapMgr.getMapState() === FutureState.NORMAL) {
                let iMarket = DataMgr.iMarket;
                let marketData = iMarket.getShelves();
                let goldProduct = iMarket.getDecoGoldProfit();
                if (marketData) {
                    marketData.forEach((value) => {
                        let shelfData = value.getShelvesData();
                        let key = CommonUtil.posToKey(cc.v2(shelfData.x, shelfData.y));
                        let itemData = this.mapItemMap.get(key);
                        if (itemData) {
                            let node = itemData.Node;
                            let script = UIUtil.getComponent(node, ShelvesBubble);
                            if (shelfData.goldIncome > 0) {
                                script.saleGoodsShowBubble(node.scaleX, shelfData.goldIncome);
                            } else {
                                script.moneyBubbleHide();
                            }
                            itemData.CaseData = shelfData;
                        }
                    });
                }
                let key = CommonUtil.posToKey(cc.v2(21, 23));
                let data = this.mapItemMap.get(key);
                if(data){
                    let node = data.Node;
                    let script = node.getComponent(ShelvesBubble);
                    if(goldProduct > 0) {
                        script.saleGoodsShowBubble(node.scaleX, goldProduct);
                    } else {
                        script.moneyBubbleHide();
                    }
                }
            }
        }
    };

    setNowPopularityValue() {
        this.nowPopularity = DataMgr.iMarket.getPopularity();
    }

    getNowPopularity() {
        return this.nowPopularity;
    }

    addPopularity() {
        let maxPopularity: number = DataMgr.iMarket.getMaxPopularity();
        if (this.truePopularityValue > maxPopularity) {
            this.nowPopularity = maxPopularity;
        } else {
            this.nowPopularity = this.truePopularityValue;
        }
    }

    addTruePopularity(value: number) {
        this.truePopularityValue += value;
    }

    checkUseGrid() {
        let useGrid = 0;
        this.mapItemMap.forEach((value) => {
            let xmlData = value.xmlData;
            if (value.CaseData) {
                useGrid += this.getUseGrid(xmlData, false);
            }
        });
        this.nowUseNode = useGrid + this.influenceGrid.size;
    }

    clearUseGrid() {
        this.nowUseNode = 0;
        this.maxNode = 0;
    }

    getAllNodeCount() {
        let base = 8 * 8;
        let expandTime = DataMgr.iMarket.getExFrequency();
        let expandCount = expandTime * 16;
        this.maxNode = base + expandCount;
    }

    addUseGrid(xmlData: IDecoShopJson, isLess: boolean, isChangeMarket: boolean = false) {
        if (!isChangeMarket) {
            this.nowUseNode += this.getUseGrid(xmlData, isLess);
            this.valueWithPercentCheck();
        }
    }

    valueWithPercentCheck() {
        let percent = this.getPercent();
        if (this.hasLocked) {
            if (percent >= this.usePercentLimit) {
                this.nowPopularity = this.truePopularityValue < this.nowPopularity ? this.truePopularityValue : this.nowPopularity;
            } else {
                let maxValue = DataMgr.iMarket.getMaxPopularity();
                this.nowPopularity = this.truePopularityValue > maxValue ? maxValue : this.truePopularityValue;
                this.hasLocked = false;
            }
        } else {
            if (percent >= this.usePercentLimit) {
                UIMgr.showView(MarketState.url);
                this.hasLocked = true;
                ClientEvents.RESET_LIMIT_WARN.emit();
            } else {
                this.addPopularity();
            }
        }
        ClientEvents.REFRESH_COUNT_AND_VALUE.emit();
    }

    clearCashierSprite() {
        this.mapItemMap.forEach((value) => {
            if (value.xmlData.mainType === ShelvesType.CheckoutShelve) {
                value.Node.getChildByName("futureItem").getComponent(cc.Sprite).spriteFrame = null;
            }
        });
    }

    resetCashierSprite() {
        this.mapItemMap.forEach((value) => {
            if (value.xmlData.mainType === ShelvesType.CheckoutShelve) {
                value.Node.getComponent("Shelves").getFutureFrame(0, false, MapMgr.getFutureId());
            }
        });
    }

    getLockedState() {
        return this.hasLocked;
    }

    getUseGrid(xmlData: IDecoShopJson, isLess: boolean) {
        let width = xmlData.acreage[0];
        let height = xmlData.acreage[1];
        let result = width * height;
        return isLess ? -result : result;
    }

    getPercent() {
        this.getAllNodeCount();
        return this.nowUseNode / this.maxNode;
    }

    initHasLocked() {
        let percent = this.getPercent();
        this.hasLocked = (percent >= this.usePercentLimit);
    }

    initTrueValue() {
        this.truePopularityValue = 0;
        let allJson = JsonMgr.getShopJson();
        this.mapItemMap.forEach((value) => {
            this.truePopularityValue += value.xmlData.Popularity;
        });
        this.floorDataMap.forEach((value) => {
            let jsonData = allJson[value.value];
            this.truePopularityValue += jsonData.Popularity;
        });
        let wallJson = ExpUtil.getWallXmlData();
        this.truePopularityValue += wallJson.Popularity;
    }

    getTruePopularity() {
        return this.truePopularityValue;
    }

    initLimitGridData() {
        this.checkUseGrid();
        this.getAllNodeCount();
        this.setNowPopularityValue();
        this.initHasLocked();
        this.initTrueValue();
    }

    /**
     * 对象池管理块
     */

    backHighlightToPool(node: cc.Node) {
        this.highlightNodePool.put(node);
    }

    backFloorToNodePool(node: cc.Node) {
        this.floorNodePool.put(node);
    }

    backFutureNodePool(node: cc.Node) {
        this.futureNodePool.put(node);
    }

    backWallNodePool(node: cc.Node) {
        this.wallNodePool.put(node);
    }

    backWallHighlightPool(node: cc.Node) {
        this.wallHighlightPool.put(node);
    }

    /**
     * 对象池管理块结束
     */

    chosenRemoveCB = (cb: Function) => {
        if (this.chosenItem != null) {
            this.chosenItem.removeItem();
        }
        cb && cb();
    };

    checkCanDownCB = (cb: Function) => {
        if (this.chosenItem == null || this.chosenItem.getCanDown()) {
            (this.chosenItem != null) && this.chosenItem.putDown();
            cb && cb();
        }
    };

    checkFloorDown(script: Floors) {
        if (this.chosenFloor === script) {
            return;
        }
        this.chosenFloor && this.chosenFloor.changeGround();
        this.chosenFloor = script;
    }

    clearChosenFloor() {
        this.chosenFloor = null;
    }

    checkBackIsChosen(script: any) {
        if (script == this.chosenItem) {
            this.chosenItem = null;
        }
    }

    //清空数据， 注 这里的清空数据与销毁数据不同，只是将各个对象里的值清空，并不是回收内存
    clearData() {
        this.mapItemMap.clear();
        this.floorDataMap.clear();
        this.shelfCloseGrid.clear();
        this.wallCloseGrid.clear();
        this.influenceGrid.clear();
    }

    //清空改变的数据
    clearChangeData() {
        this.futureChangeData.clear();
        this.futureDeleteData.clear();
        this.floorChangeDataMap.clear();
    }

    clearAllDataMap() {
        this.clearData();
        this.clearChangeData();
        this.chosenItem = null;
        this.chosenFloor = null;
        this.scaleValue = 1.0;
        this.hasMove = false;
    }

    static initIShelfData(xmlId: number, pos): IShelves {
        return {
            xmlId: xmlId,
            id: CommonUtil.posToKey(pos),
            x: pos.x,
            y: pos.y,
            reversal: true
        }
    }

    getDecorateState() {
        return this.decorateState;
    }

    clearWallNode() {
        let keyArr: number[] = [];
        this.mapItemMap.forEach((value, key) => {
            if (value.xmlData.mainType == ShelvesType.WallShelve) {
                value.Node.getComponent(WallDeco).backToPool();
                keyArr.push(key);
            }
        });
        keyArr.forEach((value) => {
            this.mapItemMap.delete(value);
        });
    }

    recoverFutures() {
        if(this.mapItemMap){
            this.mapItemMap.forEach((value) => {
                // value.Node.getComponent(FutureFather).backToPool(true);
                UIUtil.getComponent(value.Node, FutureFather).backToPool(true);
            });
        }
        this.clearAllDataMap();
        this.clearUseGrid();
    }

    initMapArea() {
        this.mapArea.clear();
        let allArea: IArea[] = JsonMgr.getAllArea();
        let exFrequency = DataMgr.iMarket.getExFrequency();
        allArea.filter((area: IArea) => area.exFrequency <= exFrequency)
            .forEach((area: IArea) => {
                let pos = cc.v2(area.x, area.y);
                this.mapArea.add(pos);
            });

        this.diffMapArea();
    }

    diffMapArea() {
        this.shelfCloseGrid.forEach((value) => {
            this.mapArea.delete(value);
        });
        CacheMapDataManager.DoorCloseGrid.forEach((value) => {
            this.mapArea.add(value);
        });
    }

    randomInMarketPos(): cc.Vec2 {
        let mapAreaArr: cc.Vec2[] = this.mapArea.values();
        let index = CommonUtil.getRandomNum(mapAreaArr.length);
        return mapAreaArr[index];
    }

    getMapArea(): HashSet<cc.Vec2> {
        return this.mapArea;
    }

    getCashierPosData(): CashierPosData[] {
        let result: CashierPosData[] = [];
        let cashierData = DataMgr.staffData.getPostStaffs(JobType.cashier);
        CASHIER_POS.forEach((value, key) => {
            let data = cashierData[key];
            let hasCashier = !!data;
            result.push({
                pos: CacheMapDataManager.DoorCloseGrid[key],
                hasCashier: hasCashier,
                reversal: (key + 1) % 2 === 0
            });
        });
        return result;
    }

    setGuidePos(pos: cc.Vec2) {
        this.guideCasePos = pos;
    }

    checkShelfPos(pos: { pos: cc.Vec2, reversal: boolean }[], useWidth: number, useHeight: number, influnce?: number) {
        for (let p of pos) {
            let result = true;
            let reversal = p.reversal;
            let ps = p.pos;
            for (let i = 0; i < useWidth; i++) {
                if (!result) {
                    break;
                }
                for (let j = 0; j < useHeight; j++) {
                    let checkPos = cc.v2(reversal ? ps.x - j : ps.x - i, reversal ? ps.y - j : ps.y - i);
                    let key = CommonUtil.posToKey(checkPos);
                    if (this.shelfCloseGrid.get(key) || this.influenceGrid.get(key)) {
                        result = false;
                        break;
                    }
                }
            }
            if (result) {
                if (influnce) {
                    for (let i = 0; i < useHeight; i++) {
                        let checkPos = cc.v2(reversal ? ps.x + 1 : ps.x - i, reversal ? ps.y - i : ps.y + 1);
                        if (this.shelfCloseGrid.get(CommonUtil.posToKey(checkPos))) {
                            result = false;
                            break;
                        }
                    }
                    if (result) {
                        return ps;
                    }
                } else {
                    return ps;
                }
            }
        }
        return false;
    }

    checkWallPos(pos: { pos: cc.Vec2, reversal: boolean }[], useWidth: number) {
        for (let p of pos) {
            let result = true;
            let reversal = p.reversal;
            let ps = p.pos;
            for (let i = 0; i < useWidth; i++) {
                if (!result) {
                    break;
                }
                let checkPos = cc.v2(reversal ? ps.x : ps.x - i, reversal ? ps.y - i : ps.y);
                let key = CommonUtil.posToKey(checkPos) + (reversal ? ps.x : ps.y) * WallFactor.WallFactor;
                if (this.wallCloseGrid.get(key)) {
                    result = false;
                }
            }
        }
        return false;
    }

    private static instance: CacheMapDataManager = null;

    static _instance() {
        if (CacheMapDataManager.instance == null) {
            CacheMapDataManager.instance = new CacheMapDataManager();
        }
        return CacheMapDataManager.instance;
    }

}

export const CacheMap = CacheMapDataManager._instance();


export interface CacheCaseData {
    CaseData?: IShelves;
    WallData?: IShelves;
    Node: cc.Node;
    xmlData: IDecoShopJson;
}

export interface SendData {
    oldKey: number,
    newKey: number,
    xmlId: number,
    oldReversal: boolean;
    isReversal: boolean
}

export interface Cases {
    pos: cc.Vec2;
    reversal: boolean;
    itemData: IShelves;
}

export interface FloorKeyValue {
    key: number;
    value: number;
}

export interface CaseDetailData {
    usePos: cc.Vec2[];
    hasSelling: boolean;
    id: number;
    reversal: boolean; //当这个为true的时候小人向左为面向货架，反之向右
}

export interface CashierPosData {
    pos: cc.Vec2;
    reversal: boolean; //当这个为true的时候小人向左为面向货架，反之向右
    hasCashier: boolean;
}

export interface WallCloseGridData {
    pos: cc.Vec2;
    landValue: number;
}

export interface IInfluence {
    count: number
}

