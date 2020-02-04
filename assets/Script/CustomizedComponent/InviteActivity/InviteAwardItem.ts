import {AWARD_TYPE} from "./InviteActivity";
import FavorabilityGiftItem from "../favorability/FavorabilityGiftItem";
import {ButtonMgr} from "../common/ButtonClick";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {COUNTERTYPE, DotInst} from "../common/dotClient";

const {ccclass, property} = cc._decorator;

@ccclass
export default class InviteAwardItem extends cc.Component {

    @property(cc.Node)
    awards: cc.Node = null;

    @property(cc.RichText)
    label: cc.RichText = null;

    @property(cc.Button)
    receiveBtn: cc.Button = null;

    @property(cc.Node)
    receive1: cc.Node = null;

    @property(cc.Node)
    receive2: cc.Node = null;

    @property(cc.Node)
    isReceivedIcon: cc.Node = null;

    @property(cc.Prefab)
    ItemPrefab: cc.Prefab = null;

    private curAwardId: number = 0;


    onLoad() {
        ButtonMgr.addClick(this.receiveBtn.node, this.receiveAward)
    }

    receiveAward = () => {
        DotInst.clientSendDot(COUNTERTYPE.share, "14007", this.curAwardId + "");
        HttpInst.postData(NetConfig.GET_INVITE_AWARD, [this.curAwardId], (res) => {
            ClientEvents.REFRESH_INVITE_VIEW.emit(res.invite);
        })
    }

    updateItem(data: IinviteJson, type: AWARD_TYPE) {
        this.curAwardId = data.id;
        this.label.string = "<color=#814D34>邀请新玩家达到</c><color=#1BA015>" + data.wechatInvite + "</color><color=#814D34>人</c>";
        this.initAwars(data.inviteReward);
        switch (type) {
            case AWARD_TYPE.CAN_RECEIVE:
                this.receiveBtn.node.active = true;
                this.isReceivedIcon.active = false;
                this.receive1.active = true;
                this.receive2.active = false;
                break;
            case AWARD_TYPE.CAN_NOT_RECEIVE:
                this.receiveBtn.node.active = true;
                this.isReceivedIcon.active = false;
                this.receiveBtn.interactable = false;
                this.receive1.active = false;
                this.receive2.active = true;
                break;
            case AWARD_TYPE.IS_RECEIVED:
                this.receiveBtn.node.active = false;
                this.isReceivedIcon.active = true;
                break;
        }
    }

    initAwars(awardStr: string) {
        let dataStr: string[] = awardStr.split(";");
        this.awards.removeAllChildren();
        dataStr.forEach((value, index) => {
            let node = cc.instantiate(this.ItemPrefab);
            let awardItem: FavorabilityGiftItem = node.getComponent(FavorabilityGiftItem);
            let itemstr: string[] = value.split(",");
            awardItem.updateItem(Number(itemstr[0]), Number(itemstr[1]));
            awardItem.setItemNumState(true);
            awardItem.node.setScale(1.1, 1.1);
            awardItem.smallIcon();
            this.awards.addChild(node);
        })

    }

}
