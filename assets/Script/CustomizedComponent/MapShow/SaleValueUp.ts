
const {ccclass, property} = cc._decorator;

@ccclass
export default class SaleValueUp extends cc.Component {
    static url = "Map/saleValueUp";

    @property(sp.Skeleton)
    private spine: sp.Skeleton = null;

    init(parentNode: cc.Node, cb?: Function) {
        this.node.scaleX = parentNode.scaleX;
        let x = -parentNode.width / 2;
        let y = parentNode.height - 30;
        this.node.setPosition(x, y);
        this.spine.setAnimation(0, "animation", false);
        this.spine.setCompleteListener(() => {
            cb && cb();
            this.node.removeFromParent();
            this.node.destroy();
        });
    }
}
