import {GameComponent} from "../../core/component/GameComponent";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {JsonMgr} from "../../global/manager/JsonManager";
import {DataMgr} from "../../Model/DataManager";
import {IRechargeActivityInfo, IVipDataInfo} from "../../types/Response";
import {ButtonMgr} from "../common/ButtonClick";
import {COUNTERTYPE, DotInst} from "../common/dotClient";

const {ccclass, property} = cc._decorator;

@ccclass
export default class RechargeBuyTips extends GameComponent {
    static url: string = "recharge/RechargeBuyTips";
    @property(cc.Node)
    private renewNode: cc.Node = null;

    @property(cc.Node)
    private expireNode: cc.Node = null;

    @property(cc.Node)
    private renewBtn_0: cc.Node = null;

    @property(cc.Node)
    private renewBtn_1: cc.Node = null;

    @property(cc.Label)
    private expireNameLab: cc.Label = null;

    @property([cc.Label])
    private renewPrice: cc.Label[] = [];
    @property([cc.Label])
    private timeLab: cc.Label[] = [];

    @property(cc.Node)
    private conditionNode: cc.Node = null;

    @property(cc.Label)
    private conditionLab_1: cc.Label = null;

    @property(cc.Label)
    private conditionLab_2: cc.Label = null;

    @property(cc.Node)
    private breakBtn_0: cc.Node = null;

    @property(cc.Node)
    private breakBtn_1: cc.Node = null;

    @property(cc.Node)
    private jumpBtn: cc.Node = null;

    @property(cc.Label)
    private fistPrice: cc.Label = null;
    @property(cc.Label)
    private ordinaryPrice: cc.Label = null;

    private vipData: IVipJson[] = [];
    private dataVo: IVipDataInfo = null;
    private jumpId: number = 0;
    private mouthPrice: number = 0;
    private jiPrice: number = 0;

    getBaseUrl() {
        return RechargeBuyTips.url;
    }

    onLoad() {
        ButtonMgr.addClick(this.renewBtn_0, this.sendChargeHander_0);
        ButtonMgr.addClick(this.renewBtn_1, this.sendChargeHander_1);
        ButtonMgr.addClick(this.breakBtn_0, () => {
            DotInst.clientSendDot(COUNTERTYPE.recharge, "4101", "3");
            this.closeView();
        });
        ButtonMgr.addClick(this.breakBtn_1, () => {
            DotInst.clientSendDot(COUNTERTYPE.recharge, "4113");
            this.closeView()
        });
        ButtonMgr.addClick(this.jumpBtn, this.jumpChargeHandler);
        this.dispose.add(ClientEvents.SEND_MOUTH_PAY.on(this.sendMouthHttp));
        this.dispose.add(ClientEvents.SEND_JI_PAY.on(this.sendJiHttp));
        this.dataVo = this.node['data'];
        // cc.log("data", this.dataVo);
        this.renewNode.active = this.dataVo.type == 1;
        this.expireNode.active = this.dataVo.type !== 1;
        if (this.dataVo.type === 1) {
            this.setRenewView()
        } else {
            this.setExpireView();
        }
    }

    setExpireView() {
        this.conditionLab_1.node.active = false;
        this.conditionLab_2.node.active = false;
        let vipData: IVipJson = JsonMgr.getVipJson(this.dataVo.type + 1);
        // cc.log("vipData", vipData);
        this.expireNameLab.string = "续约" + vipData.name;
        // cc.log("preVip" + vipData.preVip);
        let vipInfo: IVipDataInfo = null;
        let preVipInfo: IVipDataInfo = null;
        if (vipData.preVip) {
            vipInfo = DataMgr.rechargeModel.getVipInfo()[vipData.preVip - 1];//前置条件数据
        }
        // cc.log("vipInfo", vipInfo);
        if (!vipInfo.vip) {
            let vipConditionData = JsonMgr.getVipJson(vipInfo.type);
            this.conditionLab_1.node.active = true;
            this.conditionLab_1.string = vipConditionData.name + "(已到期)";
            this.jumpId = vipInfo.type - 1;
            if (vipConditionData.preVip) {
                preVipInfo = DataMgr.rechargeModel.getVipInfo()[vipData.preVip];//上层前置条件数据
                if (preVipInfo && !preVipInfo.vip) {
                    this.jumpId = preVipInfo.type - 1;
                    let vipConditionData2 = JsonMgr.getVipJson(vipInfo.type);
                    if (vipConditionData2) {
                        this.conditionLab_2.node.active = true;
                        this.conditionLab_1.string = vipConditionData.name + "(已到期)";
                        this.conditionLab_2.string = vipConditionData2.name + "(已到期)";

                    }
                }
            }
        }
    }

