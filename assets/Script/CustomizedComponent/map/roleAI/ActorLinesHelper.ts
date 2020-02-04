import {Role} from "../Role";
import {isThisMapPosInMarket} from "./CustomerHelper";
import {CommonUtil} from "../../../Utils/CommonUtil";
import {IncidentModel} from "../../../Model/incident/IncidentModel";
import {DataMgr} from "../../../Model/DataManager";
import {JsonMgr} from "../../../global/manager/JsonManager";
import {Staff} from "../../../Model/StaffData";
import {FavorType} from "../../favorability/FavorHelp";

export enum ACTOR_LINES_TYPE {
    TOUCH = 1,                               //玩家主动点击的台词
    DANGER,                                  //当有顾客经过危机所在格及其周围8格时
    EVENT,                                   //当有顾客经过事件所在格及其周围8格时
    CUSTOMER_ASK_SALEMAN,                    //当顾客来到有售货员存在的货架前时，顾客播放固定台词
    SALEMAN_ANSWER_CUSTOMER = 5,             //当顾客来到售货员面前问询后，售货员播放台词回答顾客问题
    CUSTOMER_BUY_SUCCEED,                    //当顾客购买成功时
    CUSTOMER_BUY_FAILED,                     //当顾客购买失败时
    CUSTOMER_ENTER_MARKET,                   //顾客进店时，店内的店员（售货员和收银员）会根据 10% 概率说话
    CUSTOMER_EXIT_MARKET,                    //顾客出店时，店内的店员（售货员和收银员）会根据 10% 概率说话
    HAVE_EMPTY_CASE = 10,                    //当场景内有卖空的货架时，售货员和理货员在切换至任意一个货架时，有概率播放台词
    CUSTOMER_STAND_ON_EMPTY_CASE,            //顾客站在卖空的货架前，会50%概率播放台词，并转移货架
    TALLYMAN_SLEEPY,                         //理货员原定在场景中等待一段时间并播放犯困的表情，改为，在场景中等待一段时间并说话
    TALLYMAN_ASK_OTHER,                      //理货员原定在场景中等待一段时间并寻找其他理货员互相播放表情气泡，改为，在场景中等待一段时间后和另一个理货员搭话并播放台词
    TALLYMAN_ANSWER,                         //理货员被其他理货员搭话后的理货员，会播放一段台词
    POWER_GUIDE_CASHIER_UP_WORK = 999,       //强制引导上岗的员工同时说一句特殊台词“店长放心，我会努力工作的！”
    POWER_GUIDE_CASHIER_SAY_THANKS,          //强制引导结账时，收银员需要说谢谢惠顾
}

const DEBUG: boolean = false;

let occurDangerPercentage = () => DEBUG ? 100 : Number(JsonMgr.getConstVal('occurDangerPercentage'));

let occurEventPercentage = () => DEBUG ? 100 : Number(JsonMgr.getConstVal('occurEventPercentage'));

let occurCustomerAskSalemanPercentage = () => DEBUG ? 100 : Number(JsonMgr.getConstVal('occurCustomerAskSalemanPercentage'));

let occurCustomerBuySucceedPercentage = () => DEBUG ? 100 : Number(JsonMgr.getConstVal('occurCustomerBuySucceedPercentage'));

let occurCustomerBuyFailedPercentage = () => DEBUG ? 100 : Number(JsonMgr.getConstVal('occurCustomerBuyFailedPercentage'));

let occurCustomerEnterMarketPercentage = () => DEBUG ? 100 : Number(JsonMgr.getConstVal('occurCustomerEnterMarketPercentage'));

let occurCustomerExitMarketPercentage = () => DEBUG ? 100 : Number(JsonMgr.getConstVal('occurCustomerExitMarketPercentage'));

let occurHaveEmptyCasePercentage = () => DEBUG ? 100 : Number(JsonMgr.getConstVal('occurHaveEmptyCasePercentage'));

let occurCustomerStandOnEmptyCasePercentage = () => DEBUG ? 100 : Number(JsonMgr.getConstVal('occurCustomerStandOnEmptyCasePercentage'));

