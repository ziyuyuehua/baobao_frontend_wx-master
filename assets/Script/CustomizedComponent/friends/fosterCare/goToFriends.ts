// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {GameComponent} from "../../../core/component/GameComponent";
import {ButtonMgr} from "../../common/ButtonClick";
import {UIMgr} from "../../../global/manager/UIManager";
import {HttpInst} from "../../../core/http/HttpClient";
import {NetConfig} from "../../../global/const/NetConfig";
import SearchNode from "../searchNode";
import {DataMgr} from "../../../Model/DataManager";
import {ClientEvents} from "../../../global/manager/ClientEventCenter";

const {ccclass, property} = cc._decorator;

@ccclass
export default class goToFriends extends GameComponent {
    static url: string = "fosterCare/noFriends";

    @property(cc.Node)
    private closeBtn: cc.Node = null;

    @property(cc.Node)
    private jumpBtn: cc.Node = null;

    @property(cc.Node)
    private aniNode: cc.Node = null;

    start() {
        ClientEvents.FOSTER_ARROW.emit(false);
        ButtonMgr.addClick(this.closeBtn, this.closeHandler);
        ButtonMgr.addClick(this.jumpBtn, this.jumpHandler);
    }

    onEnable() {
        this.onShowPlay(1, this.aniNode);
    }

    getBaseUrl(): string {
        return goToFriends.url;
    }

    closeHandler = () => {
        DataMgr.fosterCare.softLeftCount = 1;
        ClientEvents.FOSTER_ARROW.emit(true);
        this.closeOnly();
    }

    jumpHandler = () => {
        HttpInst.postData(NetConfig.RECOMMEND_FRIEND, [], (res: any) => {
            UIMgr.showView(SearchNode.url, cc.director.getScene(), null, () => {
                DataMgr.loadRecommended(res);
            });
        });
        UIMgr.closeView(goToFriends.url);
    }
}
