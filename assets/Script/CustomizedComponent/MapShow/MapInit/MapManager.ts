/**
 *@Athuor ljx
 *@Date 14:32
 */
import GroundNode from "./GroundNode";
import {CoordinateTranslate, MapWAndH} from "../../../Utils/CoordinateTranslate";
import {CommonUtil} from "../../../Utils/CommonUtil";
import WallPaper from "../FutureItem/WallPaper";
import WallCorner from "../FutureItem/WallCorner";
import {DataMgr} from "../../../Model/DataManager";
import {JsonMgr} from "../../../global/manager/JsonManager";
import {CacheMap, FutureState} from "../CacheMapDataManager";
import {ResManager} from "../../../global/manager/ResManager";
import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {UIMgr} from "../../../global/manager/UIManager";
import MapLoading from "./MapLoading";
import {ExpUtil} from "../Utils/ExpandUtil";
import OutWall from "../FutureItem/OutWall";
import {UIUtil} from "../../../Utils/UIUtil";

class MapManager {

    static instance: MapManager = new MapManager();
    private defaultFloorUrl = ResManager.platformPath("texture/floor/floor_int");
    private baseFloorUrl = ResManager.platformPath("texture/floor/");
    private wallPaperUrl;

    private mapNode: Array<cc.Node> = new Array<cc.Node>();
    private wallNode: Array<cc.Node> = new Array<cc.Node>();
    private cornerNode: Array<cc.Node> = new Array<cc.Node>();
    private outWallNodeArr: Array<cc.Node> = new Array<cc.Node>();
    private nodePool: cc.NodePool = new cc.NodePool();
    private wallPool: cc.NodePool = new cc.NodePool();
    private cornerPool: cc.NodePool = new cc.NodePool();
    private outWallPool: cc.NodePool = new cc.NodePool();
    private getMoneyAniNodePool: cc.NodePool = new cc.NodePool();

    private fatherNode: cc.Node = null;
    private wallPaperLayer: cc.Node = null;

    private prefix: string = ResManager.platformPath("texture/wallPaper/");
    private cacheWallPaperUrl = null;

    private mapState: FutureState = 0;
    private baseFloorXmlData: IDecoShopJson;
    private defaultFloor: number;
    private isLowPhone: boolean = false;
    private expandShowAni: boolean = false;
    private isLoaded: boolean = false;
    private nowFutureId: number = 1;

    longOrderBubbleState: boolean = true;

    setWallLayer(layer: cc.Node) {
        this.wallPaperLayer = layer;
    }

    setIsLoaded(state: boolean) {
        this.isLoaded = state;
    }

    changeMarket() {
        this.nowFutureId++;
    }

    getFutureId() {
        return this.nowFutureId;
    }

    getIsLoaded() {
        return this.isLoaded;
    }

    setExpandShowAni(isDo: boolean) {
        this.expandShowAni = isDo;
    }

    getExpandShowAin() {
        return this.expandShowAni;
    }

    setIsLowPhone(isLow: boolean) {
        this.isLowPhone = isLow;
    }

    getIsLowPhone() {
        return this.isLowPhone;
    }

    setMapState(state: FutureState) {
        this.mapState = state;
    }

    getMapState() {
        return this.mapState;
    }

    mapIsNormal() {
        return this.mapState == FutureState.NORMAL;
    }

    checkBusCanDown() {
        return this.mapState == FutureState.ACCESS || this.mapState == FutureState.NORMAL;
    }

    addOutWallNodeToArr(node: cc.Node) {
        this.outWallNodeArr.push(node);
    }

    getDefaultFloorUrl() {
        return this.defaultFloorUrl;
    }

    getBaseFloorUrl() {
        return this.baseFloorUrl;
    }

    getWallPaperUrl() {
        return this.wallPaperUrl;
    }

    getOutWallUrl(url: string) {
        return ResManager.MAIN_UI + url;
    }

    setWallPaperUrl(url: string) {
        this.wallPaperUrl = this.prefix + url;
    }

