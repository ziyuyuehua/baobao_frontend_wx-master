/**
 * author: ljx
 */
import ListItem from "../../Utils/GridScrollUtil/ListItem";
import {ResMgr} from "../../global/manager/ResManager";
import {CommonUtil} from "../../Utils/CommonUtil";
import {ButtonMgr} from "../common/ButtonClick";
import {UIMgr} from "../../global/manager/UIManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ResolveGetNode extends ListItem {

    @property(cc.Sprite)
    private bg: cc.Sprite = null;
    @property(cc.Label)
    private count: cc.Label = null;

    private data = null;

    init(data: any, count: number) {
        this.data = data;
        ResMgr.getItemBox2(this.bg, "k" + data.color);
        ResMgr.imgTypeJudgment(this.icon, data.id, 1.1);
        this.count.string = CommonUtil.numChange(count);
    }

    protected start(): void {
        UIMgr.addDetailedEvent(this.node, this.data.id);
    }

}
