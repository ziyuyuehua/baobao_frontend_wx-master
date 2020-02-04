import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import {UIUtil} from "../../Utils/UIUtil";
import {UIMgr} from "../../global/manager/UIManager";
import {GameManager} from "../../global/manager/GameManager";

@ccclass()
export class fightScene extends cc.Component{
    @property(cc.Prefab)
    fightView:cc.Prefab = null;

    private fightPanel:cc.Node = null;
    onLoad(){
        UIUtil.resize(this.node.getComponent(cc.Canvas));
        UIMgr.addLoading();

        this.fightPanel = cc.instantiate(this.fightView);
        this.fightPanel.parent = this.node;
    }
    onDestroy() {
        if(!GameManager.isDebug){
            wx && wx.triggerGC();
        }
    }
}
