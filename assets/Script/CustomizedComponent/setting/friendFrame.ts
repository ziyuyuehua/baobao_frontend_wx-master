// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {UIMgr} from "../../global/manager/UIManager";
import {ButtonMgr} from "../common/ButtonClick";
import {DataMgr} from "../../Model/DataManager";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {GameComponent} from "../../core/component/GameComponent";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {IOwnFrameInfo} from "../../types/Response";
import {JsonMgr} from "../../global/manager/JsonManager";
import {topUiType} from "../MainUiTopCmpt";
import List from "../../Utils/GridScrollUtil/List";
import friendFrameItem from "./friendFrameItem";

const {ccclass, property} = cc._decorator;

@ccclass
export default class friendFrame extends GameComponent {
    static url: string = "setting/other/friendFrame";

    @property(List)
    private frameList: List = null;

    @property(cc.Node)
    private closeBtn: cc.Node = null;

    @property(cc.Button)
    private sureBtn: cc.Button = null;

    @property(cc.Node)
    private aniNode: cc.Node = null;


    start() {
        ButtonMgr.addClick(this.closeBtn, this.closeView);
        ButtonMgr.addClick(this.sureBtn.node, this.sendRequest);
        this.addEvent(ClientEvents.FRAME_CLICK.on(this.updateSelect));
        this.init();
        this.initScroll();
    }

    init() {
        HttpInst.postData(NetConfig.FRAME_REDPOINT, [], () => {

        });
    }

    protected getBaseUrl(): string {
        return friendFrame.url;
    }

    updateSelect = (id: number) => {
        for (let i in DataMgr.settingData.getOwnFrames()) {
            if (DataMgr.settingData.getOwnFrames()[i].id == DataMgr.settingData.frameId) {
                DataMgr.settingData.getOwnFrames()[i].redDot = false;
                break;
            }
        }
        this.sureBtn.interactable = true;
        this.sureBtn.enableAutoGrayEffect = false;
        ClientEvents.REFRESH_SELECTED.emit(id);
    }

    onEnable(): void {
        this.onShowPlay(2, this.aniNode);
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.gold);
    }

    onDisable(): void {
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -2);
    }

    initScroll() {
        this.sureBtn.interactable = false;
        this.sureBtn.enableAutoGrayEffect = true;
        this.setOwnFramesData();
        let colnum: number = DataMgr.settingData.getOwnFrames().length;
        if (colnum > 0) {
            this.frameList.numItems = colnum;
        } else {
            this.frameList.numItems = 0;
        }
    }

    sendRequest = () => {
        let frameId: number = DataMgr.settingData.frameId;
        HttpInst.postData(NetConfig.UPDATE_FRIEND_FRAME, [frameId], (res) => {
            DataMgr.settingData.setFriendFrame(res.friendFrame);
            this.initScroll();
        });
    }

    closeView = () => {
        UIMgr.closeView(friendFrame.url);
    }

    setOwnFramesData() {
        let data: IOwnFrameInfo[] = DataMgr.settingData.getOwnFriendFrames();
        let ownFrame = JsonMgr.getStaffFrame();
        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < ownFrame.length; j++) {
                if (data[i].id == ownFrame[j].id) {
                    ownFrame[j] = data[i];
                    break;
                }
            }
        }
        ownFrame.sort((a: IOwnFrameInfo, b: IOwnFrameInfo) => {
            let isLock: boolean = false;
            for (let i in data) {
                if (data[i].id == a.id) {
                    isLock = true;
                    break
                }
            }
            if (isLock) {
                return -1;
            } else {
                return 1;
            }
        });
        ownFrame.unshift({id: -1, redDot: false});
        DataMgr.settingData.setOwnFrames(ownFrame);
    }

    onListVRender(item: cc.Node, idx: number) {
        let frameItem: friendFrameItem = item.getComponent(friendFrameItem);
        frameItem.initItem(idx);
    }

    // update (dt) {}
}
