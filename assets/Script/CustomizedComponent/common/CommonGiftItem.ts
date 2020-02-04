import {JsonMgr} from "../../global/manager/JsonManager";
import {UIMgr} from "../../global/manager/UIManager";
import {ResMgr} from "../../global/manager/ResManager";
import {CommonUtil} from "../../Utils/CommonUtil";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonGiftItem extends cc.Component {

    @property(cc.Sprite)
    itemBgIcon: cc.Sprite = null;

    @property(cc.Sprite)
    itemIcon: cc.Sprite = null;

    @property(cc.Label)
    itemCount: cc.Label = null;

    @property(cc.Prefab)
    tip: cc.Prefab = null;

    private tipsView = null;
    private itemId: number = 0;
    private Count: number = 0;
    private curPos = null;

    start() {
        UIMgr.addDetailedEvent(this.node, this.itemId, this.Count);
    }

    loadItem(itemId: number, itemCount: number) {
        if (itemId >= 1001 && itemId <= 1138 && itemCount < 0) {
            this.itemId = 510003;
        } else {
            this.itemId = itemId;
        }
        this.Count = itemCount;
        if (itemCount >= 0) {     //item道具
            let itemVo = JsonMgr.getInformationAndItem(itemId);
            ResMgr.imgTypeJudgment(this.itemIcon, itemId);
            ResMgr.getItemBox(this.itemBgIcon, "k" + itemVo.color, 1);
            this.itemCount.node.active = true;
            this.itemCount.string = CommonUtil.numChange(itemCount) + "";
            if (itemId == 150001 || itemId == 150002) {
                this.itemCount.node.active = false;
            }
        } else {          //台词，好友框，换一换
            if (this.itemId >= 510001 && this.itemId <= 510007) {
                let itemjson = JsonMgr.getItemMod(this.itemId);
                ResMgr.getItemIcon(this.itemIcon, itemjson.icon, 1);
                ResMgr.getItemBox(this.itemBgIcon, "k" + itemjson.color, 1);
                this.itemCount.node.active = false;
            } else {
                let dialogJson = JsonMgr.getDialogueJson(itemId);
                ResMgr.getLineIcon(this.itemIcon, dialogJson.icon);
                this.itemCount.node.active = false;
            }

        }

    }

    onDestroy() {
        this.node.destroy();
    }

}
