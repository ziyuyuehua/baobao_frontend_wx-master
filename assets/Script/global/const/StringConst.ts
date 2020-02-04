/*
 * @Author: tyq
 * @Date: 2019-01-09
 * @Desc: 事件名及字符串常量枚举定义
 */

//节点路径

export enum PrefabPathConst {
    /**
     * 提示的prefab
     */
    PREFAB_ERROR_TIPS = "Prefab/Util/ErrorTips",
}

export enum CarOrHouse {
    CAR,
    HOUSE
}

//顶点坐标
export enum Vertex {
    VERTEX_X = 22,
    VERTEX_Y = 23,
}

export enum Door {
    DOOR1_X = 20,
    DOOR1_Y = 23,
    DOOR2_X = 19,
    DOOR2_Y = 23,
}

//马路拐角的地块坐标
export enum ROAD_CORNER {
    X = 25,
    Y = 26,
}

export enum SpeedId {
    index = 25
}

export enum NewFutureFactor {
    FACTOR = 10000000000
}

/**
 * 颜色const
 */
export const blackColor: cc.Color = new cc.Color(0, 0, 0);
export const redColor: cc.Color = new cc.Color(174, 34, 2);
export const redColor1: cc.Color = new cc.Color(176, 49, 36);
export const redColor2: cc.Color = new cc.Color(196, 55, 65);
export const redColor3: cc.Color = new cc.Color(231, 104, 74);
export const redColor4: cc.Color = new cc.Color(154, 42, 34);
export const redColor5: cc.Color = new cc.Color(236, 19, 14);

export const greenColor: cc.Color = new cc.Color(76, 112, 25);
export const greenColor1: cc.Color = new cc.Color(134, 176, 36);
export const greenColor2: cc.Color = new cc.Color(23, 170, 50);
export const greenColor3: cc.Color = new cc.Color(118, 179, 47);
export const greenColor4: cc.Color = new cc.Color(75, 115, 69);


//#31b602
export const miniItemGreen: cc.Color = new cc.Color(49, 182, 2);

export const brownColor: cc.Color = new cc.Color(111, 46, 22);
