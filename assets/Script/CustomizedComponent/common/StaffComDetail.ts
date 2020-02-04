import { GameComponent } from "../../core/component/GameComponent";
import { ClientEvents } from "../../global/manager/ClientEventCenter";
import { JsonMgr } from "../../global/manager/JsonManager";
import { DataMgr } from "../../Model/DataManager";
import { Staff } from "../../Model/StaffData";
import { HashSet } from "../../Utils/dataStructures/HashSet";
import { UIUtil } from "../../Utils/UIUtil";
import { Direction } from "../map/Role";
import { NumberItem, numType } from "../staff/list/NumberItem";
import { StaffRole } from "../staff/list/StaffRole";
import AttributeItem from "./AttributeItem";
import { ButtonMgr } from "./ButtonClick";
import staffComAdvItem from "./staffComAdvItem";
import { IAdvantage } from "../../types/Response";
import {COUNTERTYPE, DotInst} from "./dotClient";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StaffComDetail extends GameComponent {

    @property(cc.Label)
    StaffName: cc.Label = null;

    @property(cc.Node)
    StaffNode: cc.Node = null;

    @property(cc.ProgressBar)
    StaffLvPro: cc.ProgressBar = null;

    @property(cc.Label)
    StaffLvLabel: cc.Label = null;

    @property(cc.Node)
    StaffAdvan: cc.Node = null;

    @property([cc.Sprite])
    StarArray: cc.Sprite[] = [];

    @property(cc.Node)
    staffRole: cc.Node = null;

    @property(cc.Sprite)
    RecommendLab: cc.Sprite = null;

    @property(cc.Node)
    StaffAttNode: cc.Node = null;

    @property(cc.Sprite)
    AdvantageTitle: cc.Sprite = null;

    @property([cc.Sprite])
    advantageIcons: Array<cc.Sprite> = [];

    @property(cc.Prefab)
    attributeItem: cc.Prefab = null;

    @property(cc.Layout)
    advanLayout: cc.Layout = null;

    @property(cc.Node)
    advanTitle: cc.Node = null;

    @property(cc.Prefab)
    advanPrefab: cc.Prefab = null;

    @property(cc.Node)
    advantipBg: cc.Node = null;


    @property(cc.Node)
    private backBtn: cc.Node = null;

    private staffID: number = 0;

    static url = "common/staffComDetail";

    getBaseUrl() {
        return StaffComDetail.url;
    }

    onLoad() {
        ButtonMgr.addClick(this.backBtn, () => {
            DotInst.clientSendDot(COUNTERTYPE.staff, "6024");
            this.closeOnly();
        });
        ButtonMgr.addClick(this.advantipBg, this.hideAdvanBg);
        this.addEvent(ClientEvents.STAFF_UPDATE_STAFF.on(this.onUpdateStaff));
    }

    showAdvanBg = () => {
        this.advantipBg.active = true;

    };

    hideAdvanBg = () => {
        this.advantipBg.active = false;
        ClientEvents.CLOSE_ADVAN_ITEM.emit();
    };

    onUpdateStaff = (staffIds: HashSet<number>) => {
        if (!staffIds.has(this.staffID)) {
            return;
        }
        let staff: Staff = DataMgr.getStaff(this.staffID);
        this.updateStaff(staff);
    };

    initView(staffId: number) {
        this.staffID = staffId;
        let staff: Staff = DataMgr.getStaff(staffId);
        //动画
        let staffRole: StaffRole = this.staffRole.getComponent(StaffRole);
        staffRole.init(staff, Direction.LEFT, false);
        //星星
        for (let i = 1; i <= this.StarArray.length; i++) {
            if (i <= staff.star) {
                this.StarArray[i - 1].node.active = true;
            } else {
                this.StarArray[i - 1].node.active = false;
            }
        }
        //名字
        this.StaffName.string = staff.getName();

        //擅长
        this.advanLayout.node.removeAllChildren();
        this.advanTitle.active = staff.advantages.length != 0
        for (let index = 0; index < staff.advantages.length; index++) {
            let advantageVo: IAdvantage = staff.advantages[index];
            let advanId = advantageVo.type;
            let lock = advantageVo.unlock;
            let advanLimit = staff.getAvantagesLimit()[index];
            let node = cc.instantiate(this.advanPrefab);
            let staffAdv: staffComAdvItem = node.getComponent(staffComAdvItem);
            staffAdv.updateItem(advanId, advanLimit, lock, this);
            this.advanLayout.node.addChild(node);
        }

        //推荐
        // this.RecommendLab.spriteFrame = staff.getSuggestJobImage();
        UIUtil.asyncSetImage(this.RecommendLab, staff.getSuggestJobImageUrl(), false);
        this.updateStaff(staff);
    }


    private updateStaff(staff: Staff) {
        //lv

        this.StaffNode.getComponent(NumberItem).setNum(staff.level, numType.Lv_Type);

        UIUtil.setProgressBar(this.StaffLvPro, staff.getExpProgress());
        // this.StaffLvPro.progress = staff.exp / staff.getLevelUpExp();
        UIUtil.setLabel(this.StaffLvLabel, staff.getExpLabelStr());
        // this.StaffLvLabel.string = staff.exp + "/" + staff.getLevelUpExp();

        //设置属性
        this.StaffAttNode.removeAllChildren();
        let attributeTem = JsonMgr.getAttribute();
        const width: number = this.attributeItem.data.width;
        const height: number = this.attributeItem.data.height;
        for (let nid in attributeTem) {
            const nidNum = parseInt(nid);
            const index = Staff.ATTR_INDEX[nidNum];
            let node = cc.instantiate(this.attributeItem);
            let pos_x: number = (nidNum % 2) * (width + 30);
            let pos_y: number = -(Math.floor(nidNum / 2)) * (height + 20);
            node.setPosition(pos_x, pos_y);
            let attItem: AttributeItem = node.getComponent(AttributeItem);
            attItem.loadView(staff, attributeTem[index + ""], nidNum);
            this.StaffAttNode.addChild(node);
        }
    }

}
