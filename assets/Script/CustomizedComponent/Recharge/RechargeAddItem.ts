import { IRechargeGiftInfo } from "../../types/Response";
import { DataMgr } from "../../Model/DataManager";
import CommonSimItem from "../common/CommonSimItem";
import { ButtonMgr } from "../common/ButtonClick";
import { HttpInst } from "../../core/http/HttpClient";
import { NetConfig } from "../../global/const/NetConfig";
import { ClientEvents } from "../../global/manager/ClientEventCenter";

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

@ccclass
export default class RechargeAddItem extends cc.Component {
    @property(cc.Label)
    private chargeJin: cc.Label = null

    @property(cc.Node)
    private getNode: cc.Node = null

    @property(cc.Node)
    private goChargeNode: cc.Node = null

    @property(cc.Layout)
    private giftLayout: cc.Layout = null

    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    @property(cc.Node)
    haveGetNode: cc.Node = null;

    giftId: number = 0;
    itemIndex: number = 0;

    onLoad() {
        ButtonMgr.addClick(this.getNode, this.getGiftHandler)
    }

    start() {

    }

    getGiftHandler = () => {
        DataMgr.rechargeModel.setAddRechargeIndex(this.itemIndex);
        HttpInst.postData(NetConfig.ACTIVE_DRAW_RECHARGE, [this.giftId], (response) => {
            DataMgr.rechargeModel.setActivitiesArr(response.activities);
            ClientEvents.UPDATE_ADD_RECHARGE_ITEM.emit();
            // ClientEvents.CLOSE_ADD_UP_VIEW.emit();
        })
    }

    updateItem(giftPage: IGiftPackageJson, activityId: number, index: number) {
        this.giftId = giftPage.id;
        this.itemIndex = index;
        this.updateAddEnd(giftPage, activityId);
        let giftArr = giftPage.giftContent.split(";");
        for (let index = 0; index < giftArr.length; index++) {
            let node = cc.instantiate(this.itemPrefab);
            let chargeItem: CommonSimItem = node.getComponent(CommonSimItem)
            let itemstr = giftArr[index].split(",")
            chargeItem.updateItem(Number(itemstr[0]), Number(itemstr[1]));
            this.giftLayout.node.addChild(node);
        }
    }

    updateAddEnd(giftPage: IGiftPackageJson, activityId) {
        let totalRecharge: IRechargeGiftInfo = DataMgr.rechargeModel.getRechargeDataById(activityId).rechargeGift;
        this.getNode.active = giftPage.param < totalRecharge.totalRechargeNum && totalRecharge.hasDrawGifts.indexOf(giftPage.id) == -1;
        this.goChargeNode.active = giftPage.param >= totalRecharge.totalRechargeNum;
        this.chargeJin.string = totalRecharge.totalRechargeNum + "/" + giftPage.param;
        this.haveGetNode.active = totalRecharge.hasDrawGifts.indexOf(giftPage.id) != -1;
    }


    // update (dt) {}
}
