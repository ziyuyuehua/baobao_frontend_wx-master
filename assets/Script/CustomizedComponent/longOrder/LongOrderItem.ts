/**
 * @author Lizhen
 * @date 2019/8/7
 * @Description:
 */
import {GameComponent} from "../../core/component/GameComponent";
import {ILongOrderInfo, ILongOrderReward, IRespData} from "../../types/Response";
import {UIUtil} from "../../Utils/UIUtil";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {ReceiveItem} from "./ReceiveItem";
import {DataMgr} from "../../Model/DataManager";
import {UIMgr} from "../../global/manager/UIManager";
import RechargeMain from "../Recharge/RechargeMain";
import {LongOrder} from "./LongOrder";
import {JsonMgr} from "../../global/manager/JsonManager";
import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import fadeOut = cc.fadeOut;

export enum OrderType {
    UNUNLOCKED_VIP = -2,
    UNUNLOCKED = -1,
    INORDER = 0,
    CDING = 1,
    RECEIVEORDER = 2,
}

const millis2Day = 24 * 60 * 60 * 1000;
const millis2Hour = 60 * 60 * 1000;
const millis2Minute = 60 * 1000;
const millis2Second = 1000;

@ccclass()
export class LongOrderItem extends GameComponent {
    static url = "Prefab/longOrder/LongOrderItem";

    private longOrderItemData: ILongOrderInfo = null;

    @property(cc.Node)
    unLockedNode: cc.Node = null;
    @property(cc.Label)
    unLockedLabel: cc.Label = null;
    @property(cc.Node)
    goBtn: cc.Node = null;

    @property(cc.Node)
    inOrder: cc.Node = null;
    @property(sp.Skeleton)
    inOrderCar: sp.Skeleton = null;

    @property(cc.Node)
    cdIngNode: cc.Node = null;
    @property(cc.Node)
    cdLabelNode: cc.Node = null;
    @property(cc.Node)
    cdLabelMaskNode: cc.Node = null;
    @property(cc.Label)
    diamondLabel: cc.Label = null;
    @property(sp.Skeleton)
    cdAni: sp.Skeleton = null;
    private isPlayCdAni: boolean = false;


    @property(cc.Node)
    recCar: cc.Node = null;
    @property(sp.Skeleton)
    receiveMoveCar: sp.Skeleton = null;
    @property(cc.Node)
    receiveCarNode: cc.Node = null;
    @property(cc.Node)
    redNode: cc.Node = null;

    private carIndex: number = 0;
    private firstOpen: boolean = true;//是否第一次打开
    getBaseUrl() {
        return LongOrderItem.url;
    }
    load() {
        this.addEvent(ClientEvents.EVENT_LONG_ORDER_SHAKE_CAR.on(this.shakeCar.bind(this)));
    }

    unload() {
        this.unscheduleAllCallbacks();
    }

    init(data: ILongOrderInfo, index: number, cb: Function) {
        this.longOrderItemData = data;
        this.carIndex = index;
        this.initView();
        this.firstOpen = false;
        if (data.consume) {
            this.redNode.active = DataMgr.getCanShowRedPoint() && data.consume.number <= DataMgr.getGold();
        }
        cb && cb();
    }

