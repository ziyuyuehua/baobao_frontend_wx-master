import {GameComponent} from "../../core/component/GameComponent";
import {ButtonMgr} from "./ButtonClick";
import {ClientEvents} from "../../global/manager/ClientEventCenter";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TextTip extends GameComponent {

    @property(cc.RichText)
    label: cc.RichText = null;

    @property(cc.Node)
    blockBg: cc.Node = null;

    static url: string = 'common/textTip';

    getBaseUrl() {
        return TextTip.url;
    }

    onLoad() {
        ButtonMgr.addClick(this.blockBg, this.closeOnly);
    }

    onEnable() {
        // ClientEvents.EVENT_SHOW_MAIN_UI_TOP_SHADOW.emit(true);
        this.onShowPlay(2, this.node.getChildByName("view"));
    }

    // onDestroy() {
        // ClientEvents.EVENT_SHOW_MAIN_UI_TOP_SHADOW.emit(false);
    // }

    start() {
        this.label.string = this.node['data'];
    }

}
