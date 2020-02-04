// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {ChargeType} from "./RechargeMain";
import {JsonMgr} from "../../global/manager/JsonManager";
import {UIUtil} from "../../Utils/UIUtil";
import {ActiVityType} from "../../Model/activity/ActivityModel";
import RechargeGiftView from "./RechargeGiftView";
import {ResManager, ResMgr} from "../../global/manager/ResManager";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {COUNTERTYPE, DotInst} from "../common/dotClient";
import {CompositeDisposable} from "../../Utils/event-kit";
import {ButtonMgr} from "../common/ButtonClick";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {DataMgr} from "../../Model/DataManager";
import {ActionMgr} from "../common/Action";
import {IClientActivityInfo, IRechargeActivityInfo, IVipDataInfo} from "../../types/Response";
import {CommonUtil, Reward} from "../../Utils/CommonUtil";
import CommonSimItem from "../common/CommonSimItem";
import {GameManager} from "../../global/manager/GameManager";
import RechargeVipView from "./RechargeVipView";
import {UIMgr} from "../../global/manager/UIManager";
import RechargeBuyTips from "./RechargeBuyTips";
import {TimeUtil} from "../../Utils/TimeUtil";
import {WxVideoAd} from "../login/WxVideoAd";

import List from "../../Utils/GridScrollUtil/List";
import AcitveGiftItem from "../active/ActiveGiftItem";
import {topUiType} from "../MainUiTopCmpt";

const {ccclass, property} = cc._decorator;

export enum ViewType {
    OPNE = 1,   //打开
    CLOSE = 2,  //关闭
}

@ccclass
export default class RechargeItemwx extends cc.Component {

    @property(cc.Sprite)
    private bg: cc.Sprite = null;

    @property(cc.Node)
    private Kuang: cc.Node = null;

    //充值档位相关
    @property(cc.Node)
    private firstDouble: cc.Node = null;

    @property(cc.Label)
    private costLab: cc.Label = null;

    @property(cc.Sprite)
    private giftIcon: cc.Sprite = null;

    @property(cc.Label)
    private giftLab: cc.Label = null;

    @property(cc.Node)
    private giftNode: cc.Node = null;

    @property(cc.Sprite)
    private zengGiftIcon: cc.Sprite = null;

    @property(cc.Label)
    private zengGiftLab: cc.Label = null;

    @property(cc.Node)
    private chargeNode: cc.Node = null;

    @property(cc.Node)
    private dang: cc.Node = null;

    @property(cc.Sprite)
    private dangBg: cc.Sprite = null;

    //分享
    @property(cc.Node)
    private shareNode: cc.Node = null;

    @property(cc.Node)
    private shareBtn: cc.Node = null;

    @property(cc.Sprite)
    private sharePic: cc.Sprite = null;

    @property(cc.Layout)
    private shareLay: cc.Layout = null;

    @property(cc.Prefab)
    private sharePrefab: cc.Prefab = null;

    @property(cc.Label)
    private shareCount: cc.Label = null;

    //展开
    @property(cc.Node)
    private mask: cc.Node = null;

    @property(cc.Node)
    private openNode: cc.Node = null;

    @property(cc.Node)
    private buttonNode: cc.Node = null;

    @property(cc.Node)
    private jiantou: cc.Node = null;

    @property(cc.Label)
    private title: cc.Label = null;

    @property(cc.Node)
    private openAllNode: cc.Node = null;

    @property(cc.Node)
    private firstChargeNode: cc.Node = null;

    @property(cc.Node)
    private vipNode: cc.Node = null;

    @property(cc.Node)
    private firstChargeBtnNode: cc.Node = null;


    @property(cc.Node)
    private vipBtnNode: cc.Node = null;

    @property(cc.Node)
    private vipBtnNode_0: cc.Node = null;


    @property(cc.Node)
    private vipBtnNode_1: cc.Node = null;

    @property(cc.Node)
    private vipBtnNode_2: cc.Node = null;

    @property(cc.Label)
    private vipBuyLab: cc.Label = null;

    @property(cc.Node)
    private limitBtnNode: cc.Node = null;

