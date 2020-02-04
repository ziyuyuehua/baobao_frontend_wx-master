import { GameComponent } from "../../../core/component/GameComponent";
import { HttpInst } from "../../../core/http/HttpClient";
import { NetConfig } from "../../../global/const/NetConfig";
import { UIMgr } from "../../../global/manager/UIManager";
import { DataMgr } from "../../../Model/DataManager";
import { IRespData } from "../../../types/Response";
import { StringUtil } from "../../../Utils/StringUtil";
import { ButtonMgr } from "../../common/ButtonClick";
import {COUNTERTYPE, DotInst} from "../../common/dotClient";
import {TextTipConst} from "../../../global/const/TextTipConst";
import {JsonMgr} from "../../../global/manager/JsonManager";

const { ccclass, property } = cc._decorator;

@ccclass
export class ExpandPanel extends GameComponent {

    static url: string = "staff/list/ExpandPanel";

    @property(cc.Node)
    cancel: cc.Node = null;

    @property(cc.Node)
    confirm: cc.Node = null;

    @property(cc.Node)
    private blockPanel: cc.Node = null;

    getBaseUrl() {
        return ExpandPanel.url;
    }

    onLoad() {
        ButtonMgr.addClick(this.blockPanel, this.closeOnly);
        ButtonMgr.addClick(this.cancel, this.closeOnly);
        ButtonMgr.addClick(this.confirm, this.expandStaffNum);
    }

    onEnable() {
        this.onShowPlay(2, this.node.getChildByName("view"));
    }

    private expandStaffNum = () => {
        this.closeOnly();
        HttpInst.postData(NetConfig.extendCapacity, [], (response: IRespData) => {
            let cur = DataMgr.staffData.getCapacity();
            DotInst.clientSendDot(COUNTERTYPE.staff, "6016", cur.toString());
            let next = response.staffCapacity;
            let str = StringUtil.format(JsonMgr.getTips(TextTipConst.YUANGONGCHI), cur, next);
            UIMgr.showTipText(str);
            DataMgr.updateStaffCapacity(response);
        });

    };

}
