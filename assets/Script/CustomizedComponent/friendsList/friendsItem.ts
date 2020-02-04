import {DataMgr} from "../../Model/DataManager";
import {CompositeDisposable} from "../../Utils/event-kit";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import FriendsList from "./friendsList";
import {ButtonMgr} from "../common/ButtonClick";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {UIMgr} from "../../global/manager/UIManager";
import {IFriendsItem, IRespData} from "../../types/Response";
import {MapMgr} from "../MapShow/MapInit/MapManager";
import FriendsScene from "../friends/friendsScene";
import {UIUtil} from "../../Utils/UIUtil";
import {ResMgr} from "../../global/manager/ResManager";
import {JsonMgr, StaffModConfig} from "../../global/manager/JsonManager";
import {COUNTERTYPE, DotInst} from "../common/dotClient";
import {TextTipConst} from "../../global/const/TextTipConst";


const {ccclass, property} = cc._decorator;

export enum HomeStatusType {
    // RECRUIT = Math.pow(2, 0),
    TOUR = Math.pow(2, 1),
    INCIDENT = Math.pow(2, 2),
}

@ccclass
export default class FriendsItem extends cc.Component {
    @property(cc.Sprite)
    private friendFrame: cc.Sprite = null;
    @property(cc.Node)
    private recruitBtn: cc.Node = null;
    @property([cc.Node])
    private Btn: cc.Node[] = [];
    @property([cc.Node])
    private fdNode: cc.Node[] = [];//分店
    @property([cc.Node])
    private fdtbNode: cc.Node[] = [];//分店图标
    @property([cc.Node])
    private fdxzkNode: cc.Node[] = [];//分店选择标示
    @property([cc.Node])
    private fdStatusNode: cc.Node[] = [];//分店状态
    @property(cc.Node)
    private fdbjk: cc.Node = null;//分店背景框
    @property([cc.SpriteFrame])
    private selectedImg: cc.SpriteFrame[] = [];
    @property(cc.Sprite)
    private selectedFlag: cc.Sprite = null;
    @property([cc.Label])
    private fddqLab: cc.Label[] = [];//分店标签
    @property([cc.Label])
    private fdNameLab: cc.Label[] = [];//分店名称
    @property(cc.Node)
    private pictureframeNode: cc.Node = null;
    //头像框
    @property(cc.Sprite)
    private pictureframe: cc.Sprite = null;
    //头像
    @property(cc.Sprite)
    private headportrait: cc.Sprite = null;
    @property(cc.Label)
    private levelLabel: cc.Label = null;
    @property(cc.Label)
    private nameLabel: cc.Label = null;
    @property(cc.Sprite)
    private positionIcon: cc.Sprite = null;
    @property(cc.Sprite)
    private positionName: cc.Sprite = null;
    @property(cc.Node)
    private lvAndName: cc.Node = null;
    @property(cc.Node)
    private jump: cc.Node = null;
    @property(cc.Sprite)
    private cancelFocus: cc.Sprite = null;
    @property([cc.SpriteFrame])
    private cancelImg: cc.SpriteFrame [] = [];
    private dispose = new CompositeDisposable();
    private friendsData: any;
    @property(cc.Node)
    private xz: cc.Node = null;
    private idx: number = -1;
    private list: FriendsList = null;

    private nowChosenIndex: number = -1;

    onLoad() {
        let list = this.node.parent.parent;
        this.list = list.parent.parent.getComponent(FriendsList);
        this.dispose.add(ClientEvents.SWITCH_FRIENDS_STATE.on(this.switch));
        this.dispose.add(ClientEvents.SWITCH_FRIENDS_ITEM.on(this.onClickFD));
        this.dispose.add(ClientEvents.HANDLE_SINGLE_FRIENDS.on(this.UpHomeType));
    }

    start() {
        this.onBtn();
        this._bindFDNodeEvent();
    }

    onEnable() {
    }


