import {GameComponent} from "../../core/component/GameComponent";
import {ButtonMgr} from "../common/ButtonClick";
import List from "../../Utils/GridScrollUtil/List";
import InviteAwardItem from "./InviteAwardItem";
import {JsonMgr} from "../../global/manager/JsonManager";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {GameManager} from "../../global/manager/GameManager";
import {UIMgr} from "../../global/manager/UIManager";
import {TextTipConst} from "../../global/const/TextTipConst";
import {topUiType} from "../MainUiTopCmpt";
import {COUNTERTYPE, DotInst} from "../common/dotClient";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {DataMgr} from "../../Model/DataManager";

const {ccclass, property} = cc._decorator;

export enum AWARD_TYPE {
    CAN_RECEIVE = 1,       //可领取
    IS_RECEIVED = 2,       //已领取
    CAN_NOT_RECEIVE = 3    //不可领取
}

@ccclass
export default class InviteActivity extends GameComponent {

    static url: string = "InviteActivity/InviteActivity";

    @property(cc.Label)
    label: cc.Label = null;

    @property(cc.Node)
    aniNode: cc.Node = null;

    @property(cc.Label)
    numLabel: cc.Label = null;

    @property(cc.Button)
    inviteBtn: cc.Button = null;

    @property(cc.Button)
    closeBtn: cc.Button = null;

    @property(cc.Button)
    roleBtn: cc.Button = null;

    @property(cc.Prefab)
    awardItem: cc.Prefab = null;

    @property(cc.Sprite)
    bannerSprit: cc.Sprite = null;

    @property(cc.ScrollView)
    private scrollNode: cc.ScrollView = null;

    private myInviteData = null;
    private awardsArr = [];

    onEnable() {
        this.onShowPlay(2, this.aniNode);
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.ordinary);
    }

    onDisable(): void {
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -1);
        HttpInst.postData(NetConfig.REDPOLLING, [], (response) => {
            if (response.redDots) {
                DataMgr.setRedData(response.redDots);
                ClientEvents.UPDATE_MAINUI_RED.emit(response.redDots);
            } else {
                ClientEvents.HIDE_MAINUI_RED.emit();
            }
        })
    }

    onLoad() {
        //let bannerJson: IBannerJson = JsonMgr.getBannerDataVO(this.node["data"].bannerId);    //策划说活动图片拼死
        //UIUtil.loadUrlImg(bannerJson.bannerUrl, this.bannerSprit);
        this.myInviteData = this.node["data"].inviteData;
        ButtonMgr.addClick(this.closeBtn.node, () => {
            this.closeOnly();
            ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -2);
        });
        ButtonMgr.addClick(this.roleBtn.node, () => {
            UIMgr.showTextTip(TextTipConst.InviteTip);
        });
        ButtonMgr.addClick(this.inviteBtn.node, () => {
            DotInst.clientSendDot(COUNTERTYPE.share, "14006");
            let inviteJson: IActivityJson = JsonMgr.getActivityJson(40001);
            let shareJson: IShareJson = JsonMgr.getShareJsonByType(inviteJson.type);
            GameManager.WxServices.shareGame(shareJson.word, shareJson.pictrue, "activityId=10002");
        });
        let awardsJson: IinviteJson[] = JsonMgr.getAllInviteJson();
        for (let i in awardsJson) {
            this.awardsArr.push(awardsJson[i]);
        }
        this.refreshView();
    }

    start() {
        this.dispose.add(ClientEvents.REFRESH_INVITE_VIEW.on((msg) => {
            this.myInviteData = msg;
            this.refreshView();
        }))
    }

    refreshView() {
        if (this.myInviteData.inviteNum < 10) {
            this.label.string = "当前已邀请    位好友";
        } else {
            this.label.string = "当前已邀请      位好友";
        }
        this.numLabel.string = this.myInviteData.inviteNum;
        this.scrollNode.getComponent(List).numItems = this.awardsArr.length;
    }

    onListVRender(item: cc.Node, idx: number) {
        let awardItem: InviteAwardItem = item.getComponent(InviteAwardItem);
        let type: AWARD_TYPE = AWARD_TYPE.CAN_NOT_RECEIVE;
        if (this.myInviteData.receivedRewardIds && this.myInviteData.receivedRewardIds.indexOf(this.awardsArr[idx].id) >= 0) {
            type = AWARD_TYPE.IS_RECEIVED;
        } else {
            if (this.myInviteData.inviteNum >= this.awardsArr[idx].wechatInvite) {
                type = AWARD_TYPE.CAN_RECEIVE;
            } else {
                type = AWARD_TYPE.CAN_NOT_RECEIVE;
            }
        }
        awardItem.updateItem(this.awardsArr[idx], type);
    }

    protected getBaseUrl(): string {
        return InviteActivity.url;
    }

}
