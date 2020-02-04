import { JsonMgr } from "../../global/manager/JsonManager";
import { ResMgr } from "../../global/manager/ResManager";
import { DataMgr } from "../../Model/DataManager";
import { UIMgr } from "../../global/manager/UIManager";
import { greenColor4, redColor4, brownColor, redColor2, redColor5 } from "../../global/const/StringConst";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ShopIconItem extends cc.Component {
    static url: string = "active/ShopIconItem"
    @property(cc.Sprite)
    private icon: cc.Sprite = null;
    @property(cc.Sprite)
    private iconbg: cc.Sprite = null;
    @property(cc.Label)
    private NumLab: cc.Label = null;

    start() {

    }

    mess = (itemId: number, itemNum: number, activeId: number) => {
        let itempic = JsonMgr.getItem(itemId)
        ResMgr.getItemBox(this.iconbg, "k" + itempic.color, 0.45)
        ResMgr.imgTypeJudgment(this.icon, itempic.id)
        this.NumLab.string = itemNum + ""
        UIMgr.addDetailedEvent(this.iconbg.node, itemId)
        let ownPorp = DataMgr.activeShopData.getItemsNum(itemId)
        let Times = DataMgr.activeShopData.getresidualNum(activeId)
        if (Times == 0){
            this.NumLab.node.getComponent(cc.LabelOutline).color = brownColor;
        }else{
            if (ownPorp >= itemNum) {
                this.NumLab.node.getComponent(cc.LabelOutline).color = greenColor4;
            } else if (ownPorp < itemNum) {
                this.NumLab.node.getComponent(cc.LabelOutline).color = redColor5;
            }
        }
    }
    // update (dt) {}
}
