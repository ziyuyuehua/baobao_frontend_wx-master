import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {CompositeDisposable} from "../../Utils/event-kit";
import {DataMgr} from "../../Model/DataManager";

const {ccclass, property} = cc._decorator;

@ccclass
export  class TaskItemNew extends cc.Component {
    private dispose = new CompositeDisposable();

    start () {
        this.dispose.add(ClientEvents.EVENT_HIDE_TASKNODE.on(this.hide));
        this.dispose.add(ClientEvents.EVENT_SHOW_TASKNODE.on(this.show));
        this.setAnimation();
    }

    hide = () => {
        let frameSize = cc.view.getVisibleSize();
        this.node.runAction(cc.sequence
        (cc.spawn(
            cc.moveTo(0.2, cc.v2(-frameSize.width / 2 - this.node.width / 2 - 25, this.node.y)),
            cc.fadeOut(0.2))
            , cc.callFunc(() => {
                this.node.active = false;
            })));
    };

    show = () => {
        this.node.active = true;
        this.setAnimation();
    };

    setAnimation = () => {
        let frameSize = cc.view.getVisibleSize();
        this.node.runAction(cc.spawn(cc.moveTo(
            0.2,
            cc.v2(-frameSize.width / 2 + this.node.width / 2 + 25, this.node.y))
            , cc.fadeIn(0.2)));
    };


    protected onDestroy(): void {
        this.dispose.dispose();
    }

    // update (dt) {}
}
