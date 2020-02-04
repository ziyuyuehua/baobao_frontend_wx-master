import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {JsonMgr} from "../../global/manager/JsonManager";
import {UIMgr} from "../../global/manager/UIManager";
import {DataMgr} from "../../Model/DataManager";
import {ShelvesDataModle, ShelvesType} from "../../Model/market/ShelvesDataModle";
import {IShelves} from "../../types/Response";
import {CommonUtil} from "../../Utils/CommonUtil";
import {CoordinateTranslate} from "../../Utils/CoordinateTranslate";
import {CompositeDisposable} from "../../Utils/event-kit";
import {UIUtil} from "../../Utils/UIUtil";
import {ButtonMgr} from "../common/ButtonClick";
import ExpandNode from "../ExpandFrame/ExpandNode";
import PopularityUpSuc, {PopulUpSucInter} from "../popularity/PopularityUpSuc";
import CacheMapDataManager, {CacheMap, FutureState, NodeType, OutWallUrl} from "./CacheMapDataManager";
import Floors from "./FutureItem/Floors";
import {FutureFather} from "./FutureItem/FutureFather";
import OutWall from "./FutureItem/OutWall";
import {MapMgr} from "./MapInit/MapManager";
import {MapResMgr} from "./MapResManager";
import {Area, ExpUtil} from "./Utils/ExpandUtil";
import GroundNode from "./MapInit/GroundNode";
import {ChestRes} from "../ExpandFrame/ChestResManager";
import MapAniManager from "./MapAniManager";
import ExpandAnimation from "../ExpandFrame/ExpandAnimation";
import {COUNTERTYPE, DotInst} from "../common/dotClient";
import LoadFutureSmoke from "./LoadFutureSmoke";

const {ccclass, property} = cc._decorator;

export enum SaveState {
    NORMAL_SAVE = "NormalSave",
    SAVE_UN_CLOSE = "SaveUnClose", //保存但不退出装修模式
}

export enum OutWallStartPos {
    LEFT_X = -150,
    RIGHT_X = 50,
    Y = -450,
    OFFSET_X = 50,
    OFFSET_Y = 25
}

@ccclass
export default class MapShow extends cc.Component {

    @property(cc.Prefab)
    private futurePrefab: cc.Prefab = null;
    @property(cc.Prefab)
    private wallPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    private floorPrefab: cc.Prefab = null;
    @property(cc.Node)
    private map: cc.Node = null;
    @property(cc.Prefab)
    private NewFloor: cc.Prefab = null;
    @property(cc.Node)
    private FloorNode: cc.Node = null;//
    @property(cc.Prefab)
    private outWall: cc.Prefab = null;
    @property(cc.Node)
    private outWallLayer: cc.Node = null;//
    @property(cc.Prefab)
    private wallPaper: cc.Prefab = null;
    @property(cc.Prefab)
    private cornerPrefab: cc.Prefab = null;
    @property(cc.Sprite)
    private mapSpriteArr: cc.Sprite[] = [];
    @property(cc.Node)
    private outWallNodeArr: cc.Node[] = [];
    @property(cc.Node)
    private expandNode: cc.Node = null;
    @property(cc.Node)
    private carNode: cc.Node = null;
    @property(cc.Node)
    private houseNode: cc.Node = null;
    @property(cc.Node)
    private futureAndPeopleNode: cc.Node = null;
    @property(cc.Node)
    private wallLayer: cc.Node = null;

    private loadCb: Function = null;
    private dispose: CompositeDisposable = new CompositeDisposable();
    private specialArea: Area = null;
    private normalArea: Area = null;
    private left: number = null;
    private right: number = null;
    private bgHasRelease: boolean = false;
    private isExpandRefresh: boolean = false;
    private firstHasInit: boolean = false;
    private buyItemRest: boolean = false;

    onLoad() {
        UIMgr.setFutureAndPeople(this.futureAndPeopleNode);
        UIMgr.setFloorNode(this.FloorNode);
        UIMgr.setOutWallLayer(this.outWallLayer);
        this._addListener();
    }

