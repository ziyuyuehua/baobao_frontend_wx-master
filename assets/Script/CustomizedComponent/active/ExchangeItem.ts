import { ResMgr } from "../../global/manager/ResManager";
import { JsonMgr } from "../../global/manager/JsonManager";
import { UIMgr } from "../../global/manager/UIManager";
import { GameComponent } from "../../core/component/GameComponent";
import { ClientEvents } from "../../global/manager/ClientEventCenter";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ExchangeItem extends GameComponent {
    static url: string = "active/ExchangeItem";
    @property(cc.Sprite)
    private icon: cc.Sprite = null;
    @property(cc.Sprite)
    private iconbg: cc.Sprite = null;
    @property([cc.Label])
    private NumLab: cc.Label[] = [];

    private itemnum: number = 0;

    getBaseUrl() {
        return ExchangeItem.url;
    }

    start() {
        this.addEvent(ClientEvents.ACTIVESHOP_REFRESHNUM.on(this.exchange));
    }

    updateShop = (itemId: number, itemNum: number, ) => {
        let itempic = JsonMgr.getItem(itemId);
        ResMgr.getItemBox(this.iconbg, "k" + itempic.color, 0.54);
        ResMgr.imgTypeJudgment(this.icon, itempic.id);
        this.NumLab[1].string = "/" + itemNum;
        this.itemnum = itemNum;
        UIMgr.addDetailedEvent(this.iconbg.node, itemId);
        this.exchange(0);
    };

    private exchange = (exCount: number) => {
        this.NumLab[0].string = exCount * this.itemnum + "";
    }

}
