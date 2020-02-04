/**
*@Athuor ljx
*@Date 16:30
*/
import { ChestRes } from "./ChestResManager";
import { DataMgr } from "../../Model/DataManager";

const { ccclass, property } = cc._decorator;

@ccclass

export default class ExpandAnimation extends cc.Component {
    static url = "expandFrame/expandAniNode";

    @property(cc.Animation)
    private lightNode: cc.Animation = null;
    @property(cc.Animation)
    private startEndSmokeNode: cc.Animation = null;
    @property(cc.Animation)
    private loopSmokeNode: cc.Animation = null;

    @property(cc.Node)
    private hero1: cc.Node = null;
    @property(cc.Node)
    private hero2: cc.Node = null;
    @property(cc.Node)
    private hero3: cc.Node = null;
    @property(cc.Node)
    private hero4: cc.Node = null;
    @property(cc.Node)
    private hero5: cc.Node = null;

    private endCb: Function = null;

    init(cb: Function) {
        this.endCb = cb;
        this.playHeroes();
    }

    playHeroes() {
        this.scaleLittle(this.hero2, cc.v2(-45, 140), 0);
        this.scaleLittle(this.hero4, cc.v2(-10, 81), .05);
        this.scaleLittle(this.hero3, cc.v2(27, 155), .1);
        this.scaleLittle(this.hero1, cc.v2(64, 121), .2);
        this.scaleLittle(this.hero5, cc.v2(-65, 122), .3);
        setTimeout(() => {
            this.startSmokeAni();
        }, 700);
    }

    scaleLittle(node: cc.Node, pos: cc.Vec2, delayTime: number) {
        node.runAction(cc.sequence(cc.delayTime(delayTime), cc.spawn(cc.moveTo(.2, pos), cc.fadeIn(.1)), cc.scaleTo(.2, node.scaleX, .2), cc.scaleTo(.1, node.scaleX, .3)));
    }

    startSmokeAni() {
        this.startEndSmokeNode.node.active = true;
        this.startEndSmokeNode.play("startSmokeAni");
        setTimeout(() => {
            this.hero5.active = false;
            this.hero4.active = false;
            this.hero3.active = false;
            this.hero2.active = false;
            this.hero1.active = false;
        }, 400);
        setTimeout(() => {
            this.startEndSmokeNode.node.active = false;
            this.startLoopAni();
        }, 420);
    }

    startLoopAni = () => {
        this.loopSmokeNode.node.active = true;
        this.loopSmokeNode.play("loopSmokeAni");
        setTimeout(() => {
            this.loopSmokeNode.stop("loopSmokeAni");
            this.loopSmokeNode.node.active = false;
            this.endSmokeAni();
        }, 1500);
    };

    endSmokeAni = () => {
        this.startEndSmokeNode.node.active = true;
        this.startEndSmokeNode.play("endSmokeAni");
        setTimeout(() => {
            this.startEndSmokeNode.node.active = false;
            this.showLightAni();
        }, 750);
    };

    showLightAni = () => {
        let node = this.lightNode.node;
        node.active = true;
        this.lightNode.play("lightAni");
        setTimeout(() => {
            node.active = false;
            DataMgr.setIsJudgeSoft(true);
            DataMgr.judgeStartSoftGuideJson();
            DataMgr.setClickMainTask(0);
            this.endCb && this.endCb();
            this.node.removeFromParent(true);
        }, 460);
    }

}