    getDefaultNum() {
        if(!this.defaultFloor) {
            this.defaultFloor = JsonMgr.getConstVal("default_floor");
        }
        return this.defaultFloor;
    }

    addNodeToGround(node: cc.Node) {
        this.mapNode.push(node);
    }

    addNodeToWall(node: cc.Node) {
        this.wallNode.push(node);
    }

    addNodeToCorner(node: cc.Node) {
        this.cornerNode.push(node);
    }

    getBaseFloorXmlData() {
        if(!this.baseFloorXmlData) {
            this.baseFloorXmlData = DataMgr.jsonDatas.decoShopJsonData[this.getDefaultNum()];
        }
        return this.baseFloorXmlData;
    }

    initMapNode = (fatherNode: cc.Node, prefab: cc.Prefab, mapInitCB: Function) => {
        this.fatherNode = fatherNode;
        for(let i = 0; i < MapWAndH.HEIGHT + 1; i++) {
            for (let j = 0; j < MapWAndH.WIDTH + 1; j++) {
                let node = CommonUtil.checkEnough(this.nodePool, prefab);
                fatherNode.addChild(node);
                this.addNodeToGround(node);
                node.setPosition(CoordinateTranslate.changeToGLPosition(cc.v2(j, i)));
            }
        }
        mapInitCB && mapInitCB();
    };

    setOneNodeFloor(key: number, xmlData: IDecoShopJson, isShow: boolean = true) {
        let pos = CommonUtil.keyToPos(key);
        let index = pos.y * (MapWAndH.HEIGHT + 1) + pos.x;
        if(!this.mapNode) return;
        let node = this.mapNode[index];
        if(!node) return;
        UIUtil.getComponent(node, GroundNode).changeSprite(xmlData);
        UIUtil.visibleNode(node, isShow);
    }

    showFloor(pos: cc.Vec2) {
        let index = CommonUtil.posToIndex(pos);
        this.mapNode[index].active = true;
    }

    addWallToMap = (prefab: cc.Prefab, pos: cc.Vec2, suffix: string, isShow) => {
        let node = CommonUtil.checkEnough(this.wallPool, prefab);
        node.active = isShow;
        this.addNodeToWall(node);
        this.fatherNode.addChild(node);
        let glPos = CoordinateTranslate.changeToGLPosition(cc.v2(pos.x + 1, pos.y + 1));
        node.setPosition(glPos);
        node.getComponent(WallPaper).init(suffix);
    };

    addWallCorner = (prefab: cc.Prefab, pos: cc.Vec2, suffix: string, isShow) => {
        let node = CommonUtil.checkEnough(this.cornerPool, prefab);
        node.active = isShow;
        this.addNodeToCorner(node);
        this.fatherNode.addChild(node);
        let glPos = CoordinateTranslate.changeToGLPosition(cc.v2(pos.x + .5, pos.y + .5));
        node.setPosition(glPos);
        node.getComponent(WallCorner).init(suffix);
    };

    showAllWallPaper() {
        this.wallNode.forEach((value) => {
            value.active = true;
        });
        this.cornerNode.forEach((value) => {
            value.active = true;
        });
    }

    showOutWall() {
        this.outWallNodeArr.forEach((value) => {
            value.active = true;
        });
    }

    changeOneNodeFloor(pos: cc.Vec2, xmlData: IDecoShopJson) {
        let index = CommonUtil.posToIndex(pos);
        let node = this.mapNode[index];
        node.getComponent(GroundNode).changeSprite(xmlData);
    }

    getFloorByPos(pos: cc.Vec2) {
        let index = CommonUtil.posToIndex(pos);
        return this.mapNode[index];
    }

    changeBaseUrl(xmlData: IDecoShopJson) {
        CacheMap.clearCashierSprite();
        this.cacheWallPaperUrl = this.wallPaperUrl;
        this.setWallPaperUrl(xmlData.pattern);
        this.changeWallPaper(0);
        this.changeWallCorner(0);
        CacheMap.resetCashierSprite();

    }

