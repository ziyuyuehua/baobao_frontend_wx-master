import { GameComponent } from "../../core/component/GameComponent";
import { JsonMgr } from "../../global/manager/JsonManager";
import List from "../../Utils/GridScrollUtil/List";
import { ButtonMgr } from "../common/ButtonClick";
import FavorabilityDetailItem from "./FavorabilityDetailItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FavorabilityDetail extends GameComponent {
    static url: string = "favorability/FavorabilityDetail";

    @property(List)
    private scrollNode: List = null;

    @property(cc.Node)
    private bg: cc.Node = null;

    private favorAllData: IFavorLevelJson[] = [];

    getBaseUrl() {
        return FavorabilityDetail.url;
    }

    start() {
        this.favorAllData = JsonMgr.getAllFavorLvJson();
        this.scrollNode.numItems = this.favorAllData.length;
        ButtonMgr.addClick(this.bg, this.closeOnly);
    }

    onListVRender(item: cc.Node, idx: number) {
        let popularityItem: FavorabilityDetailItem = item.getComponent(FavorabilityDetailItem);
        popularityItem.updateItem(this.favorAllData[idx]);
    }

    // update (dt) {}
}
