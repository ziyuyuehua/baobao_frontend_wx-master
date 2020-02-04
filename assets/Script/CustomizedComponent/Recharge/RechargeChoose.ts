import { GameComponent } from "../../core/component/GameComponent";
import { JsonMgr } from "../../global/manager/JsonManager";
import { HttpInst } from "../../core/http/HttpClient";
import { NetConfig } from "../../global/const/NetConfig";
import { UIMgr } from "../../global/manager/UIManager";
import { ButtonMgr } from "../common/ButtonClick";
import { ClientEvents } from "../../global/manager/ClientEventCenter";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RechargeChoose extends GameComponent {
    static url: string = "recharge/RechargeChoose"

    @property([cc.Node])
    private staffChoose: Array<cc.Node> = [];

    @property(cc.Node)
    private choose: cc.Node = null;

    @property([cc.Node])
    private bearNode: Array<cc.Node> = [];

    private bearId = null;
    getBaseUrl() {
        return RechargeChoose.url;
    }

    start() {
        this.vipControl("black");
        ButtonMgr.addClick(this.bearNode[0], () => {
            this.vipControl("white");
        })
        ButtonMgr.addClick(this.bearNode[1], () => {
            this.vipControl("black");
        })
        ButtonMgr.addClick(this.choose, () => {
            this.getgift();
        })
    }

    //开通vip奖励
    vipControl = (bear: string) => {
        let staffData = JsonMgr.getConstVal("vipFirstStaff");
        let staffArr = staffData.split(";")
        let whiteBear = staffArr[0].split(",")
        let blackBear = staffArr[1].split(",")
        this.bearId = whiteBear[0];
        //选白熊
        if (bear == "white") {
            this.staffChoose[0].active = true;
            this.staffChoose[1].active = false;
            this.bearId = whiteBear[0]
        }
        //选黑熊
        if (bear == "black") {
            this.staffChoose[0].active = false;
            this.staffChoose[1].active = true;
            this.bearId = blackBear[0]
        }
    }

    getgift = () => {
        //领取熊+装饰
        HttpInst.postData(NetConfig.RECEIVE_FIST, [this.bearId], (Response: any) => { })
        UIMgr.closeView(RechargeChoose.url);
        ClientEvents.UPDATE_RECHARGE_VIEW.emit();
    }
}
