import {GameComponent} from "../../core/component/GameComponent";
import {ButtonMgr} from "../common/ButtonClick";
import {UIMgr} from "../../global/manager/UIManager";
import {TimeUtil} from "../../Utils/TimeUtil";
import {TimeOutType} from "../staff/recruit/LeftTime";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {JsonMgr} from "../../global/manager/JsonManager";
import {COUNTERTYPE, DotInst} from "../common/dotClient";
import {CommonUtil} from "../../Utils/CommonUtil";
import {DataMgr} from "../../Model/DataManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class IncentiveCountdown extends GameComponent {

    static url: string = "incentiveCountdown/incentiveCountdown";
    private inspirePurchaseTime: number = 10;
    private inspireCost: string[] = ["-3", "100"];

    getBaseUrl() {
        return IncentiveCountdown.url;
    }

    @property(cc.Node)
    private callBtn: cc.Node = null;
    @property(cc.Node)
    private buyBtn: cc.Node = null;

    onLoad() {
        let data = this.node["data"];
        this.iniTime(data);
        ButtonMgr.addClick(this.callBtn, () => {
            DotInst.clientSendDot(COUNTERTYPE.incentive, "15003");
            HttpInst.postData(NetConfig.INSPIRE_INIF, [], () => {
            });
            this.closeOnly();
        });
        ButtonMgr.addClick(this.buyBtn, this.onBuy);
    }


    onBuy = () => {
        HttpInst.postData(NetConfig.INSPIRE_PURCHASE, [], () => {
            DotInst.clientSendDot(COUNTERTYPE.incentive, "15002");
            UIMgr.showTipText("购买成功！！！");
            this.closeOnly();
        });
    };

    @property(cc.RichText)
    leftTimeLabel: cc.RichText = null;

    millis: number = -1;
    interval = null;

    private type: TimeOutType = null;

    private des: string = "";

    iniTime(millis: number, type?: TimeOutType, des?: string) {
        this.des = "";
        this.millis = millis;
        this.type = type;
        if (millis <= 0) {
            this.leftTimeLabel.string = "";
            return;
        }
        if (des) {
            this.des = des;
        }
        this.inspirePurchaseTime = JsonMgr.getConstVal("inspirePurchaseTime");
        this.inspireCost = JsonMgr.getConstVal("inspireCost").split(",");
        this.leftTimeLabel.string =
            "<color=#009900>" + TimeUtil.getLeftTimeStr(this.millis) + "</color><color=#6d3115>后可回复1点促销点，也可使用钻石</color><color=#009900>       " + this.inspireCost[1] + " </color><color=#6d3115>回复" + this.inspirePurchaseTime + "次。</color>";
        //"" + TimeUtil.getLeftTimeStr(this.millis) + "后可回复1点促销点，也可使用" + this.inspireCost[1] + "钻石购买" + this.inspirePurchaseTime + "次哦~";
    }

    onEnable() {
        if (this.hasTime()) {
            this.checkClearInterval();
            this.interval = setInterval(() => {
                this.millis -= 1000;
                if (this.millis <= 0) {
                    this.leftTimeLabel.string = "<color=#009900>00:00:00 </color><color=#6d3115>后可回复1点促销点，也可使用钻石</color><color=#009900>       " + this.inspireCost[1] + " </color><color=#6d3115>回复" + this.inspirePurchaseTime + "次。</color>";
                    this.checkClearInterval();
                } else {
                    this.leftTimeLabel.string = "<color=#009900>" + TimeUtil.getLeftTimeStr(this.millis) + "</color><color=#6d3115>后可回复1点促销点，也可使用钻石</color><color=#009900>       " + this.inspireCost[1] + " </color><color=#6d3115>回复" + this.inspirePurchaseTime + "次。</color>";
                }
            }, 1000);
        }
    }

    onDisable() {
        this.checkClearInterval();
    }

    private checkClearInterval() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    hasTime() {
        return this.millis > 0;
    }
}