    onBtn = () => {
        ButtonMgr.addClick(this.node, this.goFriendMarket);
        // ButtonMgr.addClick(this.Btn[0], () => {//巴士
        // });
        // ButtonMgr.addClick(this.Btn[1], () => {//危机
        // });
        // ButtonMgr.addClick(this.recruitBtn, () => {
        // });
        ButtonMgr.addClick(this.cancelFocus.node, () => {
            let data = DataMgr.getFocusData();
            if (this.friendsData.focus) {
                if (this.friendsData.mutualFocus) {
                    ClientEvents.EVENT_CANCEL_FOCUS.emit(this.friendsData, () => {
                        HttpInst.postData(NetConfig.QUXIAOGUANZHU, [this.friendsData.id], (res) => {
                            if(!this.friendsData) return;
                            if (DataMgr.friendData && DataMgr.friendData.id == this.friendsData.id) {
                                DataMgr.friendData.friendFocus = false;
                            }
                            data.setFocusState(this.idx, false, false);
                            this.cancelFocus.spriteFrame = this.cancelImg[0];
                            UIMgr.showTipText(TextTipConst.CACLEGUANSUC);
                            if (res.staff) {
                                DataMgr.staffData.update(res.staff);
                            }
                        });
                    });
                } else {
                    HttpInst.postData(NetConfig.QUXIAOGUANZHU, [this.friendsData.id], (res) => {
                        if(!this.friendsData) return;
                        if (DataMgr.friendData && DataMgr.friendData.id == this.friendsData.id) {
                            DataMgr.friendData.friendFocus = false;
                        }
                        data.setFocusState(this.idx, false, false);
                        this.cancelFocus.spriteFrame = this.cancelImg[0];
                        UIMgr.showTipText(TextTipConst.CACLEGUANSUC);
                        if (res.staff) {
                            DataMgr.staffData.update(res.staff);
                        }
                    });
                }
            } else {
                HttpInst.postData(NetConfig.GUANZHU, [this.friendsData.id], () => {
                    if(!this.friendsData) return;
                    if (DataMgr.friendData && DataMgr.friendData.id == this.friendsData.id) {
                        DataMgr.friendData.friendFocus = true;
                    }
                    if (this.friendsData.fans) {
                        data.setFocusState(this.idx, true, true);
                        this.cancelFocus.spriteFrame = this.cancelImg[2];
                    } else {
                        data.setFocusState(this.idx, true, false);
                        this.cancelFocus.spriteFrame = this.cancelImg[1];
                    }
                    UIMgr.showTipText(TextTipConst.GUANGZHUSUC);
                });
            }
        });
    };

    itemInit = (data: IFriendsItem, idx: number, ble: boolean) => {
        let focusData = DataMgr.getFocusData();
        if (idx == focusData.getNewFocusSize()) {
            UIMgr.showTipText("好友列表刷新中~");
            ClientEvents.OPERATE_FRIENDs_HOME.emit();
            return;
        }
        if (!data) {
            return;
        }
        this.idx = idx;
        this.friendsData = data;
        DataMgr.addUrlData(data.head);
        UIUtil.loadUrlImg(data.head, this.headportrait); //头像
        if (data.friendFrame > 0) {
            let temp: StaffModConfig = JsonMgr.getStaffMod(data.friendFrame);
            ResMgr.setFrameIcon(this.friendFrame, temp.friendIcon);
        } else {
            this.friendFrame.spriteFrame = null;
        }
        // //等级
        // this.levelLabel.string = data.level + "";
        let postionJson: IPositionJson = JsonMgr.getPositionJson(data.positionId);
        ResMgr.setPositionIcon(this.positionIcon, postionJson.positionIcon, false);
        ResMgr.setPositionIcon(this.positionName, postionJson.positionName, false);
        //玩家名字
        this.nameLabel.string = /*data.nickName.length > 6 ? data.nickName.substring(0, 6) + "..." :*/ data.nickName + "";
        this.switch(ble);
        // this.cancelFocus.node.active = ble1;

        // //我关注的人关注了我
        // if (this.friendsData.focusHasNewFans === "true") {
        //     this.redDotSprite.active = true;
        // } else {
        //     this.redDotSprite.active = false;
        // }
        //关注状态
        if (this.friendsData.mutualFocus) {
            this.cancelFocus.spriteFrame = this.cancelImg[2];
        } else if (this.friendsData.focus) {
            this.cancelFocus.spriteFrame = this.cancelImg[1];
        } else {
            this.cancelFocus.spriteFrame = this.cancelImg[0];
        }
        this.cancelFocus.node.active = data.id > 0;
        this.recruitBtn.active = data.recruit && this.friendsData.mutualFocus;
        this.fdNode.forEach((node: cc.Node) => {
            node.active = false;
            node.name = "r";
        });
        let size: number = data.marketStatus.length;
        if (size > 1) {
            this.Btn[0].active = false;
            this.Btn[1].active = false;
            // this.selectedFlag.spriteFrame = this.selectedImg[1];
            let j: number = size === 2 ? 1 : 0;
            for (let i = 0; i < size; i++) {
                this.fddqLab[i + j].string = data.marketStatus[i].marketId + "";
                this.fdNameLab[i + j].string = data.nickName + "的" + data.marketStatus[i].name + "店";
                this.HomeStatus(this.fdStatusNode[i + j].children, data.id < 0 ? 0 : data.marketStatus[i].status);
                this.fdNode[i + j].active = true;
                this.fdNode[i + j].name = data.marketStatus[i].marketId + "";
            }
        } else {
            // this.selectedFlag.spriteFrame = this.selectedImg[0];
            this.HomeStatus(this.Btn, data.id < 0 ? 0 : data.marketStatus[0].status);
        }
        if (this.list.getFriendsUsetId() && this.list.getFriendsUsetId() === data.id) {
            this.list.selectedId(idx);
            this.clickFD(this.list.getFriendsFDId());
        }
    };

