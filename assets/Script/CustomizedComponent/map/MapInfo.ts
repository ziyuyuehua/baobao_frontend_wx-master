import {astar, Graph, GridNode} from "./Astar";
import {CommonUtil} from "../../Utils/CommonUtil";
import {HashSet} from "../../Utils/dataStructures/HashSet";
import {Door} from "../../global/const/StringConst";
import {MapPeople} from "./MapPeople";
import {CacheMap, Cases} from "../MapShow/CacheMapDataManager";
import {MapOffset, MapWAndH, TileSize} from "../../Utils/CoordinateTranslate";
import {ExpUtil} from "../MapShow/Utils/ExpandUtil";
import {IncidentModel} from "../../Model/incident/IncidentModel";
import {DataMgr} from "../../Model/DataManager";

export enum MapPosType {
    wall = 0,
    empty = 1,
    shelf = MapWAndH.WIDTH,
}

export class MapInfo {

    //超市右下角，以此为基础点计算超市墙壁阻挡A星寻路
    private static MARKET_RIGHT_BOTTOM_POS: cc.Vec2 = cc.v2({x: 23, y: 24});

    private static DOOR_1_POS = cc.v2(Door.DOOR1_X, 24); //20,24
    private static DOOR_2_POS = cc.v2(Door.DOOR2_X, 24); //19,24
    private static DOOR_1_DECO_POS = cc.v2(Door.DOOR1_X, Door.DOOR1_Y); //20,23
    private static DOOR_2_DECO_POS = cc.v2(Door.DOOR2_X, Door.DOOR2_Y); //20,23
    private static DOOR_1_DECO_POS_1 = cc.v2(Door.DOOR1_X, 22); //20,22
    private static DOOR_2_DECO_POS_2 = cc.v2(Door.DOOR2_X, 22); //19, 22

    //门虽然不能放置装饰物，但是却可以让员工A星寻路的
    private static MARKET_OPEN_POS: Array<cc.Vec2> = [
        MapInfo.DOOR_1_POS,
        MapInfo.DOOR_2_POS,
        MapInfo.DOOR_1_DECO_POS,
        MapInfo.DOOR_2_DECO_POS,
        MapInfo.DOOR_1_DECO_POS_1,
        MapInfo.DOOR_2_DECO_POS_2,
    ];

    //理货员去拿货物的仓库门口坐标
    private static TALLY_POS: Array<cc.Vec2> = [
        cc.v2({x: 27, y: 20}),
        cc.v2({x: 28, y: 21}),
        cc.v2({x: 28, y: 22}),
    ];

    static ENEMY_CLOSE_POS: Array<cc.Vec2> = [
        cc.v2({x: 18, y: 22}),
        cc.v2({x: 18, y: 23}),
        cc.v2({x: 18, y: 24}),

        cc.v2({x: 21, y: 22}),
        cc.v2({x: 21, y: 23}),
        cc.v2({x: 21, y: 24}),
    ];

    //巴士站台不可行走区域，避免小人层级问题
    static BUS_STATION_POS: Array<cc.Vec2> = [
        cc.v2({x: 25, y: 17}),
        cc.v2({x: 25, y: 18}),
        cc.v2({x: 25, y: 19}),
        cc.v2({x: 25, y: 20}),
    ];

    private static MIN_INDEX: number = 0;
    private static MAX_INDEX: number = 28;
    contentSize: cc.Size;

    graph: Graph;

    private touterPosSet: HashSet<cc.Vec2> = null;

    private tallymanPosSet: HashSet<cc.Vec2> = null;

    passPosSet: HashSet<cc.Vec2> = null;

    homeLeftPosSet: HashSet<cc.Vec2> = null;
    homeRightPosSet: HashSet<cc.Vec2> = null;
    homePosSet: HashSet<cc.Vec2> = null;

    marketClosePosSet: HashSet<cc.Vec2> = null;

    private mapPeople: MapPeople = null;

    private data: Array<Array<number>> = null;

    initData = (mapPeople: MapPeople) => {
        this.mapPeople = mapPeople;
    };

