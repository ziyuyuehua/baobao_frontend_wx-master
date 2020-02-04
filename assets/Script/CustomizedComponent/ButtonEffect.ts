const { ccclass, property } = cc._decorator;
//按钮特效
@ccclass
export default class ButtonEffect extends cc.Component {
    @property(cc.SpriteFrame)
    private sf :Array< cc.SpriteFrame> = [];

private index:number = 0;
    onLoad() {
        this.registerEvent();
    }

    registerEvent() {
        //touchstart 可以换成cc.Node.EventType.TOUCH_START /'touchstart'
        this.node.on(cc.Node.EventType.TOUCH_START, this.onEventStart, this);
        //touchmove 可以换成cc.Node.EventType.TOUCH_MOVE /'touchmove'
        this.node.on('touchmove', this.onEventMove, this);
        //touchcancel 可以换成cc.Node.EventType.TOUCH_CANCEL /'touchcancel'
        this.node.on('touchcancel', this.onEventCancel, this);
        //touchend 可以换成cc.Node.EventType.TOUCH_END /'touchend'
        this.node.on('touchend', this.onEventEnd, this);
    }

    /**
     * 触摸开始
     * @param {*} event 
     */
    onEventStart() {
        this.node.parent.getComponent(cc.Sprite).spriteFrame = this.sf[1];
        this.index = this.node.parent.getSiblingIndex();
        this.node.parent.zIndex = 1;
    }

    /**
     * 触摸移动
     * @param {*} event 
     */
    onEventMove() {
        this.node.parent.getComponent(cc.Sprite).spriteFrame = this.sf[1];
        this.node.parent.zIndex = 1;
    }

    /**
     * 触摸
     * 当手指在目标节点区域外离开屏幕时
     * 比如说，触摸node的size是200x200。
     * 当超过这个区域时，就是触发这个事件
     * @param {*} event 
     */
    onEventCancel() {
        let name = this.node.name;
        // if (name == "recruitingBtn" || name == "shoppingBtn") {
        //     this.node.parent.getComponent(cc.Sprite).spriteFrame = this.sf[2];
        // }else{
            this.node.parent.getComponent(cc.Sprite).spriteFrame = this.sf[0];
        // }
        this.node.parent.zIndex = 0;
        this.node.parent.setSiblingIndex(this.index);
    }

    /**
     * 当手指在目标节点区域内离开屏幕时
     * @param {*} event 
     */
    onEventEnd() {
        let name = this.node.name;
        // if (name == "recruitingBtn" || name == "shoppingBtn") {
        //     this.node.parent.getComponent(cc.Sprite).spriteFrame = this.sf[2];
        // }else{
            this.node.parent.getComponent(cc.Sprite).spriteFrame = this.sf[0];
        // }
        this.node.parent.setSiblingIndex(this.index);
        this.node.parent.zIndex = 0;
    }

    // update(dt) {

    // }

    // onDestroy() {
    // }


}
