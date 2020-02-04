/**
 * @author Lizhen
 * @date 2019/11/21
 * @Description:
 */
import {GameComponent} from "../../core/component/GameComponent";
import property = cc._decorator.property;
import ccclass = cc._decorator.ccclass;
@ccclass()
export class ExplainPlane extends GameComponent{
    static url: string = "Prefab/fight/ExplainPlane";
    @property(cc.Node)
    bg: cc.Node = null;
    getBaseUrl() {
        return ExplainPlane.url;
    }
    onEnable() {
        this.onShowPlay(2, this.bg);
    }
    closeHandler(){
        this.closeOnly();
    }
}