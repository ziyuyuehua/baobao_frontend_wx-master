import {ButtonMgr} from "./ButtonClick";
import {GameComponent} from "../../core/component/GameComponent";
import {DataMgr} from "../../Model/DataManager";

const {ccclass, property} = cc._decorator;

@ccclass
export class CommonPopup extends GameComponent {
    static url: string = "common/commonPopup";

    @property(cc.Node)
    cancleNode: cc.Node = null;

    @property(cc.Node)
    sureNode: cc.Node = null;

    @property(cc.RichText)
    tipLabel: cc.RichText = null;

    private callBack: Function = null;

    protected getBaseUrl(): string {
        return CommonPopup.url;
    }

    load() {
        ButtonMgr.addClick(this.sureNode, () => {
            this.closeOnly();
            this.callBack && this.callBack();
        });
        ButtonMgr.addClick(this.cancleNode, () => {
            this.closeOnly();
            DataMgr.incrCancelLowCount();
        });
    }

    initView(desc: string, cb: Function) {
        this.tipLabel.string = desc;
        this.callBack = cb;
    }

    onEnable() {
        this.onShowPlay(2, this.node.getChildByName("view"));
    }

}
