import {ClientEvents} from "../global/manager/ClientEventCenter";
import {Door} from "../global/const/StringConst";
import {DataMgr} from "../Model/DataManager";
import {ResManager, ResMgr} from "../global/manager/ResManager";
import {MapWAndH} from "./CoordinateTranslate";
import {CacheMap, NodeType} from "../CustomizedComponent/MapShow/CacheMapDataManager";
import {ShelvesType} from "../Model/market/ShelvesDataModle";
import {JsonMgr} from "../global/manager/JsonManager";
import {ICommonRewardInfo, IFosterReward} from "../types/Response";

/*
 * @Author: tyq 
 * @Date: 2019-01-06 
 * @Desc: 
 */

export class Reward {
    xmlId: number;
    number: number;

    constructor(xmlId: number, number: number) {
        this.xmlId = xmlId;
        this.number = number;
    }
}

export class CommonUtil {

    //异步函数休眠，配合await使用
    static async sleep(millisecond: number) {
        return new Promise(resolve => {
            setTimeout(resolve, millisecond);
        })
    }

    //合并id相同的Reward的num
    static mergeRewards(rewards: Array<Reward>): Array<Reward> {
        if (rewards.length <= 0) {
            return [];
        }
        const rewardMap: Map<number, Reward> = new Map<number, Reward>();
        let rewardVal: Reward = null;
        rewards.forEach((reward: Reward) => {
            rewardVal = rewardMap.get(reward.xmlId);
            if (!rewardVal) {
                rewardVal = new Reward(reward.xmlId, reward.number);
                rewardMap.set(reward.xmlId, rewardVal);
            } else {
                rewardVal.number = rewardVal.number + reward.number
            }
        });
        return CommonUtil.mapValues(rewardMap);
    }

    // id1,num1;id2,num => Reward
    static toRewards(rewardStr: string): Array<Reward> {
        return CommonUtil.toArray(rewardStr)(CommonUtil.rwd);
    }

    static rwd(xmlId: number, number: number) {
        return new Reward(xmlId, number)
    };

    // x1,y1;x2,y2 => vv.Vec2
    static toMapPos(posStr: string): Array<cc.Vec2> {
        return CommonUtil.toArray(posStr)(cc.v2);
    }

    private static toArray(str: string): Function {
        return <T>(conFn): Array<T> => {
            if (!CommonUtil.isString(str)) {
                return [];
            }
            const strArray: string[] = str.split(";");
            let innerArray: string[] = null;
            let result = [];
            strArray.forEach((str: string) => {
                innerArray = str.split(",");
                result.push(conFn(parseInt(innerArray[0]), parseInt(innerArray[1])));
            });
            return result;
        };
    }

    static randomBoolean(): boolean {
        return CommonUtil.randomByPercent(50);
    }

    //根据百分比判断逻辑真假，例如30%为真——参数percent就传30
    static randomByPercent(percent: number): boolean {
        const randomNum: number = this.getRandomContainNum(100);
        return randomNum <= percent;
    }

    //数组乱序，返回打乱顺序后的数组
    static shuffle(arr: Array<any>): Array<any> {
        for (let i = 0; i < arr.length; i++) {
            //const randomIndex = Math.round(Math.random() * (arr.length - 1 - i)) + i;
            const randomIndex = CommonUtil.getRangeCloseNum(i, arr.length - 1);
            [arr[i], arr[randomIndex]] = [arr[randomIndex], arr[i]]
        }
        return arr
    };

    //开区间
    static getRandomNum(num: number) {
        return CommonUtil.getRangeCloseNum(0, num - 1);
    }

    //闭区间
    static getRandomContainNum(num: number) {
        return CommonUtil.getRangeCloseNum(0, num);
    }

    /** 范围闭区间（既begin和end都可能随到） */
    static getRangeCloseNum(begin: number, end: number) {
        if (begin > end) {
            cc.log("begin=", begin, "can not greater than end=", end);
            return;
        }
        return Math.floor(Math.random() * (end - begin + 1)) + begin;

        //不要使用下面的，Math.round会导致内部的Math.random的平均随机数概率失效
        //return Math.round(Math.random() * (end - begin)) + begin;
    }

    static getRange(from: number, to: number): Array<number> {
        let range = [];
        for (let i = from; i <= to; i++) {
            range.push(i);
        }
        return range;
    }

    static log(msg: string | any, ...subst: any[]): void {
        // cc.log(Array.prototype.join.call(arguments, " "));
    }

    /** 简单粗暴（即不判断继承和方法）的浅拷贝，有原型链属性的时候不用for in获取不到 */
    static copy(dest: any, src: any) {
        // for in 会遍历原型查找属性，比较慢所以注释掉
        // for (let key in src) {
        //     dest[key] = src[key];
        // }

        // map方法返回新数组，避免返回新数组所以注释掉
        // Object.keys(src).map((key) => {
        //     dest[key] = src[key];
        // });

        let keys: Array<string> = Object.keys(src);
        for (let key of keys) {
            dest[key] = src[key];
        }
    }

