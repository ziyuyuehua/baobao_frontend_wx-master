/**
 * author: ljx
 */
import {GameComponent} from "../../core/component/GameComponent";
import {ButtonMgr} from "../common/ButtonClick";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {DataMgr} from "../../Model/DataManager";
import {CommonUtil} from "../../Utils/CommonUtil";
import {ActionMgr} from "../common/Action";
import {UIMgr} from "../../global/manager/UIManager";
import dialogueView from "../common/dialogueView";
import {JsonMgr} from "../../global/manager/JsonManager";
import Widget = cc.Widget;
import {TaskItemNew} from "../taskItem/TaskItemNew";
import {COUNTERTYPE, DotInst} from "../common/dotClient";

const {ccclass, property} = cc._decorator;

export enum GuideConst {
    POST = 1,
    SET_FUTURE,
    PURCHASE,
    RECEIVE_MISSION
}

@ccclass
export default class PowerGuide extends GameComponent {

    static url = "PowerGuide/GuideNode";

    @property(cc.Node)
    private blinkNode: cc.Node = null;
    // @property(cc.Animation)
    // private animNode: cc.Animation = null;
    @property(cc.Node)
    private mask: cc.Node = null;
    @property([cc.Node])
    private nodeArr: cc.Node[] = [];
    @property([cc.Animation])
    private animNodeArr: cc.Animation[] = [];
    // @property(cc.Node)
    // private finger: cc.Node = null;
    // @property(cc.Node)
    // private lightNode: cc.Node = null;
    // @property(cc.Label)
    // private desc: cc.Label = null;
    // @property(cc.Node)
    // private descNode: cc.Node = null;
    // @property(cc.Node)
    // private leftNode: cc.Node = null;
    // @property(cc.Node)
    // private leftDescNode: cc.Node = null;
    // @property(cc.Label)
    // private leftLabel: cc.Label = null;

    /* @property(cc.Node)
     private jueshe: cc.Node = null;
     @property(cc.Node)
     private duihuak: cc.Node = null;
     @property(cc.RichText)
     private duihuaText: cc.RichText = null;*/

    // private testRich: string = "";
    // private curIndex = 0;
    // private curText: string[] = null;
    //
    // loadText = () => {
    //     this.isText = 1;
    //     this.curIndex = 0;
    //     this.curText = this.testRich.split(";");
    //     this.addString(this.curText[this.curIndex]);
    // };
    // private isText: number = -1;
    //
    // addString(str) {
    //     this.duihuaText.string += str;
    //     this.scheduleOnce(() => {
    //         this.curIndex++;
    //         if (this.curText[this.curIndex]) {
    //             this.addString(this.curText[this.curIndex]);
    //         } else {
    //             this.isText = 2;
    //         }
    //     }, 0.1)
    // }

    private highlightNode: cc.Node = null;
    private cb: Function = null;
    private isFinal: boolean = false;
    private isSavePoint: boolean = false;
    private isSelfRefresh: boolean = false;
    private delayTime: number = 0;
    private isScale: boolean = false;
    private hasClick: boolean = false;
    private afterHttpCb: Function = null;
    private cpBtn: cc.Node = null;
    private idx: number = -1;
    private Btn: cc.Node = null;

    // private isBtn: boolean = true;

    protected start(): void {
        this.node.zIndex = 10000;
        this.blinkNode.zIndex = 999;
        this.blinkNode.group = "guideLayer";
        this._bindEvent();
        this.addEvent(ClientEvents.DIALO_END_SEND.on(this.onClick));
    }

    private _bindEvent() {
        // ButtonMgr.addClick(this.cpBtn, this.blinkNodeDonClick, null, this.touchStart, this.touchEnd);
        // ButtonMgr.addClick(this.descNode, this.blinkNodeDonClick, null, this.touchStart, this.touchEnd);
        // ButtonMgr.addClick(this.leftNode, this.blinkNodeDonClick, null, this.touchStart, this.touchEnd);
        // ButtonMgr.addClick(this.duihuak, this.test);
    }

    // test = () => {
    //     if (this.isText == 1) {//加载文字中
    //         if (this.curText.length > 0) {
    //             this.curIndex = this.curText.length;
    //             let text: string = "";
    //             for (let i = 0; i < this.curText.length; i++) {
    //                 text += this.curText[i];
    //             }
    //             this.duihuaText.string = text;
    //         }
    //         this.isText = 2;
    //     } else if (this.isText == 2) {//加载完成
    //         this.blinkNodeDonClick();
    //     }
    // };
    //
    // Action = () => {
    //     this.scheduleOnce(() => {
    //         this.jueshe.runAction(
    //             cc.sequence(
    //                 cc.spawn(
    //                     cc.scaleTo(.3, 1).easing(cc.easeSineOut()), cc.fadeIn(.3).easing(cc.easeSineIn())
    //                 ), cc.callFunc(() => {
    //                         this.duihuak.runAction(
    //                             cc.sequence(
    //                                 cc.spawn(
    //                                     cc.scaleTo(.3, 1).easing(cc.easeSineOut()), cc.fadeIn(.3).easing(cc.easeSineIn())
    //                                 ),
    //                                 cc.callFunc(() => {
    //                                         this.loadText();
    //                                     }
    //                                 )
    //                             ));
    //                     }
    //                 )
    //             )
    //         );
    //     }, this.delayTime);
    // };


