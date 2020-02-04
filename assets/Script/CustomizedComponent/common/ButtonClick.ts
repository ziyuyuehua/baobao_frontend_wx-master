import { UIUtil } from "../../Utils/UIUtil";
import { UIMgr } from "../../global/manager/UIManager";
import {ClientEvents} from "../../global/manager/ClientEventCenter";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ButtonClick {

    static instance: ButtonClick = new ButtonClick();

    //多点触控常量
    maxTouchNum = 1;     //最大按下数量
    touchNum = 0;        //当前按下数量
    canTouch = false;    //是否可点击

    //连点限制
    quickClick = 0;     //快速点击常量
    quickMaxClick = 1;  //最多连点
    canQuickTouch = false;  //是否可点击

    private clickCb: Function = null;

    //是否判断需要置灰不点击
    interactableNoClick: boolean = true;

    private constructor() {

    }

    setInteractableNoClick(click) {
        this.interactableNoClick = click
    }

    getInteractableNoClick() {
        return this.interactableNoClick
    }

    resetClick() {
        this.maxTouchNum = 1;
        this.touchNum = 0;
        this.canTouch = false;

        this.quickMaxClick = 1;
        this.quickClick = 0;
        this.canQuickTouch = false;
    }

    /**
     * @param btnNode 取消事件节点
     * @param target 该参数为绑定时传入的target参数
     */
    removeClick(btnNode: cc.Node, target: any) {
        if (!btnNode) {
            return;
        }
        btnNode.targetOff(target);
    }

    //绑定点击事件
    addClick(btnNode: cc.Node, touchEndFun?: Function, touchMoveFun?: Function, touchStartFun?: Function, touchCancelFun?: Function, target?: any) {
        if (!btnNode) {
            cc.log("addClick btnNode is null");
            return;
        }
        touchEndFun && this.touchEndEvent(btnNode, touchEndFun, target);
        touchMoveFun && this.touchMoveEvent(btnNode, touchMoveFun, target);
        this.touchStartEvent(btnNode, touchStartFun, target);
        this.touchCancelEvent(btnNode, touchCancelFun, target);
    }

    touchEndEvent = (btnNode: cc.Node, touchEndFun: Function, target: any) => {
        let cb = (event: cc.Event.EventTouch) => {
            if (this.canTouch && this.canQuickTouch) {
                this.canTouch = false;
                this.canQuickTouch = false;
                this.quickClick--;
                this.touchNum--;
                this.clickCb && this.clickCb();
                if (touchEndFun) {
                    ClientEvents.HIDE_JUMP_ARROW.emit();
                    if (this.interactableNoClick) {
                        if (this.checkCanClick(btnNode)) {
                            touchEndFun(event)
                        }
                    } else {
                        touchEndFun(event)
                    }
                }
            }
        };
        if (target) {
            btnNode.on(cc.Node.EventType.TOUCH_END, cb, target);
        } else {
            btnNode.on(cc.Node.EventType.TOUCH_END, cb);
        }
    };

    touchMoveEvent(btnNode: cc.Node, touchMoveFun: Function, target) {
        let cb = (event: cc.Event.EventTouch) => {
            if (!this.canTouch && this.touchNum < this.maxTouchNum) {
                this.canTouch = true;
                this.touchNum++;
            }
            this.clickCb && this.clickCb();
            if (this.canTouch) {
                if (touchMoveFun) {
                    if (this.interactableNoClick) {
                        if (this.checkCanClick(btnNode)) {
                            touchMoveFun(event)
                        }
                    } else {
                        touchMoveFun(event)
                    }
                }
            }
        };
        if (target) {
            btnNode.on(cc.Node.EventType.TOUCH_MOVE, cb, target);
        } else {
            btnNode.on(cc.Node.EventType.TOUCH_MOVE, cb);
        }
    }

    touchStartEvent(btnNode: cc.Node, touchStartFun: Function, target) {
        let cb = (event: cc.Event.EventTouch) => {
            if (this.quickClick < this.quickMaxClick) {
                this.quickClick++;
                this.canQuickTouch = true;
            }
            if (this.touchNum < this.maxTouchNum) {
                this.touchNum++;
                this.canTouch = true;
                if (touchStartFun) {
                    if (this.interactableNoClick) {
                        if (this.checkCanClick(btnNode)) {
                            touchStartFun(event)
                        }
                        touchStartFun(event)
                    } else {
                        touchStartFun(event)
                    }
                }

                return true;
            }
            return false;
        };
        if (target) {
            btnNode.on(cc.Node.EventType.TOUCH_START, cb, target);
        } else {
            btnNode.on(cc.Node.EventType.TOUCH_START, cb);
        }
    }

    touchCancelEvent(btnNode: cc.Node, touchCancelFun: Function, target) {
        let cb = (event: cc.Event.EventTouch) => {
            if (this.canTouch) {
                this.canTouch = false;
                this.touchNum--;
                this.clickCb && this.clickCb();
                if (touchCancelFun) {
                    if (this.interactableNoClick) {
                        if (this.checkCanClick(btnNode)) {
                            touchCancelFun(event)
                        }
                    } else {
                        touchCancelFun(event)
                    }
                }
            }
        };
        if (target) {
            btnNode.on(cc.Node.EventType.TOUCH_CANCEL, cb, target);
        } else {
            btnNode.on(cc.Node.EventType.TOUCH_CANCEL, cb);
        }
    }

    checkCanClick(btnNode: cc.Node) {
        let clickBtn: cc.Button = btnNode.getComponent(cc.Button);
        if (clickBtn && !clickBtn.interactable) {
            return false;
        }
        return true;
    }

    setCb = (cb: Function) => {
        this.clickCb = cb;
    };

    //绑定单选点击事件
    addToggle(toggle: cc.Toggle, fun: Function) {
        this.addToggleNode(toggle.node, fun);
    }

    //绑定单选节点点击事件
    addToggleNode(toggleNode: cc.Node, fun: Function) {
        toggleNode.on("toggle", fun);
    }

}

export const ButtonMgr: ButtonClick = ButtonClick.instance;