    init = () => {
        CacheMap.initMapArea();

        let exceptPos: Array<cc.Vec2> = Array.from(CacheMap.getGroundCloseGrid().values());
        let shelfPosSet: HashSet<cc.Vec2> = new HashSet<cc.Vec2>(exceptPos);
        shelfPosSet.deleteArray(MapInfo.MARKET_OPEN_POS);

        let closePosSet: HashSet<cc.Vec2> = this.getMarketClosePosSet(true);
        closePosSet = closePosSet.diff(CacheMap.getMapArea());

        let openPosSet: HashSet<cc.Vec2> = new HashSet<cc.Vec2>();
        openPosSet.addArray(MapInfo.MARKET_OPEN_POS);

        let mapSize = this.getMapSize();
        this.data = new Array<Array<number>>(mapSize.width);
        let pos: cc.Vec2 = cc.v2(0, 0);
        for (let i = 0; i < mapSize.width; i++) {
            this.data[i] = new Array<number>(mapSize.height);
            for (let j = 0; j < mapSize.height; j++) {
                this.data[i][j] = MapPosType.empty;
                pos.x = i;
                pos.y = j;

                if (openPosSet.has(pos)) {
                    continue;
                }

                //DONE 填充二维数组中不能行走的区域
                if (closePosSet.has(pos) || shelfPosSet.has(pos)) {
                    if (closePosSet.has(pos)) {
                        this.data[i][j] = MapPosType.wall; //墙则直接不可通行
                    }
                    if (shelfPosSet.has(pos)) {
                        this.data[i][j] = MapPosType.shelf; //货架则设置权重
                    }
                }
            }
        }
        // cc.log("MapData = ", this.data);
        this.graph = new Graph(this.data);

        // cc.log("e", this.getPosType({x: 15, y: 14}));
        // cc.log("r", this.getPosType({x: 15, y: 15}));
        // cc.log("t", this.getPosType({x: 15, y: 16}));
        // cc.log("e2", this.isShelf({x: 15, y: 14}));
        // cc.log("r2", this.isShelf({x: 15, y: 15}));
        // cc.log("t2", this.isShelf({x: 15, y: 16}));
    };

    search(from: Pos, to: Pos): Array<GridNode> {
        let start = this.graph.grid[from.x][from.y];
        let end = null;
        if (!this.graph.grid[to.x] || !(end = this.graph.grid[to.x][to.y])) {
            return [];
        }
        return astar.search(this.graph, start, end);
    }

    isShelf(pos: Pos) {
        return this.getPosType(pos) == MapPosType.shelf;
    }

    private getPosType(pos: Pos): MapPosType {
        return this.data[pos.x][pos.y];
    }

    calcSide(): number {
        let tileSize = this.getTileSize();
        return Math.sqrt(Math.pow(tileSize.width / 2, 2) + Math.pow(tileSize.height / 2, 2));
    }

    //将tileMap对象层的对象属性坐标转换成地图索引坐标
    objMapPos(mapObj): cc.Vec2 {
        //console.log('objPos=', mapObj.offset.x, ', ', mapObj.offset.y);
        //let mapSize = this.node.getContentSize();
        let side = this.calcSide();
        let x = Math.floor((mapObj.offset.x) / side);
        let y = Math.floor((mapObj.offset.y) / side);
        //console.log(x, y);
        return cc.v2(x, y);
    }

    //将像素坐标转化为90度瓦片坐标
    getTilePos(posInPixel: Pos): cc.Vec2 {
        //console.log('posInPixel=', posInPixel.x, ', ', posInPixel.y);
        let mapSize = this.getContentSize();
        let tileSize = this.getTileSize();
        let x = Math.floor(posInPixel.x / tileSize.width);
        let y = Math.floor((mapSize.height - posInPixel.y) / tileSize.height);
        //console.log(x, y);
        return cc.v2(x, y);
    }

    //地图坐标转GL
    toGLPos(mapPos: Pos): cc.Vec2 {
        //console.log('mapPos=', mapPos.x, ', ', mapPos.y);
        let mapSize = this.getContentSize();
        let tileSize = this.getTileSize();
        let x: number = mapSize.width / 2 + (mapPos.x - mapPos.y) * tileSize.width / 2;
        let y: number = mapSize.height - (mapPos.x + mapPos.y) * tileSize.height / 2;
        //console.log('toGLPos=', x, y);
        return cc.v2(x - MapOffset.X, y - MapOffset.Y);
    }