    initView() {
        if(!this.unLockedNode) return;
        this.unLockedNode.active = false;
        this.unscheduleAllCallbacks();
        let inOrderCar = this.inOrder.getChildByName("car");
        let recCar = this.recCar.getChildByName("car");
        switch (this.longOrderItemData.state) {
            case OrderType.UNUNLOCKED_VIP:
                this.cdIngNode.active = false;
                this.unLockedNode.active = true;
                this.unLockedLabel.string = "开通超级店长解锁";
                this.goBtn.active = true;
                break;
            case OrderType.UNUNLOCKED:
                this.goBtn.active = false;
                this.cdIngNode.active = false;
                this.unLockedNode.active = true;
                this.unLockedLabel.string = "再扩建" + this.longOrderItemData.level + "次   解锁";
                break;
            case OrderType.INORDER:
                this.cdIngNode.active = false;
                this.inOrderCar.node.getChildByName("cost").getComponent(cc.Label).string = this.longOrderItemData.consume.number.toString();
                if (this.firstOpen) {
                    if (this.longOrderItemData.unlockPlay) {
                        this.unLockedNode.active = true;
                        let faceIn = cc.fadeOut(0.5);
                        this.unLockedNode.runAction(cc.sequence(cc.delayTime(0.5), faceIn, cc.callFunc(() => {
                            this.unLockedNode.active = false;
                            inOrderCar.position = cc.v2(650, -25);
                            this.inOrder.active = true;
                            this.inOrderCar.animation = "run";
                            this.moveCarFunction(inOrderCar, false, () => {
                                this.inOrderCar.animation = "";
                                this.faceInCar();
                            });
                        })));
                    } else {
                        inOrderCar.position = cc.v2(650, -25);
                        this.inOrder.active = true;
                        if (this.longOrderItemData.play) {
                            this.inOrderCar.animation = "run";
                            this.moveCarFunction(inOrderCar, false, () => {
                                this.inOrderCar.animation = "";
                                this.faceInCar();
                            });
                        } else {
                            inOrderCar.setPosition(0, -25);
                            this.faceInCar();
                        }
                    }
                } else {
                    if (this.recCar.active) {
                        this.receiveMoveCar.animation = "run";
                        let moveReceive = cc.moveTo(1, cc.v2(650, -25));
                        recCar.runAction(cc.sequence(moveReceive.easing(cc.easeIn(3)), cc.delayTime(2), cc.callFunc(() => {
                            inOrderCar.position = cc.v2(650, -25);
                            this.receiveMoveCar.animation = "";
                            this.recCar.active = false;
                            this.inOrder.active = true;
                            this.inOrderCar.animation = "run";
                            this.moveCarFunction(inOrderCar, false, () => {
                                this.inOrderCar.animation = "";
                                this.faceInCar();
                            });
                        })));
                    }
                }
                break;
            case OrderType.CDING:
                this.isPlayCdAni = false;
                let bg: cc.Node = this.cdLabelMaskNode;
                for (let i = 0; i < 5; i++) {
                    bg.getChildByName("titleLabel" + i).active = false;
                }
                for (let i = 0; i < 6; i++) {
                    bg.getChildByName("cdTime" + (i + 1)).active = false;
                }
                if (this.firstOpen) {
                    this.inOrder.active = false;
                    this.cdIngNode.active = true;
                    this.cdIngNode.opacity = 255;
                    if (this.longOrderItemData.play) {
                        this.cdIngNode.getChildByName("bg2").opacity = 0;
                        this.cdAni.setAnimation(0, "animation", false);
                        this.cdAni.setCompleteListener(() => {
                            this.initCdTime();
                        });
                    } else {
                        this.initCdTime();
                    }
                } else {
                    if (this.inOrder.active) {
                        this.inOrderCar.animation = "run";
                        if (DataMgr.longOrderInfoData.goCar < 3) {
                            DataMgr.longOrderInfoData.goCar += 1;
                        }
                        let moveReceive = cc.moveTo(1, cc.v2(-650, -25));
                        inOrderCar.runAction(cc.sequence(moveReceive.easing(cc.easeIn(3)), cc.callFunc(() => {
                            this.inOrderCar.animation = "";
                            this.inOrder.active = false;
                            this.cdIngNode.active = true;
                            this.cdIngNode.opacity = 255;
                            this.cdIngNode.getChildByName("bg2").opacity = 0;
                            this.cdAni.setAnimation(0, "animation", false);
                            this.cdAni.setCompleteListener(() => {
                                this.initCdTime();
                            });
                        })));
                    }
                }
                break;
            case OrderType.RECEIVEORDER:
                if (this.firstOpen) {
                    this.cdIngNode.active = false;
                    this.recCar.active = true;
                    recCar.position = cc.v2(-650, -25);
                    if (this.longOrderItemData.play) {
                        this.receiveMoveCar.animation = "run";
                        this.moveCarFunction(recCar, false, () => {
                            this.receiveMoveCar.animation = "";
                        });
                    } else {
                        recCar.setPosition(0, -25);
                    }
                    this.initRewards();
                } else {
                    this.isPlayCdAni = true;
                    let faceIn = fadeOut(1);
                    this.cdIngNode.runAction(cc.sequence(faceIn, cc.callFunc(() => {
                        this.cdIngNode.active = false;
                        this.recCar.active = true;
                        recCar.position = cc.v2(-650, -25);
                        if (this.longOrderItemData.play) {
                            this.receiveMoveCar.animation = "run";
                            this.moveCarFunction(recCar, false, () => {
                                this.receiveMoveCar.animation = "";
                            });
                        } else {
                            recCar.setPosition(0, -25);
                        }
                        this.initRewards();
                    })));
                }
                break;
        }
    }