    initMap = (cb: Function) => {
        MapMgr.setWallLayer(this.wallLayer);
        UIMgr.setCarNode(this.carNode);
        UIMgr.setHouseNode(this.houseNode);
        ExpUtil.refreshData();
        this.initBg();
        this.loadCb = cb;
        MapMgr.initMapNode(this.FloorNode, this.NewFloor, this.mapShowInitCB);
    };

    initBg() {
        this.mapSpriteArr.forEach((value) => {
            MapResMgr.setMapBgSprite(value, value.node.name);
        });
    }

    mapShowInitCB = () => {
        this.init();
        this._bindEvent();
        this.initSpecialAndNormalArea();
    };

    initSpecialAndNormalArea() {
        this.specialArea = ExpUtil.getSpecialArea();
        this.normalArea = ExpUtil.getNormalArea();
    }

    private _bindEvent() {
        ButtonMgr.addClick(this.node, this.touchEndEvent);
    }

    _addListener() {
        this.dispose.add(ClientEvents.EVENT_FLOORMODE.on(this.changeToGroundMode));
        this.dispose.add(ClientEvents.EVENT_LEAVE_FLOORMODE.on(this.leaveGroundMod));
        this.dispose.add(ClientEvents.ADD_ITEM_TO_MAP.on(this.addItemToMap));
        this.dispose.add(ClientEvents.SAVE_MAP.on(this.saveMap));
        this.dispose.add(ClientEvents.EXPAND_REFRESH.on(this.expandRefreshMap));
        this.dispose.add(ClientEvents.LOAD_NEW_MARKET.on(this.changeMarket));
        this.dispose.add(ClientEvents.PLAY_EXPAND_ANI.on(this.playExpandAni));
        this.dispose.add(ClientEvents.EXPAND_WALL_PAPER.on(this.expandInitWallPaper));
        this.dispose.add(ClientEvents.CHANGE_PHONE_STATE.on(this.changeHuaZhi));
        this.dispose.add(ClientEvents.INSERT_FUTURE_TO_MAP.on(this.insertFutureToMap));
    }

    expandInitWallPaper = () => {
        this.isExpandRefresh = true;
        ExpUtil.initWallPaper(this.wallPaper, this.cornerPrefab, false);
        this.initOutWall(false)
    };

    initLeftAndRight() {
        let leftAndRight = ExpUtil.getOutWallLeftAndRight();
        this.left = leftAndRight.left;
        this.right = leftAndRight.right;
    }

    init() {
        CacheMap.initData();
        this.initMapItem();
    }

    initMapItem() {
        this.loadCb && this.loadCb();
        this.loadCb = null;
        CacheMap.setDefaultCloseGrid();
        ExpUtil.initExpandData();
        this._wallInit();
        ExpUtil.initFloor();
        this.initOutWall();
    }

    initOutWall(isShow: boolean = true) {
        this.initLeftAndRight();
        this.outWallInit(0, cc.v2(OutWallStartPos.RIGHT_X + OutWallStartPos.OFFSET_X, OutWallStartPos.Y + OutWallStartPos.OFFSET_Y), isShow);
    }

    expandRefreshMap = () => {
        ExpUtil.showExpandFloor();
        MapMgr.showAllWallPaper();
        MapMgr.showOutWall();
        UIMgr.getExpandNode().getComponent(ExpandNode).setNodePos();
        UIMgr.hideMask();
        MapMgr.setMapState(FutureState.NORMAL);
        this.insertFutureToMap(false);
    };

    insertFutureToMap = (result: boolean) => {
        this.buyItemRest = result;
        this.futureInit(0, CacheMap.getNewShelfArr(), MapMgr.getFutureId(), CacheMap.getNewWallArr());
    };

    _wallInit() {
        ExpUtil.initWallPaper(this.wallPaper, this.cornerPrefab);
    }

