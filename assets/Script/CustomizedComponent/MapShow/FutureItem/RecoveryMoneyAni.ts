/**
 *@Athuor ljx
 *@Date 16:59
 */
import {MapMgr} from "../MapInit/MapManager";

const {ccclass, property} = cc._decorator;

@ccclass

export default class RecoveryMoneyAni extends cc.Component {
    static url = "Map/bubble";

    @property(sp.Skeleton)
    private ani: sp.Skeleton = null;

    init(status: string, nodeScale: number = 1) {
        this.node.scaleX = nodeScale;
        this.ani.setAnimation(0, "animation" + status, false);
        this.ani.setCompleteListener(this.returnNodePool);
    }

    returnNodePool = () => {
        this.ani.clearTracks();
        this.node.removeFromParent();
        MapMgr.backMoneyAniNode(this.node);
    };
}