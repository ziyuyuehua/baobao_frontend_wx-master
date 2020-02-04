import {ButtonMgr} from "./ButtonClick";
import {UIMgr} from "../../global/manager/UIManager";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {IRespData} from "../../types/Response";
import GoldExchange_wx from "../exchange/goldExchange_wx";
import {FunctionName, JsonMgr} from "../../global/manager/JsonManager";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {GameManager} from "../../global/manager/GameManager";
import WelfareView from "../Welfare/WelfareView";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonInsufficient extends cc.Component {
    static url: string = "common/commonInsufficient";

    @property(cc.Node)
    cancleNode: cc.Node = null;

    @property(cc.Node)
    sureNode: cc.Node = null;

    @property(cc.Label)
    tipLabel: cc.Label = null;

    private type: number = 0;

    start() {
        this.type = this.node['data'];
        if (this.type == InsufficientType.Gold) {
            if (!JsonMgr.isFunctionOpen(FunctionName.GoldExchange)) {
                // let openJson: IFunctionOpenJson = JsonMgr.getFunctionOpenByName(FunctionName.GoldExchange);
                // let positionJson: IPositionJson = JsonMgr.getPositionJson(openJson.value);
                // UIMgr.showTipText("金币兑换将于职位达到【" + positionJson.name + positionJson.level + "阶】后开启");
                UIMgr.showTipText("金币不足，去戳金币攒钱吧~");
                this.cancleHandelr();
                return;
            }
            this.tipLabel.string = "金币不足，是否前往兑换";
        } else if (this.type == InsufficientType.Diamond) {
            if (GameManager.isIos()) {
                if (!JsonMgr.isFunctionOpen(FunctionName.charge)) {
                    UIMgr.showTipText("钻石不足！！！");
                    this.cancleHandelr();
                    return;
                }
                this.tipLabel.string = "钻石不足，是否前往福利观看广告";
            } else {
                this.tipLabel.string = "钻石不足，是否前往兑换";
            }
        }

        ButtonMgr.addClick(this.cancleNode, this.cancleHandelr);
        ButtonMgr.addClick(this.sureNode, this.sureHandler);
    }

    cancleHandelr = () => {
        UIMgr.closeView(CommonInsufficient.url);
    };

    sureHandler = () => {
        if (this.type == InsufficientType.Gold) {
            HttpInst.postData(NetConfig.GET_EXCHANGE_GOLD, [], (response: IRespData) => {
                UIMgr.showView(GoldExchange_wx.url, cc.director.getScene(), response, null, true)
            });
        } else if (this.type == InsufficientType.Diamond) {
            if (GameManager.isIos()) {
                UIMgr.showView(WelfareView.url);
            } else {
                ClientEvents.EVENT_POPUP_DIAMOND_EXCHANGE.emit();
            }
        }
        this.cancleHandelr();
    }

}

export enum InsufficientType {
    Gold = 1,
    Diamond = 2,
}