    @property(cc.Node)
    private firstChargeGetNode: cc.Node = null;

    @property(cc.Node)
    private firstChargeGoNode: cc.Node = null;

    @property(cc.Node)
    private buyNode: cc.Node = null;

    @property(cc.Node)
    private dazheNode: cc.Node = null;

    @property(cc.Label)
    private dazheLab: cc.Label = null;

    @property(cc.Label)
    private YuanPrice: cc.Label = null;

    @property(cc.Label)
    private nowPrice: cc.Label = null;

    @property(cc.Node)
    private wuzhe: cc.Node = null;

    @property(cc.Node)
    private zhuanshi_0: cc.Node = null;

    @property(cc.Node)
    private zhuanshi_1: cc.Node = null;

    @property([cc.Sprite])
    private priceSprite: cc.Sprite[] = [];

    @property(cc.Node)
    private advertNode: cc.Node = null;

    @property(cc.Label)
    private advertLabel: cc.Label = null;

    @property(cc.Node)
    private advertBtn: cc.Node = null;

    @property(cc.Sprite)
    private advertBg: cc.Sprite = null;

    @property(List)
    private advertLsit: List = null;

    @property(cc.Node)
    private advertScroll: cc.Node = null;

    @property(cc.Node)
    private advertPlay: cc.Node = null;

    @property(cc.Node)
    private advertShare: cc.Node = null;

    @property(cc.Label)
    private advertNewLabel: cc.Label = null;

    type: ViewType = ViewType.CLOSE;    //当前item状态
    protected dispose: CompositeDisposable = new CompositeDisposable();
    private Index: number = 0;                    //item唯一标示
    private addHeight: number = 0;               //改变的高度
    private activityId: number = 0;              //活动ID
    private vipId: number = 0;              //vipID
    private vipType: number = 0;              //vipID
    private activityType: ActiVityType = ActiVityType.firstCharge;  //活动类型
    private rechargeId: number = 0;  //充值ID
    private shareId: number = 0;   //分享ID
    private adType: number = 0;
    private advertId: number = 0;
    private isEnd: boolean = false;
    private advertCount: number = 0;
    private giftpackInfo: IGiftPackageJson = null;
    private advertRewards: Reward[] = [];
    private img: string = null;
    private preventClick = false;

    onLoad() {
        ButtonMgr.addClick(this.openNode, this.changeHeightHandler);
        ButtonMgr.addClick(this.bg.node, this.changeHeightHandler);
        ButtonMgr.addClick(this.chargeNode, this.chargeHandler);
        ButtonMgr.addClick(this.firstChargeGetNode, this.firstChargeGetHandler);
        ButtonMgr.addClick(this.firstChargeGoNode, this.jumpChargeHandler);
        ButtonMgr.addClick(this.buyNode, this.buyHandler);
        ButtonMgr.addClick(this.shareBtn, this.shareHandler);
        ButtonMgr.addClick(this.vipBtnNode_0, this.receiveAwards);
        ButtonMgr.addClick(this.vipBtnNode_1, this.buyVip);
        ButtonMgr.addClick(this.vipBtnNode_2, this.buyVip);
        ButtonMgr.addClick(this.advertBtn, this.advertHandler);
        this.dispose.add(ClientEvents.RECHARGE_ITEN_MOVE.on(this.changePosY));
        this.dispose.add(ClientEvents.RESET_RECHARGE_ITEM_POS.on(this.resetPosY));
        this.dispose.add(ClientEvents.OPEN_WX_PAY.on(this.wxPayHandler));
        this.dispose.add(ClientEvents.UPDATE_RECHARGE_ITEM.on(this.updateItem2));
        this.addHeight = this.bg.node.height - this.Kuang.height;
    }

    prevent = () => {
        this.scheduleOnce(function () {
            this.preventClick = false;
        }, 0.8);
    };


    changePosY = (changeHei) => {
        if (this.Index <= DataMgr.rechargeModel.getRechargeItemIndex()) {
            return;
        }
        let Action = cc.moveTo(0.3, this.node.x, this.node.y - changeHei);
        this.node.runAction(Action);
    };

