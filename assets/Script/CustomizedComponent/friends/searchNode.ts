import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {COUNTERTYPE, DotInst} from "../common/dotClient";
import {DataMgr} from "../../Model/DataManager";
import {GameComponent} from "../../core/component/GameComponent";
import {UIMgr} from "../../global/manager/UIManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SearchNode extends GameComponent {
    static url = 'friendsList/searchNode';

    @property(cc.Node)
    private arrow: cc.Node = null;
    @property(cc.Prefab)
    private addFriends: cc.Prefab = null;
    @property(cc.Label)
    private IDLabel: cc.Label = null;
    @property(cc.Node)
    private content: cc.Node = null;
    @property(cc.Node)
    private addFriendScrollView: cc.Node = null;
    @property(cc.Node)
    private recommended: cc.Node = null;
    @property(cc.EditBox)
    private searchEditBox: cc.EditBox = null;
    @property(cc.Node)
    private thereIsNo: cc.Node = null;

    getBaseUrl() {
        return SearchNode.url;
    }

    onLoad() {

        this.addEvent(ClientEvents.EVENT_SEARCH_FAILURE.on(this.searchFailure));
        //空白处关闭
        this.node.on(cc.Node.EventType.TOUCH_END, () => {
            // ClientEvents.EVENT_FOCUS_SLIDE.emit(false);
            this.closeOnly();

        });
        // this.IDLabel.string = "你的ID：" + DataMgr.getUserId();
    }

    onhideArrow() {
        this.arrow.active = false;
    };

    //返回按钮
    returnButton() {
        // ClientEvents.EVENT_FOCUS_SLIDE.emit(false);
        // this.node.parent.getComponent("friendsInit").ble = true;
        ClientEvents.FOSTER_ARROW.emit(true);
        this.closeOnly();
        DotInst.clientSendDot(COUNTERTYPE.friend, "10206");
    }

    //搜索按钮
    searchButton() {

        if (this.searchEditBox.string) {
            //查询玩家
            let text: string = this.searchEditBox.string;
            DotInst.clientSendDot(COUNTERTYPE.friend, "10203", text);
            HttpInst.postData(NetConfig.CHAXUNYONGHU, [text], this.addFriendsXingXi);
        }

    }

    addFriendsXingXi = (res: any) => {
        this.recommended.active = false;
        this.thereIsNo.active = false;
        this.addFriendScrollView.active = true;
        DataMgr.setQueryFriend(res);
        let size = DataMgr.getQueryFriend().queryFriend.length;
        if (size === 0) {
            this.thereIsNo.active = true;
        } else {
            UIMgr.showTipText("成功的找到一个目标");
        }
        ClientEvents.EVENT_SCROLLVIEW_LOADITEM.emit(this.addFriends, size, "addFriendScrollView");
    };


    searchFailure = () => {
        this.recommended.active = false;
        this.addFriendScrollView.active = true;
        this.content.removeAllChildren();
        this.thereIsNo.active = true;
    };


    onDestroy() {
        this.dispose.dispose();
    }

}