    //GL转地图坐标，坐标选取使用Math.floor，目的是为了点击方块的时候准确定位到左上角定点坐标
    clickToMapPos(glPos: Pos): cc.Vec2 {
        //console.log('glPos=', glPos.x, ', ', glPos.y);
        let mapSize = this.getContentSize();
        let tileSize = this.getTileSize();
        let x: number = Math.floor((glPos.x + MapOffset.X - mapSize.width / 2) / tileSize.width + (mapSize.height - glPos.y - MapOffset.Y) / tileSize.height);
        let y: number = Math.floor((mapSize.height - glPos.y - MapOffset.Y) / tileSize.height - (glPos.x + MapOffset.X - mapSize.width / 2) / tileSize.width);
        //console.log('toMapPos=', x, y);
        return cc.v2(x, y);
    }

    //GL转地图坐标，坐标选取使用Math.round，目的是为了遮住后面的货架
    toMapPos(glPos: Pos): cc.Vec2 {
        //console.log('glPos=', glPos.x, ', ', glPos.y);
        let mapSize = this.getContentSize();
        let tileSize = this.getTileSize();
        let x: number = Math.round((glPos.x + MapOffset.X - mapSize.width / 2) / tileSize.width + (mapSize.height - (glPos.y + MapOffset.Y)) / tileSize.height);
        let y: number = Math.round((mapSize.height - (glPos.y + MapOffset.Y)) / tileSize.height - (glPos.x + MapOffset.X - mapSize.width / 2) / tileSize.width);
        //console.log('toMapPos=', x, y);
        return cc.v2(x, y);
    }

    getTileSize() {
        return {width: TileSize.width, height: TileSize.height};
    }

    getMapSize() {
        return {width: MapWAndH.WIDTH, height: MapWAndH.HEIGHT};
    }

    getContentSize(): cc.Size {
        if (this.contentSize) {
            return this.contentSize;
        }
        let mapSize = this.getMapSize();
        let tileSize = this.getTileSize();
        this.contentSize = new cc.Size(mapSize.width * tileSize.width, mapSize.height * tileSize.height);
        return this.contentSize;
    }

    static TOUTER_MIN_X = 18;
    static TOUTER_MIN_Y = 21;

    static CUSTOMER_MIN_X = MapInfo.TOUTER_MIN_X + 1;
    static CUSTOMER_MIN_Y = MapInfo.TOUTER_MIN_Y + 1;

    touterRandomPos(curMapPos?: cc.Vec2): cc.Vec2 {
        if (!this.touterPosSet) {
            this.touterPosSet = this.rangePosSet({x: MapInfo.TOUTER_MIN_X, y: 25}, {x: 25, y: 26});
            this.touterPosSet.addAll(this.rangePosSet({x: 24, y: MapInfo.TOUTER_MIN_Y}, {x: 25, y: 24}));
        }

        return this.filterDangerRandomPos(curMapPos, this.touterPosSet);
    }

    //理货员
    tallymanRandomPos(curMapPos?: cc.Vec2): cc.Vec2 {
        if (!this.tallymanPosSet) {
            this.tallymanPosSet = this.rangePosSet({x: 24, y: 3}, {x: 25, y: 8});
        }

        let filterPosSet: HashSet<cc.Vec2> = this.tallymanPosSet;
        if (curMapPos) {
            let exceptPosSet: HashSet<cc.Vec2> = HashSet.oneSet(curMapPos);
            filterPosSet = this.tallymanPosSet.diff(exceptPosSet);
        }

        return this.randomInPosArray(filterPosSet.values());
    }

    outsideCustomerRandomPos(curMapPos: cc.Vec2): cc.Vec2 {
        if (!this.passPosSet) {
            this.passPosSet = this.rangePosSet({x: MapInfo.CUSTOMER_MIN_X, y: 25}, {x: 25, y: 26});
            this.passPosSet.addAll(this.rangePosSet({x: 24, y: MapInfo.CUSTOMER_MIN_Y}, {x: 25, y: 24}));
        }

        return this.filterDangerRandomPos(curMapPos, this.passPosSet);
    }