    resetPosY = (changeHei) => {
        if (this.Index <= DataMgr.rechargeModel.getRechargeItemIndex()) {
            return;
        }
        this.node.y -= changeHei;
    };

    updateItem2 = () => {
        let activityData = DataMgr.rechargeModel.acitvityData()[this.Index];
        if (this.type == ViewType.OPNE) {
            this.setOpenState();
            if (activityData.type !== ChargeType.VIP) {
                this.changeHeightHandler();
            }
        }
        this.setUIVisible(activityData);
        switch (activityData.type) {
            case ChargeType.ACTIVITY:
                this.setActivityView(activityData);
                break;
            case ChargeType.CHARGE:
                this.setNodeState(false);
                this.setChargeDang(activityData);
                break;
            case ChargeType.VIP:
                // cc.log("执行");
                this.setVipView(activityData);
                break;
            case ChargeType.SHARE:
                this.setNodeState(false);
                this.setShareView(activityData);
                break;
            case ChargeType.AD:
                this.setNodeState(false);
                this.setAdvertView(activityData);
        }
    };

    changeHeightHandler = () => {
        if (this.preventClick) return;
        this.preventClick = true;
        if (this.adType == ChargeType.AD) return;
        DataMgr.rechargeModel.setRechargeItemIndex(this.Index);
        if (this.type == ViewType.CLOSE) {
            this.type = ViewType.OPNE;
            this.buttonNode.active = false;
            this.buttonNode.opacity = 0;
            this.openAllNode.active = true;
            this.setOpenState();
            ActionMgr.nodeHeightChange(this.mask, this, this.mask.height + this.addHeight, null);
            ActionMgr.nodeHeightChange(this.Kuang, this, this.Kuang.height + this.addHeight, () => {
                this.buttonNode.active = true;
                this.buttonNode.y = -(Math.abs(this.buttonNode.y) + this.addHeight);
                let action = cc.fadeTo(0.5, 255);
                this.buttonNode.stopAllActions();
                this.buttonNode.runAction(action);
            });
            ActionMgr.nodeHeightChange(this.node, this, this.node.height + this.addHeight, null);
            this.jiantou.angle = -180;
            ClientEvents.RECHARGE_ITEN_MOVE.emit(this.addHeight);
            ClientEvents.UPDATE_CHARGE_HEIGHT.emit(this.addHeight);
            let curHegih = DataMgr.rechargeModel.getRechargeMainHeight() + this.addHeight;
            DataMgr.rechargeModel.setRechargeMainHeight(curHegih);
            ClientEvents.UPDATE_UPTOP.emit(this.Index, 0);
        } else {
            this.type = ViewType.CLOSE;
            this.buttonNode.active = false;
            this.buttonNode.opacity = 0;
            this.openAllNode.active = false;
            this.dazheLab.node.active = true;
            this.YuanPrice.node.active = true;
            this.nowPrice.node.active = true;
            this.wuzhe.active = true;
            this.zhuanshi_0.active = true;
            this.zhuanshi_1.active = false;
            if (this.adType == ChargeType.ACTIVITY || ChargeType.CHARGE || ChargeType.VIP) {
                ClientEvents.SHOW_RECHARGE_GIFT_VIEW.emit();
            }
            ActionMgr.nodeHeightChange(this.mask, this, this.mask.height - this.addHeight, null);
            ActionMgr.nodeHeightChange(this.Kuang, this, this.Kuang.height - this.addHeight, () => {
                this.buttonNode.y = -(Math.abs(this.buttonNode.y) - this.addHeight);
                let action = cc.fadeTo(0.5, 255);
                this.buttonNode.active = true;
                this.buttonNode.stopAllActions();
                this.buttonNode.runAction(action);
            });
            ActionMgr.nodeHeightChange(this.node, this, this.node.height - this.addHeight, null);
            this.jiantou.angle = 0;
            ClientEvents.RECHARGE_ITEN_MOVE.emit(-this.addHeight);
            ClientEvents.UPDATE_CHARGE_HEIGHT.emit(-this.addHeight);
            let curHegih = DataMgr.rechargeModel.getRechargeMainHeight() - this.addHeight;
            DataMgr.rechargeModel.setRechargeMainHeight(curHegih);
        }
        ClientEvents.RECHARGE_MAIN_CONTENT_HEI.emit();
        this.prevent();
    };

