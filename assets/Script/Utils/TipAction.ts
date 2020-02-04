
export default class TipsAction {

    setActionForNode = (node: cc.Node) => {
        // node.position = cc.v2(0, 0);
        // node.opacity = 255;
        // node.stopAllActions();
        // node.runAction(cc.sequence(cc.scaleTo(0.2, 1.1), cc.scaleTo(0.1, 1), cc.moveTo(0.8, cc.v2(0, 0)), cc.spawn(cc.moveBy(1, cc.v2(0, 200)), cc.fadeOut(0.8)), cc.callFunc(() => {
        //     node.removeFromParent();
        //     node.active = false;
        // })));


        node.position = cc.v2(0, -200);
        node.opacity = 0;
        node.stopAllActions();
        let aciton = cc.sequence(cc.spawn(cc.moveTo(0.4, cc.v2(0, 0)), cc.fadeTo(0.4, 255)), cc.callFunc(() => {
            node.stopAllActions();
            let action1 = cc.sequence(cc.spawn(cc.moveTo(0.4, cc.v2(0, 100)), cc.fadeTo(0.4, 0)), cc.callFunc(() => {
                node.removeFromParent();
                node.active = false;
            }))
            node.runAction(action1)
        }))
        node.runAction(aciton)

    }

}
