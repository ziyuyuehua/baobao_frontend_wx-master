import {IMarketModel} from "../../../Model/market/MarketDataMoudle";
import {DataMgr} from "../../../Model/DataManager";
import {JsonMgr} from "../../../global/manager/JsonManager";
import {Vertex} from "../../../global/const/StringConst";
import {Face, Role} from "../Role";

export namespace CustomerHelper {
    let shelfCount = -1;
    let outsideMaxNum = 0;
    let insideMaxNum = 0;
    let insideMinNum = 0;
    let isLow = undefined;

    function updateCustomerNum() {
        let initManager: IMarketModel = DataMgr.iMarket;
        let curCount = initManager.getHasGoodsCase();
        let low = DataMgr.isLowPhone();
        if (shelfCount != curCount || isLow !== low) {
            shelfCount = curCount;
            isLow = low;
            let data = JsonMgr.getFirstJson<ICustomerNumJson>("customerNum", (e: ICustomerNumJson) => curCount <= e.sellingShelfMax);
            let num = isLow ? data.lowCustomerNum : data.customerNum;
            insideMaxNum = Math.floor(num * data.shoppingCustomerRate / 100);
            outsideMaxNum = num - insideMaxNum;
            insideMinNum = Math.floor(insideMaxNum * 0.8);
        }
    }

    export function getOutsideMaxNum(): number {
        updateCustomerNum();
        return outsideMaxNum;
    }

    export function getInsideMaxNum(): number {
        updateCustomerNum();
        return insideMaxNum;
    }

    export function getInsideMinNum(): number {
        updateCustomerNum();
        return insideMinNum;
    }

    export function getMaxNum(): number {
        updateCustomerNum();
        return outsideMaxNum + insideMaxNum;
    }
}

//点击气泡的奖励是否已达今日最大值
let maxBubbleAwardCount: number = -1;

let bubbleAwardItemId: number = -1;

let curBubbleAwardCount: number = -1;

export function checkBubbleAwardOverMax(): boolean {
    if (maxBubbleAwardCount == -1) {
        let costConfigStr: string = JsonMgr.getConstVal("sceneBubble");
        maxBubbleAwardCount = Number(costConfigStr.split(",")[0]);
        bubbleAwardItemId = Number(costConfigStr.split(",")[1]);
    }
    if (curBubbleAwardCount == -1) {
        curBubbleAwardCount = DataMgr.getBubbleCnt();
    }
    return curBubbleAwardCount >= maxBubbleAwardCount;
}

export function addCurBubbleAwardCount(): number {
    return ++curBubbleAwardCount;
}

export function getBubbleAwardItemId(): number {
    return bubbleAwardItemId;
}

export function isThisMapPosInMarket(thisMapPos: cc.Vec2): boolean {
    return !(thisMapPos.x > Vertex.VERTEX_X || thisMapPos.y > Vertex.VERTEX_Y);
}

export function getFaceEnumByName(name: string): Face {
    for (let i = 0; i < Role.SKINS.length; i++) {
        if (name == Role.SKINS[i]) {
            return i;
        }
    }
    return -1;
}