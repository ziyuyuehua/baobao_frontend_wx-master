
import { GameComponent } from "../../core/component/GameComponent";
import { ResMgr } from "../../global/manager/ResManager";
import { ButtonMgr } from "./ButtonClick";
import { JsonMgr } from "../../global/manager/JsonManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class functionOpenTip extends GameComponent {
    static url: string = "common/functionOpenTip";

    getBaseUrl() {
        return functionOpenTip.url;
    }

    @property(cc.Sprite)
    titleIcon: cc.Sprite = null;

    @property(cc.Sprite)
    funcOpenIcon: cc.Sprite = null;

    @property(cc.Sprite)
    detailIcon: cc.Sprite = null;

    @property(cc.Node)
    sureNode: cc.Node = null;

    @property(cc.Node)
    bg: cc.Node = null;

    @property(cc.Node)
    aniNode: cc.Node = null;

    private jumpId: number = 0;
    private callBack = null;
    private imgAdd: number = 1;
    onLoad() {
        ButtonMgr.addClick(this.sureNode, this.jumpHandler);
        ButtonMgr.addClick(this.bg, this.jumpHandler);
        ButtonMgr.addClick(this.funcOpenIcon.node, this.jumpHandler)
    }

    jumpHandler = () => {
        this.closeView();
        this.callBack && this.callBack();
    };

    onEnable() {
        this.onShowPlay(2, this.aniNode)
    }

    start() {
        this.sureNode.active = false;
        this.callBack = this.node["data"].callback;
        this.updateView();
        // GuideMgr.showSoftGuide(this.sureNode, ARROW_DIRECTION.TOP, "朕已阅", (node: cc.Node) => {

        // });
    }

    updateView() {
        let functionName = this.node["data"].functionName;
        let functionJson: IFunctionOpenJson = JsonMgr.getFunctionOpenByName(functionName);
        if (functionJson) {
            this.jumpId = functionJson.jump;
            ResMgr.setFunctionOpenIcon(this.funcOpenIcon, "bg" + functionJson.functionPicType, false, this.imgLoadEnd);
            ResMgr.setFunctionOpenIcon(this.titleIcon, "title" + functionJson.functionPicType, false, this.imgLoadEnd);
            ResMgr.setFunctionOpenIcon(this.detailIcon, "detail" + functionJson.functionPicType, false, this.imgLoadEnd);
        }
    }

    imgLoadEnd = () => {
        this.imgAdd++
        if (this.imgAdd >= 3) {
            this.sureNode.active = true;
        }
    }

}