    //模拟实现es6的Object.values
    static values(obj: any): any[] {
        if (!obj) return [];
        return Object.keys(obj).map(key => obj[key]);
    }

    //模拟实现es6的Object.entries
    static entries(obj: any): any[] {
        return Object.keys(obj).map((key) => {
            return [key, obj[key]];
        });
    }

    //对象Object转Map，注意Object的属性名是字符串
    static obj2Map(obj: any): Map<any, any> {
        return new Map(CommonUtil.entries(obj));
    }

    //Map转对象
    static map2Obj(map: Map<any, any>): any {
        let obj: any = {};
        map.forEach((value: any, key: any) => {
            obj[key] = value;
        });
        return obj;
    }

    //返回map的key数组
    static mapKeys(map: Map<any, any>): any[] {
        // return [...map.keys()]; //
        return Array.from(map.keys());
    }

    //返回map的value数组
    static mapValues(map: Map<any, any>): any[] {
        // return [...map.values()];
        return Array.from(map.values());
    }

    static isEmpty(value: any) {
        return value ? Object.keys(value).length > 0 : true;
    }

    static isFunction(value: any) {
        return typeof value === "function";
    }

    static isObject(value: any) {
        return typeof value === 'object' || value instanceof Object;
    }

    static isString(value: any) {
        return typeof value === 'string' || value instanceof String;
    }

    static isError(value: any) {
        return value instanceof Error;
    }