    outWallInit = (index: number, pos: cc.Vec2, isShow: boolean) => {
        let pool = MapMgr.getOutWallPool();
        let nextPos: cc.Vec2;
        let url: string;
        let node: cc.Node;
        if (this.right && index < this.right) {
            node = CommonUtil.checkEnough(pool, this.outWall);
            if (index + 3 == this.right) {
                url = OutWallUrl.OUT_3;
                nextPos = cc.v2(OutWallStartPos.LEFT_X, OutWallStartPos.Y);
                index = 0;
                this.right = 0;
            } else {
                url = OutWallUrl.OUT_1;
                nextPos = cc.v2(pos.x + OutWallStartPos.OFFSET_X, pos.y + OutWallStartPos.OFFSET_Y);
                index++;
            }
        } else if (this.left && index < this.left) {
            node = CommonUtil.checkEnough(pool, this.outWall);
            if (index + 2 == this.left) {
                url = OutWallUrl.OUT_4;
                nextPos = null;
                index = 0;
                this.left = 0;
                if (!this.isExpandRefresh) {
                    ClientEvents.SHOW_NEW_MARKET.emit();
                    this.futureInit(0, DataMgr.iMarket.getShelves(), MapMgr.getFutureId());
                }
                this.isExpandRefresh = false;
            } else {
                url = OutWallUrl.OUT_2;
                nextPos = cc.v2(pos.x - OutWallStartPos.OFFSET_X, pos.y + OutWallStartPos.OFFSET_Y);
                index++;
            }
        }
        if (node) {
            MapMgr.addOutWallNodeToArr(node);
            this.outWallLayer.addChild(node);
            node.getComponent(OutWall).init(url, pos, this.outWallInit, nextPos, index, isShow);
        }
    };

    //分帧加载
    futureInit = (index: number, data: ShelvesDataModle[], id: number, wallData?: ShelvesDataModle[]) => {
        if (MapMgr.getFutureId() !== id) {
            return;
        }
        if (index < data.length) {
            let shelve = data[index].getShelvesData();
            index++;
            this._init(shelve, this.futurePrefab, NodeType.SHELF, () => {
                this.futureInit(index, data, id, wallData);
            }, id);
        } else {
            this.wallInit(0, wallData ? wallData : DataMgr.iMarket.getWallDeco(), id);
        }
    };

    wallInit(index: number, data: ShelvesDataModle[], id: number) {
        if (MapMgr.getFutureId() !== id) {
            return;
        }
        if (index < data.length) {
            let shelve = data[index].getShelvesData();
            index++;
            this._init(shelve, this.wallPrefab, NodeType.WALL, () => {
                this.wallInit(index, data, id);
            }, id);
        } else {
            let iMarket = DataMgr.iMarket;
            let expandTime = iMarket.getExFrequency();
            let sceneId = iMarket.getMarketId();
            let time = expandTime + (sceneId - 1) * 22;
            let jsonData = JsonMgr.getSceneData(time + 1);
            CacheMap.clearNewArr();
            let cb = () => {
                MapResMgr.checkAssetsUse();
                MapMgr.setIsLoaded(true);
                this.node.getComponent(MapAniManager).setOrderStatus();
                UIMgr.hideLoading();
                if (this.firstHasInit) {
                    ClientEvents.MAP_INIT_FINISHED.emit(true);
                }else{
                    if(!DataMgr.isFirstPowerGuide()){
                        ClientEvents.MAP_INIT_FINISHED.emit(true);
                    }
                }
                this.firstHasInit = true;
            };
            if (jsonData && jsonData.shopID == sceneId) {
                let expandNode = UIMgr.getExpandNode();
                if (!expandNode) {
                    UIUtil.dynamicLoadPrefab(ExpandNode.url, (node: cc.Node) => {
                        if (!this.expandNode) return;
                        this.expandNode.addChild(node);
                        UIMgr.setExpandNode(node);
                        let script = node.getComponent(ExpandNode);
                        script.init();
                        cb && cb();
                        DataMgr.iMarket.getExpandChest();
                    });
                } else {
                    let script = expandNode.getComponent(ExpandNode);
                    script.init();
                    cb && cb();
                    DataMgr.iMarket.getExpandChest();
                }

            } else {
                UIMgr.clearExpandNode();
                cb && cb();
            }
        }
    }

