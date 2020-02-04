import { DataMgr } from "../../Model/DataManager";
import { IncidentModel } from "../../Model/incident/IncidentModel";
import { JsonMgr } from "../manager/JsonManager";

// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

//引导类型 0->等级区间 1->功能解锁
export enum GuideType {
    lvGuide = 0,
    funcGuide = 1
}

//引导显示类型 0->箭头 1->对话
export enum GuideShowType {
    arraw = 0,
    dialog = 1
}

//引导结束条件
export enum GuideEndType {
    lv = 1,                 //等级
    gudieEnd = 2,           //子引导步骤
    firstStaffLvMax = 3,    //员工列表第一个是否满级
    nullPost = 4,         //空岗位
    PositionLv = 5,     //职位等级
}

//触发条件
export enum GuideStartType {
    alwaysTrigger = -1, //一直触发
    position = 1,   //满足升职条件
    taskJumpId = 2, //任务跳转ID
    expand = 3,     //满足扩建条件
    event = 4,      //是否拥有事件
    gold = 5,       //金币数量是否满足
    decoNumLess = 6,    //店内装饰数量（小于）
    shelfNumLess = 7,   //店内货架数量（小于）
    shelfNumMore = 8,   //店内货架数量（大于）
    function = 9,   //功能解锁触发
    maxStaffLv = 10,    //最高员工等级
    ziGuideCom = 11,    //子引导步骤（完成）
    freeStaff = 12,     //是否有空闲员工
    freePosition = 13,  //是否有空闲岗位
    unMaxLvStaff = 14,  //是否有未满级员工
    wareHouseFreeShelf = 15,    //仓库中是否有货架
    decoPlaceCap = 16,  //是否达到货架摆放数量上限
    friendNum = 17, //是否有好友
    crisis = 18,    //是否拥有危机
    takeaway = 19,  //是否拥有外卖
    promovition = 20,   //是否有激励
    lv = 21,   //等级
    expandLv = 22,  //扩建等级
    decoNumMax = 23,    //店内装饰数量（大于）
    taskIsComple = 24,  //是否有任务完成
}

//引导ID
export enum GuideIdType {
    incentive = 1,  //促销
    position = 2,   //职位
    deco = 3,   //装饰
    expand = 4, //扩建
    shelf = 5,  //货架
    event = 6,  //事件
    compleTask = 7, //完成任务
    FunEvent = 8,   //功能解锁事件
    FunDiam = 13,   //钻石招募
    FunGold = 14,   //金币招募
    FunCrisis = 16, //功能解锁危机
    FunOrder = 17,  //订单
    FunBaoBao = 19, //宝宝赠送
}

export function judgeSoftGuideStart(softGuideJson: ISoftGuideJson) {
    let endConditions = softGuideJson.endCondition.toString().split("&");
    ;
    for (let index = 0; index < endConditions.length; index++) {
        let endCondition = endConditions[index];
        let conditionAnds = endCondition.split(";");
        let allConditions: number = conditionAnds.length;
        let curConditions: number = 0;
        for (let index = 0; index < conditionAnds.length; index++) {
            curConditions += judgeEndSoftType(conditionAnds[index]);
        }
        if (curConditions == allConditions) {
            return false;
        }
    }
    let condition = softGuideJson.triggerCondition;
    if (Number(condition) == -1) {
        return true;
    }
    let conditions: string[] = condition.toString().split("&");
    for (let index = 0; index < conditions.length; index++) {
        let condition = conditions[index];
        let conditionAnds = condition.split(";");
        let allConditions: number = conditionAnds.length;
        let curConditions: number = 0;
        for (let index = 0; index < conditionAnds.length; index++) {
            curConditions += judgesoftType(conditionAnds[index]);
        }
        if (curConditions == allConditions) {
            return true;
        }
    }
    return false;
}

export function judgeEndSoftType(endCondition: string) {
    let endConditionStr = endCondition.split(",");
    let conditonType = Number(endConditionStr[0]);
    let conditonValue = endConditionStr[1];
    let userData = DataMgr.userData;
    switch (conditonType) {
        case GuideEndType.lv:
            let curLv: number = userData.level;
            if (curLv >= Number(conditonValue)) {
                return 1;
            }
            break;
        case GuideEndType.PositionLv:
            let curPos: number = userData.positionId;
            if (curPos >= Number(conditonValue)) {
                return 1;
            }
            break;
    }
    return 0;
}

