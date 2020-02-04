// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html


import {ButtonMgr} from "../common/ButtonClick";
import {UIMgr} from "../../global/manager/UIManager";
import {SettingData} from "../../Model/SettingData";
import {DataMgr, IPhoneState} from "../../Model/DataManager";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {AudioMgr} from "../../global/manager/AudioManager";
import {GameComponent} from "../../core/component/GameComponent";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {topUiType} from "../MainUiTopCmpt";
import {DotInst, COUNTERTYPE} from "../common/dotClient";

const {ccclass, property} = cc._decorator;

@ccclass
export default class soundSetting extends GameComponent {
    static url: string = "setting/other/soundSetting";

    @property(cc.Node)
    private closeBtn: cc.Node = null;

    @property(cc.Node)
    private musicNode: cc.Node = null;

    @property(cc.Node)
    private effectNode: cc.Node = null;

    @property(cc.Node)
    private musciSwitchNode: cc.Node = null;

    @property(cc.Node)
    private effectSwitchNode: cc.Node = null;

    @property(cc.Node)
    private aniNode: cc.Node = null;

    @property(cc.Node)
    private phoneStateClick: cc.Node = null;
    @property(cc.Node)
    private phoneStateNode: cc.Node = null;

    private settingData: SettingData = null;

    private musicBol: boolean = false;
    private soundBol: boolean = false;
    private musicFlag: boolean = false;
    private soundFlag: boolean = false;

    load(){
        ButtonMgr.addClick(this.closeBtn, this.closeHandler);
        ButtonMgr.addClick(this.musciSwitchNode, this.musicAction);
        ButtonMgr.addClick(this.effectSwitchNode, this.effectAction);
        ButtonMgr.addClick(this.phoneStateClick, this.phoneAction);
    }

    start() {
        this.musicFlag = false;
        this.soundFlag = false;
        this.settingData = DataMgr.settingData;
        this.musicBol = this.settingData.musicBol;
        this.soundBol = this.settingData.soundBol;
        this.init();
    }

    protected getBaseUrl(): string {
        return soundSetting.url;
    }

    onEnable(): void {
        this.onShowPlay(2, this.aniNode);
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.gold);
    }

    onDisable(): void {
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -2);
    }

    init() {
        this.musicNode.setPosition(this.musicBol ? 25 : -25, 0);
        this.effectNode.setPosition(this.soundBol ? 25 : -25, 0);
        this.phoneStateNode.setPosition(DataMgr.isLowPhone() ? 63 : -63, 0);
    }

    private closeHandler = () => {
        this.sendRequest();
        UIMgr.closeView(soundSetting.url);
    };

    private musicAction = () => {
        let action = null;
        this.musicFlag = true;
        this.soundFlag = false;
        if (this.musicBol) {
            DotInst.clientSendDot(COUNTERTYPE.setting, "3005", "1");
            action = cc.sequence(cc.moveTo(0.1, cc.v2(-25, 0)), cc.callFunc(() => {
                this.musicBol = false;
                DataMgr.settingData.setMusicBol(this.musicBol);
                this.musicNode.setPosition(-25, 0);
                AudioMgr.setPauseMusic();
            }));
        } else {
            DotInst.clientSendDot(COUNTERTYPE.setting, "3005", "2");
            action = cc.sequence(cc.moveTo(0.1, cc.v2(25, 0)), cc.callFunc(() => {
                this.musicBol = true;
                DataMgr.settingData.setMusicBol(this.musicBol);
                this.musicNode.setPosition(25, 0);
                AudioMgr.playMusic("Audio/ydgqq", true);
            }));
        }
        this.musicNode.runAction(action);
    };

    private effectAction = () => {
        let action = null;
        this.musicFlag = false;
        this.soundFlag = true;
        if (this.soundBol) {
            DotInst.clientSendDot(COUNTERTYPE.setting, "3005", "3");
            action = cc.sequence(cc.moveTo(0.1, cc.v2(-25, 0)), cc.callFunc(() => {
                this.soundBol = false;
                DataMgr.settingData.setSoundBol(this.soundBol);
                this.effectNode.setPosition(-25, 0);
                AudioMgr.setStopAllEffect();
            }));
        } else {
            DotInst.clientSendDot(COUNTERTYPE.setting, "3005", "4");
            action = cc.sequence(cc.moveTo(0.1, cc.v2(25, 0)), cc.callFunc(() => {
                this.soundBol = true;
                DataMgr.settingData.setSoundBol(this.soundBol);
                this.effectNode.setPosition(25, 0);
                AudioMgr.setResumeAllEffect();
            }));
        }
        this.effectNode.runAction(action);
    };

    private phoneAction = () => {
        let state = DataMgr.switchPhoneState();
        let action = null;
        if(state == IPhoneState.HIGH){
            DotInst.clientSendDot(COUNTERTYPE.setting, "3005", "5");
            action = cc.sequence(cc.moveTo(0.1, cc.v2(-63, 0)), cc.callFunc(() => {
                this.phoneStateNode.setPosition(-63, 0);
            }));
        }else{
            DotInst.clientSendDot(COUNTERTYPE.setting, "3005", "6");
            action = cc.sequence(cc.moveTo(0.1, cc.v2(63, 0)), cc.callFunc(() => {
                this.phoneStateNode.setPosition(63, 0);
            }));
        }
        this.phoneStateNode.runAction(action);
    };

    sendRequest() {
        HttpInst.postData(NetConfig.SET_SETTING, [this.musicBol, this.soundBol, DataMgr.isLowPhone()], (res) => {
            DataMgr.settingData.musicSwitch = res.settings.music;
            DataMgr.settingData.soundSwitch = res.settings.sound;
            AudioMgr.updateSwitchData();
        });
    }

}
