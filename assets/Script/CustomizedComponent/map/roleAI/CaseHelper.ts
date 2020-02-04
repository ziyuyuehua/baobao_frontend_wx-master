import {CacheMap, CaseDetailData} from "../../MapShow/CacheMapDataManager";
import {Customer} from "./Customer";
import {Saleman} from "./Saleman";
import {Pos} from "../MapInfo";
import {Direction} from "../Role";

//为场景小人逻辑设计的货架数据结构
export interface RoleCase {
    id: number;

    bindingCustomer?: Customer;
    bindingCustomerPos?: Pos;
    bindingCustomerDirection?: Direction;

    bindingSaleman?: Saleman;
    bindingSalemanPos?: Pos;
    bindingSalemanDirection?: Direction;
}

//CaseHelper 货架相关
export namespace RoleCaseHelper {
    let roleCaseArray: Array<RoleCase> = [];
    let popIndex = 0;

    //数组中项随机排序
    function randomsort(array: Array<any>) {
        array.sort(() => {
            return Math.random() > 0.5 ? -1 : 1;
        });
    }

    export function initRoleCase() {
        roleCaseArray = [];
        popIndex = 0;
        let caseArray: CaseDetailData[] = CacheMap.getCaseData();
        for (let caseData of caseArray) {
            let posArr = caseData.usePos.concat();
            posArr.sort((a: cc.Vec2, b: cc.Vec2) => {
                let aValue = a.x * 1000 + a.y;
                let bValue = b.x * 1000 + b.y;
                if (aValue > bValue) return 1;
                return -1;
            });
            let roleCase: RoleCase = {id: caseData.id};

            //销售员始终面朝左  顾客面朝右
            roleCase.bindingCustomerDirection = Direction.RIGHT;
            roleCase.bindingSalemanDirection = Direction.LEFT;

            if (caseData.reversal) {
                roleCase.bindingSalemanPos = posArr[0];
                roleCase.bindingCustomerPos = posArr[1];
            } else {
                roleCase.bindingCustomerPos = posArr[0];
                roleCase.bindingSalemanPos = posArr[1];
            }

            roleCaseArray.push(roleCase);
        }
    }

    export function hasEmptyCaseInMarket(): boolean {
        let caseArray: CaseDetailData[] = CacheMap.getCaseData();
        for (let caseData of caseArray) {
            if (!caseData.hasSelling) {
                return true;
            }
        }
        return false;
    }

    export function isEmpty(caseId: number): boolean {
        let caseArray: CaseDetailData[] = CacheMap.getCaseData();
        for (let caseData of caseArray) {
            if (caseData.id == caseId) {
                return !caseData.hasSelling;
            }
        }
        return false;
    }

    export function popBindingSalemanPos(): cc.Vec2 {
        let roleCase = roleCaseArray[popIndex];
        if (roleCase) {
            popIndex++;
            return cc.v2(roleCase.bindingSalemanPos.x, roleCase.bindingSalemanPos.y);
        }
        return null;
    }

    export function getUnbindingSalemanRoleCase(): RoleCase {
        randomsort(roleCaseArray);
        for (let roleCase of roleCaseArray) {
            if (!roleCase.bindingSaleman) return roleCase;
        }
        return null;
    }

    //优先查找有售货员的
    export function getUnbindingCustomerRoleCase(): RoleCase {
        randomsort(roleCaseArray);
        let unbindingSalemanRoleCase: RoleCase = null;
        for (let roleCase of roleCaseArray) {
            if (!roleCase.bindingCustomer) {
                if (roleCase.bindingSaleman) {
                    return roleCase;
                } else {
                    unbindingSalemanRoleCase = roleCase;
                }
            }
        }
        return unbindingSalemanRoleCase;
    }

    export function getRandomRoleCase(): RoleCase {
        randomsort(roleCaseArray);
        return roleCaseArray[0];
    }

    export function getCustomerRandomRoleCase(except: Pos): RoleCase {
        randomsort(roleCaseArray);
        for (let roleCase of roleCaseArray) {
            if(!roleCase || !roleCase.bindingCustomerPos){
                continue;
            }
            if (roleCase.bindingCustomerPos.x != except.x && roleCase.bindingCustomerPos.y != except.y) {
                return roleCase;
            }
        }
        return null;
    }
}

export interface Cashier {
    pos: Pos;
    direction?: Direction; //当这个为true的时候小人向左为面向货架，反之向右
    hasCashier?: boolean;
    cashCount?: number;
}

//顾客所站立的收银位置
export namespace CashierHelper {
    let hasCashierArray: Array<Cashier>;
    let noCashierArray: Array<Cashier>;

    export function initCashier() {
        hasCashierArray = [];
        noCashierArray = [];
        let dataArray = CacheMap.getCashierPosData();
        for (let data of dataArray) {
            let tmp: Cashier = {pos: cc.v2(data.pos.x, data.pos.y)};
            tmp.direction = data.reversal ? Direction.LEFT : Direction.RIGHT;
            tmp.hasCashier = data.hasCashier;
            tmp.cashCount = 0;
            if (tmp.hasCashier) {
                hasCashierArray.push(tmp);
            } else {
                noCashierArray.push(tmp);
            }
        }
    }

    export function getCashier(): Cashier {
        let sortFunc = (a: Cashier, b: Cashier): number => {
            if (a.cashCount > b.cashCount) return 1;
            return -1;
        };

        if (hasCashierArray.length > 0) {
            hasCashierArray.sort(sortFunc);
            return hasCashierArray[0];
        }

        noCashierArray.sort(sortFunc);
        return noCashierArray[0];
    }
}