//【场景演绎】台词对话演绎
export namespace ActorLinesHelper {
    function getTouchString(role: Role): string {
        let dialogueArr = [];
        //staffModId是4位数则为特殊角色 台词是通过好感度控制的，好感度未达到的时候，不能播放对应台词
        if (role.artResId <= 9999) {
            dialogueArr = JsonMgr.getJsonArr<IDialogueJson>("dialogue", (v: IDialogueJson) => v.type == ACTOR_LINES_TYPE.TOUCH && v.id < 0);
            let staffData = DataMgr.getCurStaffData();
            let staff: Staff = staffData.getStaff(role.staffId);
            let favorJson: IFavorLevelJson = JsonMgr.getFavorLevelJson(staff.favorStage, staff.favorLevel);
            let favorArray = JsonMgr.getJsonArr<IFavorJson>("favor", (v: IFavorJson) => v.staffId == role.artResId && v.favorLevelId <= favorJson.id && v.type == FavorType.UnlockTheLines);
            if (favorArray && favorArray.length > 0) {
                for (let favor of favorArray) {
                    let dialogueId = Number(favor.para);
                    let dialogue = JsonMgr.getFirstJson<IDialogueJson>("dialogue", (v: IDialogueJson) => v.type == ACTOR_LINES_TYPE.TOUCH && v.id == dialogueId);
                    if (dialogue) {
                        dialogueArr.push(dialogue);
                    }
                }
            }
        } else {
            dialogueArr = JsonMgr.getJsonArr<IDialogueJson>("dialogue", (v: IDialogueJson) => v.type == ACTOR_LINES_TYPE.TOUCH && v.staffModId == role.artResId);
        }

        if (dialogueArr && dialogueArr.length > 0) {
            return dialogueArr[CommonUtil.getRangeCloseNum(0, dialogueArr.length - 1)].dialogue;
        }
        return "Can not find in dialogue: type = " + ACTOR_LINES_TYPE.TOUCH + " staffModId = " + role.artResId;
    }

    function getTypeString(role: Role, type: ACTOR_LINES_TYPE) {
        let dialogueArr = JsonMgr.getJsonArr<IDialogueJson>("dialogue", (v: IDialogueJson) => v.type == type && v.staffModId == role.artResId);
        if (dialogueArr && dialogueArr.length > 0) {
            return dialogueArr[CommonUtil.getRangeCloseNum(0, dialogueArr.length - 1)].dialogue;
        }
        return "Can not find in dialogue: type = " + type + " staffModId = " + role.artResId;
    }

    function isThisMapPosIn3X3Range(thisMapPos: cc.Vec2, centerMapPos: cc.Vec2) {
        for (let y = centerMapPos.y - 1; y <= centerMapPos.y + 1; y++) {
            for (let x = centerMapPos.x - 1; x <= centerMapPos.x + 1; x++) {
                if (x == thisMapPos.x && y == thisMapPos.y) {
                    return true;
                }
            }
        }
        return false;
    }

    function getDangerIdByThisMapPosIn3X3(pos: cc.Vec2): number { //当pos是危机所在格及其周围8格时，return this danger's ID
        let incidentsArr: IncidentModel[] = DataMgr.incidentData.getMapIncidents();
        for (let incident of incidentsArr) {
            let incidentPos = incident.getMapPos();
            if (!incidentPos) continue;
            if (isThisMapPosIn3X3Range(pos, incidentPos)) {
                return incident.getId();
            }
        }
        return -1;
    }

    function getEventIdByThisMapPosIn3X3(pos: cc.Vec2): number {
        let incidentsArr: IncidentModel[] = DataMgr.incidentData.getMapEvents();
        for (let incident of incidentsArr) {
            let incidentPos = incident.getMapPos();
            if (!incidentPos) continue;
            if (isThisMapPosIn3X3Range(pos, incidentPos)) {
                return incident.getId();
            }
        }
        return -1;
    }

    function checkOccurDanger(role: Role): boolean {
        if (!role.isCustomer()) return false; //此危机对话只针对顾客而言
        if (isThisMapPosInMarket(role.curMapPos())) return false; //并且是店外顾客
        if (!CommonUtil.randomByPercent(occurDangerPercentage())) return false;
        let dangerId = getDangerIdByThisMapPosIn3X3(role.curMapPos());
        if (dangerId == -1) {
            role.occurDangerId = -1;
            return false;
        }
        if (dangerId == role.occurDangerId) return false; //排除同一个危机
        role.occurDangerId = dangerId;
        return true;
    }

