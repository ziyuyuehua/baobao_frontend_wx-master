/**
 * author: ljx
 */
import {JsonMgr} from "../../global/manager/JsonManager";
import {ResMgr} from "../../global/manager/ResManager";
import {CommonUtil} from "../../Utils/CommonUtil";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SaleGetItem extends cc.Component {

    @property(cc.Sprite)
    private bg: cc.Sprite = null;
    @property(cc.Sprite)
    private icon: cc.Sprite = null;
    @property(cc.Label)
    private count: cc.Label = null;

    init(resolveData: string) {
        let data = resolveData.split(",");
        let xmlId = parseInt(data[0]);
        let count = data[1];
        let xmlData = JsonMgr.getInformationAndItem(xmlId);
        ResMgr.getItemBox2(this.bg, "k" + xmlData.color);
        ResMgr.imgTypeJudgment(this.icon, xmlData.id);
        this.count.string = CommonUtil.numChange(parseInt(count));
    }
}