export function judgesoftType(oneCondition: string) {
    let oneConditions = oneCondition.split(",")
    let conditonType = Number(oneConditions[0]);
    let conditonValue = oneConditions[1];
    switch (conditonType) {
        case GuideStartType.alwaysTrigger:
            return 1;
        case GuideStartType.position:
            if (DataMgr.taskData.getPositionTaskRed()) {
                return 1;
            }
            break;
        case GuideStartType.taskJumpId:
            let mainTask = DataMgr.taskData.getMainTaskJson();
            if (mainTask) {
                if (mainTask.jumpPage == conditonValue) {
                    return 1;
                }
            } else {
                console.log("找不到当前主任务");
            }
            break;
        case GuideStartType.expand:
            if (DataMgr.checkMapCanExpand()) {
                return 1;
            }
            break;
        case GuideStartType.event:
            let events: IncidentModel[] = DataMgr.incidentData.getMapEvents();
            if (events.length > 0) {
                return 1;
            }
            break;
        case GuideStartType.gold:
            let curGold = DataMgr.userData.gold;
            if (curGold >= Number(conditonValue)) {
                return 1;
            }
            break;
        case GuideStartType.decoNumLess:
            if (DataMgr.iMarket.getDecorateCount() < Number(conditonValue)) {
                return 1;
            }
            break;
        case GuideStartType.decoNumMax:
            if (DataMgr.iMarket.getDecorateCount() > Number(conditonValue)) {
                return 1;
            }
            break;
        case GuideStartType.shelfNumLess:
            if (DataMgr.iMarket.getCaseCount() < Number(conditonValue)) {
                return 1;
            }
            break;
        case GuideStartType.shelfNumMore:
            if (DataMgr.iMarket.getCaseCount() > Number(conditonValue)) {
                return 1;
            }
            break;
        case GuideStartType.function:
            let userData = DataMgr.userData;
            let positionId = userData.positionId;
            let curlv = userData.level;
            let functionOpen: IFunctionOpenJson[] = JsonMgr.getFunctionOpenByLv(curlv, 1);   //当前等级有没有
            if (functionOpen.length > 0) {
                for (let index = 0; index < functionOpen.length; index++) {
                    if (functionOpen[index].name === conditonValue) {
                        return 1;
                    }
                }
            }
            let functionOpenPos: IFunctionOpenJson[] = JsonMgr.getFunctionOpenByLv(positionId, 2);   //当前职位有没有
            if (functionOpenPos.length > 0) {
                for (let index = 0; index < functionOpenPos.length; index++) {
                    if (functionOpenPos[index].name === conditonValue) {
                        return 1;
                    }
                }
            }
            break;
        case GuideStartType.maxStaffLv:
            let staffMaxLv: number = DataMgr.staffData.curMaxStaffLv();
            if (staffMaxLv >= Number(conditonValue)) {
                return 1
            }
            break;
        case GuideStartType.ziGuideCom:
            break;
        case GuideStartType.freeStaff:
            if (DataMgr.staffData.isFreeStaff()) {
                return 1;
            }
            break;
        case GuideStartType.freePosition:
            if (DataMgr.staffData.findEmptyPostsIdx(DataMgr.getMarketId()) < 0) {
                return 1;
            }
            break;
        case GuideStartType.unMaxLvStaff:
            if (DataMgr.staffData.isHaveUnMaxLv()) {
                return 1;
            }
            break;
        case GuideStartType.wareHouseFreeShelf:
            if (DataMgr.warehouseData.getShelfNum() > 0) {
                return 1;
            }
            break;
        case GuideStartType.decoPlaceCap:
            if (!DataMgr.iMarket.checkCaseIsLimit()) {
                return 1;
            }
            break;
        case GuideStartType.friendNum:

            break;
        case GuideStartType.crisis:
            let mapIncitents: IncidentModel[] = DataMgr.incidentData.getMapIncidents();
            if (mapIncitents.length > 0) {
                return 1;
            }
            break;
        case GuideStartType.takeaway:
            if (DataMgr.orderData.getOrderList().orders.length > 0) {
                return 1
            }
            break;
        case GuideStartType.promovition:
            let incentiveNum: number = DataMgr.inspireInfo.inspireNum;
            if (incentiveNum > 0) {
                return 1;
            }
            break;
        case GuideStartType.lv:
            let curLv = DataMgr.userData.level;
            if (curLv >= Number(conditonValue)) {
                return 1;
            }
            break;
        case GuideStartType.expandLv:
            let expandLV = DataMgr.iMarket.getTrueExpandTime();
            if (expandLV >= Number(conditonValue)) {
                return 1;
            }
            break;
        case GuideStartType.taskIsComple:
            if (DataMgr.taskData.getMainTaskIsCom()) {
                return 1
            }
            break;
    }
    return 0;
}