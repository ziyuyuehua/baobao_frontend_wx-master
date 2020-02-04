// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {UIMgr} from "../../global/manager/UIManager";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {ButtonMgr} from "../common/ButtonClick";
import {GameComponent} from "../../core/component/GameComponent";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {topUiType} from "../MainUiTopCmpt";

const {ccclass, property} = cc._decorator;

@ccclass
export default class exchange extends GameComponent {
    static url: string = "setting/other/exchange";
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    @property(cc.EditBox)
    private cdkEdiBox: cc.EditBox = null;

    @property(cc.Node)
    private sendBtn: cc.Node = null;

    @property(cc.Node)
    private aniNode: cc.Node = null;

    start() {
        ButtonMgr.addClick(this.sendBtn, this.sendRequest);
    }

    closeHandler() {
        UIMgr.closeView(exchange.url);
    }

    protected getBaseUrl(): string {
        return exchange.url;
    }

    onEnable(): void {
        this.onShowPlay(2, this.aniNode);
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.gold);
    }

    onDisable(): void {
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -2);
    }

    sendRequest = () => {
        let text: string = this.cdkEdiBox.string;
        if (text.length == 0) {
            UIMgr.showTipText("兑换码不能为空");
            return;
        }
        HttpInst.postData(NetConfig.CDK_SERVICE, [text], (res) => {
            this.cdkEdiBox.string = "";
            UIMgr.showTipText("兑换成功");
        });
    }

    // update (dt) {}
}