    initRewards() {
        if (this.longOrderItemData.rewardList.length == 3) {
            this.receiveCarNode.getComponent(cc.Layout).spacingX = 28;
            this.receiveCarNode.getComponent(cc.Layout).paddingRight = 30;
        } else if (this.longOrderItemData.rewardList.length == 4) {
            this.receiveCarNode.getComponent(cc.Layout).spacingX = 8;
            this.receiveCarNode.getComponent(cc.Layout).paddingRight = 10;
        }
        this.receiveCarNode.removeAllChildren(true);
        for (let i = 0; i < this.longOrderItemData.rewardList.length; i++) {
            let rewArr: ILongOrderReward = this.longOrderItemData.rewardList[i];
            if(!rewArr)  continue;
            UIUtil.dynamicLoadPrefab(ReceiveItem.url, (pre: cc.Node) => {
                pre.parent = this.receiveCarNode;
                let component: ReceiveItem = pre.getComponent(pre.name);
                component.initView(rewArr.xmlId, rewArr.num);
            });
        }
    }

    receiveOrder() {
        HttpInst.postData(NetConfig.LONG_ORDER_RECEIVE,
            [this.carIndex], (response) => {
                HttpInst.postData(NetConfig.REDPOLLING, [], (res: IRespData) => {
                    DataMgr.setRedData(res.redDots);
                    if (DataMgr.checkHasLongOrderCar()) {
                        ClientEvents.SHOW_LONG_ORDER_CAR.emit();
                    }
                });
                this.longOrderItemData = response.longOrder.orderList[this.carIndex];
                this.initView();
            });
    }

    passCd() {
        if (!this.isPlayCdAni) {
            let Time: number = DataMgr.getServerTime();
            let cost:number = JsonMgr.getAniConstVal("releaseTimePreDiamond");
            let num: number = Math.ceil((this.longOrderItemData.endCd - (Time)) / 1000 / cost);
            UIMgr.showPopPanel("提示", "确定要立即加速货运车返回吗？", num, -3, () => {
                HttpInst.postData(NetConfig.LONG_ORDER_ADDSPEED,
                    [this.carIndex], (response) => {
                        this.longOrderItemData = response.longOrder.orderList[this.carIndex];
                        this.initView();
                    });
            });
        }
    }

    initCdTime() {
        this.initCdTitleLabel();
        let Time: number = DataMgr.getServerTime();
        let cost:number = JsonMgr.getAniConstVal("releaseTimePreDiamond");
        this.diamondLabel.string = Math.ceil((this.longOrderItemData.endCd - (Time)) / 1000 / cost).toString();
        this.refuseCd();
    }

    initCdTitleLabel() {
        let bg: cc.Node = this.cdLabelMaskNode;
        for (let i = 0; i < this.longOrderItemData.destination.length; i++) {
            let node: cc.Node = bg.getChildByName("titleLabel" + i);
            node.active = false;
        }
        for (let i = 0; i < this.longOrderItemData.destination.length; i++) {
            let node: cc.Node = bg.getChildByName("titleLabel" + (5 - this.longOrderItemData.destination.length + i));
            node.active = true;
            node.getComponent(cc.Label).string = this.longOrderItemData.destination[i];
            if (this.longOrderItemData.play) {
                node.setPosition(cc.v2(node.x, node.y + 50));
                let moveTo = cc.moveBy(0.15, cc.v2(0, -50));
                moveTo.easing(cc.easeBackOut());
                node.runAction(cc.sequence(cc.delayTime(i * 0.075), moveTo, cc.callFunc(() => {
                    if ((i + 1) == this.longOrderItemData.destination.length) {
                        this.initCdTimeLabel();
                    }
                })));
            } else {
                if ((i + 1) == this.longOrderItemData.destination.length) {
                    this.initCdTimeLabel();
                }
            }
        }
    }

    initCdTimeLabel() {
        let bg: cc.Node = this.cdLabelMaskNode;
        let Time: number = DataMgr.getServerTime();
        this.getLongOrderTimeStr((this.longOrderItemData.endCd - (Time)));
        for (let i = 0; i < 6; i++) {
            let node: cc.Node = bg.getChildByName("cdTime" + (i + 1));
            node.active = true;
            if (this.longOrderItemData.play) {
                node.setPosition(cc.v2(node.x, node.y + 50));
                let moveTo = cc.moveBy(0.15, cc.v2(0, -50));
                moveTo.easing(cc.easeBackOut());
                node.runAction(cc.sequence(cc.delayTime(i * 0.075), moveTo, cc.callFunc(() => {
                    if ((i + 1) == 6) {
                        let faceIn = cc.fadeIn(0.2);
                        this.cdIngNode.getChildByName("bg2").runAction(faceIn);
                    }
                })));
            } else {
                if ((i + 1) == 6) {
                    this.cdIngNode.getChildByName("bg2").opacity = 255;
                }
            }
        }
    }