    function checkOccurEvent(role: Role): boolean {
        if (!role.isCustomer()) return false; //此危机对话只针对顾客而言
        if (!CommonUtil.randomByPercent(occurEventPercentage())) return false;
        let eventId = getEventIdByThisMapPosIn3X3(role.curMapPos());
        if (eventId == -1) {
            role.occurEventId = -1;
            return false;
        }
        if (eventId == role.occurEventId) return false; //排除同一个事件
        role.occurEventId = eventId;
        return true;
    }

    function checkOccurCustomerAskSaleman(): boolean {
        return CommonUtil.randomByPercent(occurCustomerAskSalemanPercentage());
    }

    function checkOccurCustomerBuySucceed(): boolean {
        return CommonUtil.randomByPercent(occurCustomerBuySucceedPercentage());
    }

    function checkOccurCustomerBuyFailed(): boolean {
        return CommonUtil.randomByPercent(occurCustomerBuyFailedPercentage());
    }

    function checkOccurCustomerEnterMarket(role: Role): boolean {
        if (!role.isCashier() && !role.isSaleman()) return false;
        return CommonUtil.randomByPercent(occurCustomerEnterMarketPercentage());
    }

    function checkOccurCustomerExitMarket(role: Role): boolean {
        if (!role.isCashier() && !role.isSaleman()) return false;
        return CommonUtil.randomByPercent(occurCustomerExitMarketPercentage());
    }

    function checkOccurHaveEmtpyCase(): boolean {
        return CommonUtil.randomByPercent(occurHaveEmptyCasePercentage());
    }

    function checkOccurCustomerStandOnEmptyCase(): boolean {
        return CommonUtil.randomByPercent(occurCustomerStandOnEmptyCasePercentage());
    }

    export function checkOccur(type: ACTOR_LINES_TYPE, role: Role): boolean {
        if (role.isShowedActorLindes()) return false;

        switch (type) {
            case ACTOR_LINES_TYPE.DANGER:
                return checkOccurDanger(role);
            case ACTOR_LINES_TYPE.EVENT:
                return checkOccurEvent(role);
            case ACTOR_LINES_TYPE.CUSTOMER_ASK_SALEMAN:
                return checkOccurCustomerAskSaleman();
            case ACTOR_LINES_TYPE.CUSTOMER_BUY_SUCCEED:
                return checkOccurCustomerBuySucceed();
            case ACTOR_LINES_TYPE.CUSTOMER_BUY_FAILED:
                return checkOccurCustomerBuyFailed();
            case ACTOR_LINES_TYPE.CUSTOMER_ENTER_MARKET:
                return checkOccurCustomerEnterMarket(role);
            case ACTOR_LINES_TYPE.CUSTOMER_EXIT_MARKET:
                return checkOccurCustomerExitMarket(role);
            case ACTOR_LINES_TYPE.HAVE_EMPTY_CASE:
                return checkOccurHaveEmtpyCase();
            case ACTOR_LINES_TYPE.CUSTOMER_STAND_ON_EMPTY_CASE:
                return checkOccurCustomerStandOnEmptyCase();
            case ACTOR_LINES_TYPE.TALLYMAN_SLEEPY:
                return true;
            case ACTOR_LINES_TYPE.TALLYMAN_ANSWER:
                return true;
            case ACTOR_LINES_TYPE.TALLYMAN_ASK_OTHER:
                return true;
            default:
                break;
        }
    }

    export function getString(type: ACTOR_LINES_TYPE, role: Role): string {
        switch (type) {
            case ACTOR_LINES_TYPE.TOUCH:
                return getTouchString(role);
            case ACTOR_LINES_TYPE.POWER_GUIDE_CASHIER_UP_WORK:
                return "店长放心，我会努力工作的！";
            case ACTOR_LINES_TYPE.POWER_GUIDE_CASHIER_SAY_THANKS:
                return "谢谢惠顾！";
            default:
                return getTypeString(role, type);
        }
    }
}