import {UIUtil} from "./UIUtil";
import AnimationUtil from "./AnimationUtil";
import {UIMgr} from "../global/manager/UIManager";

export interface AnimationData {
    node: cc.Node;
    money: number;
    exp: number;
    fadeInTime?: number;
    stayTime?: number;
    upMoveTime?: number;
    upMoveOffset?: cc.Vec2;
    fadeOutTime?: number;
}

export class CommonAnimation {

    private static _instance: CommonAnimation = null;

    static instance() {
        if(CommonAnimation._instance == null) {
            CommonAnimation._instance = new CommonAnimation();
        }
        return CommonAnimation._instance;
    }

    private bubblePool: cc.NodePool = new cc.NodePool();

    initBubble(animation: AnimationData) {
        let nodes: cc.Node;
        if(this.bubblePool.size() <= 0) {
            UIUtil.dynamicLoadPrefab(AnimationUtil.url, (node: cc.Node) => {
                UIMgr.getCanvas().addChild(node, 1000);
                let script = node.getComponent(AnimationUtil);
                script.init(animation);
            });
        } else {
            nodes = this.bubblePool.get();
            UIMgr.getCanvas().addChild(nodes, 1000);
            let script = nodes.getComponent(AnimationUtil);
            script.init(animation);
        }
    }

    backNodeToPool(node: cc.Node) {
        this.bubblePool.put(node);
    }

}

export const CommonAniUtil = CommonAnimation.instance();