    updateItem = (Index: number, activityData: IClientActivityInfo) => {
        // cc.log("activityData:{}", activityData);
        this.Index = Index;
        this.adType = activityData.type;
        this.setNodeState(true);
        if (this.type == ViewType.OPNE) {
            this.setOpenState();
            // if (activityData.type !== ChargeType.VIP) {
            //     this.changeHeightHandler();
            // }
        } else {
            this.setUIVisible(activityData);
            switch (activityData.type) {
                case ChargeType.ACTIVITY:
                    this.setActivityView(activityData);
                    break;
                case ChargeType.CHARGE:
                    this.setNodeState(false);
                    this.setChargeDang(activityData);
                    break;
                case ChargeType.VIP:
                    // cc.log("执行");
                    this.setVipView(activityData);
                    break;
                case ChargeType.SHARE:
                    this.setNodeState(false);
                    this.setShareView(activityData);
                    break;
                case ChargeType.AD:
                    this.setNodeState(false);
                    this.setAdvertView(activityData);
                    break;
            }
        }
    };

    private setUIVisible = (activityData: IClientActivityInfo) => {
        this.vipBtnNode.active = false;
        this.mask.active = activityData.type == ChargeType.ACTIVITY || activityData.type == ChargeType.VIP || activityData.type == ChargeType.AD;
        this.dang.active = activityData.type == ChargeType.CHARGE;
        this.shareNode.active = activityData.type == ChargeType.SHARE;
        this.vipNode.active = activityData.type == ChargeType.VIP;
        this.advertScroll.active = activityData.type == ChargeType.AD;
        this.advertBg.node.active = activityData.type == ChargeType.AD;
        this.advertBtn.active = activityData.type == ChargeType.AD;
        this.advertNode.active = activityData.type == ChargeType.AD;
    };

    setAdvertView(data: IClientActivityInfo) {
        let temp = JsonMgr.getAdvertisements(data.templateId);
        this.advertRewards = CommonUtil.toRewards(temp.reward2);
        this.advertScroll.active = true;
        this.initScroll();
        this.advertCount = temp.count;
        this.isEnd = data.number < temp.count;
        this.advertId = data.templateId;
        this.advertBg.node.active = true;
        this.advertBtn.active = true;
        this.advertNode.active = true;
        this.firstChargeBtnNode.active = false;
        this.vipBtnNode.active = false;
        this.limitBtnNode.active = false;
        this.title.string = temp.name;
        DataMgr.addUrlData(temp.url);
        UIUtil.loadUrlImg(temp.url, this.advertBg);
        this.img = temp.url;
        this.setAdvertLabel();
        this.setAdvertBtnStatus();
    }

    setAdvertLabel() {
        if (this.isEnd) {
            let str: string = "";
            if (DataMgr.isCanWatchAdvert()) {
                str = "剩余观看次数";
            } else {
                str = "剩余分享次数";
            }
            this.advertLabel.string = str + this.advertCount;
        } else {
            let endTime: number = DataMgr.rechargeModel.getTimeEnd();
            this.advertLabel.string = "明日" + TimeUtil.getDataHour(endTime) + "点刷新";
        }
        if (DataMgr.isCanWatchAdvert()) {
            this.advertNewLabel.string = "观看广告获得活动礼包";
        } else {
            this.advertNewLabel.string = "分享获得活动礼包";
        }
    }

    setAdvertBtnStatus() {
        this.advertPlay.active = DataMgr.isCanWatchAdvert();
        this.advertShare.active = !DataMgr.isCanWatchAdvert();
        this.advertBtn.getComponent(cc.Button).interactable = this.isEnd;
    }

    advertHandler = () => {
        if (DataMgr.isCanWatchAdvert()) {
            WxVideoAd.showVideo(() => {
                this.sendMovieMsg(0);
            }, () => {
                UIMgr.showTipText("请观看完整广告！");
            });
        } else {
            GameManager.WxServices.shareGame("来和我一起成为店长拥有自己的小店吧~", `https://cdn.nuojuekeji.com/uploadImages/share/xuanchuan2.png`, "", () => {
                this.sendMovieMsg(1);
            });
        }
    };

