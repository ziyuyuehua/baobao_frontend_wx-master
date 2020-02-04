import { ResManager } from "../../../global/manager/ResManager";
import { UIUtil } from "../../../Utils/UIUtil";

const { ccclass, property } = cc._decorator;

export enum numType {
    Att_Type = 1,
    Lv_Type = 2
}

@ccclass
export class NumberItem extends cc.Component {

    onLoad() {
        //this.setNum(1234567890);
    }

    setNum(num: number, type: numType = numType.Att_Type) {
        this.node.removeAllChildren();
        let numStr: string = num + "";
        for (let i = 0; i < numStr.length; i++) {
            let char: string = numStr.charAt(i);
            //cc.log(char);
            let node: cc.Node = new cc.Node();
            let sprite: cc.Sprite = node.addComponent(cc.Sprite);
            //sprite.spriteFrame = ResMgr.getStaffListImage(char);
            switch (type) {
                case numType.Att_Type:
                    UIUtil.asyncSetImage(sprite, ResManager.STAFF_UI + char);
                    break;
                case numType.Lv_Type:
                    UIUtil.asyncSetImage(sprite, ResManager.STAFF_UI + "lv" + char);
                    break;
            }
            this.node.addChild(node);
        }
    }

}
