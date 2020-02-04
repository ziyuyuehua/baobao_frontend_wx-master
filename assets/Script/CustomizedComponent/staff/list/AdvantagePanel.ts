import { GameComponent } from "../../../core/component/GameComponent";
import { DataMgr } from "../../../Model/DataManager";
import { StaffAdvantage } from "../../../Model/StaffData";
import { ButtonMgr } from "../../common/ButtonClick";
import AddInfoItem from "./AddInfoItem";
import { UIMgr } from "../../../global/manager/UIManager";
import { TextTipConst } from "../../../global/const/TextTipConst";

const { ccclass, property } = cc._decorator;

@ccclass
export class AdvantagePanel extends GameComponent {
    static url: string = "staff/list/advantagePanel";
    @property(cc.Node)
    private blockPanel: cc.Node = null;

    @property(cc.Node)
    trainLayout: cc.Node = null;

    @property(cc.Prefab)
    AddInfoItemView: cc.Prefab = null;

    @property(cc.Node)
    closeBtn: cc.Node = null;

    @property(cc.Node)
    topNode: cc.Node = null;

    @property(cc.Node)
    midNode: cc.Node = null;

    @property(cc.Node)
    bomNode: cc.Node = null;

    @property(cc.Node)
    bgNode: cc.Node = null;

    @property(cc.Node)
    setPosition: cc.Node = null;

    @property(cc.Node)
    tipNode: cc.Node = null;


    getBaseUrl() {
        return AdvantagePanel.url;
    }

    start() {
        this.loadView();
    }

    onLoad() {
        ButtonMgr.addClick(this.blockPanel, this.closeOnly);
        ButtonMgr.addClick(this.closeBtn, this.closeOnly);
        ButtonMgr.addClick(this.tipNode, this.openTipNode)
        // this.advantageList.on(cc.Node.EventType.TOUCH_END, this.showDetail);
    }

    openTipNode = () => {
        UIMgr.showTextTip(TextTipConst.PostADDTip);
    }

    onEnable() {
        this.onShowPlay(2, this.node.getChildByName("view"));
        // this.blockPanel.on(cc.Node.EventType.TOUCH_END, this.hideDetail);
    }

    onDisable() {
        // this.blockPanel.off(cc.Node.EventType.TOUCH_END, this.hideDetail);
    }

    loadView() {
        this.trainLayout.removeAllChildren();

        let addItem: number = 0;
        let staffAdvMap: Map<StaffAdvantage, number[]> = DataMgr.staffData.refreshStaffAdvMap();
        for (let staffAdv = StaffAdvantage.poster; staffAdv <= StaffAdvantage.cd; staffAdv++) {
            let staffIds: number[] = staffAdvMap.get(staffAdv);
            let staffIdNum: number = staffIds ? staffIds.length : 0;
            if (staffIdNum <= 0) {
                continue;
            }
            addItem++;
            let item: AddInfoItem = cc.instantiate(this.AddInfoItemView).getComponent(AddInfoItem);
            item.loadView(staffAdv, staffIds);
            this.trainLayout.addChild(item.node);
        }

        this.midNode.height = addItem * 158 + (addItem - 1) * 10;
        this.bgNode.height = this.topNode.height + this.midNode.height + this.bomNode.height;
        this.bomNode.y = -(this.midNode.height + this.topNode.height);
        this.trainLayout.y = 0;

        this.setPosition.height = this.midNode.height + this.topNode.height + this.bomNode.height
        this.setPosition.y = this.setPosition.height / 2;
    }

}
