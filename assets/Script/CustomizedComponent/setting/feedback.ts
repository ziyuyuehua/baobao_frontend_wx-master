import { HttpInst } from "../../core/http/HttpClient";
import { NetConfig } from "../../global/const/NetConfig";
import { UIMgr } from "../../global/manager/UIManager";
import { GameComponent } from "../../core/component/GameComponent";
import { ClientEvents } from "../../global/manager/ClientEventCenter";
import { topUiType } from "../MainUiTopCmpt";
import { DotInst, COUNTERTYPE } from "../common/dotClient";

const { ccclass, property } = cc._decorator;

@ccclass
export default class feedBack extends GameComponent {
    static url: string = "setting/other/feedback";
    @property(cc.EditBox)
    private feedbackEditBox: cc.Label = null;

    @property(cc.Label)
    private inputLimt: cc.Label = null;

    @property(cc.Node)
    private aniNode: cc.Node = null;

    protected getBaseUrl(): string {
        return feedBack.url;
    }

    onEnable(): void {
        this.onShowPlay(2, this.aniNode);
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.gold);
    }

    onDisable(): void {
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -2);
    }

    onLoad() {
    }

    start() {
        this.inputLimt.string = this.feedbackEditBox.string.length + "/" + 300;
    }

    shutDownBtn() {
        UIMgr.closeView(feedBack.url);
    }

    textChangeHandler() {
        this.inputLimt.string = this.feedbackEditBox.string.length + "/" + 300;
    }

    sendBtn() {
        let text = this.feedbackEditBox.string;
        if (text) {
            DotInst.clientSendDot(COUNTERTYPE.setting, "3004", text);
            HttpInst.postData(NetConfig.FEEDBACK_SERVICE, [text], () => {
                UIMgr.showTipText("感谢你的反馈");
                this.feedbackEditBox.string = "";
                this.inputLimt.string = this.feedbackEditBox.string.length + "/" + 300;
            });
        } else {
            UIMgr.showTipText("发送内容不能为空");
        }
    }

    // update (dt) {}
}