    sendMovieMsg(type: number) {
        HttpInst.postData(NetConfig.SEE_ADVERT,
            [this.advertId, type], (response: any) => {
                ClientEvents.UPDATE_RECHARGE_VIEW.emit();
            });
    }

    setNodeState(state) {
        this.openNode.active = state;
    }

    //=======设置活动
    setActivityView(activityData: IClientActivityInfo) {
        this.activityId = activityData.templateId;
        let activityjson: IActivityJson = JsonMgr.getActivityJson(activityData.templateId);
        UIUtil.loadUrlImg(activityjson.giftUrlBig, this.bg);
        this.img = activityjson.giftUrlBig;
        this.title.string = activityjson.name;
        this.activityType = activityjson.type;
        this.firstChargeBtnNode.active = activityjson.type == ActiVityType.firstCharge;
        this.limitBtnNode.active = activityjson.type == ActiVityType.DateGift ||
            activityjson.type == ActiVityType.BuyGift;
        switch (activityjson.type) {
            case ActiVityType.firstCharge:
                for (let i of this.priceSprite) {
                    ResManager.getVipBuffIcon(i, "￥", false);
                }
                let firstGiftJson: IGiftPackageJson = JsonMgr.getRechargeJsonByAcId(this.activityId)[0];
                this.firstChargeGetNode.active = activityData.rechargeGift.totalRechargeNum >= firstGiftJson.param;
                this.firstChargeGoNode.active = activityData.rechargeGift.totalRechargeNum < firstGiftJson.param;
                break;
            case ActiVityType.DateGift:
            case ActiVityType.BuyGift:
                let giftJson: IGiftPackageJson = JsonMgr.getRechargeJsonByAcId(this.activityId)[0];
                let icon = giftJson.costType == 3 ? "zhuanshi" : "￥";
                for (let i of this.priceSprite) {
                    ResManager.getVipBuffIcon(i, icon, false);
                }
                let giftArr = giftJson.showParam.split(",");
                let param = giftJson.param;
                this.YuanPrice.string = giftArr[0];
                this.dazheNode.active = !activityData.isbuyed;
                this.buyNode.getComponent(cc.Button).interactable = !activityData.isbuyed;
                this.dazheLab.string = "-" + giftArr[1] + "%";
                this.nowPrice.string = param + "";
                break;
        }
    }

    //=======设置展开
    setOpenState() {
        this.firstChargeNode.active = false;
        this.vipNode.active = false;
        switch (this.activityType) {
            case ActiVityType.firstCharge:
            case ActiVityType.DateGift:
            case ActiVityType.BuyGift:
                this.firstChargeNode.active = true;
                this.dazheLab.node.active = false;
                this.YuanPrice.node.active = false;
                this.nowPrice.node.active = false;
                this.wuzhe.active = false;
                this.zhuanshi_0.active = false;
                this.zhuanshi_1.active = true;
                let rechargeGift: RechargeGiftView = this.firstChargeNode.getComponent(RechargeGiftView);
                rechargeGift.updateView(this.activityId);
                DotInst.clientSendDot(COUNTERTYPE.recharge, "4106", this.activityId + "");
                break;
            case ActiVityType.vip:
                this.vipNode.active = true;
                let rechargeVip: RechargeVipView = this.vipNode.getComponent(RechargeVipView);
                rechargeVip.updateView(this.vipId);
                DotInst.clientSendDot(COUNTERTYPE.recharge, "4106", "vip", this.vipId + "");
                break;
        }
    }

