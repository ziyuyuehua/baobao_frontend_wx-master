import {DataMgr} from "../../../Model/DataManager";
import {Vertex} from "../../../global/const/StringConst";
import {CacheMap} from "../CacheMapDataManager";
import {MapMgr} from "../MapInit/MapManager";
import {CoordinateTranslate} from "../../../Utils/CoordinateTranslate";
import {UIMgr} from "../../../global/manager/UIManager";
import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {JsonMgr} from "../../../global/manager/JsonManager";
import {CommonUtil} from "../../../Utils/CommonUtil";

export enum OutWallOffset {
    X = 70,
    LEFT_Y = 42,
    RIGHT_Y = 44
}

export enum WallPaperURL {
    WALLPAPER_01 = "wallpaper_01",
    WALLPAPER_02 = "wallpaper_02",
    WALLPAPER_03 = "wallpaper_03",
    WALLPAPER_04 = "wallpaper_04",
    WALLPAPER_05 = "wallpaper_05",
    WALLPAPER_06 = "wallpaper_06",
}

enum ExpandSize {
    BASE_SIZE = 4,
    BASE_MARKET = 8
}


export class ExpandUtil extends cc.Component {
    //定义基础扩建形状次数
    readonly BASE_EXPAND_STEP = 5;
    //可以支持当前形状的扩建次数
    private nowShapeCanExpandTime: number = 0;
    //已经扩建的总次数
    private expandTime: number = 0;
    //当前形状最大扩建次数
    private maxExpand: number = 0;
    //当前形状开始的扩建次数
    private startTime: number = 0;
    //一遍扩建次数
    private sideTime: number = 0;
    //扩建完成的规律单位, 完成一个规律扩建的频率
    private expandSucTime: number = 0;
    //当前规律里，已在当前规律次数中扩建成功次数
    private nowExpandSucTime = 0;

    private left = 0;
    private right = 0;
    private wallXmlData: IDecoShopJson = null;
    private specialArea: Area;
    private normalArea: Area;
    private posArr: cc.Vec2[] = [];

    getExpandSucTime() {
        return this.expandSucTime;
    }

    getNowExpandSucTime() {
        return this.nowExpandSucTime;
    }

    initExpandData = () => {
        this.expandTime = DataMgr.iMarket.getExFrequency();
        this.initWallXmlData();
        this.nowShapeCanExpandTime = this.getNowShapeData();
        this.setSideTime();
        this.getLeftAndRightLen();
        this.initArea();
    };

    initWallXmlData() {
        let xmlId: number = DataMgr.iMarket.getWallPaper();
        this.wallXmlData = DataMgr.jsonDatas.decoShopJsonData[xmlId];
        if (this.wallXmlData) {
            MapMgr.setWallPaperUrl(this.wallXmlData.pattern);
        }
    }

    refreshData() {
        this.expandTime = 0;
        this.startTime = 0;
        this.maxExpand = 0;
        this.sideTime = 0;
        this.expandSucTime = 0;
        this.nowExpandSucTime = 0;
        this.left = 0;
        this.right = 0;
        this.nowShapeCanExpandTime = 0;
        this.specialArea = null;
    }

    getNowShapeData() {
        let time = this.BASE_EXPAND_STEP;
        this.maxExpand = this.BASE_EXPAND_STEP;
        while (this.maxExpand <= this.expandTime) {
            time += 2;
            this.expandSucTime++;
            this.startTime = this.maxExpand;
            this.maxExpand = this.maxExpand + time;
        }
        return time;
    }

    getWallXmlId(): number {
        return this.wallXmlData.id;
    }

    setSideTime() {
        let time = this.maxExpand - this.startTime;
        this.sideTime = Math.floor(time / 2);
        this.nowExpandSucTime = this.expandTime - this.startTime;
    }

    //地板的初始化，扩建要另写
    initFloor() {
        let floor = DataMgr.iMarket.getFloor();
        let floorXml: IDecoShopJson = DataMgr.jsonDatas.decoShopJsonData;
        for (let i = 0; i < floor.length; i++) {
            let data = floor[i];
            let xmlData: IDecoShopJson = floorXml[data.value];
            CacheMap.setFloorData(data.key, data.value);
            MapMgr.setOneNodeFloor(data.key, xmlData);
        }
    }

