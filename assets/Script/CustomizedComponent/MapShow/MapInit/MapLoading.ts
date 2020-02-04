/**
 *@Athuor ljx
 *@Date 15:04
 */
import {GameComponent} from "../../../core/component/GameComponent";
import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {UIMgr} from "../../../global/manager/UIManager";
import CommunityActive from "../../communityActivity/CommunityActive";
import CommunityRank from "../../communityActivity/CommunityRank";
import {DataMgr} from "../../../Model/DataManager";
import {JobUpView} from "../../staff/list/JobUpView";

const {ccclass, property} = cc._decorator;

@ccclass

export default class MapLoading extends GameComponent {

    static url = "Map/changeMarketLoading";

    @property(cc.Node)
    private aniCloud: cc.Node = null;
    @property(sp.Skeleton)
    private spine: sp.Skeleton = null;

    private loadCb: Function = null;

    _addListener() {
        this.dispose.add(ClientEvents.SHOW_NEW_MARKET.on(this.loadCompleteAction));
    }

    init(cb: Function) {
        this.loadCb = cb;
        this.spine.timeScale = .7;
        this.spine.setAnimation(0, "animation", false);
        this.spine.setCompleteListener(this.firstEnd);
        this._addListener();
    }

    firstEnd = () => {
        this.spine.setAnimation(0, "animation2", true);
        this.spine.timeScale = 1.2;
        this.spine.setCompleteListener(null);
        this.loadCb && this.loadCb();
    };

    loadCompleteAction = () => {
        this.spine.setCompleteListener(this.secondEnd);
    };

    secondEnd = () => {
        this.spine.setAnimation(0, "animation3", false);
        this.spine.timeScale = .9;
        this.spine.setCompleteListener(this.thirdEnd);
    };

    thirdEnd = () => {
        this.node.removeFromParent();
        this.closeOnly();
        if (UIMgr.getHideCommunity() && !DataMgr.isInFriendHome()) {
            UIMgr.showView(CommunityActive.url, null, null, () => {
                UIMgr.showView(CommunityRank.url);
            });
            UIMgr.setHideCommunity(false);
        }
    };

    protected getBaseUrl(): string {
        return MapLoading.url;
    }
}