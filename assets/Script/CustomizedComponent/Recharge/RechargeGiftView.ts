// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {ActiVityType} from "../../Model/activity/ActivityModel";
import {UIMgr} from "../../global/manager/UIManager";
import {itemType, JsonMgr} from "../../global/manager/JsonManager";
import {DataMgr} from "../../Model/DataManager";
import {CommonUtil, Reward} from "../../Utils/CommonUtil";
import AcitveGiftItem from "../active/ActiveGiftItem";
import {ButtonMgr} from "../common/ButtonClick";
import {CompositeDisposable} from "../../Utils/event-kit";
import {ClientEvents} from "../../global/manager/ClientEventCenter";

const {ccclass, property} = cc._decorator;

@ccclass
export default class RechargeGiftView extends cc.Component {

    @property(cc.Label)
    private needprice: cc.Label = null;

    @property(cc.Layout)
    giftLayout: cc.Layout = null;

    @property(cc.Node)
    commonGiftBg: cc.Node = null;

    @property(cc.Prefab)
    giftPrefab: cc.Prefab = null;

    @property(cc.Node)
    private giftPanel: cc.Node = null;

    @property(cc.Node)
    private giftBg: cc.Node = null;

    @property(cc.Layout)
    private giftLay: cc.Layout = null;

    @property(cc.Node)
    private limitRechargeNode: cc.Node = null;

    @property(cc.Label)
    private limitRechargeLab: cc.Label = null;


    @property(cc.Node)
    private DiscountNode: cc.Node = null;

    @property(cc.Node)
    private pruchaseLimitNode: cc.Node = null;

    @property(cc.Label)
    private pruchaseLimitLab: cc.Label = null;

    @property(cc.Label)
    private dazheLab: cc.Label = null;

    @property(cc.Label)
    private YuanPrice: cc.Label = null;

    @property(cc.Label)
    private nowPrice: cc.Label = null;

    @property(cc.Label)
    private giftNameLab: cc.Label = null;

    @property(cc.Node)
    private jiaoNode: cc.Node = null;

    @property(cc.Node)
    private sanjiaoNode: cc.Node = null;

    protected dispose: CompositeDisposable = new CompositeDisposable();

    onLoad() {
        this.dispose.add(ClientEvents.SHOW_RECHARGE_GIFT_VIEW.on(this.showGiftPanel));
    }

    showGiftPanel = () => {
        if (this.giftPanel) {
            this.giftPanel.active = false;
        }
    }


    setNodeState(state) {
        this.pruchaseLimitNode.active = !state;
        this.limitRechargeNode.active = state;
        this.limitRechargeLab.node.active = state;
        this.DiscountNode.active = !state;

    }

    updateView(acitivityId: number) {
        let activityjson: IActivityJson = JsonMgr.getActivityJson(acitivityId);
        let giftpackInfo = JsonMgr.getRechargeJsonByAcId(acitivityId)[0];
        this.setNodeState(true);
        if (!giftpackInfo) {
            return;
        }
        switch (activityjson.type) {
            case ActiVityType.firstCharge:
                this.setNodeState(true);
                if (!DataMgr.rechargeModel.getRechargeDataById(acitivityId).rechargeGift) {
                    return;
                }
                let totalRecharge = DataMgr.rechargeModel.getRechargeDataById(acitivityId).rechargeGift.totalRechargeNum;
                this.limitRechargeNode.active = giftpackInfo.param > totalRecharge;
                this.needprice.string = (giftpackInfo.param - totalRecharge) + "元，";
                this.limitRechargeLab.node.active = giftpackInfo.param <= totalRecharge;
                this.limitRechargeLab.string = "充值已达标，可立即领取";
                break;
            case ActiVityType.DateGift:
            case ActiVityType.BuyGift:
                let showparms = giftpackInfo.showParam.toString().split(",");
                let param = giftpackInfo.param;
                this.dazheLab.string = "-" + showparms[1] + "%";
                this.YuanPrice.string = showparms[0];
                this.nowPrice.string = param + "";
                this.setNodeState(false);
                if (giftpackInfo.maxGet !== -1) {
                    this.pruchaseLimitLab.node.active = true;
                    this.pruchaseLimitLab.string = giftpackInfo.maxGet + "次";
                } else {
                    this.pruchaseLimitLab.node.active = false;
                }
                break;
        }
        this.giftLayout.node.removeAllChildren();
        let rewards: Reward[] = CommonUtil.toRewards(giftpackInfo.giftContent);
        if (rewards.length > 4) {
            this.commonGiftBg.setContentSize(cc.size(310, 180));
            this.giftLayout.node.setPosition(0, -20);
        }
        for (let index = 0; index < rewards.length; index++) {
            let node = cc.instantiate(this.giftPrefab);
            let simItem: AcitveGiftItem = node.getComponent(AcitveGiftItem);
            this.giftLayout.node.addChild(node);
            simItem.bagShow(rewards, rewards[index].xmlId, rewards[index].number);
            let BagId = rewards[index].xmlId;
            // cc.log("BagId" + BagId);
            let itemJson = JsonMgr.getInformationAndItem(BagId);
            // cc.log("itemJson", itemJson);
            node.on(cc.Node.EventType.TOUCH_START, () => {
                this.giftPanel.active = false;
                if (itemJson.type == itemType.ZhiOpenGift) {
                    this.giftNameLab.string = itemJson.name;
                    let giftArr = itemJson.uniqueValue.split(";");
                    this.giftLay.node.removeAllChildren();
                    for (let i = 0; i < giftArr.length; i++) {
                        let giftStr = giftArr[i].split(",");
                        let item = cc.instantiate(this.giftPrefab);
                        let giftitem: AcitveGiftItem = item.getComponent(AcitveGiftItem);
                        this.giftLay.node.addChild(item);
                        giftitem.numShow(Number(giftStr[0]), Number(giftStr[1]))
                    }
                    this.giftPanel.active = !this.giftPanel.active;
                    if (giftArr.length < 5) {
                        let x = 50;
                        if (giftArr.length == 4) {
                            this.giftLay.node.setPosition(12, -60);
                        } else if (giftArr.length == 2) {
                            this.giftLay.node.setPosition(85, -60);
                        } else {
                            this.giftLay.node.setPosition(x * (4 - giftArr.length), -60);
                        }
                        this.giftPanel.setPosition(node.position.x, node.position.y + 110);
                        this.giftPanel.setContentSize(cc.size(320, 150));
                        this.giftNameLab.node.setPosition(0, 50);
                        this.jiaoNode.setPosition(0, -95);
                        this.sanjiaoNode.setPosition(0, 24);
                    } else {
                        this.giftPanel.setPosition(node.position.x, node.position.y + 150);
                        this.giftPanel.setContentSize(cc.size(320, 230));
                        this.giftNameLab.node.setPosition(0, 87);
                        this.giftLay.node.setPosition(12, -21);
                        this.jiaoNode.setPosition(0, -132);
                        this.sanjiaoNode.setPosition(0, 64);
                    }
                } else {
                    UIMgr.addDetailedEvent(node, rewards[index].xmlId);
                }
            });
        }
        if (rewards.length == 4) {
            this.giftLayout.paddingLeft = 0;
            this.giftLayout.paddingRight = 0;
        } else if (rewards.length < 3) {
            this.giftLayout.paddingLeft = rewards.length * (4 - rewards.length) * 20;
        } else if (rewards.length == 3) {
            this.giftLayout.paddingLeft = 40;
            this.giftLayout.paddingRight = 30;
        }
    }

}
