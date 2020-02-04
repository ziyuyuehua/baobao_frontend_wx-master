export enum redBubbleConst {
    SIGN = 1,//广告牌
    LONGORDER = 2,//长途货运
    ORDER = 3,//订单
    WAREHOUSE = 4,//仓库
}

export enum dircetionConst {
    LEFT = 0,//左
    RIGHT = 1,//右
    TOP = 2,//上
    BUTTOM = 3,//下
}

export interface IBubbleInfo {
    bubbleType: number;
    direction: IDirection;
    isShow: boolean;
}

export interface IBubbleType {
    isSign: boolean;
    isLongOrder: boolean;
    isOrder: boolean;
    isWareHouse: boolean;
}

export interface IDirection {
    directionX: number;
    directionY: number;
}