    //设置充值档位
    setChargeDang(activityData: IClientActivityInfo) {
        for (let i of this.priceSprite) {
            ResManager.getVipBuffIcon(i, "￥", false);
        }
        this.rechargeId = activityData.id;
        let chargejson: IChargeJson = JsonMgr.getChargeJson(activityData.id);
        let chargeSprite = chargejson.pic;
        UIUtil.loadUrlImg(chargeSprite, this.dangBg);
        this.img = chargeSprite;
        this.costLab.string = chargejson.cost + "";
        this.title.string = chargejson.name;

        this.updateRechargeItem(activityData.first);
        let rewardId = chargejson.reward.split(",")[0];
        let rewardNum = chargejson.reward.split(",")[1];
        let infoJson: IInformationJson = JsonMgr.getInforMationJson(rewardId);
        ResMgr.getCurrency(this.giftIcon, infoJson.icon);
        this.giftLab.string = "*" + rewardNum;
        if (activityData.first) {
            let rewardId = chargejson.firstreward.split(",")[0];
            let rewardNum = chargejson.firstreward.split(",")[1];
            let infoJson: IInformationJson = JsonMgr.getInforMationJson(rewardId);
            ResMgr.getCurrency(this.zengGiftIcon, infoJson.icon, 1);
            this.zengGiftLab.string = "*" + rewardNum;
        }
    }

    //更新充值item
    updateRechargeItem(first) {
        this.firstDouble.active = first;
        this.giftNode.active = first;
    }

    //设置分享
    setShareView(activityData: IClientActivityInfo) {
        this.shareId = activityData.id;
        let shareJson: IAdvertisementJson = JsonMgr.getAdvertisements(this.shareId);
        this.title.string = shareJson.name;
        UIUtil.loadUrlImg(shareJson.url, this.sharePic);
        this.img = shareJson.url;
        let rewards: Reward[] = CommonUtil.toRewards(shareJson.reward2);
        for (let nid = 0; nid < rewards.length; nid++) {
            let node = cc.instantiate(this.sharePrefab);
            let commfive: CommonSimItem = node.getComponent(CommonSimItem);
            commfive.updateItem(rewards[nid].xmlId, rewards[nid].number);
            this.shareLay.node.addChild(node);
        }
        HttpInst.postData(NetConfig.ADVER_INFO, [this.shareId], (response) => {
            this.setShareBtnState(response.adCount);
        })
    }

    setVipView(activityData: IClientActivityInfo) {
        this.vipBtnNode.active = true;
        this.firstChargeBtnNode.active = false;
        this.limitBtnNode.active = false;
        this.vipId = activityData.id;
        // cc.log("vipId:" + this.vipId);
        // let activityjson: IActivityJson = JsonMgr.getActivityJson(5001);
        // cc.log("activityjson:+" + activityjson.giftUrlBig);
        for (let i of this.priceSprite) {
            ResManager.getVipBuffIcon(i, "￥", false);
        }
        if (this.vipId > 1) {
            this.vipId++;
        }
        let vipData: IVipJson = JsonMgr.getVipJson(this.vipId);
        // cc.log("vipData.urlBig:" + vipData.urlBig);
        UIUtil.loadUrlImg(vipData.urlBig, this.bg);
        this.img = vipData.urlBig;
        // cc.log("vipData:{}", vipData);
        this.title.string = vipData.name;
        this.vipType = activityData.id;
        this.activityType = ActiVityType.vip;
        // cc.log("bg:" + this.bg.node.active);
        let index = 0;
        if (this.vipId > 1) {
            index = this.vipId - 2;
        }
        let vipInfo = DataMgr.rechargeModel.getVipInfo()[index];
        this.vipBtnNode_0.active = vipInfo.vip && !vipInfo.dailyReward;
        this.vipBtnNode_1.active = !vipInfo.vip;
        if (vipInfo.type == 1) {
            this.vipBtnNode_2.active = vipInfo.dailyReward && vipInfo.vip && vipInfo.fistReward;
        } else {
            this.vipBtnNode_2.active = vipInfo.dailyReward && vipInfo.vip;
        }
        switch (vipInfo.type) {
            case 1:
                this.vipBuyLab.string = "开通特权";
                break;
            case 2:
            case 3:
                this.vipBuyLab.string = "￥" + vipData.price + "   " + "开启";
                break;
        }
    }

    //设置次数和按钮状态
    setShareBtnState(seeNum: number) {
        let shareJson: IAdvertisementJson = JsonMgr.getAdvertisements(this.shareId);
        this.shareCount.string = "剩余：" + seeNum + "/" + shareJson.count;
        this.shareBtn.getComponent(cc.Button).interactable = seeNum < shareJson.count;
    }

