

const { ccclass, property } = cc._decorator;

@ccclass
export default class BtnEffect extends cc.Component {
    private index: number = 0;

    onLoad() {
        this.node.on('touchend', this.onEventEnd, this);
        this.index = this.node.getSiblingIndex();
    }

    start() {

    }

    /**
     * 当手指在目标节点区域内离开屏幕时
     * @param {*} event 
     */
    onEventEnd(event) {
        this.node.zIndex = 1;
    }

    setting = () =>{
        this.node.setSiblingIndex(this.index);
        this.node.zIndex = 0;
    };

    update(dt) {
        // if (this.node.getComponent(cc.Button).interactable) {
        //
        // }
    }
}
