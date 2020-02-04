import { ResManager } from "../../global/manager/ResManager";
import { DataMgr } from "../../Model/DataManager";
import { IPopularityArr } from "../../types/Response";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopularityItem extends cc.Component {
    @property(cc.Sprite)
    itemIcon: cc.Sprite = null;

    @property(cc.Label)
    itemNum: cc.Label = null;

    @property(cc.Label)
    enoughMark: cc.Label = null;

    private ItemId: number = 0;

    reuse(nindx: number) {
        let popularityVo: IPopularityArr = DataMgr.iMarket.getPopularityArr()[nindx];
        let shelveJson: IDecoShopJson = popularityVo.sheleveDecoJson;
        ResManager.getShelvesItemIcon(this.itemIcon, shelveJson.icon, shelveJson.mainType);
        this.itemNum.string = popularityVo.sheleveNum + "";
        this.enoughMark.string = "+" + shelveJson.Popularity * popularityVo.sheleveNum
    }


    // update (dt) {}
}
