// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {GameComponent} from "../../../core/component/GameComponent";
import {ButtonMgr} from "../../common/ButtonClick";
import {UIMgr} from "../../../global/manager/UIManager";
import {DataMgr} from "../../../Model/DataManager";
import {TimeUtil} from "../../../Utils/TimeUtil";
import {HttpInst} from "../../../core/http/HttpClient";
import {NetConfig} from "../../../global/const/NetConfig";
import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {IFosterRewardInfo} from "../../../types/Response";
import CommonGiftItem from "../../common/CommonGiftItem";
import CommonSimItem from "../../common/CommonSimItem";

const {ccclass, property} = cc._decorator;

@ccclass
export default class fosterCancel extends GameComponent {
    static url: string = "fosterCare/fosterCareCancel";

    @property(cc.Node)
    private aniNode: cc.Node = null;
    @property(cc.Node)
    private sureBtn: cc.Node = null;
    @property(cc.Node)
    private closeBtn: cc.Node = null;
    @property(cc.Label)
    private friendName: cc.Label = null;
    @property(cc.Label)
    private reTime: cc.Label = null;
    @property(cc.Node)
    private dropNode1: cc.Node = null;
    @property(cc.Node)
    private dropNode2: cc.Node = null;
    @property(cc.Prefab)
    private dropItem: cc.Prefab = null;
    @property(cc.Node)
    private noReward: cc.Node = null;
    private index: number = 0;
    private time: number = 0;

    start() {
        this.index = DataMgr.fosterCare.index;
        ButtonMgr.addClick(this.closeBtn, this.closeHandler);
        ButtonMgr.addClick(this.sureBtn, this.sureHandler);
        this.initView();
    }

    initView() {
        let friend = DataMgr.fosterCare.fosterCare[this.index];
        if(!friend) return;
        HttpInst.postData(NetConfig.FOSTER_CANCEL_REWARD, [friend.friendId], (res: IFosterRewardInfo) => {
            let friendName: string = friend.friendName.length > 6 ? friend.friendName.substring(0, 6) + "..." : friend.friendName;
            this.friendName.string = friendName;
            if (res.canRewards) {
                this.setRewardItem(res);
            }
            this.time = DataMgr.fosterCare.fosterCare[this.index].fosterRemain;
            this.reTime.string = TimeUtil.getTimeHouseStr(this.time);
            this.schedule(this.fosterTime, 1);
        });
    }

    setRewardItem(data: IFosterRewardInfo) {
        this.noReward.active = data.canRewards.length == 0;
        if (data.canRewards.length == 0) return;
        let dropNode = null;
        if (data.canRewards.length < 5) {
            dropNode = this.dropNode1;
        } else {
            dropNode = this.dropNode2;
        }
        this.dropNode1.active = data.canRewards.length < 5;
        this.dropNode2.active = data.canRewards.length >= 5;
        for (let i = 0; i < data.canRewards.length; i++) {
            let node = cc.instantiate(this.dropItem);
            let dropItem: CommonGiftItem = node.getComponent("CommonGiftItem");
            dropItem.loadItem(data.canRewards[i].xmlId, data.canRewards[i].num);
            dropNode.addChild(node);
        }
    }

    fosterTime = () => {
        if (this.time > 0) {
            this.time = DataMgr.fosterCare.fosterCare[this.index].fosterRemain -= 1000;
            this.reTime.string = TimeUtil.getTimeHouseStr(this.time);
        } else {
            UIMgr.closeView(fosterCancel.url);
        }
    }

    sureHandler = () => {
        let friend = DataMgr.fosterCare.fosterCare[this.index];
        if(!friend) return;
        HttpInst.postData(NetConfig.CANCEL_FOSTER, [friend.friendId], (res: any) => {
            DataMgr.fosterCare.setFosterCare(res.fosterList);
            DataMgr.staffData.update(res.staff);
            ClientEvents.UPDATE_STAFFLIST.emit();
            ClientEvents.REFRESH_FOSTERCARE.emit();
            UIMgr.closeView(fosterCancel.url);
        });
    }

    closeHandler = () => {
        UIMgr.closeView(fosterCancel.url);
    }

    onEnable() {
        this.onShowPlay(1, this.aniNode);
    }

    protected getBaseUrl(): string {
        return fosterCancel.url;
    }

    // update (dt) {}
}
