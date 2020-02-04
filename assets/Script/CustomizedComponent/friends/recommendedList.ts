import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {CompositeDisposable} from "../../Utils/event-kit";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {DotVo, COUNTERTYPE, DotInst} from "../common/dotClient";
import {DataMgr} from "../../Model/DataManager";
import {ArrowType} from "../common/Arrow";
import friendsItem from "../friendsList/friendsItem";
import AddFriend from "./addFriend";


const {ccclass, property} = cc._decorator;

@ccclass
export default class RecommendedList extends cc.Component {

    @property(cc.EditBox)
    private searchEditBox: cc.EditBox = null;
    @property(cc.Node)
    private arrow: cc.Node = null;
    @property(cc.Prefab)
    private addFriends: cc.Prefab = null;
    @property(cc.Node)
    private recommendedList: cc.Node = null;
    @property(cc.Node)
    private redDotSprite: cc.Node = null;
    @property(cc.Node)
    private noRecommended: cc.Node = null;
    @property(cc.Button)
    private recommended: cc.Button = null;
    private dispose = new CompositeDisposable();

    onLoad() {
        // this.dispose.add(ClientEvents.EVENT_FRIENDS_RED_DOT.on(this.redDot));
        this.dispose.add(ClientEvents.EVENT_LOAD_RECOMENDED.on(this.loadItem));
    }

    start() {
        // this.redDot();
    }

    loadItem = () => {
        this.recommendedList.destroyAllChildren();
        let sum: number = DataMgr.getRecommended().getRecommendedSize();
        this.noRecommended.active = sum <= 0;
        for (let i = 0; i < (sum > 4 ? 4 : sum); i++) {
            let item = cc.instantiate(this.addFriends);
            item.name = i + "";
            this.recommendedList.addChild(item);
        }
        this.t(sum <= 0);
    };

    t = (ble: boolean) => {
        if (ble) return;
        if (!DataMgr.getCanShowRedPoint()) {
            // HttpInst.postData(NetConfig.SOFT_LED_INFO, [ArrowType.FriendsArrow, false], (response) => {
            if (DataMgr.getGuideCompleteTimeById(ArrowType.FriendsArrow) <= 0) {
                this.arrow.active = true;
                if (this.recommendedList.childrenCount > 0) {
                    let node: cc.Node = this.recommendedList.children[0];
                    this.arrow.once(cc.Node.EventType.TOUCH_END,()=>{
                        node.getComponent(AddFriend).guanzhuBtn();
                        this.t1();
                    });
                    node.getChildByName("guanzhuButton").once(cc.Node.EventType.TOUCH_END, this.t1);
                    node.once(cc.Node.EventType.TOUCH_END, this.t1);
                }
            }
            // });
        }
    };

    t1 = () => {
        this.arrow.active = false;
        HttpInst.postData(NetConfig.SOFT_LED_INFO, [ArrowType.FriendsArrow], () => {
        });
    };

    recommendedBtn() {
        if (this.recommended.interactable) {
            this.recommended.interactable = false;
            setTimeout(() => {
                if (this.recommended) {
                    this.recommended.interactable = true;
                }
            }, 3000);
            DotInst.clientSendDot(COUNTERTYPE.friend, "10205");
            if (!this.node.active) {
                this.node.active = true;
                this.searchEditBox.string = "";
            }
            HttpInst.postData(NetConfig.RECOMMEND_FRIEND, [], (res: any) => {
                DataMgr.loadRecommended(res);
            });
        }
    }

    onDestroy() {
        this.dispose.dispose();
    }
}
