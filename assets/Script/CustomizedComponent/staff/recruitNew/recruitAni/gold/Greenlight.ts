/**
 * @author Lizhen
 * @date 2019/9/22
 * @Description:
 */
import ccclass = cc._decorator.ccclass;
import callFunc = cc.callFunc;
import property = cc._decorator.property;
import {ClientEvents} from "../../../../../global/manager/ClientEventCenter";

@ccclass()
export class Greenlight extends cc.Component {
    @property(sp.Skeleton)
    greenLight: sp.Skeleton = null;

    onCollisionEnter(other, self) {
        //self代表当前节点的的碰撞组件，other代表和self产生碰撞的其他碰撞组件
        if (self.tag == 10) {//第一排关闭物理系统
            this.greenLight.setAnimation(0, "animation", false);
        }
        if (self.tag == 11) {//第一排关闭物理系统
            // this.greenLight.setAnimation(0,"animation",false);
            cc.director.getPhysicsManager().enabled = false;
        }
        this.greenLight.setCompleteListener(() => {
            this.greenLight.clearTracks();
            ClientEvents.GOLD_RECRUIT.emit();
        });
    }

    onCollisionExit(other, self) {
        //self代表当前节点的的碰撞组件，other代表和self产生碰撞的其他碰撞组件
        if (self.tag == 10) {//第一排关闭物理系统
            cc.director.getPhysicsManager().enabled = false;
        }
    }
}