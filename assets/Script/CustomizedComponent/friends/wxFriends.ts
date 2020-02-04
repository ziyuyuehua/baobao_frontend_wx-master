import {GameComponent} from "../../core/component/GameComponent";
import {GameManager} from '../../global/manager/GameManager';
import {DataMgr, SHARE_TYPE} from '../../Model/DataManager';
import {WxMessage} from '../../CustomizedComponent/login/WxServices';
import {UIMgr} from '../../global/manager/UIManager';
import {JsonMgr} from "../../global/manager/JsonManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class WxFriends extends GameComponent {
    static url = 'friendsList/wxFriends';

    @property(cc.Node)
    private returnBtn: cc.Node = null;
    @property(cc.Node)
    private wxFriendsNode: cc.Node = null;

    getBaseUrl() {
        return WxFriends.url;
    }

    onLoad() {
        // 空白处关闭
        this.node.on(cc.Node.EventType.TOUCH_END, () => {
            this.closeOnly();
        });

        this.scheduleOnce(() => {
            this.wxFriendsNode.getComponent(cc.WXSubContextView).enabled = true;
            let canvas = wx.getOpenDataContext().canvas;
            canvas.width = this.wxFriendsNode.width * (<any>cc.view)._scaleX;
            canvas.height = this.wxFriendsNode.height * (<any>cc.view)._scaleY;
            GameManager.WxServices.postMessage(WxMessage.ShowFriendList, {});
        });
    }

    //返回按钮
    returnButton() {
        this.closeOnly();
    }

    shareToFriend() {
        let shareJsons: IShareJson = JsonMgr.getShareJsonByType(SHARE_TYPE.wxFriends);
        const title = shareJsons ? shareJsons.title : "";
        const imageUrl = shareJsons ? shareJsons.pictrue : "";
        // if (GameManager.WxServices.checkVersion("2.9.0")) {
        //     GameManager.WxServices.setMessageToFriendQuery({requestAddFriendFrom: DataMgr.userData.id});
        //     GameManager.WxServices.postMessage(WxMessage.ShareToFriend, {
        //         title,
        //         imageUrl
        //     });
        // } else {
            GameManager.WxServices.shareGame(title, imageUrl, `requestAddFriendFrom=${DataMgr.userData.id}`);
        // }
    }

    nexPage() {
        GameManager.WxServices.postMessage(WxMessage.FriendListNextPage, {});
    }

    onDestroy() {
        this.dispose.dispose();
    }

}
