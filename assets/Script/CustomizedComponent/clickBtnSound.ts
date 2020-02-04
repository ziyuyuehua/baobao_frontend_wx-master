import {AudioMgr} from "../global/manager/AudioManager";


const { ccclass, property } = cc._decorator;

@ccclass
export default class ClickBtnSound extends cc.Component {

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, () => {
            let btn = this.node.getComponent(cc.Button);
            if (btn !== null) {
                return;
            }
            // if (this.node.getComponent(cc.Button)) {
            //     if (!this.node.getComponent(cc.Button).interactable) {
            //         return;
            //     }
            // }
            AudioMgr.playEffect("Audio/clickSound");
        }, this)
    }

    start() {

    }

    // update (dt) {}
}
