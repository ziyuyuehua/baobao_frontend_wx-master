/**
 * User: cJian
 * Date: 2019/8/13 8:49 PM
 * Note: ...
 */
import {IUserBaseItem} from "../../types/Response";
import {UIUtil} from "../../Utils/UIUtil";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AssistMemberItem extends cc.Component {

    @property(cc.Sprite)
    headSpt: cc.Sprite = null;

    @property(cc.Label)
    nameLab: cc.Label = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}


    start() {

    }
    initView(item:IUserBaseItem) {
        UIUtil.loadUrlImage(item.avatar, (spriteFrame: cc.SpriteFrame) => {
            if(!this.headSpt || !this.headSpt.isValid || !spriteFrame) return;
            this.headSpt.spriteFrame = spriteFrame;
        });
        this.nameLab.string = item.nickName ;
    }

    // update (dt) {}
}
