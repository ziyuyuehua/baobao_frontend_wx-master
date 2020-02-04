// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {ButtonMgr} from "../common/ButtonClick";
import {UIMgr} from "../../global/manager/UIManager";
import playerRankTips from "./playerRankTips";
import {rankSubType, rankType} from "./playerRank";

const {ccclass, property} = cc._decorator;

@ccclass
export default class playerRankItem extends cc.Component {

    @property(cc.Label)
    rankNumberLab: cc.Label = null;

    @property(cc.Node)
    itemBtn: cc.Node = null;

    @property(cc.Node)
    boosRankShow: cc.Node = null;

    @property(cc.Node)
    shopRankShow: cc.Node = null;

    @property(cc.Node)
    staffRankShow: cc.Node = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    index: number = 0;
    type: rankSubType = null;
    offSetY: number = 0;

    onEnable() {

    }

    start() {
        ButtonMgr.addClick(this.itemBtn, this.jumpOrShowShop);
    }

    onload() {

    }

    jumpOrShowShop = (event: cc.Event.EventTouch) => {
        let itemPos: cc.Vec2 = this.node.convertToWorldSpace(cc.v2(this.node.position.x, this.node.position.y));
        UIMgr.showView(playerRankTips.url, null, {num: this.index, pos: itemPos, type: this.type});
    }

    updateItem(data, index, type) {
        this.index = index + 1;
        this.type = type;
        this.rankNumberLab.string = this.index + "";
        this.boosRankShow.active = type == rankSubType.boosRank;
        this.shopRankShow.active = type == rankSubType.shopRank;
        this.staffRankShow.active = type == rankSubType.staffRank;
    }


    // update (dt) {}
}