    expandSetFloor() {
        let floorArr = JsonMgr.getExpandArea();
        this.posArr = floorArr;
        let floorXml = JsonMgr.getDefaultFloorXmlData();
        floorArr.forEach((value) => {
            let key = CommonUtil.posToKey(value);
            CacheMap.setFloorData(key, floorXml.id);
            MapMgr.setOneNodeFloor(CommonUtil.posToKey(value), floorXml, false);
        });
    }

    showExpandFloor() {
        this.posArr.forEach((value) => {
            MapMgr.showFloor(value);
        });
    }

    oneSetFloor(xmlData: IDecoShopJson) {
        let floor = CacheMap.getChangeFloorData();
        floor.forEach((value, key) => {
            MapMgr.setOneNodeFloor(key, xmlData);
        });
    }

    initWallPaper(prefab: cc.Prefab, cornerPrefab: cc.Prefab, isShow: boolean = true) {
        if (this.expandTime == this.startTime || this.expandTime == 0 || this.nowExpandSucTime === this.sideTime) {
            this._normalInit(prefab, cornerPrefab, isShow);
            return;
        }
        let normalCb: Function;
        let suffix: string = null;
        let pos: cc.Vec2;
        if (this.nowExpandSucTime >= this.sideTime) {
            suffix = WallPaperURL.WALLPAPER_03;
            normalCb = (index: number) => {
                MapMgr.addWallToMap(prefab, cc.v2(Vertex.VERTEX_X - this.left, Vertex.VERTEX_Y - this.right + index + 1), suffix, isShow);
            };
            pos = cc.v2(Vertex.VERTEX_X - this.left, Vertex.VERTEX_Y);
            this._specialSetTile(pos, WallPaperURL.WALLPAPER_01, this.right, normalCb, prefab, cornerPrefab, isShow);
        } else {
            suffix = WallPaperURL.WALLPAPER_04;
            normalCb = (index: number) => {
                MapMgr.addWallToMap(prefab, cc.v2(Vertex.VERTEX_X - this.left + index + 1, Vertex.VERTEX_Y - this.right), suffix, isShow);
            };
            pos = cc.v2(Vertex.VERTEX_X, Vertex.VERTEX_Y - this.right);
            this._specialSetTile(pos, WallPaperURL.WALLPAPER_02, this.left, normalCb, prefab, cornerPrefab, isShow);
        }

    }

    _normalInit(wallPrefab: cc.Prefab, cornerPrefab: cc.Prefab, isShow) {
        MapMgr.addWallCorner(cornerPrefab, cc.v2(Vertex.VERTEX_X - this.left + 1, Vertex.VERTEX_Y - this.right + 1), WallPaperURL.WALLPAPER_05, isShow);
        for (let i = 1; i < this.right - 1; i++) {
            MapMgr.addWallToMap(wallPrefab, cc.v2(Vertex.VERTEX_X - this.left, Vertex.VERTEX_Y - this.right + 1 + i), WallPaperURL.WALLPAPER_03, isShow);
        }
        for (let i = 1; i < this.left - 1; i++) {
            MapMgr.addWallToMap(wallPrefab, cc.v2(Vertex.VERTEX_X - this.left + 1 + i, Vertex.VERTEX_Y - this.right), WallPaperURL.WALLPAPER_04, isShow);
        }
        MapMgr.addWallToMap(wallPrefab, cc.v2(Vertex.VERTEX_X - this.left, Vertex.VERTEX_Y), WallPaperURL.WALLPAPER_01, isShow);
        MapMgr.addWallToMap(wallPrefab, cc.v2(Vertex.VERTEX_X, Vertex.VERTEX_Y - this.right), WallPaperURL.WALLPAPER_02, isShow);
    }

    getLeftAndRightLen() {
        let rim = ExpandSize.BASE_SIZE * this.expandSucTime + ExpandSize.BASE_MARKET;
        if (this.nowExpandSucTime < this.sideTime) {
            this.left = rim;
            this.right = rim;
        } else {
            this.left = rim + ExpandSize.BASE_SIZE;
            this.right = rim;
        }
    }

