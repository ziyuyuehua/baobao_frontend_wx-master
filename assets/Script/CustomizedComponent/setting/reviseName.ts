// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {GameComponent} from "../../core/component/GameComponent";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {topUiType} from "../MainUiTopCmpt";
import {ButtonMgr} from "../common/ButtonClick";
import {UIMgr} from "../../global/manager/UIManager";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {DataMgr} from "../../Model/DataManager";
import {TimeUtil} from "../../Utils/TimeUtil";
import {JsonMgr} from "../../global/manager/JsonManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class reviseName extends GameComponent {
    static url: string = "setting/other/reviseName";

    @property(cc.Node)
    private aniNode: cc.Node = null;

    @property(cc.EditBox)
    private nameEdi: cc.EditBox = null;

    @property(cc.Node)
    private closeBtn: cc.Node = null;

    @property(cc.Node)
    private sureBtn: cc.Node = null;

    @property(cc.Node)
    private sureLabel: cc.Node = null;

    @property(cc.Label)
    private timeLabel: cc.Label = null;

    @property(cc.Label)
    private reTime: cc.Label = null;

    @property(cc.Node)
    private block: cc.Node = null;

    getBaseUrl(): string {
        return reviseName.url;
    }

    onEnable(): void {
        this.onShowPlay(2, this.aniNode);
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.gold);
    }

    onDisable(): void {
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -2);
    }

    start() {
        ButtonMgr.addClick(this.closeBtn, this.closeHandler);
        ButtonMgr.addClick(this.sureBtn, this.sureHandler);
        ButtonMgr.addClick(this.block, this.showBlockTips);
        this.setTimeStatus();
    }

    closeHandler = () => {
        this.closeOnly();
    }

    sureHandler = () => {
        let str: string = this.nameEdi.string;
        if (str.length == 0) {
            UIMgr.showTipText("输入文本长度不能为空");
            return;
        }
        if (str.length > 8) {
            UIMgr.showTipText("输入文本长度超过限制(8个字)");
            return;
        }
        HttpInst.postData(NetConfig.REVISE_NAME, [str], () => {
            ClientEvents.REFRESH_NAME.emit();
            this.closeOnly();
        });
    }

    setTimeStatus() {
        let endTime = Number(JsonMgr.getConstVal("renameTime")) / 3600;
        this.reTime.string = endTime + "小时内只能修改一次";
        this.nameEdi.string = DataMgr.userData.nickName;
        let serTime = DataMgr.getServerTime();
        let time: number = DataMgr.userData.renameEndTime - serTime;
        this.setBtnStatus(time);
        if (time > 0) {
            this.timeLabel.string = TimeUtil.getTimeHouseStr(time);
            this.schedule(() => {
                time -= 1000;
                if (time > 0) {
                    this.timeLabel.string = TimeUtil.getTimeHouseStr(time);
                } else {
                    this.setBtnStatus(0);
                    this.unscheduleAllCallbacks();
                }
            }, 1);
        }
    }

    setBtnStatus(time) {
        this.sureBtn.getComponent(cc.Button).interactable = time <= 0;
        this.sureLabel.active = time <= 0;
        this.timeLabel.node.active = time > 0;
        this.block.active = time > 0;
    }

    showBlockTips = () => {
        UIMgr.showTipText("改名冷却中，倒计时结束再来改名吧~");
    }

}