    private _init(data: IShelves, prefab: cc.Prefab, type: string, cb: Function = null, id: number) {
        let future = CacheMap.getFutureNode(prefab, type);
        this.futureAndPeopleNode.addChild(future);
        let script: FutureFather = future.getComponent(type);
        if(this.buyItemRest) {
            UIMgr.showView(LoadFutureSmoke.url, future, null, (node: cc.Node) => {
                script.init(data, MapMgr.getMapState(), this.map, () => {
                    cb && cb();
                    script.showUpAni();
                }, id);
                node.getComponent(LoadFutureSmoke).showAni(() => {
                });
                DotInst.clientSendDot(COUNTERTYPE.expandMarket, "18003", data.id.toString(), cc.v2(data.x, data.y).toString());
                UIMgr.resetView(future, null, 0, 0, 0);
            });
            this.buyItemRest = false;
        } else {
            script.init(data, MapMgr.getMapState(), this.map, cb, id);
        }
    }

    touchEndEvent = (event: cc.Event.EventTouch) => {
        if (!CacheMap.getHasMove() && MapMgr.getMapState() == FutureState.GROUND) {
            let mapGlPos = this.futureAndPeopleNode.convertToNodeSpaceAR(event.getLocation());
            let mapPos = CoordinateTranslate.changeToMapPosition(mapGlPos);
            let chooseData = MapMgr.getFloorByPos(mapPos);
            if (chooseData) {
                let id = chooseData.getComponent(GroundNode).getNowXmlId();
                if (id !== -1 && id !== MapMgr.getDefaultNum()) {
                    let node = CacheMap.getFutureNode(this.floorPrefab, NodeType.FLOOR);
                    this.futureAndPeopleNode.addChild(node, 996);
                    let script: Floors = node.getComponent("Floors");
                    script.initFloor(mapPos, id);
                }
            }
        }
        CacheMap.setHasMove(false);
    };

    changeToGroundMode = () => {
        if (MapMgr.getMapState() == FutureState.GROUND) {
            return;
        }
        MapMgr.setMapState(FutureState.GROUND);
        CacheMap.changeToGround();
    };

    leaveGroundMod = () => {
        if (MapMgr.getMapState() != FutureState.GROUND) {
            return;
        }
        MapMgr.setMapState(FutureState.DECORATE);
        CacheMap.changeToGround();
    };

    addItemToMap = (xmlData: IDecoShopJson, type: string) => {
        let node: cc.Node;
        let cb: Function;
        let state = MapMgr.getMapState();
        switch (type) {
            case NodeType.SHELF:
                cb = () => {
                    let pos = this.getPos(xmlData);
                    node = CacheMap.getFutureNode(this.futurePrefab, NodeType.SHELF);
                    let width = xmlData.acreage[0];
                    let height = xmlData.acreage[1];
                    let influence = xmlData.influence;
                    let shelfData = CacheMapDataManager.initIShelfData(xmlData.id, pos ? pos : this.getPosition(width, influence, height));
                    node.parent = this.futureAndPeopleNode;
                    node.getComponent(FutureFather).addItem(shelfData, state, this.map);
                    UIMgr.resetView(node, null, -node.width / 2, node.height / 2);
                };
                break;
            case NodeType.WALL:
                cb = () => {
                    let pos = this.getPos(xmlData);
                    node = CacheMap.getFutureNode(this.wallPrefab, NodeType.WALL);
                    let wallData = CacheMapDataManager.initIShelfData(xmlData.id, pos ? pos : this.getPosition());
                    node.parent = this.futureAndPeopleNode;
                    node.getComponent(FutureFather).addItem(wallData, state, this.map);
                    UIMgr.resetView(node, null, -node.width / 2, node.height / 2);
                };
                break;
            case NodeType.FLOOR:
                node = CacheMap.getFutureNode(this.floorPrefab, NodeType.FLOOR);
                node.parent = this.futureAndPeopleNode;
                let script = node.getComponent(Floors);
                script.addFloor(xmlData, state, this.getPosition(), this.map);
                break;
            case NodeType.WALLPAPER:
                DotInst.clientSendDot(COUNTERTYPE.decoration, "7010", xmlData.id.toString(), DataMgr.getMarketId().toString());
                ClientEvents.BACK_TO_MINI_WARE.emit(ExpUtil.getWallXmlData(), 1);
                MapMgr.changeBaseUrl(xmlData);
                ExpUtil.changeWallPaperData(xmlData);
                break;
        }
        CacheMap.chosenRemoveCB(cb);
    };