    private filterDangerRandomPos(curMapPos: cc.Vec2, posSet: HashSet<cc.Vec2>){
        let filterPosSet: HashSet<cc.Vec2> = posSet;
        if (curMapPos) {
            filterPosSet = posSet.diff(HashSet.oneSet(curMapPos));
        }

        let dangerPosSet = this.getDanger3X3PosHashSet();
        if (dangerPosSet) {
            filterPosSet = filterPosSet.diff(dangerPosSet);
        }

        filterPosSet = filterPosSet.diff(new HashSet(this.motorcycleStayPos()));
        return this.randomInPosArray(filterPosSet.values());
    }

    private getDanger3X3PosHashSet(): HashSet<cc.Vec2> {
        let posSet: HashSet<cc.Vec2> = null;
        let incidentsArr: IncidentModel[] = DataMgr.incidentData.getMapIncidents();
        for (let incident of incidentsArr) {
            let incidentPos = incident.getMapPos();
            if (!incidentPos) {
                // cc.error("getMapIncidents getMapPos is null!");
                continue;
            }
            let rangeSet = this.rangePosSet({x: incidentPos.x - 1, y: incidentPos.y - 1}, {
                x: incidentPos.x + 1,
                y: incidentPos.y + 1
            });
            if (!posSet) {
                posSet = rangeSet;
            } else {
                posSet = posSet.union(rangeSet)
            }
        }
        return posSet;
    }

    homeRandomPos(curMapPos: cc.Vec2 = null): cc.Vec2 {
        if (!this.homePosSet) {
            this.homeLeftPosSet = this.rangePosSet({x: 1, y: 25}, {x: 3, y: 26});
            this.homeRightPosSet = this.rangePosSet({x: 24, y: 2}, {x: 25, y: 4});
            this.homePosSet = this.homeLeftPosSet.union(this.homeRightPosSet);
        }

        let filterPosSet: HashSet<cc.Vec2> = this.homePosSet;
        if (curMapPos) {
            let exceptPosSet: HashSet<cc.Vec2> = HashSet.oneSet(curMapPos);
            filterPosSet = this.homePosSet.diff(exceptPosSet);
        }

        return this.randomInPosArray(filterPosSet.values());
    }

    private getMarketClosePosSet(refresh: boolean = false): HashSet<cc.Vec2> {
        if (refresh || !this.marketClosePosSet) {
            let leftAndRight = ExpUtil.getOutWallLeftAndRight();
            //墙壁的宽高需要多1圈所以加1
            let width: number = leftAndRight.left + 1;
            let height: number = leftAndRight.right + 1;

            this.marketClosePosSet = new HashSet<cc.Vec2>();
            this.marketClosePosSet.add(MapInfo.MARKET_RIGHT_BOTTOM_POS);

            for (let i = 0; i <= width; i++) {
                for (let j = 0; j <= height; j++) {
                    let pos: cc.Vec2 = cc.v2(MapInfo.MARKET_RIGHT_BOTTOM_POS.x - i, MapInfo.MARKET_RIGHT_BOTTOM_POS.y - j);
                    this.marketClosePosSet.add(pos);
                }
            }

            this.marketClosePosSet.deleteArray(MapInfo.MARKET_OPEN_POS);
            this.marketClosePosSet.addArray(this.subwayRoadPos());
            this.marketClosePosSet.addArray(this.busRoadPos());
            this.marketClosePosSet.addArray(this.motorcycleStayPos());
            this.marketClosePosSet.addArray(this.customerBlockRoadPos());
            this.marketClosePosSet.addArray(MapInfo.BUS_STATION_POS);
        }
        return this.marketClosePosSet;
    }

    private customerBlockRoadPos(): Array<cc.Vec2> {
        let leftBlock = this.rangePosSet({x: 0, y: 24}, {x: 13, y: 24});
        let rightBlock = this.rangePosSet({x: 20, y: 0}, {x: 20, y: 3});
        leftBlock.addAll(rightBlock);
        return leftBlock.values();
    }

