import property = cc._decorator.property;
import ccclass = cc._decorator.ccclass;
import {ResMgr} from "../../global/manager/ResManager";

@ccclass()
export class itemPre extends cc.Component{
    @property(cc.Sprite)
    icon:cc.Sprite = null;
    @property(cc.Label)
    num:cc.Label = null;

    initView(id:number,num:number){
        ResMgr.imgTypeJudgment(this.icon, id);
        this.num.string = num.toString();
        this.icon.node.scale = 0.2;
    }
}
