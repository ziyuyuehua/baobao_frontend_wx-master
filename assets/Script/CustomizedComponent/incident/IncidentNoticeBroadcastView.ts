import { GameComponent } from "../../core/component/GameComponent";
import { TextTipConst } from "../../global/const/TextTipConst";
import { StringUtil } from "../../Utils/StringUtil";
import { ButtonMgr } from "../common/ButtonClick";
import { ClientEvents } from "../../global/manager/ClientEventCenter";
import { JumpConst } from "../../global/const/JumpConst";
import {JsonMgr} from "../../global/manager/JsonManager";
// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class IncidentNoticeBroadcastView extends GameComponent {

    static url: string = "incident/IncidentNoticeBroadcastView";

    @property(cc.RichText)
    contextRichTxt: cc.RichText = null;

    @property(cc.Node)
    closeNode: cc.Node = null;

    @property(cc.Node)
    closeNode1: cc.Node = null;

    responseData: number[] = [];
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.responseData = this.node["data"];
        ButtonMgr.addClick(this.closeNode, this.returnCallback);
        ButtonMgr.addClick(this.closeNode1, this.returnCallback);
    }

    start() {
        this.init(this.responseData);
    }


    init(ranks: number[]) {
        if (ranks == null || ranks.length != 2) {
            // console.log("current rank length is error!");
            return;
        }
        let worldRank = ranks[0];
        let localRank = ranks[1];
        if (worldRank != 0) {//区排名
            this.contextRichTxt.string = StringUtil.format(JsonMgr.getTips(TextTipConst.INCIDENT_WORLDRANKTXT), worldRank, localRank);
        } else {
            this.contextRichTxt.string = StringUtil.format(JsonMgr.getTips(TextTipConst.INCIDENT_LOCALRANKTXT), localRank);
        }
    }


    handleCallback() {
        this.closeView();
    }


    returnCallback = () => {
        this.closeView();
        ClientEvents.EVENT_OPEN_UI.emit(JumpConst.EMAILVIEW);
    }


    getBaseUrl() {
        return IncidentNoticeBroadcastView.url;
    }

    // update (dt) {}
}
