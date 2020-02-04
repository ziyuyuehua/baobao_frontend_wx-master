/**
 * @author Lizhen
 * @date 2019/8/27
 * @Description:
 */
import {GameComponent} from "../../core/component/GameComponent";
import property = cc._decorator.property;
import ccclass = cc._decorator.ccclass;
import {ResManager, ResMgr} from "../../global/manager/ResManager";
import {CommonUtil} from "../../Utils/CommonUtil";

@ccclass()
export class PopPanel extends GameComponent {
    static url: string = "Prefab/common/popup/PopPanel";

    sureCb: Function = null;
    @property(cc.Label)
    desLabel: cc.Label = null;
    @property(cc.Label)
    numLabel: cc.Label = null;
    @property(cc.Sprite)
    icon: cc.Sprite = null;

    load() {

    }
    onEnable(){
        this.onShowPlay(2, this.node.getChildByName("bg"));
    }

    initPanel(title: string, des: string, num: number, iconType: number, cb: Function) {
        this.sureCb = cb;
        this.desLabel.string = des;
        this.numLabel.string = "x" + CommonUtil.numChange(num);
        this.initIcon(iconType);
    }

    initIcon(type: number) {
        switch (type){
            case -2://gold
                ResMgr.getCurrency(this.icon,"currency_notes",0.6);
                break;
            case -3://daimond
                ResMgr.getCurrency(this.icon,"currency_stone",0.6);
                break
        }
    }

    sureHandler() {
        this.sureCb && this.sureCb();
        this.closeHandler();
    }

    closeHandler() {
        this.node.removeFromParent(true);
        this.node.destroy();
    }

    getBaseUrl() {
        return PopPanel.url;
    }
}