    /**
     * @param guideNode 需要被引导的节点
     * @param cb
     * @param idx 描述配置表里的id
     * @param isRole 是否放大角色
     * @param isSavePoint 是否是存档点
     * @param isFinal 是否是最后一步
     * @param isSelfRefresh 刷新主界面的新手是否由自己手动触发
     * @param delayTime 延迟显示时间
     * @param isScale 是否缩放
     * @param isLeft 是否向左
     * @param httpCb
     */
    setNodeToPowerGuide(guideNode?: cc.Node, cb?: Function, idx?: number, isSavePoint: boolean = false, isMask = true/*, isFinal: boolean = false, isSelfRefresh: boolean = false, delayTime: number = 0, isScale: boolean = true, isLeft: boolean = false, httpCb?: Function*/) {
        this.idx = idx;
        // this.afterHttpCb = httpCb;
        // this.isScale = isScale;
        // this.delayTime = delayTime;
        // this.highlightNode = guideNode;
        this.isSavePoint = isSavePoint;
        // this.isSelfRefresh = isSelfRefresh;
        // this.testRich = JsonMgr.getNoviceText(idx);
        // this.show();
        // this.isFinal = isFinal;
        this.mask.active = isMask;
        if (guideNode) {
            this.scheduleOnce(() => {
                this.nodeArr.forEach((node: cc.Node, index: number) => {
                    if (Number(node.name) === idx) {
                        node.active = true;
                        this.animNodeArr[index].play();
                        node.setContentSize(guideNode.getContentSize());
                        this.cpBtn = cc.instantiate(guideNode);
                        this.cpBtn.setPosition(cc.v2(0, 0,));
                        ButtonMgr.addClick(this.cpBtn, this.blinkNodeDonClick, null, this.touchStart, this.touchEnd);
                        let wordPos = guideNode.convertToWorldSpaceAR(cc.v2(0, 0));
                        let ble: boolean = idx == 10;
                        if (idx == 14) {
                            this.Btn = guideNode;
                            guideNode.group = "guideLayer";
                            this.cpBtn.removeComponent(Widget);
                            this.cpBtn.removeComponent(TaskItemNew);
                            let btnNode: cc.Node = node.getChildByName("btn");
                            ButtonMgr.addClick(btnNode, this.blinkNodeDonClick, null, this.touchStart, this.touchEnd);
                        }
                        node.setPosition(ble ? guideNode.getPosition() : this.node.convertToNodeSpaceAR(wordPos));
                        if (idx == 15) {
                            node.setPosition(cc.v2(103.212, -395.061));
                        }
                        this.cpBtn.active = true;
                        if (idx !== 14) {
                            node.addChild(this.cpBtn);
                        }
                        this.blinkNode.active = true;
                    } else {
                        node.active = false;
                    }
                });
            }, .1);
        }
        this.cb = cb;
        // this.stopAction();
        let arr: number[] = [10,16];
        if (arr.indexOf(idx) == -1) {
            UIMgr.showView(dialogueView.url, this.node, idx, (node: cc.Node) => {
                node.group = "guideLayer";
            }, false, 998, 0, false);
        }
        // if (!this.highlightNode) {
        //     // this.testRich = desc;
        //     // this.jueshe.scale = isRole ? 0 : 1;
        //     // this.jueshe.opacity = isRole ? 0 : 255;
        //     // this.Action();
        //
        // }
        //else {
        //     if (isLeft) {
        //         // this.initLeft(this.testRich);
        //         this.setLeftPosInView();
        //     } else {
        //         // this.initNormal(this.testRich);
        //         this.getNodePosInView();
        //     }
        // }
    }

    // initLeft(desc: string,) {
    //     if (desc) {
    //         this.leftLabel.node.parent.active = true;
    //         this.leftLabel.string = desc;
    //     } else {
    //         this.leftLabel.node.parent.active = false;
    //     }
    // }
    //
    // initNormal(desc) {
    //     if (desc) {
    //         this.desc.node.parent.active = true;
    //         this.desc.string = desc;
    //     } else {
    //         this.desc.node.parent.active = false;
    //     }
    // }

