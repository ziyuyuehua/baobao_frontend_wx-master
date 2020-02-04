// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {GameComponent} from "../../core/component/GameComponent";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {topUiType} from "../MainUiTopCmpt";
import {ButtonMgr} from "../common/ButtonClick";
import {DataMgr} from "../../Model/DataManager";
import {IFreeOrderList, IOrderInfo} from "../../types/Response";
import {JsonMgr} from "../../global/manager/JsonManager";
import {CommonUtil, Reward} from "../../Utils/CommonUtil";
import {TimeUtil} from "../../Utils/TimeUtil";
import CommonSimItem from "../common/CommonSimItem";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import SureCancleTip from "../common/SureCancleTip";
import {GuideIdType, judgeSoftGuideStart} from "../../global/const/GuideConst";
import {UIMgr} from "../../global/manager/UIManager";
import dialogueView from "../common/dialogueView";
import {ARROW_DIRECTION, GuideMgr} from "../common/SoftGuide";
import {COUNTERTYPE, DotInst} from "../common/dotClient";

const {ccclass, property} = cc._decorator;

@ccclass
export default class randomOrder extends GameComponent {
    static url: string = "randomOrder/randomOrder";

    @property(cc.Node)
    private aniNode: cc.Node = null;
    @property(cc.Node)
    private rewardNode: cc.Node = null;
    @property(cc.Node)
    private needNode: cc.Node = null;
    @property(cc.Node)
    private closeBtn: cc.Node = null;
    @property(cc.Node)
    private sureBtn: cc.Node = null;
    @property(cc.Node)
    private deleteBtn: cc.Node = null;
    @property(cc.Label)
    private time: cc.Label = null;
    @property(cc.Prefab)
    private orderRewardItem: cc.Prefab = null;
    @property(cc.Prefab)
    private sureCancel: cc.Prefab = null;

    private evthandleNode: cc.Node = null;
    private softGuideId: number = 0;

    onLoad() {
        DotInst.clientSendDot(COUNTERTYPE.order, "20001");
        this.addEvent(ClientEvents.DIALO_END_SEND.on(() => {
            this.showSureGuide();
        }));
        this.addEvent(ClientEvents.SHOW_PLANE.on(this.refreshTime));
    }

