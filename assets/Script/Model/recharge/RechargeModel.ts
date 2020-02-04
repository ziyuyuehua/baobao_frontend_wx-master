import {JsonMgr} from "../../global/manager/JsonManager";
import {
    IActivityBuyInter,
    IChargeInfo,
    IRechargeActivitiesInfo,
    IRechargeActivityInfo,
    IVipDataInfo,
    IRechargeGiftInfo,
    IClientActivityInfo, IAdvDataInfo
} from "../../types/Response";
import {GameManager} from "../../global/manager/GameManager";
import {DataMgr} from "../DataManager";
import {ChargeType} from "../../CustomizedComponent/Recharge/RechargeMain";

// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class RechargeModel {

    private activitiesArr: IRechargeActivitiesInfo[] = []; //总活动数组  需要拆成一个未完成数组和一个完成数组
    private getonActivitiesArr: IRechargeActivitiesInfo[] = [];   //未完成的活动数组
    private comActivitiesArr: IRechargeActivitiesInfo[] = [];    //完成的活动数组 

    private chargeArr: IChargeInfo[] = [];      //充值档位
    private vipInfo: IVipDataInfo[] = [];       //vip
    private advInfo: IAdvDataInfo[] = [];       //活动广告
    private chargeCost: number = 0;      //充值钱
    private timeEnd: number = 0;//广告刷新时间
    private wxPayType: number = 0;   //1->支付 2->购买礼包 3->月卡vip 4->季卡vip

    RechargeMainHeight: number;         //充值界面滑动列表总高度
    RechargeItemIndex: number;           //充值item移动的index
    RechargeIndex: number = -1;           //当前点击的充值index
    AddRechargeIndex: number = -1;       //点击的累计充值index

    private _acitvityData: IClientActivityInfo[] = [];

    fullData(dataVo: IRechargeActivityInfo) {
        this.activitiesArr = dataVo.rechargeActivities;
        this.chargeArr = dataVo.charges;
        this.vipInfo = dataVo.vips;
        this.advInfo = dataVo.advInfo;
        this.resetActivityData();
    }

    setWxPayType(type: number) {
        this.wxPayType = type;
    }

    getWxPayType() {
        return this.wxPayType;
    }

    //活动分组
    resetActivityData() {
        this.getonActivitiesArr = [];
        this.comActivitiesArr = [];
        for (let index = 0; index < this.activitiesArr.length; index++) {
            let giftJson: IGiftPackageJson[] = JsonMgr.getRechargeJsonByAcId(this.activitiesArr[index].templateId);
            let maxNum = giftJson[0].maxGet;
            let isAdd: boolean = true;
            if (maxNum > 0) {
                let buyInter: IActivityBuyInter[] = this.activitiesArr[index].buyCntList;
                if (buyInter) {
                    for (let id = 0; id < buyInter.length; id++) {
                        if (buyInter[id].giftXmlId == giftJson[0].id) {
                            if (buyInter[id].buyNum >= maxNum) {
                                isAdd = false;
                                this.comActivitiesArr.push(this.activitiesArr[index]);
                            }
                        }
                    }
                }
            }
            isAdd && this.getonActivitiesArr.push(this.activitiesArr[index]);
        }
        this.getonActivitiesArr.sort((a: IRechargeActivitiesInfo, b: IRechargeActivitiesInfo) => {
            let aActJson = JsonMgr.getActivityJson(a.templateId);
            let bActJson = JsonMgr.getActivityJson(b.templateId);
            if (aActJson.sort != bActJson.sort) {
                return a.templateId - b.templateId
            }
        })
    }

    acitvityData() {
        return this._acitvityData;
    }

    resetDataVo() {
        this._acitvityData = [];
        if (GameManager.isIos()) {
            let advInfoArr = this.getAdvInfo();
            if(!advInfoArr) return;
            for (let index = 0; index < advInfoArr.length; index++) {
                let temp = JsonMgr.getAdvertisements(advInfoArr[index].xmlId);
                let info: IClientActivityInfo = {
                    type: ChargeType.AD,
                    templateId: advInfoArr[index].xmlId,
                    number: advInfoArr[index].number
                };
                if (advInfoArr[index].number < temp.count) {
                    this._acitvityData.unshift(info);
                }
            }
        } else {
            let vipData = this.getVipInfo();
            //未完成的活动
            let activitiesArr = this.getGetOnActivitiesArr();
            this.addActivityToData(activitiesArr, false);
            //充值档位
            let chargeArr = this.getChargeArr();
            for (let index = 0; index < chargeArr.length; index++) {
                let info: IClientActivityInfo = {
                    type: ChargeType.CHARGE,
                    new: true,
                    templateId: chargeArr[index].id,
                    first: chargeArr[index].first,
                    id: chargeArr[index].id,
                    sort: 60 + index,
                };
                this._acitvityData.push(info);
            }
            if (vipData) {
                for (let index = 0; index < vipData.length; index++) {
                    let vipInfo = vipData[index];
                    let preVipData: IVipJson = JsonMgr.getVipJson(vipInfo.type + 1);
                    // cc.log("preVipData:", preVipData);
                    if (preVipData.preVip) {
                        let preVipInfo = this.getVipInfo()[preVipData.preVip - 1];
                        if (preVipInfo.vip || vipData[index].vip) {
                            let sort = JsonMgr.getActivityJson(preVipData.activityId).sort;
                            let info: IClientActivityInfo = {
                                type: ChargeType.VIP,
                                templateId: preVipData.activityId,
                                new: true,
                                id: vipData[index].type,
                                sort: sort,
                                first: vipData[index].expireData !== 0,
                            }
                            this._acitvityData.push(info);
                        }
                    } else {
                        let sort = JsonMgr.getActivityJson(preVipData.activityId).sort;
                        let info: IClientActivityInfo = {
                            type: ChargeType.VIP,
                            templateId: preVipData.activityId,
                            new: true,
                            id: vipData[index].type,
                            sort: sort,
                            first: vipData[index].expireData !== 0,
                        }
                        this._acitvityData.push(info);
                    }
                }
            }
            this._acitvityData.sort((a: IClientActivityInfo, b: IClientActivityInfo) => {
                if (a.sort != b.sort) {
                    return a.sort - b.sort;
                }
            })

            //暂时屏蔽勿动
            // if (advInfoArr) {
            //     for (let index = 0; index < advInfoArr.length; index++) {
            //         let temp = JsonMgr.getAdvertisements(advInfoArr[index].xmlId);
            //         let info: IClientActivityInfo = {
            //             type: ChargeType.AD,
            //             templateId: advInfoArr[index].xmlId,
            //             number: advInfoArr[index].number
            //         };
            //         if (advInfoArr[index].number < temp.count) {
            //             this._acitvityData.unshift(info);
            //         }
            //     }
            // }
            //完成的活动
            let comActivitiesArr = this.getComActivitiesArr();
            this.addActivityToData(comActivitiesArr, true);
        }

    }

    //增加活动
    private addActivityToData(activitiesArr: IRechargeActivitiesInfo[], isEnough: boolean) {
        for (let nid = 0; nid < activitiesArr.length; nid++) {
            let sort = JsonMgr.getActivityJson(activitiesArr[nid].templateId).sort;
            let info: IClientActivityInfo = {
                type: ChargeType.ACTIVITY,
                new: activitiesArr[nid].new,
                templateId: activitiesArr[nid].templateId,
                buyCntList: activitiesArr[nid].buyCntList,
                rechargeGift: activitiesArr[nid].rechargeGift,
                sort: sort,
                //是否完成
                isbuyed: isEnough,
            }
            this._acitvityData.push(info);
        }
    }

    judgeDeleteItem(activityId) {
        for (let index = 0; index < this.activitiesArr.length; index++) {
            if (this.activitiesArr[index].templateId == activityId) {
                return true;
            }
        }
        return false;
    }

    getRechargeDataById(activityId) {
        for (let index = 0; index < this.activitiesArr.length; index++) {
            if (this.activitiesArr[index].templateId == activityId) {
                return this.activitiesArr[index]
            }
        }
    }

    getAllAddUpGift(): IGiftPackageJson[] {
        return JsonMgr.getRechargeJsonByAcId(20)
    }

    setActivitiesArr(v: IRechargeActivitiesInfo[]) {
        this.activitiesArr = v;
        this.resetActivityData();
    }

    getActivityDataByid(templateId): IRechargeActivitiesInfo {
        for (let index = 0; index < this.activitiesArr.length; index++) {
            if (this.activitiesArr[index].templateId == templateId) {
                return this.activitiesArr[index];
            }
        }
        return null;
    }

    getGetOnActivitiesArr(): IRechargeActivitiesInfo[] {
        return this.getonActivitiesArr;
    }

    getComActivitiesArr(): IRechargeActivitiesInfo[] {
        return this.comActivitiesArr;
    }


    setChargeArr(v: IChargeInfo[]) {
        this.chargeArr = v;
    }

    getChargeArr(): IChargeInfo[] {
        return this.chargeArr;
    }

    getChargetDataById(id): IChargeInfo {
        for (let index = 0; index < this.chargeArr.length; index++) {
            if (this.chargeArr[index].id == id) {
                return this.chargeArr[index]
            }
        }
    }

    getVipInfo(): IVipDataInfo[] {
        return this.vipInfo;
    }

    setRechargeIndex(index) {
        this.RechargeIndex = index;
    }

    getRechargeIndex() {
        return this.RechargeIndex;
    }

    setChargeCost(cost) {
        this.chargeCost = cost
    }

    getChargeCost() {
        return this.chargeCost;
    }

    setAddRechargeIndex(index) {
        this.AddRechargeIndex = index;
    }

    getAddRechargeIndex() {
        return this.AddRechargeIndex;
    }

    setRechargeMainHeight(height) {
        this.RechargeMainHeight = height;
    }

    getRechargeMainHeight() {
        return this.RechargeMainHeight;
    }

    setRechargeItemIndex(index) {
        this.RechargeItemIndex = index;
    }

    getRechargeItemIndex() {
        return this.RechargeItemIndex;
    }

    getAdvInfo() {
        return this.advInfo;
    }

    getTimeEnd() {
        return this.timeEnd;
    }
}
