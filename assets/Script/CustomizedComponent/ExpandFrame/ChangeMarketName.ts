/**
 * author: ljx
 */
import {GameComponent} from "../../core/component/GameComponent";
import {DataMgr} from "../../Model/DataManager";
import {ButtonMgr} from "../common/ButtonClick";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {UIMgr} from "../../global/manager/UIManager";
import {ClientEvents} from "../../global/manager/ClientEventCenter";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ChangeMarketName extends GameComponent {

    static url = "expandFrame/changeName";

    @property(cc.Label)
    private nameLabel: cc.Label = null;
    @property(cc.EditBox)
    private nameEdit: cc.EditBox = null;
    @property(cc.Node)
    private change: cc.Node = null;
    @property(cc.Node)
    private back: cc.Node = null;
    @property(cc.Node)
    private aniNode: cc.Node = null;

    protected onEnable(): void {
        this.onShowPlay(1, this.aniNode);
    }

    protected start(): void {
        this.initChangeName();
        this._bindEvent();
        this.initButtonState();
    }

    private _bindEvent() {
        ButtonMgr.addClick(this.change, this.changeMarketName);
        ButtonMgr.addClick(this.back, this.closeHandle);
    }

    closeHandle = () => {
        this.closeOnly();
    };

    initButtonState() {
        this.change.getComponent(cc.Button).interactable = !DataMgr.iMarket.getTodayName();
    }

    changeMarketName = () => {
        if (this.nameEdit.string === "") {
            UIMgr.showTipText("输入名字不能为空");
            return;
        }
        HttpInst.postData(NetConfig.EDIT_MARKET_NAME, [DataMgr.getMarketId(), this.nameEdit.string], () => {
            this.closeOnly();
            this.initChangeName()
        });
    };

    initChangeName() {
        this.nameLabel.string = DataMgr.iMarket.getName();
        ClientEvents.EDIT_MARKET_NAME.emit();
        this.nameEdit.string = "";
    }

    protected getBaseUrl(): string {
        return "expandFrame/changeName";
    }
}
