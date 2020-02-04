// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class SureCancleTip extends cc.Component {

    @property(cc.RichText)
    DescLab: cc.RichText = null;

    @property(cc.Button)
    CancleBtn: cc.Button = null;

    @property(cc.Label)
    CancleTipLab: cc.Label = null;

    @property(cc.Button)
    SureBtn: cc.Button = null;

    @property(cc.Label)
    CSureTipLab: cc.Label = null;

    private sureCallBack = null;
    private cancleCallBack = null;

    setCancleText(str) {
        this.CancleTipLab.string = str;
    }

    setSureText(str) {
        this.CSureTipLab.string = str;
    }

    setLable(text) {
        this.DescLab.string = text;
    }

    setCancleHandler(callBack) {
        this.cancleCallBack = callBack
    }

    setSureHandler(callBack) {
        this.sureCallBack = callBack
    }

    CancleHandler() {
        this.closeHandler()
        if (this.cancleCallBack) {
            this.cancleCallBack();
        }
    }

    SureHandler() {
        this.closeHandler();
        if (this.sureCallBack) {
            this.sureCallBack();
        }
    }

    closeHandler() {
        this.node.destroy();
    }

    // update (dt) {}
}