    refuseCd() {
        this.schedule(() => {
            let Time: number = DataMgr.getServerTime();
            if (this.longOrderItemData.endCd <= Time) {
                this.unscheduleAllCallbacks();
                this.diamondLabel.string = "0";
                HttpInst.postData(NetConfig.LONG_ORDER_REFUSEORDER,
                    [this.carIndex], (response) => {
                        this.longOrderItemData = response.boxList;
                        this.initView();
                    });
            } else {
                this.getLongOrderTimeStr((this.longOrderItemData.endCd - (Time)));
                let cost:number = JsonMgr.getAniConstVal("releaseTimePreDiamond");
                this.diamondLabel.string = Math.ceil((this.longOrderItemData.endCd - (Time)) / 1000 / cost).toString();
            }
        }, 1);
    }

    moveCarFunction(node: cc.Node, isBcak: boolean, cb?: Function) {
        let moveReceive = cc.moveTo(1.5, cc.v2(0, -25));
        if (isBcak) {
            node.runAction(cc.sequence(moveReceive.easing(cc.easeBackOut()), cc.callFunc(() => {
                cb && cb();
            })));
        } else {
            node.runAction(cc.sequence(moveReceive.easing(cc.easeInOut(3)), cc.callFunc(() => {
                cb && cb();
            })));
        }
    }
    goHandler() {//gobtn回掉 超级店长
        if (this.longOrderItemData.state == OrderType.UNUNLOCKED_VIP) {
            UIMgr.closeView(LongOrder.url);
            // UIMgr.showView(RechargeMain.url, cc.director.getScene() , null, null, true);
            ClientEvents.EVENT_POPUP_DIAMOND_EXCHANGE.emit();
        }
    }
    commitBox(){
        UIMgr.showPopPanel("提示", "确定要消耗金币采购吗？", this.longOrderItemData.consume.number, -2, () => {
            HttpInst.postData(NetConfig.LONG_ORDER_COMMIT,
                [this.carIndex], (response) => {
                    this.faceOutCar();
                    ClientEvents.EVENT_REFUSE_ORDER_PANEL.emit(this.carIndex);
                }, () => {

                });
        });
    }

    getLongOrderTimeStr(millis: number) {//长途订单特殊时间显示
        let hour = Math.floor(millis / millis2Hour);
        let remainder = millis % millis2Hour;
        let minute = Math.floor(remainder / millis2Minute);
        remainder = remainder % millis2Minute;
        let second = Math.floor(remainder / millis2Second);
        this.cdLabelMaskNode.getChildByName("cdTime1").getComponent(cc.Label).string = this.longOrderPadding(hour).toString()[0];
        this.cdLabelMaskNode.getChildByName("cdTime2").getComponent(cc.Label).string = this.longOrderPadding(hour).toString()[1];
        this.cdLabelMaskNode.getChildByName("cdTime3").getComponent(cc.Label).string = this.longOrderPadding(minute).toString()[0];
        this.cdLabelMaskNode.getChildByName("cdTime4").getComponent(cc.Label).string = this.longOrderPadding(minute).toString()[1];
        this.cdLabelMaskNode.getChildByName("cdTime5").getComponent(cc.Label).string = this.longOrderPadding(second).toString()[0];
        this.cdLabelMaskNode.getChildByName("cdTime6").getComponent(cc.Label).string = this.longOrderPadding(second).toString()[1];
    }

    longOrderPadding(num: number) {
        let numStr = num + "";
        return numStr.length < 2 ? "0" + numStr : numStr;
    }

    shakeCar(carIndex: number) {//抖动车
        if (this.carIndex == carIndex) {
            this.inOrderCar.setAnimation(0, "zhuanghuo", false);
        }
    }
    faceInCar(){
        let faceIn = cc.fadeIn(0.5);
        let node = this.inOrderCar.node.getChildByName("sureBtn");
        node.active = true;
        node.opacity = 0;
        node.runAction(faceIn);
    }
    faceOutCar(){
        let faceIn = cc.fadeOut(0.5);
        let node = this.inOrderCar.node.getChildByName("sureBtn");
        node.runAction(cc.sequence(faceIn,cc.callFunc(()=>{
            node.active = true;
        })));
    }
}