    _specialInit(wallPrefab: cc.Prefab, cornerPrefab: cc.Prefab, isShow: boolean) {
        let isOut = this.nowExpandSucTime > this.sideTime;
        let specialLen = isOut ? this.nowExpandSucTime - this.sideTime : this.nowExpandSucTime;
        let len = specialLen * ExpandSize.BASE_SIZE - 1;
        let lenM = ExpandSize.BASE_SIZE - 1;
        let len2 = isOut ? this.left - len - 2 : this.right - len - 2;
        let pos1: cc.Vec2 = cc.v2();
        let pos2: cc.Vec2 = cc.v2();
        let suffix: string;
        let cornerX = isOut ? Vertex.VERTEX_X - len : Vertex.VERTEX_X - ExpandSize.BASE_SIZE - this.left + 1;
        let cornerY = isOut ? Vertex.VERTEX_Y - ExpandSize.BASE_SIZE - this.right + 1 : Vertex.VERTEX_Y - len;
        MapMgr.addWallCorner(cornerPrefab, cc.v2(cornerX, cornerY), WallPaperURL.WALLPAPER_05, isShow);
        cornerX = isOut ? Vertex.VERTEX_X - len - 1 - len2 : Vertex.VERTEX_X - this.left + 1;
        cornerY = isOut ? Vertex.VERTEX_Y - this.right + 1 : Vertex.VERTEX_Y - len - 1 - len2;
        MapMgr.addWallCorner(cornerPrefab, cc.v2(cornerX, cornerY), WallPaperURL.WALLPAPER_05, isShow);
        for (let i = 1; i < len; i++) {
            pos1.x = isOut ? Vertex.VERTEX_X - len + i : Vertex.VERTEX_X - ExpandSize.BASE_SIZE - this.left;
            pos1.y = isOut ? Vertex.VERTEX_Y - ExpandSize.BASE_SIZE - this.right : Vertex.VERTEX_Y - len + i;
            suffix = isOut ? WallPaperURL.WALLPAPER_04 : WallPaperURL.WALLPAPER_03;
            MapMgr.addWallToMap(wallPrefab, pos1, suffix, isShow);
        }

        for (let i = 1; i < lenM; i++) {
            suffix = isOut ? WallPaperURL.WALLPAPER_03 : WallPaperURL.WALLPAPER_04;
            let pos = cc.v2(isOut ? Vertex.VERTEX_X - len - 1 : Vertex.VERTEX_X - this.left - lenM + i,
                isOut ? Vertex.VERTEX_Y - this.right - lenM + i : Vertex.VERTEX_Y - len - 1);
            MapMgr.addWallToMap(wallPrefab, pos, suffix, isShow);
        }

        for (let i = 1; i <= len2 - 1; i++) {
            pos2.x = isOut ? Vertex.VERTEX_X - len - 1 - len2 + i : Vertex.VERTEX_X - this.left;
            pos2.y = isOut ? Vertex.VERTEX_Y - this.right : Vertex.VERTEX_Y - len - 1 - len2 + i;
            suffix = isOut ? WallPaperURL.WALLPAPER_04 : WallPaperURL.WALLPAPER_03;
            MapMgr.addWallToMap(wallPrefab, pos2, suffix, isShow);
        }
        suffix = isOut ? WallPaperURL.WALLPAPER_02 : WallPaperURL.WALLPAPER_01;
        let startX = isOut ? Vertex.VERTEX_X : Vertex.VERTEX_X - ExpandSize.BASE_SIZE - this.left;
        let startY = isOut ? Vertex.VERTEX_Y - ExpandSize.BASE_SIZE - this.right : Vertex.VERTEX_Y;
        MapMgr.addWallToMap(wallPrefab, cc.v2(startX, startY), suffix, isShow);
        cornerX = isOut ? Vertex.VERTEX_X - ExpandSize.BASE_SIZE * specialLen : Vertex.VERTEX_X - this.left;
        cornerY = isOut ? Vertex.VERTEX_Y - this.right : Vertex.VERTEX_Y - ExpandSize.BASE_SIZE * specialLen;
        MapMgr.addWallToMap(wallPrefab, cc.v2(cornerX, cornerY), WallPaperURL.WALLPAPER_06, isShow);
    }

    _specialSetTile(firstPos: cc.Vec2, suffix: string, normalSide: number, normalCb: Function, wallPrefab: cc.Prefab, cornerPrefab: cc.Prefab, isShow: boolean) {
        this._specialInit(wallPrefab, cornerPrefab, isShow);
        for (let i = 1; i < normalSide - 1; i++) {
            normalCb(i);
        }
        MapMgr.addWallToMap(wallPrefab, firstPos, suffix, isShow);
    }

