import {UIMgr} from "../../global/manager/UIManager";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {IOwnFrameInfo, ISettingInfo, IVipDataInfo} from "../../types/Response";
import {JsonMgr} from "../../global/manager/JsonManager";
import helpClass from "./help";
import feedBack from "./feedback";
import exchange from "./exchange";
import {DataManager, DataMgr, IPhoneState} from "../../Model/DataManager";
import soundSetting from "./soundSetting";
import customerService from "./customerService";
import fanList from "./fanList";
import {ButtonMgr} from "../common/ButtonClick";
import {CommonUtil} from "../../Utils/CommonUtil";
import branchDetail from "./branchDetail";
import friendFrame from "./friendFrame";
import {TextTipConst} from "../../global/const/TextTipConst";
import {GameComponent} from "../../core/component/GameComponent";
import {JumpConst} from "../../global/const/JumpConst";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {UIUtil} from "../../Utils/UIUtil";
import {topUiType} from "../MainUiTopCmpt";
import {COUNTERTYPE, DotInst} from "../common/dotClient";
import {GameManager} from "../../global/manager/GameManager";
import reviseName from "./reviseName";
import RechargeMain from "../Recharge/RechargeMain";
import vipItem from "./vipItem";
import Overflow = cc.Label.Overflow;

const {ccclass, property} = cc._decorator;

@ccclass
export default class Setting extends GameComponent {
    static url: string = "setting/setting";

    getBaseUrl() {
        return Setting.url;
    }

    @property(cc.Sprite)
    private headSprite: cc.Sprite = null;

    @property(cc.Label)
    private nameLabel: cc.Label = null;

    @property(cc.Label)
    private numLabel: cc.Label = null;

    @property(cc.Label)
    private storeLevelLabel: cc.Label = null;

    @property(cc.Label)
    private storeExpLabel: cc.Label = null;

    @property(cc.ProgressBar)
    private storeExpPro: cc.ProgressBar = null;

    @property(cc.Label)
    private popularityLabel: cc.Label = null;

    @property(cc.Label)
    private incomeLabel: cc.Label = null;

    @property(cc.Label)
    private attentionLabel: cc.Label = null;

    @property(cc.EditBox)
    private signatureEdi: cc.EditBox = null;

    @property(cc.Node)
    private attenNode: cc.Node = null;

    @property(cc.Label)
    private versionLabel: cc.Label = null;

    @property(cc.Node)
    private branchBtn: cc.Node = null;

    @property(cc.Label)
    private inputLimit: cc.Label = null;

    @property(cc.Node)
    private aniNode: cc.Node = null;

    @property(cc.Node)
    private redPoint: cc.Node = null;

    @property(cc.Node)
    private vipNode: cc.Node = null;

    @property(cc.Node)
    private inVipNode: cc.Node = null;

    @property(cc.Node)
    private onVipNode: cc.Node = null;

    @property(cc.Node)
    private marketNode: cc.Node = null;

    @property(cc.Node)
    private marketNode2: cc.Node = null;

    @property(cc.Node)
    private lodingBtn: cc.Node = null;

    @property(cc.Node)
    private reNameBtn: cc.Node = null;

    @property(cc.Prefab)
    private vipItem: cc.Prefab = null;

    @property(cc.Node)
    private vipParNode: cc.Node = null;

    private vip: boolean = false;
    private wxLoginBtn = null;

    private phoneState: number = 1; //IPhoneState.HIGH

    private versionLabClick: number = 0;

    load() {
        ButtonMgr.addClick(this.attenNode, this.updateFanList);
        ButtonMgr.addClick(this.headSprite.node, this.updateFriendFrame);
        ButtonMgr.addClick(this.branchBtn, this.updateBranchDetail);
        ButtonMgr.addClick(this.vipNode, this.jumpRechargeView);
        ButtonMgr.addClick(this.reNameBtn, this.reviseName);
        ButtonMgr.addClick(this.versionLabel.node, this.checkShowTestBtn);
        this.phoneState = DataMgr.getPhoneState();
    }

    // update (dt) {}
    start() {
        this.setStoreInfo();
        if (this.node['data']) {
            switch (this.node['data']) {
                case JumpConst.FRIENDKUANSET:
                    this.updateFriendFrame();
                    break;
                case JumpConst.FANSEE:
                    this.updateFanList();
                    break;
                case JumpConst.HELP:
                    this.helpClickHandler();
                    break;
                case JumpConst.FEEDBACK:
                    this.feedBackClickHandler();
                    break;
                case JumpConst.MUSICFANSEE:
                    this.settingClickHandler();
                    break;
                case JumpConst.CUSTOMERSERVICE:
                    this.customerClickHandler();
                    break;
                case JumpConst.EXCHANGE:
                    this.cdkClickHandler();
                    break;
            }
        }
        this.setLoadingBtn();
        this.addEvent(ClientEvents.REFRESH_NAME.on(this.updateName));
    }

