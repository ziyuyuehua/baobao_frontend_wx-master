/**
 * author: ljx
 */
import {ResMgr} from "../../global/manager/ResManager";
import {JsonMgr} from "../../global/manager/JsonManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ResolveItem extends cc.Component {

    @property(cc.Sprite)
    private bg: cc.Sprite = null;
    @property(cc.Sprite)
    private icon: cc.Sprite = null;
    @property(cc.Node)
    private downNode: cc.Node = null;

    init(data: any, cb: Function) {
        let xmlData = JsonMgr.getInformationAndItem(data.id);
        ResMgr.getItemBox2(this.bg, "b" + xmlData.color);
        ResMgr.imgTypeJudgment(this.icon, xmlData.id, .8);
        cb && cb(data, this.downNode);
    }
}