    setRenewView() {
        let allVipData = JsonMgr.getAllVipJson();
        // cc.log("allVipData", allVipData);
        for (let i in allVipData) {
            if (allVipData[i].vipType == 1) {
                this.vipData.push(allVipData[i]);
            }
        }
        for (let i in this.vipData) {
            if (Number(i) == 0) {
                if (this.dataVo.expireData > 0) {
                    this.ordinaryPrice.node.active = false;
                    this.fistPrice.node.active = false;
                    this.renewPrice[i].string = "￥ " + this.vipData[i].price;
                    this.mouthPrice = this.vipData[i].price;
                } else {
                    this.renewPrice[i].node.active = false;
                    this.ordinaryPrice.string = "￥ " + this.vipData[i].price;
                    this.fistPrice.string = "￥ " + this.vipData[i].firstPrice;
                    this.mouthPrice = this.vipData[i].firstPrice;

                }
            } else {
                this.renewPrice[i].string = "￥ " + this.vipData[i].price;
                this.jiPrice = this.vipData[i].price;
            }
            this.timeLab[i].string = "持续时间：" + this.vipData[i].duration.toString() + "天";
        }
    }

    jumpChargeHandler = () => {
        // cc.log("跳转Vipid：" + this.jumpId);
        DotInst.clientSendDot(COUNTERTYPE.recharge, "4112");
        let vipJumpId = JsonMgr.getVipJson(this.jumpId).vipType;
        ClientEvents.SCROLL_TO_CHARGE_VIP.emit(vipJumpId);
        this.closeView();
    }
    //发送支付请求
    sendChargeHander_0 = () => {
        DotInst.clientSendDot(COUNTERTYPE.recharge, "4101", "1");
        DataMgr.rechargeModel.setChargeCost(this.mouthPrice);
        DataMgr.rechargeModel.setWxPayType(3);
        this.sendMouthHttp()
    }

    sendMouthHttp = () => { //月卡
        HttpInst.postData(NetConfig.BUYVIP, [this.vipData[0].id], (response: IRechargeActivityInfo) => {
            DotInst.clientSendDot(COUNTERTYPE.recharge, "4115");
            DataMgr.rechargeModel.fullData(response);
            ClientEvents.UPDATE_RECHARGE_ITEM_VIEW.emit(-1);
            this.closeView();
            let vipJumpId = JsonMgr.getVipJson(this.vipData[0].id).vipType;
            ClientEvents.SCROLL_TO_CHARGE_VIP.emit(vipJumpId);
        })
    }

    sendChargeHander_1 = () => {
        DotInst.clientSendDot(COUNTERTYPE.recharge, "4101", "2");
        DataMgr.rechargeModel.setChargeCost(this.jiPrice);
        DataMgr.rechargeModel.setWxPayType(4);
        this.sendJiHttp();
    }

    sendJiHttp = () => { //季度卡
        HttpInst.postData(NetConfig.BUYVIP, [this.vipData[1].id], (response: IRechargeActivityInfo) => {
            DotInst.clientSendDot(COUNTERTYPE.recharge, "4116");
            DataMgr.rechargeModel.fullData(response);
            ClientEvents.UPDATE_RECHARGE_ITEM_VIEW.emit(-1);
            this.closeView();
            let vipJumpId = JsonMgr.getVipJson(this.vipData[1].id).vipType;
            ClientEvents.SCROLL_TO_CHARGE_VIP.emit(vipJumpId);
        })
    }
}
