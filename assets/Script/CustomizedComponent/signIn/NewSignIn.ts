import { GameComponent } from "../../core/component/GameComponent";
import { ButtonMgr } from "../common/ButtonClick";
import { TextTipConst } from "../../global/const/TextTipConst";
import { UIMgr } from "../../global/manager/UIManager";
import { DataMgr } from "../../Model/DataManager";
import { HttpInst } from "../../core/http/HttpClient";
import { NetConfig } from "../../global/const/NetConfig";
import { ClientEvents } from "../../global/manager/ClientEventCenter";
import { JsonMgr } from "../../global/manager/JsonManager";
import { ResMgr } from "../../global/manager/ResManager";
import { CommonUtil } from "../../Utils/CommonUtil";
import { topUiType } from "../MainUiTopCmpt";
import { DotInst, COUNTERTYPE } from "../common/dotClient";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewSignIn extends GameComponent {
    static url = 'signIn/NewSignIn';

    getBaseUrl() {
        return NewSignIn.url;
    }

    @property(cc.Node)
    private loadItemNode: cc.Node = null;
    @property(cc.Node)
    private loadItemNode1: cc.Node = null;

    @property(cc.Prefab)
    private signInItem: cc.Prefab = null;
    @property(cc.Node)
    private helpBtn: cc.Node = null;
    @property(cc.Node)
    private shutBtn: cc.Node = null;
    @property(cc.Node)
    private signInBtn: cc.Node = null;
    @property(cc.Node)
    private noSignInBtn: cc.Node = null;
    @property([cc.Sprite])
    private iconBg: cc.Sprite[] = [];
    @property([cc.Sprite])
    private icon: cc.Sprite[] = [];
    @property([cc.Label])
    private iconNum: cc.Label[] = [];
    @property(cc.Sprite)
    private stateLab: cc.Sprite = null;
    @property([cc.SpriteFrame])
    private SF: cc.SpriteFrame[] = [];
    @property(cc.Node)
    private signInState: cc.Node[] = [];
    @property([cc.Node])
    private signInRew: cc.Node[] = [];
    @property(cc.Node)
    private aniNode: cc.Node = null;

    onLoad() {
        let data = DataMgr.signInData;
        if (data !== null) {
            this.loadSignIn();
        }
        this.addEvent(ClientEvents.SIGNIN_CONTINUOUS.on(this.loadContinuous));
    }

    start() {
        this.addOnBtn();
    }

    onEnable(): void {
        this.onShowPlay(1, this.aniNode);
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.ordinary);
    }

    onDisable(): void {
        this.dispose.dispose();
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -1);
    }

    addOnBtn = () => {
        ButtonMgr.addClick(this.helpBtn, this.signInHelpBtn);
        ButtonMgr.addClick(this.shutBtn, () => {
            DotInst.clientSendDot(COUNTERTYPE.sign, "10004");
            this.closeView();
        });
        ButtonMgr.addClick(this.signInBtn, this.onCheckedInBtn);
    };

    signInHelpBtn = () => {
        DotInst.clientSendDot(COUNTERTYPE.sign, "10005");
        UIMgr.showTextTip(TextTipConst.SignInTip);
    };

    loadSignIn = () => {
        if(!this.signInBtn) return;
        let data = DataMgr.signInData;
        this.signInBtn.active = !data.isCheckinToday;
        this.noSignInBtn.active = data.isCheckinToday;
        this.loadItemNode.removeAllChildren();
        this.loadItemNode1.removeAllChildren();

        for (let i = 1; i <= 7; i++) {
            let node = cc.instantiate(this.signInItem);
            node.name = i + "";
            if (i < 5) {
                this.loadItemNode.addChild(node);
            } else {
                this.loadItemNode1.addChild(node);
            }
        }
    };

    loadContinuous = (idx: number, rew: string) => {
        let ble: boolean = false;
        let ble1: boolean = false;
        this.signInRew.forEach((node: cc.Node) => {
            node.active = false;
        });
        switch (idx) {
            case 1:
                this.stateLab.spriteFrame = this.SF[0];//"今天签到后，明日签到可额外 领取以下奖励哦~";
                ble = true;
                break;
            case 2:
                //"昨天签今天没签，今日签到可额外 领取以下奖励哦~";
                this.stateLab.spriteFrame = this.SF[1];
                this.signInRew.forEach((node: cc.Node) => {
                    node.active = false;
                });
                ble = true;
                ble1 = true;
                break;
            case 3:
                //"昨天今天都没签，今日签到后 明日再次签到可额外 领取以下奖励哦~";
                this.stateLab.spriteFrame = this.SF[2];
                break;
        }
        this.signInState[0].active = ble;
        this.signInState[1].active = ble;
        this.signInState[2].active = ble1;
        this.attachmentInit(rew);
    };

    //附件初始化
    attachmentInit = (reward: string) => {
        let attachmentData = [];
        let str = reward.split(";");
        for (let a of str) {
            attachmentData.push(a.split(","))
        }
        for (let i = 0; i < (attachmentData.length > 3 ? 3 : attachmentData.length); i++) {
            let id = attachmentData[i];
            let t = JsonMgr.getInformationAndItem(id[0]);
            if (!t) {
                return;
            }
            ResMgr.getItemBox(this.iconBg[i], "k" + t.color, 0.7);
            ResMgr.imgTypeJudgment(this.icon[i], parseInt(id[0]));
            this.iconNum[i].string = CommonUtil.numChange(parseInt(id[1]), 1) + "";
            UIMgr.addDetailedEvent(this.iconBg[i].node, parseInt(id[0]));
        }
    };

    //签到
    onCheckedInBtn = () => {
        let signInData = DataMgr.signInData;
        if (!signInData.isCheckinToday) {
            HttpInst.postData(NetConfig.SIGN_IN, [], this.loadSignIn);
        }
    };

}
