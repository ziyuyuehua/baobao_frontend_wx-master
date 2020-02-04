// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {DataMgr} from "../../Model/DataManager";
import {JsonMgr, StaffModConfig} from "../../global/manager/JsonManager";
import {ButtonMgr} from "../common/ButtonClick";
import {ResMgr} from "../../global/manager/ResManager";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {CompositeDisposable} from "../../Utils/event-kit";
import {UIMgr} from "../../global/manager/UIManager";
import frameLockTip from "./frameLockTip";
import {DotInst, COUNTERTYPE} from "../common/dotClient";

const {ccclass, property} = cc._decorator;

@ccclass
export default class friendFrameItem extends cc.Component {

    @property(cc.Node)
    private selectNode: cc.Node = null;

    @property(cc.Node)
    private selectIng: cc.Node = null;

    @property(cc.Sprite)
    private frameIcon: cc.Sprite = null;

    @property(cc.Node)
    private redPoint: cc.Node = null;

    @property(cc.Node)
    private lockNode: cc.Node = null;

    private index: number = 0;
    private frameId: number = 0;
    private dispose = new CompositeDisposable();

    start() {
        this.dispose.add(ClientEvents.REFRESH_SELECTED.on(this.updateSelecting));
        ButtonMgr.addClick(this.node, this.clickHandler);
    }

    clickHandler = () => {
        DataMgr.settingData.frameId = this.frameId;
        if (this.lockNode.active) {
            UIMgr.showView(frameLockTip.url);
            return;
        }

        DotInst.clientSendDot(COUNTERTYPE.setting, "3001", this.frameId + "");
        ClientEvents.FRAME_CLICK.emit(this.index);
    }

    updateSelecting = (id: number) => {
        if (this.index == id) {
            this.redPoint.active = false;
        }
        this.selectNode.active = this.index == id;
    }

    initItem = (index: number) => {
        let data = DataMgr.settingData.getOwnFriendFrames();
        let isLock: boolean = true;
        this.index = index;
        this.frameId = DataMgr.settingData.getOwnFrames()[index].id;
        this.redPoint.active = DataMgr.settingData.getOwnFrames()[index].redDot;
        let temp: StaffModConfig = JsonMgr.getStaffMod(this.frameId);
        if (this.frameId > 0) {
            ResMgr.setFrameIcon(this.frameIcon, temp.friendIcon);
        } else {
            this.frameIcon.spriteFrame = null;
        }
        for (let i in data) {
            if (data[i].id == this.frameId) {
                isLock = false;
                break;
            }
        }
        this.lockNode.active = isLock;
        this.selectIng.active = this.frameId == DataMgr.settingData.getFriendFrame();
        this.selectNode.active = this.frameId == DataMgr.settingData.getFriendFrame();
    }

    protected onDestroy(): void {
        this.dispose.dispose();
        this.node.destroy();
    }

    // update (dt) {}
}
