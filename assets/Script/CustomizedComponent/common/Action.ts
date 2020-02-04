import ActionInterval = cc.ActionInterval;
class Action {
    private constructor() {
    }
    private static _instance: Action;

    public static get instance(): Action {
        if (Action._instance == null) {
            Action._instance = new Action();
        }
        return Action._instance;
    }

    /**
     * 移动的节点
     * 回调函数
     * 移动到的x坐标
     * 移动到到y坐标
     * 是否有缓冲动作
     */
    MoveAction(moveNode: cc.Node, callBack?: Function, moveX?: number, moveY?: number, isEase: boolean = true, time: number = 1) {
        let posX = moveX ? moveX : moveNode.x;
        let posY = moveY ? moveY : moveNode.y;
        let action = cc.sequence(cc.moveTo(time, posX, posY), cc.callFunc(() => {
            if (callBack) {
                callBack();
            }
        }));
        if (isEase) {
            action.easing(cc.easeBackOut());
        }
        moveNode.runAction(action);
    }

    /**
     * 缩放的节点
     * 回调函数
     * x缩放 默认缩放0.8
     * y缩放 默认缩放0.8
     * 是否有缓冲动作
     */
    ScaleAction(scaleNode: cc.Node, callBack?: Function, scaleX: number = 0.8, scaleY: number = 0.8, isEase: boolean = true) {
        let action = cc.sequence(cc.scaleTo(0.5, scaleX, scaleY), cc.callFunc(() => {
            if (callBack) {
                callBack();
            }
        }));
        if (isEase) {
            action.easing(cc.easeBackOut());
        }
        scaleNode.runAction(action);

    }

    /**
     * 顺序执行动画
     * 节点
     * 回调函数
     * 是否有缓冲动作
     * 顺序执行的动画
     */
    SequenceAction(sequenceNode: cc.Node, callBack?: Function, isEase: boolean = true, ...actionArr: any[]) {
        let action = cc.sequence(actionArr, cc.callFunc(() => {
            if (callBack) {
                callBack();
            }
        }));
        if (isEase) {
            action.easing(cc.easeBackOut());
        }
        sequenceNode.runAction(action);
    }

    /**
    * 永不停止执行动画
    * 节点
    * 是否有缓冲动作
    * 顺序执行的动画
    */
    ForverAction(ForverNode: cc.Node, Everaction, isEase: boolean = true) {
        let action = cc.repeatForever(Everaction)
        if (isEase) {
            action.easing(cc.easeBackOut());
        }
        ForverNode.runAction(action);
    }

    /**
     * 呼吸动画
     */
    BreatheAction(BreatheNode: cc.Node, initialScale: number = 1, isEase: boolean = false) {
        let toScale: number = 1 + 0.05
        let action = cc.repeatForever(cc.sequence(cc.scaleTo(0.5, toScale, toScale), cc.scaleTo(0.5, initialScale, initialScale)))
        if (isEase) {
            action.easing(cc.easeBackOut());
        }
        BreatheNode.runAction(action);
    }

    /**
     * 上下缓动动画
     */
    SwingAction(SwingNode: cc.Node, isEase: boolean = false, moveY: number = 5) {
        let x = SwingNode.x;
        let height1 = SwingNode.y - moveY;
        let height2 = SwingNode.y;
        let height3 = SwingNode.y + moveY;
        let action = cc.repeatForever(cc.sequence(cc.moveTo(0.4, x, height1), cc.moveTo(0.8, x, height3), cc.moveTo(0.4, x, height2)));
        if (isEase) {
            action.easing(cc.easeBackOut());
        }
        SwingNode.runAction(action);
    }

    //上下移动
    upAndDown(delta: number = 10): ActionInterval {
        return cc.repeatForever(cc.sequence(
            cc.moveBy(1, 0, delta).easing(cc.easeSineOut()),
            cc.moveBy(1, 0, -delta).easing(cc.easeSineOut())));
    }

    //变大然后还原，类似呼吸
    breathe() {
        return cc.repeatForever(cc.sequence(cc.scaleTo(0.5, 1.05, 1.05), cc.scaleTo(0.5, 1, 1)));
    }

    //抖动
    shake() {
        return cc.repeatForever(cc.sequence(cc.rotateTo(0.5, 3), cc.rotateTo(0.5, -3)));
    }

    /**
    * 上下缓动动画
    */
    CycleAction(SwingNode: cc.Node, isEase: boolean = false) {
        let x = SwingNode.x;
        let action = cc.sequence(cc.rotateTo(0.15, -7), cc.rotateTo(0.3, 5), cc.rotateTo(0.15, 0));
        if (isEase) {
            action.easing(cc.easeBackOut());
        }
        SwingNode.runAction(action);
    }

    /**
     * height 改变动画(node y 锚点设为1)
     * 改变的节点
     * 传this
     * 目标高度
     * 回调
     */
    nodeHeightChange(changeNode: cc.Node, self, targeHeight: number, callBack?: Function) {
        if (targeHeight == changeNode.height) {
            return;
        }
        let inter = null;
        let nodeHeight = changeNode.height;
        if (targeHeight > nodeHeight) {
            let addHeight = Math.floor((targeHeight - nodeHeight) / 10);
            inter = setInterval(() => {
                nodeHeight += addHeight;
                if (nodeHeight > targeHeight) {
                    nodeHeight = targeHeight;
                    changeNode.height = nodeHeight;
                    callBack && callBack();
                    clearInterval(inter)
                }
                changeNode.height = nodeHeight;
            }, 0.01);

        } else {
            let reduceHeight = Math.floor((nodeHeight - targeHeight) / 10);
            inter = setInterval(() => {
                nodeHeight -= reduceHeight;
                if (nodeHeight < targeHeight) {
                    nodeHeight = targeHeight;
                    changeNode.height = nodeHeight;
                    callBack && callBack();
                    clearInterval(inter)
                }
                changeNode.height = nodeHeight;
            }, 25);
        }
    }

    fingerLight(finger: cc.Node, lightNode: cc.Node) {
        finger.runAction(cc.repeatForever(
            cc.sequence(
                cc.spawn(
                    cc.moveBy(.5, -10, 10),
                    cc.scaleTo(.5, 1)
                ),
                cc.spawn(cc.moveBy(.5, 10, -10),
                    cc.scaleTo(.5, 1.2)
                )
            )
            )
        );
        lightNode.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(.5, 1.2), cc.scaleTo(.5, 1))));
    }

    setRedAction(redSprite: cc.Node) {
        let moveSpr: cc.Node = redSprite.getChildByName("remove");
        moveSpr.setPosition(0,0);
        if(redSprite.active){
            moveSpr.stopAllActions();
            moveSpr.runAction(ActionMgr.upAndDown());
        }else{
            moveSpr.stopAllActions();
        }

        // let moveSpr: cc.Node = redSprite.getChildByName("remove");
        // if (redSprite.active) {
        //     let active1 = cc.repeatForever(cc.sequence(cc.moveTo(0.5, moveSpr.x, 10),
        //         cc.moveTo(0.5, moveSpr.x, 0)));
        //     moveSpr.stopAllActions();
        //     moveSpr.runAction(active1);
        // } else {
        //     moveSpr.stopAllActions();
        // }
    }
}

export const ActionMgr: Action = Action.instance;