    //==========点击事件
    //充值
    chargeHandler = () => {
        DotInst.clientSendDot(COUNTERTYPE.recharge, "4114", this.rechargeId + "");
        DataMgr.rechargeModel.setRechargeIndex(this.Index);
        DataMgr.rechargeModel.setWxPayType(1);
        let chargeJson: IChargeJson = JsonMgr.getChargeJson(this.rechargeId);
        DataMgr.rechargeModel.setChargeCost(chargeJson.cost);
        // console.log("chargeHandler", this.Index, 1, chargeJson.cost);
        this.sendChargeHander();
    };

    //吊起微信支付
    wxPayHandler = () => {
        if (DataMgr.rechargeModel.getRechargeIndex() == this.Index) {
            let cost = DataMgr.rechargeModel.getChargeCost();
            let payType = DataMgr.rechargeModel.getWxPayType();
            // console.log("index", this.Index, "payType", payType, "cost", cost);
            if (cost > 0) {
                GameManager.WxServices.payHandler(cost, () => {
                    console.log("-----支付成功");
                    switch (payType) {
                        case 1:
                            this.sendChargeHander();
                            break;
                        case 2:
                            this.buyPayHandler();
                            break;
                        case 3:
                            ClientEvents.SEND_MOUTH_PAY.emit();
                            break;
                        case 4:
                            ClientEvents.SEND_JI_PAY.emit();
                            break;
                        case 5:
                            this.sendChargeHander_vip();
                            break;
                    }
                })
            }
        }
    };

    //发送支付请求
    sendChargeHander = () => {
        HttpInst.postData(NetConfig.RECHARGE, [this.rechargeId], (response: IRechargeActivityInfo) => {
            DataMgr.rechargeModel.fullData(response);
            DotInst.clientSendDot(COUNTERTYPE.recharge, "4107", this.rechargeId + "");
            ClientEvents.UPDATE_RECHARGE_ITEM_VIEW.emit(-1);
        })
    };


    //首冲领取
    firstChargeGetHandler = () => {
        let giftJson: IGiftPackageJson = JsonMgr.getRechargeJsonByAcId(this.activityId)[0];
        DotInst.clientSendDot(COUNTERTYPE.recharge, "4102", this.activityId + "", giftJson.id + "");
        HttpInst.postData(NetConfig.DRAW_RECHARGE_ACTIVITY, [giftJson.id], (response) => {
            DataMgr.rechargeModel.fullData(response);
            ClientEvents.UPDATE_RECHARGE_ITEM_VIEW.emit(this.Index);
        })
    };

    //跳转充值
    jumpChargeHandler = () => {
        DotInst.clientSendDot(COUNTERTYPE.recharge, "4103", this.activityId + "");
        ClientEvents.SCROLL_TO_CHARGE.emit();
    };

    //购买
    buyHandler = () => {
        DataMgr.rechargeModel.setRechargeIndex(this.Index);
        DataMgr.rechargeModel.setWxPayType(2);
        this.giftpackInfo = JsonMgr.getRechargeJsonByAcId(this.activityId)[0];
        DataMgr.rechargeModel.setChargeCost(this.giftpackInfo.param);
        // console.log("buyHandler", this.Index, 2, this.giftpackInfo.param);
        DotInst.clientSendDot(COUNTERTYPE.recharge, "4104", this.activityId + "", this.giftpackInfo.id + "");
        this.buyPayHandler();
    };

    //发起购买请求
    buyPayHandler() {
        let isDiamond = this.giftpackInfo.costType == 3;
        let netConfig = isDiamond ? NetConfig.BUY_DIAMOND_DGUFT : NetConfig.BUYGUFT;
        HttpInst.postData(netConfig, [this.giftpackInfo.id], (response) => {
            DotInst.clientSendDot(COUNTERTYPE.recharge, "4117", this.activityId + "", this.giftpackInfo.id + "");
            DataMgr.rechargeModel.fullData(response);
            ClientEvents.UPDATE_RECHARGE_ITEM_VIEW.emit(this.Index);
        })
    }