    static getClassName(obj: any): string {
        let funcNameRegex = /function (.{1,})\(/;
        let results: string[] = (funcNameRegex).exec((obj).constructor.toString());
        return (results && results.length > 1) ? results[1] : "";
    }

    static schedule(callback: Function, node: cc.Node, interval: number, repeat: boolean = false) {
        let sequence;
        if (interval >= 0) {
            sequence = cc.sequence(
                cc.delayTime(interval),
                cc.callFunc(callback),
            );
            let action = null;
            if (repeat) {
                action = cc.repeatForever(sequence);
            } else {
                action = sequence;
            }
            return node.runAction(action);
        } else {
            if (repeat) {
                while (true) {
                    let ret = callback();
                    if (!ret) {
                        break;
                    }
                }
            } else {
                callback();
            }

        }
    }

    static deepCopy(obj): any {
        let str = JSON.stringify(obj);
        return JSON.parse(str);
    }

    static numChange(num: number, fix: number = 2) {
        if (num < 10000) {
            return num.toString();
        }
        if (num < 100000) {
            return this.cutOut(num / 10000, 3) + "万";
        }
        if (num < 10000000) {
            return this.cutOut(num / 10000, 2) + "万";
        }
        if (num < 100000000) {
            return this.cutOut(num / 10000) + "万";
        }
        if (num < 1000000000) {
            return this.cutOut(num / 100000000, 3) + "亿";
        }
        if (num < 100000000000) {
            return this.cutOut(num / 100000000, 2) + "亿";
        }
        return this.cutOut(num / 100000000) + "亿";
    }

    static cutOut = (num: number, fix: number = 0) => {
        let number = num.toString();
        if (number.indexOf(".") == -1) {
            return number;
        }
        return parseFloat(number.substring(0, number.indexOf(".") + fix));
    };


    static calculate(num: number) {
        if (num < 10000) {
            return num;
        }
        if (num < 100000) {
            return (num / 10000).toFixed(2) + "万";
        }
        if (num < 1000000) {
            return (num / 10000).toFixed(1) + "万";
        }
        if (num < 100000000) {
            return (num / 10000).toFixed(0) + "万";
        }
        if (num < 1000000000) {
            return (num / 100000000).toFixed(2) + "亿";
        }
        return (num / 100000000).toFixed(1) + "亿";
    }

    static deepCopyMap(map: Map<any, any>) {
        let newData = new Map<any, any>();
        let entry = map.entries();
        let e: IteratorResult<[any, any]>;
        while (e = entry.next(), !e.done) {
            let newArray = Object.assign({}, e.value[1]);
            newData.set(e.value[0], newArray);
        }
        return newData;
    }

    static setDecorateIcon(icon: cc.Sprite, xmlData: any) {
        switch (xmlData.mainType) {
            case 4:
                ResManager.getFloorIcon(icon, xmlData.icon);
                break;
            case 5:
                ResMgr.getWallPaperIcon(icon, xmlData.icon);
                break;
            default:
                ResManager.getDecorateIcon(icon, xmlData.icon);
                break;
        }
    }

    static posToKey(pos: cc.Vec2): number {
        if(!pos) {
            return null;
        }
        return pos.x * 1000 + pos.y;
    }

    static keyToPos(key: number): cc.Vec2 {
        if(!key) {
            return null;
        }
        let x = Math.floor(key / 1000);
        let y = key % 1000;
        return cc.v2(x, y);
    }

    static showRedDot() {
        let index = DataMgr.redData.indexOf(110);
        if (index !== -1) {
            DataMgr.redData.splice(index, 1);
        }
        ClientEvents.UPDATE_MAINUI_RED.emit(DataMgr.redData);
    };

    //权重随机，数组里的数字暂不能算带小数点
    static getWeightRandom(weightArr: number[]): number {
        let weightSum = 0;
        //获得所有权重值的和，在区间内进行数值随机，并查看该数值在哪一个权重区间
        for (let i of weightArr) {
            weightSum += i;
        }
        let num = CommonUtil.getRangeCloseNum(1, weightSum);
        let nowValue = 0;
        for (let i = 0; i < weightArr.length; i++) {
            nowValue += weightArr[i];
            if (num < nowValue) {
                return i;
            }
        }
        return Math.floor(weightArr.length / 2);
        // UIUtil.showTipText("未能找到该表情的权重");
    };

    static upDownTime() {
        let randNum = CommonUtil.getRangeCloseNum(1, 10);
        return randNum > 5 ? (2 + randNum) : (-5 - randNum);
    };

    static randomInDoor() {
        let doorArr = [cc.v2(Door.DOOR1_X, Door.DOOR1_Y), cc.v2(Door.DOOR2_X, Door.DOOR2_Y)];
        let index = CommonUtil.getRangeCloseNum(0, 1);
        return doorArr[index];
    }

    static posToIndex(pos: cc.Vec2) {
        return pos.y * (MapWAndH.WIDTH + 1) + pos.x;
    }

    static getNodeType(mainType: ShelvesType) {
        switch (mainType) {
            case ShelvesType.FeaturesShelve:
            case ShelvesType.GroundShelve:
                return NodeType.SHELF;
            case ShelvesType.WallShelve:
                return NodeType.WALL;
            case ShelvesType.FloorShelve:
                return NodeType.FLOOR;
            case ShelvesType.WallPaperShelve:
                return NodeType.WALLPAPER;
        }
    }

    static checkEnough(nodePool: cc.NodePool, prefab: cc.Prefab) {
        let node: cc.Node;
        if (nodePool.size() <= 0) {
            node = cc.instantiate(prefab);
        } else {
            node = nodePool.get();
        }
        return node;
    }

    static getRestView(node: cc.Node) {
        return node.convertToWorldSpaceAR(cc.v2(-node.width / 2, node.height / 2));
    }

    static checkOneLineCount(allCount: number, arr: number[]) {
        switch (allCount) {
            case 1:
                arr.push(1);
                break;
            case 2:
                arr.push(2);
                break;
            case 3:
                arr.push(3);
                break;
            case 4:
                arr.push(4);
                break;
            case 5:
                arr.push(3, 2);
                break;
            case 6:
                arr.push(3, 3);
                break;
            case 7:
                arr.push(4, 3);
                break;
            case 8:
                arr.push(4, 4);
                break;
        }
    }

    static numInit(count: number, fatherNode: cc.Node, startNum: number, offset: number, prefab: cc.Prefab, dataArr: IFosterReward[]) {
        let midIndex = Math.floor(count / 2);
        for (let i = 0; i < count; i++) {
            let node = cc.instantiate(prefab);
            fatherNode.addChild(node);
            let showIndex = startNum + 2 + i;
            CommonUtil.initSpecialItem(dataArr, node, showIndex);
            if(count % 2) {
                CommonUtil.oddNumInit(node, offset, midIndex, i);
            } else {
                CommonUtil.evenNumInit(node, offset, midIndex, i)
            }
        }
    }

    private static oddNumInit(node: cc.Node, offset: number, midIndex, i: number) {
        let width = node.width;
        if(i === midIndex) {
            node.setPosition(0, 0);
        } else {
            let changeValue = i - midIndex;
            let posX = changeValue * (width + offset);
            node.setPosition(posX, 0);
        }
    }

    private static evenNumInit(node: cc.Node, offset: number, midIndex, i: number) {
        let width = node.width;
        let changeValue: number;
        let halfValue: number;
        if(i < midIndex) {
            changeValue = i + 1 - midIndex;
            halfValue = (-width - offset) / 2;
        } else {
            changeValue = i - midIndex;
            halfValue = (width + offset) / 2;
        }
        let posX = changeValue * (width + offset);
        node.setPosition(posX + halfValue, 0);
    }

    private static initSpecialItem = (dataArr: IFosterReward[], node: cc.Node, index: number) => {
        let data = dataArr[index];
        let xmlData = JsonMgr.getInformationAndItem(data.xmlId);
        let bg = node.getComponent(cc.Sprite);
        ResMgr.getItemBox2(bg, "k" + xmlData.color);
        let icon = node.getChildByName("icon").getComponent(cc.Sprite);
        ResMgr.imgTypeJudgment(icon, xmlData.id, .7);
        let count = node.getChildByName("count").getComponent(cc.Label);
        count.string = CommonUtil.numChange(data.num);
    };

    static putRewardTogether(reward: ICommonRewardInfo[]) {
        let rewardStr = "";
        for (let i of reward) {
            rewardStr += rewardStr.length > 0 ? (";" + i.xmlId + "," + i.num) : (i.xmlId + "," + i.num);
        }
        return rewardStr;
    }
}
