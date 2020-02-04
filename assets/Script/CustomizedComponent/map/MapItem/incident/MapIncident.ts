import { UIUtil } from "../../../../Utils/UIUtil";
import { ActionMgr } from "../../../common/Action";

const { ccclass, property } = cc._decorator;

@ccclass
export class MapIncident extends cc.Component {

    @property(cc.Sprite)
    image: cc.Sprite = null;

    @property(cc.Animation)
    animation: cc.Animation = null;

    initImage(iconUrl: string, useSrc: boolean = false, animationUrl: string = null) {
        UIUtil.asyncSetImage(this.image, iconUrl, useSrc);
        this.image.node.runAction(ActionMgr.upAndDown());
        if(animationUrl){ //这个animationUrl为null的时候是危机UI面板直接绑定animation动画而不是动态加载
            UIUtil.asyncPlayAnim(this.animation, animationUrl);
        }else{
            UIUtil.playFirstAnim(this.animation);
        }
    }

    onDisable() {
        this.image.node.setPosition(0, 0);
        this.image.node.stopAllActions();
        this.image.spriteFrame = null;
        this.animation.stop();
    }

}
