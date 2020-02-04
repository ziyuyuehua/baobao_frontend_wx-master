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
import {ButtonMgr} from "../common/ButtonClick";
import {UIMgr} from "../../global/manager/UIManager";
import friendFrame from "./friendFrame";
import setting from "./setting";
import {StaffList} from "../staff/list/StaffList";
import {DataMgr} from "../../Model/DataManager";
import {UIUtil} from "../../Utils/UIUtil";
import {JsonMgr} from "../../global/manager/JsonManager";
import {Staff} from "../../Model/StaffData";
import {ResMgr} from "../../global/manager/ResManager";
import {topUiType} from "../MainUiTopCmpt";

const {ccclass, property} = cc._decorator;

@ccclass
export default class frameLockTip extends GameComponent {
    static url: string = "setting/other/frameLockTip";

    @property(cc.Sprite)
    private staffIcon: cc.Sprite = null;

    @property(cc.Sprite)
    private favorIcon: cc.Sprite = null;

    @property(cc.Node)
    private closeBtn: cc.Node = null;

    @property(cc.Node)
    private sureBtn: cc.Node = null;

    @property(cc.Label)
    private favorLevel: cc.Label = null;

    @property(cc.Node)
    private aniNode: cc.Node = null;

    getBaseUrl(): string {
        return frameLockTip.url;
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
        this.loadFrameState();
    }

    closeHandler = () => {
        this.closeOnly();
    }

    loadFrameState() {
        this.favorLevel.node.active = false;
        let favorlJson: IFavorJson = JsonMgr.getFavorJsonByType(DataMgr.settingData.frameId, 8);
        let favorLevelJson: IFavorLevelJson = JsonMgr.getFavorLevelJsonById(favorlJson.favorLevelId);
        UIUtil.asyncSetImage(this.staffIcon, Staff.getStaffAvataUrlById(DataMgr.settingData.frameId), false);
        ResMgr.getFavorIcon(this.favorIcon, favorLevelJson.icon);
        if (favorLevelJson.iconLevel) {
            this.favorLevel.node.active = true;
            this.favorLevel.string = favorLevelJson.iconLevel + "";
        }
    }

    sureHandler = () => {
        UIMgr.showView(StaffList.url);
        UIMgr.closeSomeView([frameLockTip.url, friendFrame.url, setting.url]);
    }
    // update (dt) {}
}
