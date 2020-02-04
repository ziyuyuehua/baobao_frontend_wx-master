import { ClientEvents } from "../../global/manager/ClientEventCenter";
import { CompositeDisposable } from "../../Utils/event-kit";
import { mailbox, MailboxData } from "../../Model/MailboxData";
import { HttpInst } from "../../core/http/HttpClient";
import { NetConfig } from "../../global/const/NetConfig";
import { CommonUtil } from "../../Utils/CommonUtil";
import { DataMgr } from "../../Model/DataManager";
import { JsonMgr } from "../../global/manager/JsonManager";
import { ResMgr } from "../../global/manager/ResManager";
import { UIMgr } from "../../global/manager/UIManager";
import { DotInst, COUNTERTYPE } from "../common/dotClient";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Mailboxitem extends cc.Component {

    @property(cc.Prefab)
    private attachmentSprite: cc.Prefab = null;
    @property(cc.Node)
    private redDotSprite: cc.Node = null;
    @property(cc.Node)
    private lqBtn: cc.Node = null;
    @property(cc.Node)
    private scBtn: cc.Node = null;
    @property(cc.Node)
    private attachment: cc.Node = null;
    @property(cc.Label)
    private mailboxThemeLabel: cc.Label = null;
    @property(cc.Label)
    private mailboxLabel: cc.Label = null;
    @property(cc.Label)
    private DaysLabel: cc.Label = null;
    private dispose = new CompositeDisposable();

    private data: Array<mailbox> = null;

    onLoad() {
        this.dispose.add(ClientEvents.EVENT_REFRESH_GOODSITEM.on(this.refreshItem));
    }

    start() {
        this.itemInit(parseInt(this.node.name));
    }

    itemInit = (index: number) => {
        let mailboxData: MailboxData = DataMgr.mailboxData;
        this.data = mailboxData.mailbox;
        let size: number = this.data.length;
        this.node.name = index + "";
        this.attachmentInit(size - index - 1);
        this.mailboxThemeLabel.string = this.data[size - index - 1].theme;
        //邮件剩余天数
        let dayas: number = new Date(this.data[size - index - 1].timeRemaining * 1000).getDate();
        this.DaysLabel.string = "剩余" + (dayas - 1) + "天";
        this.mailboxLabel.string = this.data[size - index - 1].text;
        if (this.data[size - index - 1].haveAnnex) {
            this.redDotSprite.active = this.data[size - index - 1].haveAnnex && DataMgr.getCanShowRedPoint();
            this.lqBtn.active = true;
            this.scBtn.active = false;
            return;
        }
        if (!this.data[size - index - 1].read) {
            this.redDotSprite.active = !this.data[size - index - 1].read && DataMgr.getCanShowRedPoint();
            this.lqBtn.active = false;
            this.scBtn.active = true;
            HttpInst.postData(NetConfig.SEE_MAIL, [size - index - 1], () => {
            });
            return;
        }
        this.redDotSprite.active = false;
        this.lqBtn.active = false;
        this.scBtn.active = true;
    };

    refreshItem = (index: number, item: cc.Node) => {
        if (item.name != this.node.name) {
            return;
        }
        this.itemInit(index);
    };

    //附件初始化
    attachmentInit = (index: number) => {
        this.attachment.removeAllChildren();
        if (!this.data[index].haveAnnex) {
            return;
        }
        if (this.data[index].annex == "") {
            return;
        }
        let attachmentData = [];
        let str = this.data[index].annex.split(";");
        for (let a of str) {
            attachmentData.push(a.split(","))
        }
        for (let i = 0; i < (attachmentData.length > 4 ? 4 : attachmentData.length); i++) {
            let a = attachmentData[i];
            let json = JsonMgr.getInformationAndItem(a[0]);
            let attachmentNode = cc.instantiate(this.attachmentSprite);
            let iconBg: cc.Node = attachmentNode.getChildByName("iconBg");
            if (a[0] >= 1001 && a[0] < 9999) {
                ResMgr.getItemBox(iconBg.getComponent(cc.Sprite), "k6");
                attachmentNode.getChildByName("thePropsNumber").active = false;
                // attachmentNode.getChildByName("XINGXING").active = true;
            } else {
                ResMgr.getItemBox(iconBg.getComponent(cc.Sprite), "k" + json.color);
            }
            iconBg.scale = 0.51;
            let node: cc.Sprite = attachmentNode.getChildByName("thePropsImg").getComponent(cc.Sprite);
            ResMgr.imgTypeJudgment(node, parseInt(a[0]));
            attachmentNode.getChildByName("thePropsNumber").getComponent(cc.Label).string = "" + CommonUtil.numChange(a[1], 1);
            this.attachment.addChild(attachmentNode);
            UIMgr.addDetailedEvent(attachmentNode, parseInt(a[0]));
        }
    };

    //领取
    receiveBtn() {
        let size: number = this.data.length;
        let index: number = parseInt(this.node.name);
        DotInst.clientSendDot(COUNTERTYPE.email, "10103", size - index - 1 + "");
        HttpInst.postData(NetConfig.RECEIVE_ANNEX, [size - index - 1], () => {
            ClientEvents.EVENT_REFRESH_MAIL_LIST.emit();
            CommonUtil.showRedDot();
        });
    }

    //删除
    deleteBtn() {
        let size: number = this.data.length;
        let index: number = parseInt(this.node.name);
        DotInst.clientSendDot(COUNTERTYPE.email, "10104", size - index - 1 + "");
        HttpInst.postData(NetConfig.DELETE_MAIL, [size - index - 1], () => {
            ClientEvents.EVENT_REFRESH_MAIL_LIST.emit();
        });
    }

    onDestroy() {
        UIMgr.closeView("common/tips");
        this.dispose.dispose();
    }

    // update (dt) {}
}