    UpHomeType = (idx: number) => {
        if (!this.friendsData || this.friendsData.id != idx) {
            return;
        }
        this.recruitBtn.active = this.friendsData.recruit && this.friendsData.mutualFocus;
        let size: number = this.friendsData.marketStatus.length;
        if (size > 1) {
            this.Btn[0].active = false;
            this.Btn[1].active = false;
            let j: number = size === 2 ? 1 : 0;
            for (let i = 0; i < size; i++) {
                this.fddqLab[i + j].string = this.friendsData.marketStatus[i].marketId + "";
                this.fdNameLab[i + j].string = this.friendsData.marketStatus[i].name;
                this.HomeStatus(this.fdStatusNode[i + j].children, this.friendsData.marketStatus[i].status);
                this.fdNode[i + j].active = true;
                this.fdNode[i + j].name = this.friendsData.marketStatus[i].marketId + "";
            }
        } else {
            this.HomeStatus(this.Btn, this.friendsData.marketStatus[0].status);
        }
    };

    HomeStatus = (node: cc.Node[], num: number) => {
        node.forEach((node: cc.Node, id: number) => {
            switch (id) {
                case 0:
                    node.active = (num & HomeStatusType.TOUR) == HomeStatusType.TOUR && this.friendsData.mutualFocus;
                    break;
                case 1:
                    node.active = (num & HomeStatusType.INCIDENT) == HomeStatusType.INCIDENT;
                    break;
            }
        });
    };


    switch = (ble: boolean) => {
        this.node.width = ble ? 130 : 345;
        this.xz.width = ble ? 150 : 360;
        // this.xz.position = ble ?cc.v2(-7.5,6.5):cc.v2(-6.5,6.5);
        this.lvAndName.active = !ble;
        this.pictureframeNode.x = ble ? 0 : -120;
        this.jump.x = ble ? 58 : 158;

        this.fdtbNode.forEach((node: cc.Node, idx: number) => {
            node.x = ble ? -40 : -130;
            this.fdxzkNode[idx].width = ble ? 130 : 345;
            this.fdStatusNode[idx].x = ble ? 62 : 157;
            this.fdbjk.width = ble ? 130 : 345;
            this.fdNameLab[idx].node.active = !ble;
        });
    };

    onClickFD = () => {
        if(!this.friendsData) return;
        if (this.list.getFriendsUsetId() !== this.friendsData.id) {
            this.clickFD(-1);
        }
    };
    clickFD = (id: number) => {
        this.fdxzkNode.forEach((node: cc.Node) => {
            node.active = parseInt(node.parent.name) === id;
        });
    };


    _bindFDNodeEvent() {
        this.fdNode.forEach((value) => {
            ButtonMgr.addClick(value, this.goFriendMarket);
        });
    }

    goFriendMarket = (event: cc.Event.EventTouch) => {
        if (!this.friendsData) return;
        this.list.setFriendsUserId(this.friendsData.id);
        let target = event.getCurrentTarget();
        let FDid = parseInt(target.name);
        if (FDid != 1 && FDid != 2 && FDid != 3) {
            FDid = 1;
        }
        let marketId = DataMgr.iMarket.getMarketId();
        DotInst.clientSendDot(COUNTERTYPE.mainPage, "2044");
        HttpInst.postData(NetConfig.VISIT_FRIEND, [this.friendsData.id, FDid], (resp: IRespData) => {
            if(!this.friendsData) return;
            DataMgr.setClickTaskJumpMap(0);
            this.list.setFriendsFDId(FDid);
            this.clickFD(FDid);
            let index = target.getSiblingIndex();
            if (this.nowChosenIndex != index) {
                MapMgr.goOtherUserHouse(marketId);
                DataMgr.stopPolling();
                DotInst.clientSendDot(COUNTERTYPE.friend, "10207", this.friendsData.id);
                setTimeout(() => {
                    UIMgr.showView(FriendsScene.url, null, null, (node: cc.Node) => {
                        node.getComponent(FriendsScene).loadFriends(resp);
                        node.zIndex = 99;
                        let node1: cc.Node = UIMgr.getView(FriendsList.url);
                        if (!node1) return;
                        node1.getChildByName("maskNode").active = false;
                    });
                }, 900);
            } else {
                event.stopPropagation();
            }
        });
    };

    onDestroy() {
        this.dispose.dispose();
    }

    // update (dt) {}
}
