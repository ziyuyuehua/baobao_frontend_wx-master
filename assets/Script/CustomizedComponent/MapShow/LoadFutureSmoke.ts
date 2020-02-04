/**
 * @Description:
 * @Author: ljx
 * @date 2019/12/8
*/
import {UIMgr} from "../../global/manager/UIManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class LoadFutureSmoke extends cc.Component {

    static url = "Map/FutureLoadSmoke";
    @property(cc.Animation)
    private smokeAni: cc.Animation = null;


    showAni(cb: Function) {
        let parentPos = this.node.parent;
        this.node.setPosition(-parentPos.width / 2, parentPos.height / 2);
        this.smokeAni.play("smoke");
        this.schedule(() => {
            UIMgr.closeView(LoadFutureSmoke.url);
            cb && cb();
        }, .5)
    }
}