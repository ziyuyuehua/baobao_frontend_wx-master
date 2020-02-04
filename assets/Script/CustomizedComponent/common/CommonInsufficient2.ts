import {UIMgr} from "../../global/manager/UIManager";
import {ButtonMgr} from "./ButtonClick";
import ExpandFrame from "../ExpandFrame/ExpandFrame";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonInsufficient2 extends cc.Component {
    static url: string = "common/commonInsufficient2";

    @property(cc.Node)
    cancleNode: cc.Node = null;

    @property(cc.Node)
    sureNode: cc.Node = null;

    @property(cc.Label)
    tipLabel: cc.Label = null;

    private callBack: Function = null;

    protected start(): void {
        this._bindEvent();
    }

    private _bindEvent() {
        ButtonMgr.addClick(this.sureNode, () => {
           this.callBack && this.callBack();
           this.cancleHandle();
           UIMgr.closeView(ExpandFrame.url);
        });
        ButtonMgr.addClick(this.cancleNode, this.cancleHandle);
    }

    cancleHandle = () => {
        UIMgr.closeView(CommonInsufficient2.url);
        this.node.destroy()
    };

    initView(desc: string, cb: Function) {
        this.tipLabel.string = desc;
        this.callBack = cb;
    }

}