    getPos = (xmlData: IDecoShopJson) => {
        let dataArr = this.analysePosString(xmlData.recommendedCoordinate);
        if (dataArr.length === 0) {
            return false;
        }
        let nowExpand: number = DataMgr.iMarket.getExFrequency();
        let len = dataArr.length;
        let posArr: { pos: cc.Vec2, reversal: boolean }[] = [];
        for (let i = 0; i < len; i++) {
            let data = dataArr[i];
            if(nowExpand >= data.expandTime) {
                posArr.push({reversal: !!data.reversal, pos: data.pos});
            }
        }
        if (posArr.length === 0) {
            return false;
        } else {
            return xmlData.mainType !== ShelvesType.WallShelve ? CacheMap.checkShelfPos(posArr, xmlData.acreage[0], xmlData.acreage[1], xmlData.influence) : CacheMap.checkWallPos(posArr, xmlData.acreage[0]);
        }
    };

    private analysePosString(posString: string) {
        let arr: { reversal, pos, expandTime }[] = [];
        if (posString) {
            let analyse = posString.split(";");
            analyse.forEach((value) => {
                let data = value.split(",");
                arr.push({
                    reversal: !!parseInt(data[1]),
                    pos: cc.v2(parseInt(data[2]), parseInt(data[3])),
                    expandTime: parseInt(data[0])
                });
            });
        }
        return arr;
    }

    getPosition = (width: number = 0, influence: number = 0, height: number = 1) => {
        let worldPos = UIMgr.getCanvas().convertToWorldSpaceAR(cc.v2(0, 0));
        let nodePos = this.futureAndPeopleNode.convertToNodeSpaceAR(worldPos);
        let mapPos = CoordinateTranslate.changeToMapPosition(nodePos);
        if (this.specialArea) {
            this.specialCheck(mapPos, width, influence, height);
        } else {
            this.normalCheck(mapPos, width, influence, height);
        }
        return mapPos;
    };

    specialCheck(mapPos: cc.Vec2, width: number, influence: number, height: number) {
        let minX: number;
        let minY: number;
        let maxX: number;
        let maxY: number;
        if (this.specialArea.area == "left") {
            minX = mapPos.y >= this.specialArea.minY ? this.specialArea.minX + height - 1 : this.normalArea.minX + height - 1;
            maxX = this.normalArea.maxX;
            minY = mapPos.x < this.normalArea.minX ? this.specialArea.minY : this.normalArea.minY;
            maxY = this.normalArea.maxY;
        } else {
            minX = mapPos.y < this.normalArea.minY ? this.specialArea.minX + height - 1 : this.normalArea.minX + height - 1;
            maxX = this.normalArea.maxX;
            minY = mapPos.x < this.specialArea.minX ? this.normalArea.minY : this.specialArea.minY;
            maxY = this.normalArea.maxY;
        }
        if (mapPos.x < minX) {
            mapPos.x = minX;
        } else if (mapPos.x >= maxX) {
            mapPos.x = maxX - (influence ? influence : 0);
        }
        if (mapPos.y <= minY) {
            mapPos.y = minY + (width ? width - 1 : 0);
        } else if (mapPos.y > maxY) {
            mapPos.y = maxY;
        }
    }