    private checkShowTestBtn = () => {
        this.versionLabClick++;
        cc.log("versionLabClick", this.versionLabClick);
        if (this.versionLabClick == 13) {
            ClientEvents.MAP_PEOPLE_SPEED_SHOW.emit();
        } else if (this.versionLabClick > 13) {
            this.resetRoleSpeed();
        }
    };

    private resetRoleSpeed() {
        this.versionLabClick = 0;
        ClientEvents.MAP_PEOPLE_SPEED.emit(1);
        ClientEvents.MAP_PEOPLE_SPEED_HIDE.emit();
    }

    updateName = () => {
        let name: string = DataMgr.userData.nickName;
        if (name.length < 7) {
            this.nameLabel.overflow = Overflow.NONE;
        } else {
            this.nameLabel.node.setContentSize(cc.size(175, 50.4));
            this.nameLabel.overflow = Overflow.SHRINK;
        }
        this.nameLabel.string = name;
    };

    setLoadingBtn() {
        (GameManager.WxServices._wxGetSetting(() => {
            if (this.lodingBtn) {
                this.lodingBtn.active = false;
            }
        }, () => {
            if (this.lodingBtn) {
                this.lodingBtn.active = true;
                this.createLoginBtn();
            }
        }));
    }

    private createLoginBtn(): void {
        let btnSize = cc.size(this.lodingBtn.width + 5, this.lodingBtn.height + 5);
        let frameSize = cc.view.getFrameSize();
        let winSize = cc.winSize;
        //适配不同机型来创建微信授权按钮
        let left = (winSize.width * 0.5 + this.lodingBtn.x - btnSize.width * 0.5) / winSize.width * frameSize.width;
        let top = (winSize.height * 0.5 - this.lodingBtn.y - btnSize.height * 0.5) / winSize.height * frameSize.height + btnSize.height / 2;
        let width = btnSize.width / winSize.width * frameSize.width;
        let height = btnSize.height / winSize.height * frameSize.height;

        this.wxLoginBtn = wx.createUserInfoButton({
            type: 'text',
            text: "",
            style: {
                left: left,
                top: top,
                width: width,
                height: height,
                lineHeight: 0,
                backgroundColor: '',
                color: '',
                textAlign: 'center',
                fontSize: 16,
                borderRadius: 4
            }
        });
        this.wxLoginBtn.show();

        this.wxLoginBtn.onTap((res: any) => {
            if (res.userInfo) {
                if (this.lodingBtn) {
                    this.lodingBtn.active = false;
                }
                if (this.wxLoginBtn != null) {
                    this.wxLoginBtn.hide();
                    this.wxLoginBtn.destroy();
                }
                GameManager.WxServices._wxGetUserInfo(() => {
                    let url: string = DataMgr.userData.head;
                    UIUtil.loadUrlImg(url, this.headSprite);
                    this.updateName();
                });
            } else {
                cc.log("wxLogin auth fail");
                wx.showToast({title: "授权失败,请重新授权"});
            }
        });
    }

    jumpRechargeView = () => {
        DotInst.clientSendDot(COUNTERTYPE.setting, "3009");
        // UIMgr.showView(RechargeMain.url, null, 1);
        ClientEvents.EVENT_POPUP_DIAMOND_EXCHANGE.emit(1);
        this.closeView();
    };

    textChangeHandler() {
        this.inputLimit.string = "剩余输入文本" + (50 - this.signatureEdi.string.length) + "个";
    }

    inputBeginHandler() {
        this.inputLimit.node.active = true;
        this.inputLimit.string = "剩余输入文本" + (50 - this.signatureEdi.string.length) + "个";
    }

    updateFriendFrame = () => {
        this.redPoint.active = false;
        UIMgr.showView(friendFrame.url);
    };

    updateBranchDetail = () => {
        UIMgr.showView(branchDetail.url);
    };