    buyVip = () => {
        cc.log("续费");
        DataMgr.rechargeModel.setRechargeIndex(this.Index);
        if (this.activityType == ActiVityType.vip) {
            // cc.log("this.activityType" + this.activityType);
            // cc.log("this.activityType" + this.vipId);
            let index = this.vipId === 1 ? this.vipId - 1 : this.vipId - 2;
            let vipInfoArr = DataMgr.rechargeModel.getVipInfo();
            let vipInfo = vipInfoArr[index];
            // cc.log("vipInfo", vipInfo);
            switch (vipInfo.type) {
                case 1:
                    DotInst.clientSendDot(COUNTERTYPE.recharge, "4101");
                    UIMgr.showView(RechargeBuyTips.url, null, vipInfo);
                    break;
                case 2:
                case 3:
                    let vipData: IVipJson = JsonMgr.getVipJson(vipInfo.type + 1);
                    DataMgr.rechargeModel.setChargeCost(vipData.price);
                    DataMgr.rechargeModel.setWxPayType(5);
                    let vipConditionData: IVipDataInfo = null;
                    if (vipData.preVip) {
                        vipConditionData = vipInfoArr[vipData.preVip - 1];//前置条件数据
                    }
                    if (vipConditionData && vipConditionData.expireData > 0 && !vipConditionData.vip) {
                        UIMgr.showView(RechargeBuyTips.url, null, vipInfo);
                    } else {
                        this.sendChargeHander_vip();
                    }
                    break;
            }
        }
    };

    receiveAwards = () => {
        if (this.activityType == ActiVityType.vip) {
            let index = this.vipId === 1 ? this.vipId - 1 : this.vipId - 2;
            let vipInfo = DataMgr.rechargeModel.getVipInfo()[index];
            // cc.log("this.vipId:" + this.vipId);
            let rewardType: boolean = false;
            if (vipInfo.type == 1) {
                rewardType = vipInfo.fistReward;
            } else {
                rewardType = true;
            }
            DotInst.clientSendDot(COUNTERTYPE.recharge, "4110", vipInfo.type + "");
            // cc.log("rewardType:" + rewardType);
            HttpInst.postData(NetConfig.VIP_DRAW, [rewardType, vipInfo.type], (response: IRechargeActivityInfo) => {
                DataMgr.rechargeModel.fullData(response);
                ClientEvents.UPDATE_RECHARGE_ITEM_VIEW.emit(-1);
                let vipJumpId = JsonMgr.getVipJson(this.vipId).vipType;
                ClientEvents.SCROLL_TO_CHARGE_VIP.emit(vipJumpId);
            })
        }
    };

    sendChargeHander_vip = () => {
        // cc.log("this.vipId:" + this.vipId);
        DotInst.clientSendDot(COUNTERTYPE.recharge, "4109", this.vipId + "");
        HttpInst.postData(NetConfig.BUYVIP, [this.vipId], (response: IRechargeActivityInfo) => {
            DataMgr.rechargeModel.fullData(response);
            ClientEvents.UPDATE_RECHARGE_ITEM_VIEW.emit(-1);
            let vipJumpId = JsonMgr.getVipJson(this.vipId).vipType;

            ClientEvents.SCROLL_TO_CHARGE_VIP.emit(vipJumpId);
        })
    };

    //分享
    shareHandler = () => {
        HttpInst.postData(NetConfig.SEE_ADVERT, [this.shareId], (response: any) => {
            this.setShareBtnState(response.adCount);
        })
    };

    onDisable(): void {
        this.dispose.dispose();
        UIUtil.deleteLoadUrlImg([this.img]);
    }

    getCurHegiht() {
        return this.Kuang.height
    }

    initScroll() {
        if (this.advertRewards.length > 0) {
            this.advertLsit.numItems = this.advertRewards.length;
        } else {
            this.advertLsit.numItems = 0;
        }
    }

    onListVRender(item: cc.Node, idx: number) {
        let activetem: AcitveGiftItem = item.getComponent(AcitveGiftItem);
        activetem.numShow(this.advertRewards[idx].xmlId, this.advertRewards[idx].number);
    }

}