    saveMap = (cb: Function, isNormalSave: boolean, errCb: Function, timeOutCb: Function) => {
        HttpInst.postData(NetConfig.OPEN_MARKE_FOR_NEW, [], () => {
            let itemArray = CacheMap.getChangeDataArr();
            CacheMap.getFutureDeleteArr(itemArray);
            let floorData = CacheMap.getFloorChangeData();
            let beforPopul = DataMgr.iMarket.getPopularity();
            let popularity: number;
            popularity = CacheMap.getNowPopularity();
            let beforeLevel = JsonMgr.getShelfLevelByPop(DataMgr.iMarket.getPopularity());
            let nowSaleValue = DataMgr.businessOneHour;
            cc.log(itemArray);
            HttpInst.postData(NetConfig.PUSH_MAPMSG, [itemArray, floorData, ExpUtil.getWallXmlId(), 0, popularity], () => {
                CacheMap.upDateMapItemAllData();
                CacheMap.clearChangeData();
                if (isNormalSave) {
                    this.leaveGroundMod();
                    CacheMap.leaveDecorate();
                    DataMgr.iMarket.checkIsLimitWithCase();
                    ClientEvents.SWITCH_DECORATE.emit(true);
                }
                cb && cb();
                MapResMgr.checkAssetsUse();
                if (MapMgr.getMapState() === FutureState.NORMAL) {
                    let curPopul = DataMgr.iMarket.getPopularity();
                    let curLevel = JsonMgr.getShelfLevelByPop(curPopul);
                    if (beforeLevel < curLevel) {
                        let afterSaleValue = DataMgr.businessOneHour;
                        let data: PopulUpSucInter = {
                            beforPop: beforPopul,
                            curPop: curPopul,
                            beforeSaleValue: nowSaleValue,
                            afterSaleValue: afterSaleValue
                        };
                        UIMgr.showView(PopularityUpSuc.url, null, data, null, false, 1002);
                    }
                }
            }, errCb, timeOutCb);
        });
    };

    getItemArray = (itemData: any) => {
        let itemArray = new Array<any>();
        itemData.forEach((value: any) => {
            itemArray.push(value);
        });
        return itemArray;
    };

    getDeleteArray = (itemArray: any, deleteArray: any) => {
        deleteArray.forEach((value) => {
            itemArray.push(value);
        });
    };

    normalCheck(mapPos: cc.Vec2, width: number, influence: number, height: number) {
        let minX = this.normalArea.minX;
        let minY = this.normalArea.minY;
        let maxX = this.normalArea.maxX;
        let maxY = this.normalArea.maxY;
        if (mapPos.x - height + 1 < minX) {
            mapPos.x = minX + height - 1;
        } else if (mapPos.x >= maxX) {
            mapPos.x = maxX - (influence ? influence : 0);
        }
        if (mapPos.y <= minY) {
            mapPos.y = minY + (width ? width - 1 : 0);
        } else if (mapPos.y > maxY) {
            mapPos.y = maxY;
        }
    }

    changeMarket = (id: number) => {
        MapMgr.changeMarket();
        MapMgr.setIsLoaded(false);
        CacheMap.clearNowFloor();
        MapMgr.backWallNode();
        let nowMarketId = DataMgr.iMarket.getMarketId();
        CacheMap.recoverFutures();
        if (id != nowMarketId) {
            MapMgr.backAllNode();
            this.node.removeFromParent();
            this.deleteMapBgAssets();
            this.node.destroy();
            ClientEvents.INIT_NEW_MAP.emit();
        } else {
            ChestRes.destroyNode();
            this.initMapItem();
        }
    };

    deleteMapBgAssets = () => {
        if (!this.bgHasRelease) {
            this.bgHasRelease = true;
            this.mapSpriteArr.forEach((value) => {
                value.spriteFrame = null;
            });
            MapResMgr.releaseMapBgAssets();
        }
    };

    playExpandAni = (cb: Function) => {
        UIUtil.dynamicLoadPrefab(ExpandAnimation.url, (node: cc.Node) => {
            let endCb = () => {
                cb && cb();
            };
            this.node.addChild(node);
            node.setPosition(UIMgr.getExpandNode().position);
            node.getComponent(ExpandAnimation).init(endCb);
        });
    };

    changeHuaZhi = () => {
        UIMgr.showLoading();
        this.firstHasInit = false;

        let mapAniManager = this.node.getComponent(MapAniManager);
        mapAniManager.releaseByPhone();
        if(UIMgr.loadedBigHouse){
            mapAniManager.initByPhone();
        }

        CacheMap.recoverFutures();
        MapResMgr.checkAssetsUse();
        MapMgr.setIsLoaded(false);
        this.futureInit(0, DataMgr.iMarket.getShelves(), MapMgr.getFutureId());
    };

    protected onDestroy(): void {
        UIMgr.changeMarketClearNode();
        this.deleteMapBgAssets();
        this.dispose.dispose();
        ChestRes.destroyNode();
        UIMgr.loadedBigHouse = false;
    }
}

