import { ResMgr } from "../../global/manager/ResManager";
import { JsonManager, JsonMgr } from "../../global/manager/JsonManager";

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
export default class CommunityGiftItem extends cc.Component {

    @property(cc.Label)
    itemNum: cc.Label = null;

    @property(cc.Sprite)
    itemIcon: cc.Sprite = null;


    start() {

    }

    updateItem(dropId: number) {
        let dropJson: IDropJson = JsonMgr.getDropJson(dropId);
        let itemId: number = dropJson.itemId;
        ResMgr.imgTypeJudgment(this.itemIcon, itemId);
        this.itemNum.node.active = true;
        this.itemNum.string = "x" + dropJson.expression;
    }

    updateMysicBox() {
        this.itemNum.node.active = false;
        ResMgr.getItemIcon(this.itemIcon, "box");
    }

    // update (dt) {}
}
