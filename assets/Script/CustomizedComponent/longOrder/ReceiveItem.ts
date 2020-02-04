/**
 * @author Lizhen
 * @date 2019/8/20
 * @Description:
 */
import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import {ResMgr} from "../../global/manager/ResManager";

@ccclass()
export class ReceiveItem extends cc.Component {
    static url: string = "Prefab/longOrder/ReceiveItem";
    @property(cc.Sprite)
    icon: cc.Sprite = null;
    @property(cc.Label)
    num: cc.Label = null;

    initView(id: number, num: number) {
        ResMgr.imgTypeJudgment(this.icon, id);
        this.icon.node.scale = 0.55;
        this.num.string = num.toString();
    }
}