    getLeftAndRight() {
        return {left: this.left, right: this.right};
    }

    getOutWallLeftAndRight() {
        if (this.specialArea) {
            if (this.nowExpandSucTime > this.sideTime) {
                return {left: this.left, right: this.right + ExpandSize.BASE_SIZE};
            } else {
                return {left: this.left + ExpandSize.BASE_SIZE, right: this.right}
            }
        } else {
            return this.getLeftAndRight();
        }
    }


    initArea() {
        this.specialArea = this.setSpecialArea();
        this.normalArea = this.setNormalArea();
    }

    setSpecialArea(): Area {
        if (this.expandTime === this.startTime || this.nowExpandSucTime == this.sideTime) {
            return null;
        }
        if (this.nowExpandSucTime <= this.sideTime) {
            let rightDown = cc.v2(Vertex.VERTEX_X - this.left + 1, Vertex.VERTEX_Y);
            let yChange = this.nowExpandSucTime * ExpandSize.BASE_SIZE - 1;
            return this.setSpecialAreaData(rightDown.x, rightDown.y, rightDown.x - ExpandSize.BASE_SIZE, rightDown.y - yChange, "left");
        } else {
            let rightDown = cc.v2(Vertex.VERTEX_X, Vertex.VERTEX_Y - this.right + 1);
            let xChange = (this.nowExpandSucTime - this.sideTime) * ExpandSize.BASE_SIZE - 1;
            return this.setSpecialAreaData(
                rightDown.x, rightDown.y, rightDown.x - xChange, rightDown.y - ExpandSize.BASE_SIZE, "right");
        }
    }

    setSpecialAreaData(maxX: number, maxY: number, minX: number, minY: number, area: string) {
        return {maxX: maxX, maxY: maxY, minX: minX, minY: minY, area: area}
    }

    setNormalArea() {
        return {
            maxX: Vertex.VERTEX_X,
            maxY: Vertex.VERTEX_Y,
            minX: Vertex.VERTEX_X - this.left + 1,
            minY: Vertex.VERTEX_Y - this.right + 1
        }
    }

    getSpecialArea() {
        return this.specialArea;
    }

    getNormalArea() {
        return this.normalArea;
    }

    getWallLimit(): cc.Vec2[] {
        if (this.specialArea) {
            return this.specialLimit();
        } else {
            return [this.normalLimit()];
        }
    }

    specialLimit(): cc.Vec2[] {
        return [cc.v2(this.specialArea.minX, this.specialArea.minY),
            this.specialArea.area == 'left' ?
                cc.v2(this.specialArea.maxX, this.specialArea.minY) :
                cc.v2(this.specialArea.minX, this.specialArea.maxY),
            cc.v2(this.normalLimit())];
    }

    normalLimit() {
        return cc.v2(this.normalArea.minX, this.normalArea.minY);
    }

    getWallXmlData() {
        return this.wallXmlData;
    }

    changeWallPaperData(xmlData: IDecoShopJson) {
        this.wallXmlData = xmlData;
    }

    getNextTimeNodePos() {
        if (this.nowExpandSucTime >= this.sideTime) {
            return cc.v2(22 - (this.nowExpandSucTime - this.sideTime) * ExpandSize.BASE_SIZE + 1, this.normalArea.minY);
        } else {
            return cc.v2(this.normalArea.minX, 23 - this.nowExpandSucTime * ExpandSize.BASE_SIZE + 1);
        }
    }

    getMarketMiddle() {
        let pos = CoordinateTranslate.changeToGLPosition(cc.v2(Vertex.VERTEX_X - this.left / 2, Vertex.VERTEX_Y - this.right / 2));
        let worldPos = UIMgr.getMapNode().convertToWorldSpaceAR(pos);
        ClientEvents.EVENT_RESET_VIEW.emit(worldPos);
    }

    getNorGridCount() {
        return this.expandTime * 16 + 64;
    }

    private static _instance: ExpandUtil = null;

    static instance() {
        if (ExpandUtil._instance == null) {
            ExpandUtil._instance = new ExpandUtil();
        }
        return ExpandUtil._instance;
    }

}

export const ExpUtil = ExpandUtil.instance();


export interface Area {
    maxX: number;
    maxY: number;
    minX: number;
    minY: number;
    area?: string
}