    setStoreInfo() {
        let response: ISettingInfo = DataMgr.settingData.getSettingInfo();
        this.vip = response.vip;
        this.marketNode2.active = response.marketSetInfos.length > 1;
        this.marketNode.active = response.marketSetInfos.length <= 1;
        let pupuNum: number = 0;//人气值
        let proNum: number = 0;//收益
        for (let i in response.marketSetInfos) {
            pupuNum += response.marketSetInfos[i].popularity;
            proNum += response.marketSetInfos[i].profitOneHour;
        }
        let url: string = DataMgr.userData.head;
        UIUtil.loadUrlImg(url, this.headSprite);
        let needExp: number = JsonMgr.getLevel(DataMgr.userData.level, "exp");
        let percen: number = Number((DataMgr.userData.exp / needExp).toFixed(1));
        this.updateName();
        this.numLabel.string = DataMgr.userData.id.toString();
        this.storeLevelLabel.string = DataMgr.userData.level.toString();
        this.popularityLabel.string = pupuNum.toString();
        this.incomeLabel.string = proNum + "/小时";
        this.attentionLabel.string = response.fansCount.toString();
        this.storeExpLabel.string = CommonUtil.calculate(DataMgr.userData.exp) + "/" + CommonUtil.calculate(needExp);
        this.storeExpPro.progress = percen;
        this.signatureEdi.string = DataMgr.userData.signature;
        this.inputLimit.string = DataMgr.userData.signature.length + "/" + 50;
        this.versionLabel.string = "版本号：" + DataManager.version;
        this.setRedPoint();
        this.setVipStatus(response.vips)
    }

    setVipStatus(data: IVipDataInfo[]) {
        this.vipParNode.removeAllChildren();
        for (let i in data) {
            if (data[i].type != 1 && data[i].vip) {
                let node = cc.instantiate(this.vipItem);
                let item: vipItem = node.getComponent("vipItem");
                item.setVipItem(data[i]);
                this.vipParNode.addChild(node);
            } else if (data[i].type == 1) {
                this.onVipNode.active = data[i].vip;
                this.inVipNode.active = !data[i].vip;
            }
        }
    }

    setRedPoint() {
        let isRed: boolean = false;
        let data: IOwnFrameInfo[] = DataMgr.settingData.getOwnFriendFrames();
        for (let i in data) {
            if (data[i].redDot) {
                isRed = true;
                break;
            }
        }
        this.redPoint.active = isRed;
    }

    //帮助
    helpClickHandler() {
        UIMgr.showView(helpClass.url);
    }

    //反馈
    feedBackClickHandler() {
        UIMgr.showView(feedBack.url);
    }

    //设置
    settingClickHandler() {
        UIMgr.showView(soundSetting.url);
    }

    //cdk
    cdkClickHandler() {
        DotInst.clientSendDot(COUNTERTYPE.setting, "3007");
        UIMgr.showView(exchange.url);
    }

    //客服
    customerClickHandler() {
        DotInst.clientSendDot(COUNTERTYPE.setting, "3006");
        UIMgr.showView(customerService.url);
    }

    //粉丝一览
    updateFanList = () => {
        DotInst.clientSendDot(COUNTERTYPE.setting, "3010");
        UIMgr.showView(fanList.url);
    };

    //改名
    reviseName = () => {
        UIMgr.showView(reviseName.url);
    };

    //关闭
    closeClickHandler() {
        DotInst.clientSendDot(COUNTERTYPE.setting, "3008");
        let phoneState: IPhoneState = DataMgr.getPhoneState();
        let phoneStateChanged: boolean = this.phoneState != phoneState;
        if (phoneStateChanged) { //高低清状态有改变的话则抛出事件
            this.closeOnly();
            //抛出事件会导致地图重新加载可变资源，并触发生成小人和大巴，所以上面使用closeOnly
            ClientEvents.CHANGE_PHONE_STATE.emit(phoneState);
        } else {
            this.closeView();
        }

        if (this.wxLoginBtn != null) {
            this.wxLoginBtn.hide();
            this.wxLoginBtn.destroy();
        }
    }

    onEnable(): void {
        this.onShowPlay(1, this.aniNode);
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.ordinary);
        this.resetRoleSpeed();
    }

    onDisable(): void {
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -1);
    }

    ruleHandler() {
        UIMgr.showTextTip(TextTipConst.SettingRuleTip);
    }

    inputEndHandler() {
        let str: string = this.signatureEdi.string;
        DotInst.clientSendDot(COUNTERTYPE.setting, "3002", str);
        HttpInst.postData(NetConfig.CHANGE_SIGNATURE, [str], () => {
            this.inputLimit.node.active = false;
        });
    }
}
