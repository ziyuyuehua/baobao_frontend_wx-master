import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {MailboxData} from "../../Model/MailboxData";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {CommonUtil} from "../../Utils/CommonUtil";
import {COUNTERTYPE, DotInst, DotVo} from "../common/dotClient";
import {DataMgr} from "../../Model/DataManager";
import {UIMgr} from "../../global/manager/UIManager";
import {GameComponent} from "../../core/component/GameComponent";
import {topUiType} from "../MainUiTopCmpt";
import {TextTipConst} from "../../global/const/TextTipConst";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MailboxList extends GameComponent {
    static url = 'mailbox/mailbox';

    getBaseUrl() {
        return MailboxList.url;
    }

    @property(cc.Prefab)
    private mailboxPrefab: cc.Prefab = null;
    @property(cc.Node)
    private redDotSprite: cc.Node = null;
    @property(cc.Node)
    private noMailSprite: cc.Node = null;
    @property(cc.Label)
    private mailboxNumber: cc.Label = null;
    @property(cc.Button)
    private yijianlingquButton: cc.Button = null;
    @property(cc.Node)
    private yijianshanchuBtn: cc.Node = null;
    private mailboxData: MailboxData = null;
    @property(cc.Node)
    private aniNode: cc.Node = null;

    onLoad() {
        this.addEvent(ClientEvents.EVENT_REFRESH_MAIL_LIST.on(this.loadMail));
    }

    onEnable(): void {
        this.onShowPlay(1, this.aniNode);
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.gold);
    }

    start() {
        this.loadMail();
    }

    loadMail = () => {
        if (!DataMgr.mailboxData) {
            return;
        }
        this.mailboxData = DataMgr.mailboxData;
        let size: number = this.mailboxData.mailbox.length;
        this.mailboxNumber.string = size + "/99";
        size === 99 ? this.redDotSprite.active = true : this.redDotSprite.active = false;
        ClientEvents.EVENT_SCROLLVIEW_LOADITEM.emit(this.mailboxPrefab, size, "mailboxList");
        let haveAnnex: boolean = false;
        for (let i of this.mailboxData.mailbox) {
            if (i.haveAnnex) {
                haveAnnex = true;
                break;
            }
        }
        this.yijianshanchuBtn.active = !haveAnnex && size > 0;
        this.yijianlingquButton.node.active = haveAnnex || size <= 0;
        this.yijianlingquButton.interactable = size > 0;
        this.noMailSprite.active = size <= 0;
    };


    //关闭邮箱
    onfanhuiBtn() {
        DotInst.clientSendDot(COUNTERTYPE.email, "10105");
        this.closeView();
    }


    //一键领取
    oneKeyReceiveBtn() {
        DotInst.clientSendDot(COUNTERTYPE.email, "10101");
        HttpInst.postData(NetConfig.RECEIVE_ONE_KEY, [], () => {
            this.loadMail && this.loadMail();
            CommonUtil.showRedDot();
        });
    }

    aKeytoDelete() {
        HttpInst.postData(NetConfig.RECEIVE_ONE_KEY, [], () => {
            this.loadMail && this.loadMail();
            UIMgr.showTipText(TextTipConst.NOGET);
            CommonUtil.showRedDot();
        });
    }

    onDisable() {
        this.dispose.dispose();
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -2);
    }

    // update (dt) {}
}