    // stopAction() {
    //     this.finger.stopAllActions();
    //     this.lightNode.stopAllActions();
    //     this.jueshe.stopAllActions();
    //     this.duihuak.stopAllActions();
    //     this.finger.setPosition(5, -5);
    //     this.lightNode.scale = 1;
    //     this.finger.scale = 1.2;
    // }

    // getNodePosInView() {
    //     this.scheduleOnce(() => {
    //         this.leftNode.active = false;
    //         this.blinkNode.active = true;
    //         this.descNode.active = true;
    //         // this.showDescNode();
    //         this.showBlinkNode();
    //     }, this.delayTime);
    // }
    //
    // setLeftPosInView() {
    //     this.scheduleOnce(() => {
    //         this.blinkNode.active = true;
    //         this.leftNode.active = true;
    //         this.descNode.active = false;
    //         // this.showLeftDescNode();
    //         this.showBlinkNode();
    //     }, this.delayTime);
    // }

    showBlinkNode() {
        if (!this.highlightNode) return;
        let wordPos = this.highlightNode.convertToWorldSpaceAR(cc.v2(0, 0));
        this.blinkNode.setPosition(this.node.convertToNodeSpaceAR(wordPos));
        // ActionMgr.fingerLight(this.finger, this.lightNode);
    }

    onClick = () => {
        if (!this.cpBtn) {
            this.blinkNodeDonClick();
        }
    };

    blinkNodeDonClick = () => {
        if (this.hasClick) {
            return;
        }
        this.hasClick = true;
        let errCb = () => {
            this.hasClick = false;
        };
        // this.touchEnd();
        if (this.isSavePoint) {
            this.cb && this.cb();
            HttpInst.postData(NetConfig.POWER_GUIDE, [], () => {
                this.hasClick = false;
                if (this.idx != 17) {
                    this.clickHide();
                } else {
                    DataMgr.starPolling();
                    DataMgr.completeGuide();
                    DataMgr.judgeStartSoftGuideJson();
                    DotInst.clientSendDot(COUNTERTYPE.powerGuide, "210");
                    this.closeOnly && this.closeOnly();
                    ClientEvents.ADD_ACTIVE_MAIN.emit();
                }
                // this.afterHttpCb && this.afterHttpCb();
                // this.afterHttpCb = null;
                // if (!this.isSelfRefresh) {
                //     if (this.isFinal) {
                //         DataMgr.completeGuide();
                //     }
                //     ClientEvents.REFRESH_POWER_GUIDE.emit();
                // }
            }, errCb, errCb);
        } else {
            this.clickHide();
            this.cb && this.cb();
            this.hasClick = false;
        }
    };

    clickHide = () => {
        // if (this.isFinal) {
        //     this.closeOnly();
        // } else {
        this.blinkNode.active = false;
        if (this.cpBtn) {
            this.cpBtn.destroy();
            UIMgr.closeView(dialogueView.url);
        }
        if (this.idx == 14) {
            this.Btn.group = "default";
        }
        this.cpBtn = null;
        this.mask.active = false;
        // let string = this.idx > 3 ? this.idx - 2 + 200 + "" : this.idx + 200 + "";
        // DotInst.clientSendDot(COUNTERTYPE.powerGuide, string);
        // this.animNode.node.active = false;
        // this.duihuak.scale = 0;
        // this.duihuak.opacity = 0;
        // this.jueshe.scale = 0;
        // this.jueshe.opacity = 0;
        // this.duihuaText.string = "";
        // this.hideDescNode();
        // this.hideLeftDescNode();
        // this.hide();
        // }
    };

    touchStart = () => {
        if (this.isScale) {
            if (!this.highlightNode) return;
            this.highlightNode.runAction(cc.scaleTo(.1, this.highlightNode.scaleX > 0 ? 1.1 : -1.1, 1.1));
        }
    };

    touchEnd = () => {
        if (this.isScale) {
            if (!this.highlightNode) return;
            this.highlightNode.runAction(cc.scaleTo(.1, this.highlightNode.scaleX > 0 ? 1 : -1, 1));
        }
    };

    // hideDescNode() {
    //     this.descNode.scale = 0;
    //     this.descNode.opacity = 0;
    // }
    //
    // hideLeftDescNode() {
    //     this.leftNode.scale = 0;
    //     this.leftNode.opacity = 0;
    // }
    //
    // showDescNode() {
    //     this.descNode.runAction(
    //         cc.spawn(cc.scaleTo(.3, 1).easing(cc.easeSineOut()), cc.fadeIn(.3).easing(cc.easeSineIn()))
    //     )
    // }
    //
    // showLeftDescNode() {
    //     this.leftNode.runAction(
    //         cc.spawn(cc.scaleTo(.3, -1, 1).easing(cc.easeSineOut()), cc.fadeIn(.3).easing(cc.easeSineIn()))
    //     )
    // }

    protected getBaseUrl(): string {
        return PowerGuide.url;
    }
}