    changeWallPaper = (index: number) => {
        if(index < this.wallNode.length) {
            let script = this.wallNode[index].getComponent(WallPaper);
            script.changeSprite(index, this.changeWallPaper);
        } else {
            let res = cc.loader.getRes(this.cacheWallPaperUrl);
            if(res) {
                cc.loader.releaseResDir(this.cacheWallPaperUrl);
            }
        }
    };

    changeWallCorner = (index: number) => {
        if(index < this.cornerNode.length) {
            let script = this.cornerNode[index].getComponent(WallCorner);
            script.changeSprite(index, this.changeWallCorner);
        }
    };

    getMoneyAniNode(aniNode: cc.Prefab) {
        let node: cc.Node;
        if(this.getMoneyAniNodePool.size() <= 0) {
            node = cc.instantiate(aniNode);
        } else {
            node = this.getMoneyAniNodePool.get();
        }
        return node;
    }

    backMoneyAniNode(node: cc.Node) {
        this.getMoneyAniNodePool.put(node);
    }

    backWallNode() {
        this.backWallNodeToPool();
        this.backCornerToNodePool();
        this.backOutWallToNodePool();
    }

    backAllNode() {
        this.backWallNode();
        this.backGroundNodeToPool();
    }

    hideShowWallNode(show: boolean) {
        this.wallNode.forEach((value) => {
            value.active = show;
        });
    }

    hideShowCornerNode(show: boolean) {
        this.cornerNode.forEach((value) => {
            value.active = show;
        });
    }

    hideShowOutWallNode(show: boolean) {
        this.outWallNodeArr.forEach((value) => {
            value.active = show;
        });
    }

    getOutWallPool() {
        return this.outWallPool;
    }

    clearOneFloorSpriteFrame(pos: cc.Vec2) {
        let index = CommonUtil.posToIndex(pos);
        let node = this.mapNode[index];
        this.clearFloorSprite(node);
    }

    clearFloorSprite(node: cc.Node) {
        node.getComponent(GroundNode).destroySprite();
    }

    backWallNodeToPool() {
        this.wallNode.forEach((value) => {
            value.removeFromParent(false);
            value.getComponent(WallPaper).clearSprite();
            this.wallPool.put(value);
        });
        this.wallNode.splice(0, this.wallNode.length);
    }

    backGroundNodeToPool() {
        this.mapNode.forEach((value) => {
            value.removeFromParent(false);
            this.clearFloorSprite(value);
            this.nodePool.put(value);
        });
        this.mapNode.splice(0, this.mapNode.length);
    }

    backCornerToNodePool() {
        this.cornerNode.forEach((value) => {
            value.removeFromParent(false);
            value.getComponent(WallCorner).clearSprite();
            this.cornerPool.put(value);
        });
        this.cornerNode.splice(0, this.cornerNode.length);
    }

    backOutWallToNodePool() {
        this.outWallNodeArr.forEach((value) => {
            value.removeFromParent(false);
            value.getComponent(OutWall).clearSprite();
           this.outWallPool.put(value);
        });
        this.outWallNodeArr.splice(0, this.outWallNodeArr.length);
    }

    backFloorToNodePool() {
        this.mapNode.forEach((value) => {
            value.getComponent(GroundNode).destroySprite();
            value.removeFromParent(false);
            this.nodePool.put(value);
        });
        this.mapNode.splice(0, this.mapNode.length);
    }

    clearData() {
        this.backWallNode();
        this.backFloorToNodePool();
    }

    goOtherUserHouse(marketId: number) {
        ClientEvents.MAP_CLEAR_PEOPLE.emit(); //在切换自己家和好友家的时候，更新数据时做清理了
        UIMgr.showView(MapLoading.url, null, null, (node: cc.Node) => {
            ClientEvents.EVENT_HIDE_UI.emit(false);
            node.getComponent(MapLoading).init(() => {
                UIMgr.resetViewToMiddle();
                ExpUtil.refreshData();
                ClientEvents.LOAD_NEW_MARKET.emit(marketId);
                MapMgr.setMapState(FutureState.ACCESS);
                ClientEvents.GO_FRIEND_HOME.emit();
            });
        }, false, 1000);
    }
}

export const MapMgr = MapManager.instance;
