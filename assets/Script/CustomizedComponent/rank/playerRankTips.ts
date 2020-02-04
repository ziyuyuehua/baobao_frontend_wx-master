// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {GameComponent} from "../../core/component/GameComponent";
import log = cc.log;
import {ButtonMgr} from "../common/ButtonClick";
const {ccclass, property} = cc._decorator;

@ccclass
export default class playerRankTips extends GameComponent {

    static url: string = "rank/playerRankTips";

    @property(cc.Node)
    blackBg: cc.Node = null;

    @property({type: cc.Node})
    tipsView: cc.Node = null;

    @property(cc.Node)
    guanzhuBtn: cc.Node = null;

    @property(cc.Node)
    watchBtn: cc.Node = null;

    posY: number = 0;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        log("在父节点的Y==" + this.tipsView.y);
        this.tipsView.y = this.node.convertToNodeSpace(cc.v2(this.node["data"].pos)).y + (this.node["data"].num) * 135 + 40;
        log("传来的Y==" + this.tipsView.y);
        ButtonMgr.addClick(this.blackBg, this.closeOnly);
    }

    onload() {

    }

    protected getBaseUrl(): string {
        return playerRankTips.url;
    }

    // update (dt) {}
}
