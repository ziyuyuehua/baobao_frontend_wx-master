/**
 *@Athuor ljx
 *@Date 15:04
 */
import {GameComponent} from "../../core/component/GameComponent";
import {ClientEvents} from "../../global/manager/ClientEventCenter";

const {ccclass, property} = cc._decorator;

@ccclass

export default class OpenNewMarketLoading extends GameComponent {

    static url = "Map/openANewMarket";

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
        this.loadCb && this.loadCb();
        this.spine.timeScale = .9;
        this.spine.setCompleteListener(null);
        this.spine.setAnimation(0, "animation2", true);
    };

    loadCompleteAction = () => {
        this.spine.setCompleteListener(this.secondEnd);
    };

    secondEnd = () => {
        this.spine.setAnimation(0, "animation3", false);
        this.spine.setCompleteListener(this.thirdEnd);
    };

    thirdEnd = () => {
        this.node.removeFromParent();
        this.closeOnly();
    };

    protected getBaseUrl(): string {
        return OpenNewMarketLoading.url;
    }
}