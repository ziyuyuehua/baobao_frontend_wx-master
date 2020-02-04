import {IActivityGoal, IActivityStoreInfo} from "../types/Response";
import {JsonMgr, JsonManager} from "../global/manager/JsonManager";
import branchDetail from "../CustomizedComponent/setting/branchDetail";
import {brownColor} from "../global/const/StringConst";

const {ccclass, property} = cc._decorator;

@ccclass
export class ActiveShopData {

    private shopData: IActivityStoreInfo = null;
    private IntegralData: IActivityGoal = null;

    setActivityData(res: IActivityStoreInfo) {
        this.shopData = res;
    }

    getActivityData = (): IActivityStoreInfo => {
        return this.shopData;
    }

    getresidualNum(id: number) {
        let Times = 0;
        for (let i = 0; i < this.shopData.activityStore.length; i++) {
            let activeId = this.shopData.activityStore[i].id;
            if (id == activeId) {
                Times = this.shopData.activityStore[i].residualNum;
            }
        }
        return Times;
    }

    getActivityMess(id: number) {
        let shopMsg = JsonMgr.getOneKind("activityStore");
        let itemData = shopMsg[id];
        return itemData;
    }

    getItemsNum(itemId: number) {
        let itemsNum = 0;
        for (let i = 0; i < this.shopData.assistanceItems.length; i++) {
            let XmlId = this.shopData.assistanceItems[i].xmlId;
            if (XmlId == itemId) {
                itemsNum = this.shopData.assistanceItems[i].number;
            }
        }
        return itemsNum;
    }

    getItemBoxType = (id: number) => {
        if (id < 0) {
            return 1;
        }
        if (id >= 1000 && id < 9999) {
            return 3;
        }
        if (id >= 100000 && id <= 199999) {
            return 1;
        }
        if (id >= 2000000 && id <= 3000000) {
            return 1;
        }
        if (id >= 101 && id <= 105) {
            return 2;
        }
        if (id >= 510001 && id <= 510007) {
            return 1;
        }
        return 1;
    }

    sortExchange() {
        let itemArr: IActivityStore[] = [];
        for (let nid = 0; nid < this.shopData.activityStore.length; nid++) {
            let shopId = this.shopData.activityStore[nid].id;
            let shopNum = this.shopData.activityStore[nid].residualNum;
            let isEnough: boolean = true;
            let shopMsg = JsonMgr.getOneKind("activityStore");
            let itemData = shopMsg[shopId];
            if (shopNum == 0) {
                isEnough = false;
            }
            let iconArr = itemData.price.split(";")
            for (let i = 0; i < iconArr.length; i++) {
                let iconStr = iconArr[i].split(",")
                for (let i = 0; i < this.shopData.assistanceItems.length; i++) {
                    let itemArr = this.shopData.assistanceItems[i].xmlId
                    if (itemArr == Number(iconStr[0])) {
                        let ownPorp = this.shopData.assistanceItems[i].number;
                        let needPorp = Number(iconStr[1])
                        if (ownPorp < needPorp) {
                            isEnough = false;
                        }
                    }
                }
            }
            if (isEnough == false) {
                itemData.sort = nid;
            } else if (isEnough == true) {
                itemData.sort = -1;
            }
            let itemStr = itemData.itemId.split(",");
            let id = Number(itemStr[0]);
            let itemJson: IItemJson = JsonMgr.getInformationAndItem(id);
            if (id >= 1000 && id < 9999) {
                itemData.color = itemJson.star;
            } else {
                itemData.color = itemJson.color;
            }
            let shopArr = [itemData];
            for (let nid in shopArr) {
                itemArr.push(shopArr[nid]);
            }
        }
        itemArr.sort((A, B) => {
            if (A.sort != B.sort) {
                if (A.sort != -1 && B.sort != -1) {
                    return B.color - A.color;
                }
                return A.sort - B.sort;
            }
            if (A.sort == B.sort) {
                return B.color - A.color;
            }
        })
        return itemArr;
    }

    setIntegralData = (IntegralData: IActivityGoal) => {
        this.IntegralData = IntegralData;
    }

    sortIntegral = () => {
        let json: IActivityStore[] = JsonMgr.getActivityStore(this.IntegralData.templateId, 2);
        let alreadyId = this.IntegralData.alreadyRecieveds;
        for (let i = 0; i < json.length; i++) {
            if (alreadyId.indexOf(json[i].id) != -1) {
                json.push(json[i]);
                json.splice(i, 1);
                json.length--;
                i--;
            }
        }
        let jsonAdd: IActivityStore[] = JsonMgr.getActivityStore(this.IntegralData.templateId, 2);
        for (let i = 0; i < jsonAdd.length; i++) {
            if (alreadyId.indexOf(jsonAdd[i].id) != -1) {
                json.push(jsonAdd[i]);
            }
        }
        return json;
    }
}