    private motorcycleStayPos(): Array<cc.Vec2> {
        let motorcyclePosSet = this.rangePosSet({x: 21, y: 26}, {x: 24, y: 26});
        return motorcyclePosSet.values();
    }

    private subwayRoadPos(): Array<cc.Vec2> {
        const subwayRoadPos: Array<cc.Vec2> = [];
        for (let i = 8; i <= 28; i++) {
            subwayRoadPos.push(cc.v2(i, 27));
            subwayRoadPos.push(cc.v2(i, 28));
        }
        return subwayRoadPos;
    }

    private busRoadPos(): Array<cc.Vec2> {
        const subwayRoadPos: Array<cc.Vec2> = [];
        for (let i = 8; i <= 28; i++) {
            subwayRoadPos.push(cc.v2(26, i));
            subwayRoadPos.push(cc.v2(27, i));
            subwayRoadPos.push(cc.v2(28, i));
        }
        return subwayRoadPos;
    }

    randomInPosArray(posList: Array<cc.Vec2>): cc.Vec2 {
        if (posList.length <= 0) {
            cc.log("can not found pos to move!");
            return null;
        }
        return posList[CommonUtil.getRandomNum(posList.length)];
    }

    private randomCasePos = (posList: Cases[]) => {
        if (posList.length <= 0) {
            cc.log("cab not found pos to move!");
            return null;
        }
        // cc.log(posList);
        return posList[CommonUtil.getRandomNum(posList.length)];
    };

    randomPosAround(centerPos: cc.Vec2, range: number = 1): cc.Vec2 {
        const aroundPosSet: HashSet<cc.Vec2> = this.aroundPosSet(centerPos, range);
        return aroundPosSet.values()[CommonUtil.getRandomNum(aroundPosSet.size())];
    }

    aroundPosSet(centerPos: cc.Vec2, range: number = 1, exceptCenterPos: boolean = true): HashSet<cc.Vec2> {
        const leftTopX: number = Math.max(centerPos.x - range, MapInfo.MIN_INDEX);
        const leftTopY: number = Math.max(centerPos.y - range, MapInfo.MIN_INDEX);
        const leftTopPos = cc.v2(leftTopX, leftTopY);

        const rightBottomX: number = Math.min(centerPos.x + range, MapInfo.MAX_INDEX);
        const rightBottomY: number = Math.min(centerPos.y + range, MapInfo.MAX_INDEX);
        const rightBottomPos = cc.v2(rightBottomX, rightBottomY);

        return this.rangePosSet(leftTopPos, rightBottomPos, exceptCenterPos ? centerPos : null);
    }

    /**
     * 指定左上角和右下角范围内的坐标集合
     * @param {Pos} leftTopPos
     * @param {Pos} rightBottomPos
     * @param {cc.Vec2} mapPos
     * @returns {HashSet<cc.Vec2>}
     */
    rangePosSet(leftTopPos: Pos, rightBottomPos: Pos, mapPos: cc.Vec2 = null): HashSet<cc.Vec2> {
        let rangePosSet: HashSet<cc.Vec2> = new HashSet<cc.Vec2>();
        for (let i = leftTopPos.x; i <= rightBottomPos.x; i++) {
            for (let j = leftTopPos.y; j <= rightBottomPos.y; j++) {
                rangePosSet.add(cc.v2(i, j));
            }
        }
        if (mapPos) {
            rangePosSet.delete(mapPos);
        }
        return rangePosSet;
    }

    static inTallyPos(pos: cc.Vec2) {
        for (let i = 0; i < MapInfo.TALLY_POS.length; i++) {
            if (MapInfo.TALLY_POS[i].equals(pos)) {
                return true;
            }
        }
        return false;
    }

    static randomTallyPos() {
        return MapInfo.TALLY_POS[CommonUtil.getRandomNum(MapInfo.TALLY_POS.length)];
    }

    static instance: MapInfo = new MapInfo();

}

export const MapInst: MapInfo = MapInfo.instance;

export interface Pos {
    x: number;
    y: number;
}


