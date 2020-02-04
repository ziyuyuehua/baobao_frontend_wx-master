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
import {ButtonMgr} from "../common/ButtonClick";
import List from "../../Utils/GridScrollUtil/List";
import playerRankItem from "./playerRankItem";
import log = cc.log;


const {ccclass, property} = cc._decorator;

export enum rankType {
    allPlayerRank = 1,
    friendRank = 2
}

export enum rankSubType {
    boosRank = 1,
    shopRank = 2,
    staffRank = 3
}

export enum staffType {
    cashier = 1,
    tallier = 2,
    attracter = 3,
    saler = 4
}

@ccclass
export default class playerRank extends GameComponent {

    static url: string = "rank/playerRank";

    @property(cc.Node)
    aniNode: cc.Node = null;

    @property(cc.Node)
    back_btn: cc.Node = null;

    @property(cc.Node)
    friendsRank: cc.Node = null;

    @property(cc.Node)
    allRank: cc.Node = null;

    @property(cc.Node)
    bossRank: cc.Node = null;

    @property(cc.Node)
    shopRank: cc.Node = null;

    @property(cc.Node)
    staffRank: cc.Node = null;

    @property(cc.Node)
    myRank: cc.Node = null;

    @property(cc.Node)
    staffSubBtnArea: cc.Node = null;

    @property(cc.Node)
    cashierBtn: cc.Node = null;

    @property(cc.Node)
    tallierBtn: cc.Node = null;

    @property(cc.Node)
    attracterBtn: cc.Node = null;

    @property(cc.Node)
    salerBtn: cc.Node = null;

    @property({type: List})
    rankScroll: List = null;
    curRankType: rankType = rankType.friendRank;
    curRankSubType: rankSubType = null;
    curStaffType: staffType = null;
    rankList = [];
    staffBtns: cc.Node[] = [];
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    onEnable() {
        log("--------" + this.rankList.length);
        this.onShowPlay(2, this.aniNode);
        this.friendsRankHandler();
        this.bossRankHandler();
    }

    onLoad() {
        ButtonMgr.addClick(this.back_btn, this.closeOnly);
        ButtonMgr.addClick(this.friendsRank, this.friendsRankHandler);
        ButtonMgr.addClick(this.allRank, this.allRankHandler);
        ButtonMgr.addClick(this.bossRank, this.bossRankHandler);
        ButtonMgr.addClick(this.shopRank, this.shopRankHandler);
        ButtonMgr.addClick(this.staffRank, this.staffRankHandler);
        ButtonMgr.addClick(this.cashierBtn, this.cashierBtnHandler);
        ButtonMgr.addClick(this.tallierBtn, this.tallierBtnHandler);
        ButtonMgr.addClick(this.attracterBtn, this.attracterBtnHandler);
        ButtonMgr.addClick(this.salerBtn, this.salerBtnHandler);
    }

    start() {

    }

    protected getBaseUrl(): string {
        return playerRank.url;
    }

    friendsRankHandler = () => {
        this.rankList = [1, 3, 2, 9, 3, 0, 6, 5, 6];
        this.curRankType = rankType.friendRank;
        this.changeRankData();
        this.changeBtnStates(true);

    }

    allRankHandler = () => {
        this.rankList = [11, 31, 21, 51, 31, 61, 41, 51, 61, 11, 51, 10, 11, 31, 21, 91, 31, 11, 41, 15,];
        this.curRankType = rankType.allPlayerRank;
        this.changeRankData();
        this.changeBtnStates(false);
    }

    changeRankData() {
        switch (this.curRankSubType) {
            case rankSubType.boosRank:
                this.bossRankHandler();
                break;
            case rankSubType.shopRank:
                this.shopRankHandler();
                break;
            case rankSubType.staffRank:
                this.cashierBtnHandler();
                break;
        }
    }

    bossRankHandler = () => {
        this.curRankSubType = rankSubType.boosRank;
        this.shopRank.y = -430;
        this.staffRank.y = -500;
        this.myRank.y = -330;
        this.rankScroll.node.y = 470;
        this.staffSubBtnArea.active = false;
        this.rankScroll.numItems = this.rankList.length;
        this.rankScroll.scrollTo(0);
    }

    shopRankHandler = () => {
        this.curRankSubType = rankSubType.shopRank;
        this.shopRank.y = 433;
        this.staffRank.y = -500;
        this.myRank.y = -400;
        this.rankScroll.node.y = 400;
        this.staffSubBtnArea.active = false;
        this.rankScroll.numItems = this.rankList.length;
        this.rankScroll.scrollTo(0);
    }

    staffRankHandler = () => {
        this.curRankSubType = rankSubType.staffRank;
        this.shopRank.y = 432;
        this.staffRank.y = 365;
        this.myRank.y = -500;
        this.rankScroll.node.y = 290;
        this.staffSubBtnArea.active = true;
        this.cashierBtnHandler();
    }

    changeBtnStates(state) {
        this.friendsRank.getChildByName("chose").active = state;
        this.friendsRank.getChildByName("unchose").active = !state;
        this.friendsRank.zIndex = state ? 1 : -1;
        this.allRank.getChildByName("chose").active = !state;
        this.allRank.getChildByName("unchose").active = state;
        this.allRank.zIndex = !state ? 1 : -1;
        this.rankScroll.scrollTo(0);
    }

    cashierBtnHandler = () => {
        this.curStaffType = staffType.cashier;
        this.changeStaffBtnState(this.cashierBtn);
        this.rankScroll.numItems = this.rankList.length;
        this.rankScroll.scrollTo(0);
    }

    tallierBtnHandler = () => {
        this.curStaffType = staffType.tallier;
        this.changeStaffBtnState(this.tallierBtn);
        this.rankScroll.numItems = this.rankList.length;
        this.rankScroll.scrollTo(0);
    }

    attracterBtnHandler = () => {
        this.curStaffType = staffType.attracter;
        this.changeStaffBtnState(this.attracterBtn);
        this.rankScroll.numItems = this.rankList.length;
        this.rankScroll.scrollTo(0);
    }

    salerBtnHandler = () => {
        this.curStaffType = staffType.saler;
        this.changeStaffBtnState(this.salerBtn);
        this.rankScroll.numItems = this.rankList.length * 5;
        this.rankScroll.scrollTo(0);
    }

    changeStaffBtnState(btn: cc.Node) {
        this.staffBtns = [this.cashierBtn, this.tallierBtn, this.attracterBtn, this.salerBtn];
        for (let nid in this.staffBtns) {
            this.staffBtns[nid].getChildByName("sel").active = this.staffBtns[nid].name == btn.name;
            this.staffBtns[nid].getChildByName("unSel").active = !(this.staffBtns[nid].name == btn.name);
            if (this.staffBtns[nid].name == btn.name) {
                this.choseStaffType(Number(nid));
            }
        }
    }

    choseStaffType(index: number) {
        log("staffType==index" + staffType);
        this.curStaffType = index + 1;
    }

    onListVRender(item: cc.Node, idx: number) {
        log("item-------" + idx);
        let Item: playerRankItem = item.getComponent(playerRankItem);
        Item.updateItem(this.rankList[idx], idx, this.curRankSubType);
    }


    // update (dt) {}
}