    onEnable() {
        this.onShowPlay(1, this.aniNode);
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.ordinary);
    }

    onDisable(): void {
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -1);
    }

    getBaseUrl(): string {
        return randomOrder.url;
    }

    start() {
        ButtonMgr.addClick(this.closeBtn, this.closeHandler);
        ButtonMgr.addClick(this.sureBtn, this.submitHandler);
        ButtonMgr.addClick(this.deleteBtn, this.deleteHandler);
        this.updateOrderView();
        this.initGuide();
    }

    initGuide() {
        let softGuide = JsonMgr.getSoftGuideJsoById(GuideIdType.FunOrder, 2);
        if (softGuide && DataMgr.getGuideCompleteTimeById(softGuide.id) <= 0) {
            HttpInst.postData(NetConfig.SOFT_LED_INFO, [softGuide.id], (response) => {
                let diaJson: IOptionalTutorialsTextJson = JsonMgr.getOptionalTutorialsJson(softGuide.optionId)
                DotInst.clientSendDot(COUNTERTYPE.softGuide, "19063", diaJson.text);
                UIMgr.showView(dialogueView.url, null, softGuide.optionId);
            });
        } else {
            this.showSureGuide();
        }
    }

    showSureGuide() {
        let softGuide = JsonMgr.getSoftGuideJsoById(GuideIdType.FunOrder, 3);
        if (softGuide && DataMgr.getGuideCompleteTimeById(softGuide.id) <= 0 && judgeSoftGuideStart(softGuide)) {
            DotInst.clientSendDot(COUNTERTYPE.softGuide, "19064");
            GuideMgr.showSoftGuide(this.sureBtn, ARROW_DIRECTION.TOP, softGuide.displayText, (node: cc.Node) => {
                this.softGuideId = softGuide.id;
                this.evthandleNode = node;
            }, false, 0, false, () => {
                this.submitHandler();
            });
        }
    }

    updateOrderView() {
        let data: IFreeOrderList = DataMgr.orderData.getOrderList();
        //let disTime: number = data.disTime - DataMgr.getServerTime();
        this.time.string = TimeUtil.getTimeHouseStr(data.disTime);
        this.updateTime(data.disTime);
        let temp: INewOrderJson = JsonMgr.getNewOrder(data.orders[0]);
        let reward: Reward[] = CommonUtil.toRewards(temp.item);
        let cost: Reward[] = CommonUtil.toRewards(temp.cost);
        this.updateRewardView(reward);
        this.updateNeedView(cost);
    }

    updateRewardView(data: Reward[]) {
        this.rewardNode.removeAllChildren();
        for (let i = 0; i < data.length; i++) {
            let node = cc.instantiate(this.orderRewardItem);
            let item: CommonSimItem = node.getComponent("CommonSimItem");
            item.updateItem(data[i].xmlId, data[i].number);
            this.rewardNode.addChild(node);
        }
    }

    updateNeedView(data: Reward[]) {
        this.needNode.removeAllChildren();
        let conVal = JsonMgr.getConstVal("oderCostUpNumPercent");
        let cost: Reward[] = CommonUtil.toRewards(conVal);
        let orderData: IFreeOrderList = DataMgr.orderData.getOrderList();
        for (let i = 0; i < data.length; i++) {
            let num: number = 0;
            if (orderData.completeNumber > cost[0].xmlId) {
                num = Math.floor(data[i].number * (1 + cost[0].number / 100));
            } else {
                num = data[i].number;
            }
            let node = cc.instantiate(this.orderRewardItem);
            let item: CommonSimItem = node.getComponent("CommonSimItem");
            item.updateItem(data[i].xmlId, num);
            this.needNode.addChild(node);
        }
    }

    updateTime(time: number) {
        this.schedule(() => {
            time -= 1000;
            if (time > 0) {
                this.time.string = TimeUtil.getTimeHouseStr(time);
            } else {
                this.unscheduleAllCallbacks();
                HttpInst.postData(NetConfig.GET_ORDER, [], (res: IOrderInfo) => {
                    this.refreshView(res.orderManager);
                });
            }
        }, 1);
    }

    closeHandler = () => {
        DotInst.clientSendDot(COUNTERTYPE.order, "20004");
        this.closeView();
    }

    submitHandler = () => {
        HttpInst.postData(NetConfig.SUBMIT_ORDER, [], (res: IOrderInfo) => {
            HttpInst.postData(NetConfig.SOFT_LED_INFO, [this.softGuideId], (response) => {
            });
            if (this.evthandleNode) {
                this.evthandleNode.active = false;
            }
            this.refreshView(res.orderManager);
        });
    }

    deleteHandler = () => {
        let node = cc.instantiate(this.sureCancel);
        this.node.addChild(node);
        let sureCancle: SureCancleTip = node.getComponent("SureCancleTip");
        sureCancle.setLable("确定删除当前订单吗?");
        sureCancle.setSureHandler(() => {
            HttpInst.postData(NetConfig.DELETE_ORDER, [], (res: IOrderInfo) => {
                this.refreshView(res.orderManager);
            });
        });
    }

    refreshView(data: IFreeOrderList) {
        DataMgr.orderData.setOrderList(data);
        this.closeView && this.closeView();
        ClientEvents.ORDER_CAR_RUN.emit();
    }

    refreshTime = () => {
        let data: IFreeOrderList = DataMgr.orderData.getOrderList();
        this.time.string = TimeUtil.getTimeHouseStr(data.disTime);
        this.updateTime(data.disTime);
    }
    // update (dt) {}
}
