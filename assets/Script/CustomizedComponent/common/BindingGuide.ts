import {DataMgr} from "../../Model/DataManager";
import {JsonMgr} from "../../global/manager/JsonManager";
import Color = cc.Color;

const {ccclass, property} = cc._decorator;

@ccclass
export default class BindingGuide extends cc.Component {
    @property(cc.Boolean)
    private vertical: boolean = false;
    private getPosition: cc.Vec2;

    @property(cc.Label)
    arrowLab: cc.Label = null;


    onLoad() {
        // this.node.setScale(this.node.scaleX * 0.8, this.node.scaleY * 0.8);
        this.getPosition = this.node.getPosition();
        let node: cc.Node = this.node.getChildByName("back").getChildByName("tipsLab");
        node.color = new Color(67, 39, 16, 255);
        node.width = 180;
        node.getComponent(cc.Label).fontSize = 30;
        node.getComponent(cc.Label).lineHeight = 40;
        node.addComponent(cc.LabelOutline);
        node.getComponent(cc.LabelOutline).color = new Color(136, 77, 42, 255);
        node.getComponent(cc.LabelOutline).width = 1;
        this.arrow();
    }

    loadLabText=(text: string) => {
        this.arrowLab.string = text;
    };

    // onEnable() {
    // let lv = JsonMgr.getConstVal("guideArrow");
    // if (!lv) {
    //     // lv = 4
    //     cc.log("软引导限制等级不纯在")
    //     return;
    // }
    // this.node.active = DataMgr.userData.level <= 10;
    // if (this.node.active) {
    //     this.node.setPosition(this.getPosition);
    //     this.arrow(this.vertical);
    // }
    // }

    arrow() {

        let x = 0;
        let y = 0;
        if (this.vertical) {
            x = 0;
            y = 10
        } else {
            x = 10;
            y = 0;
        }
        let width1 = this.node.getPosition().x - x;
        let width2 = this.node.getPosition().x;
        let width3 = this.node.getPosition().x + x;

        let height1 = this.node.getPosition().y - y;
        let height2 = this.node.getPosition().y;
        let height3 = this.node.getPosition().y + y;
        // let active1 = cc.repeatForever(cc.sequence(cc.moveTo(0.35, width1, height1), cc.moveTo(0.7, width3, height3), cc.moveTo(0.35, width2, height2)));
        this.node.stopAllActions();
        this.node.runAction(cc.repeatForever(cc.sequence(cc.moveTo(0.35, width1, height1), cc.moveTo(0.7, width3, height3), cc.moveTo(0.35, width2, height2))));
    }

    // update (dt) {}
}
