import {GameComponent} from "../../core/component/GameComponent";
import {JsonMgr} from "../../global/manager/JsonManager";
import {ResMgr} from "../../global/manager/ResManager";
import {ButtonMgr} from "../common/ButtonClick";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {UIMgr} from "../../global/manager/UIManager";
import treasureChest from "./treasureChest";
import {DataMgr} from "../../Model/DataManager";

const {ccclass, property} = cc._decorator;
@ccclass
export default class getTreasure extends GameComponent {
    static url: string = "treasureChest/getTreasure";
    @property(cc.Label)
    namelabel: cc.Label = null;
    @property(cc.Label)
    numlabel: cc.Label = null;
    @property(cc.Sprite)
    quaImg: cc.Sprite = null;
    @property(cc.Sprite)
    boxIcon: cc.Sprite = null;
    @property(cc.Node)
    closeBtn: cc.Node = null;
    @property(cc.Node)
    openBtn: cc.Node = null;

    data = null;
    onLoad() {
        this.data = this.node["data"];
        ButtonMgr.addClick(this.closeBtn, () => {
            this.closeOnly();
        })
        ButtonMgr.addClick(this.openBtn, () => {
            HttpInst.postData(NetConfig.OPEN_BOX, [this.data.xmlId, this.data.num], (Response) => {
                ClientEvents.UPDATE_ITEM_HOUSE.emit();
                this.closeOnly();
                UIMgr.showView(treasureChest.url, null, {boxId: this.data.xmlId, awards: Response.treasureBoxRewards});
                DataMgr.setOpenBoxNum(this.data.num);
                DataMgr.setNowBoxIndex(1);
                DataMgr.setOpenBoxAward(Response.treasureBoxRewards);
            });
        })
    }

    onEnable() {
        this.onShowPlay(2, this.node);
    }

    start() {
        let BoxJson = JsonMgr.getItem(this.data.xmlId);
        this.namelabel.string = BoxJson.name;
        this.numlabel.string = this.data.num + "";
        ResMgr.getTreasureIcon(this.boxIcon, BoxJson.icon, 0.8);
        ResMgr.getItemBox(this.quaImg, "c" + BoxJson.color, 0.8);
    }

    getBaseUrl() {
        return getTreasure.url;
    }
}
