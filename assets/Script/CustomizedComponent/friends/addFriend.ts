import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {CompositeDisposable} from "../../Utils/event-kit";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {DataMgr} from "../../Model/DataManager";
import {UIMgr} from "../../global/manager/UIManager";
import {ButtonMgr} from "../common/ButtonClick";
import {UIUtil} from "../../Utils/UIUtil";
import {ServerConst} from "../../global/const/ServerConst";
import {COUNTERTYPE, DotInst} from "../common/dotClient";
import {TextTipConst} from "../../global/const/TextTipConst";
import {JsonMgr} from "../../global/manager/JsonManager";
import {ResMgr} from "../../global/manager/ResManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AddFriend extends cc.Component {


    @property(cc.Label)
    private moegoNameLabel: cc.Label = null;
    @property(cc.Label)
    private levelLabel: cc.Label = null;
    //头像框
    // @property(cc.Sprite)
    // private pictureframe: cc.Sprite = null;
    //头像
    @property(cc.Sprite)
    private headportrait: cc.Sprite = null;
    @property(cc.Node)
    private fans: cc.Node = null;
    @property(cc.SpriteFrame)
    private sf: Array<cc.SpriteFrame> = [];
    @property(cc.Sprite)
    private guanzhuImg: cc.Sprite = null;
    private dispose = new CompositeDisposable();
    private data = null;
    private ble: boolean = false;

    @property(cc.Sprite)
    private positionIcon: cc.Sprite = null;

    onLoad() {
        this.dispose.add(ClientEvents.EVENT_REFRESH_GOODSITEM.on(this.refreshItem));
        this.ble = this.node.parent.name === "recommendedList";
        ButtonMgr.addClick(this.node, this.guanzhuBtn);
        ButtonMgr.addClick(this.guanzhuImg.node, this.guanzhuBtn);
    }

    start() {
        this.doRefreshItem(parseInt(this.node.name));
    }

    refreshItem = (index: number, item: cc.Node) => {

        if (this.ble) {
            return;
        }
        if (item.name != this.node.name) {
            return;
        }
        this.doRefreshItem(index);
    };

    doRefreshItem = (index: number) => {
        this.node.name = index + "";
        if (this.ble) {
            this.data = DataMgr.getRecommended().recommended;
            this.fans.active = this.data[index].fans;
        } else {
            this.data = DataMgr.getQueryFriend().queryFriend;
        }
        //玩家萌股名字
        this.moegoNameLabel.string = this.data[index].nickName;
        // this.moegoNameLabel.string = this.data[index].nickName.length > 6 ? this.data[index].nickName.substring(0, 6) + "..." : this.data[index].nickName + "";
        //玩家等级
        // this.levelLabel.string = this.data[index].level + "";
        let postionJson: IPositionJson = JsonMgr.getPositionJson(this.data[index].positionId);
        ResMgr.setPositionIcon(this.positionIcon, postionJson.positionIcon, false);
        DataMgr.addUrlData(this.data[index].head);
        UIUtil.loadUrlImg(this.data[index].head, this.headportrait); //头像
        //加关注按钮
        if (this.data[index].mutualFocus) {
            this.guanzhuImg.spriteFrame = this.sf[2];
        } else if (this.data[index].focus) {
            this.guanzhuImg.spriteFrame = this.sf[1];
        } else {
            this.guanzhuImg.spriteFrame = this.sf[0];
        }
    };

    guanzhuBtn = () => {
        let index: number = parseInt(this.node.name);
        let getRecommended = DataMgr.getRecommended();
        let getQueryFriend = DataMgr.getQueryFriend();
        if (this.data[index].focus) {
            HttpInst.postData(NetConfig.QUXIAOGUANZHU, [this.data[index].id], (res: any) => {
                if (DataMgr.friendData && DataMgr.friendData.id == this.data[index].id) {
                    DataMgr.friendData.friendFocus = false;
                }
                DataMgr.loadFocusData(res);
                ClientEvents.EVENT_ADD_FRIEND.emit();
                UIMgr.showTipText(TextTipConst.CACLEGUANSUC);
                this.guanzhuImg.spriteFrame = this.sf[0];
                if (this.ble) {
                    getRecommended.upResponse(index, false, false);
                } else {
                    getQueryFriend.upQueryFriend(index, false, false);
                }
            });
        } else {
            DotInst.clientSendDot(COUNTERTYPE.friend, "10204", this.data[index].id);
            HttpInst.postData(NetConfig.GUANZHU, [this.data[index].id], (res: any) => {
                if (DataMgr.friendData && DataMgr.friendData.id == this.data[index].id) {
                    DataMgr.friendData.friendFocus = true;
                }
                DataMgr.loadFocusData(res);
                ClientEvents.EVENT_ADD_FRIEND.emit();
                UIMgr.showTipText(TextTipConst.GUANGZHUSUC);

                if (this.data[index].fans) {
                    if (this.ble) {
                        getRecommended.upResponse(index, true, true);
                    } else {
                        getQueryFriend.upQueryFriend(index, true, true);
                    }
                    this.guanzhuImg.spriteFrame = this.sf[2];
                } else {
                    if (this.ble) {
                        getRecommended.upResponse(index, true, false);
                    } else {
                        getQueryFriend.upQueryFriend(index, true, false);
                    }
                    this.guanzhuImg.spriteFrame = this.sf[1];
                }
            });
        }
    }

    onDestroy() {
        this.dispose.dispose();
    }

    // update (dt) {}
}
