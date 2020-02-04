import {StaffRole} from "../list/StaffRole";
import {Staff} from "../../../Model/StaffData";
import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {CompositeDisposable} from "../../../Utils/event-kit";
import {ExchangeData} from "../../../Model/ExchangeData";
import {UIUtil} from "../../../Utils/UIUtil";
import {JsonMgr, StaffConfig} from "../../../global/manager/JsonManager";
import {COUNTERTYPE, DotInst, DotVo} from "../../common/dotClient";
import {ResMgr} from "../../../global/manager/ResManager";
import {DataMgr} from "../../../Model/DataManager";
import {StringUtil} from "../../../Utils/StringUtil";
import {Direction, Role, State} from "../../map/Role";

const {ccclass, property} = cc._decorator;

@ccclass
export class ExchangeStaffDetail extends cc.Component {
    @property(cc.Node)
    advantageIcon: cc.Node = null;
    @property([cc.Sprite])
    advantageIcons: Array<cc.Sprite> = [];
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Label)
    introLabel: cc.Label = null;

    @property(cc.Node)
    attrList: cc.Node = null;

    @property(cc.Label)
    intelligenceLabel: cc.Label = null;
    @property(cc.Label)
    powerLabel: cc.Label = null;
    @property(cc.Label)
    glamourLabel: cc.Label = null;
    @property(cc.Label)
    patienceLabel: cc.Label = null;

    @property(StaffRole)
    staffRole: StaffRole = null;
    @property(cc.Node)
    starIcons: cc.Node = null;
    @property(cc.Node)
    staffFrame: cc.Node = null;

    @property(cc.Sprite)
    itemIcon: cc.Sprite = null;
    @property(cc.Sprite)
    itemIconBg: cc.Sprite = null;
    @property(cc.Sprite)
    jobNameIcon: cc.Sprite = null;
    @property(cc.Node)
    jobBg: cc.Node = null;
    @property(cc.Node)
    guagou: cc.Node = null;
    @property(cc.Label)
    itemName: cc.Label = null;
    @property(cc.Label)
    itemIntro: cc.Label = null;

    private dispose: CompositeDisposable = new CompositeDisposable();

    private staffIndex: number = -1;
    job: string[] = ["收银员", "售货员", "揽客员", "理货员", "任意"];

    onLoad() {
        this.dispose.add(ClientEvents.STAFF_EXCHANGE_SELECTED.on(this.onExchangeStaffSelected));
    }

    onExchangeStaffSelected = () => {
        const exchangeData: ExchangeData = DataMgr.exchangeData;
        let index: number = exchangeData.getIndex();
        if (this.staffIndex == index) {
            return;
        }
        this.staffIndex = index;
        const staffConfig: StaffConfig = exchangeData.getStaffConfigByIndex(index);
        if (staffConfig) {
            this.init(staffConfig);
        }
    };

    private init(staffConfig: any) {
        let active: boolean = false;
        if (staffConfig.star) {
            active = true;
            this.initAdvantageIcons(staffConfig.advantage);
            UIUtil.setLabel(this.intelligenceLabel, this.calcLevelAttr(staffConfig.getIntelligence(), staffConfig, 0));
            UIUtil.setLabel(this.powerLabel, this.calcLevelAttr(staffConfig.getPower(), staffConfig, 1));
            UIUtil.setLabel(this.patienceLabel, this.calcLevelAttr(staffConfig.getPatience(), staffConfig, 3));
            DotInst.clientSendDot(COUNTERTYPE.recruit, "8013", staffConfig + "")
            UIUtil.setLabel(this.glamourLabel, this.calcLevelAttr(staffConfig.getGlamour(), staffConfig, 2));
            this.staffRole.initSpine(Staff.getStaffSpineUrl(staffConfig.artResId), Direction.LEFT, null, Role.IDEL_ACTION, Role.SMILE_SKIN, State.IDLE);
            let value0: number = staffConfig.initPost;
            UIUtil.asyncSetImage(this.jobNameIcon, Staff.getStaffSuggestJobImageUrl(value0));
            UIUtil.setLabel(this.introLabel, "初始属性：");
            UIUtil.setLabel(this.nameLabel, staffConfig.name);
        } else {
            active = false;
            let itemData = DataMgr.exchangeData.getExchangeStaffData(this.staffIndex);
            let name = staffConfig.name + "*" + itemData.itemNum;
            UIUtil.setLabel(this.itemName, name);
            ResMgr.getItemIcon(this.itemIcon, staffConfig.icon);
            ResMgr.getItemBox(this.itemIconBg, "k" + staffConfig.color, 1);
            UIUtil.setLabel(this.itemIntro, staffConfig.description ? staffConfig.description : "暂无简介");
        }
        this.jobBg.active = active;
        this.guagou.active = !active;
        this.itemIcon.node.active = !active;
        this.itemIconBg.node.active = !active;
        this.itemName.node.active = !active;
        this.itemIntro.node.active = !active;
        this.introLabel.node.active = active;
        this.nameLabel.node.active = active;
        this.attrList.active = active;
        this.staffRole.node.active = active;
        this.starIcons.active = active;
        this.staffFrame.active = active;
        this.advantageIcon.active = active;
        this.advantageIcons.forEach((value: cc.Sprite) => {
            value.node.active = active;
        })
    }

    private calcLevelAttr(grow: number, staffConfig: StaffConfig, attType: number) {
        const levelAttr = Staff.calcLevelAttr(grow, 1, staffConfig.star);
        let specialJson: Array<ISpecialJson> = JsonMgr.getSpecialTemplate(staffConfig.id);
        let num = 0;
        specialJson.forEach((v: ISpecialJson) => {
            if (v.isInitSpecial == 1) {
                let t = v.specialAdd.split(";");
                t.forEach((value: string) => {
                    let type = Number(value.split(",")[0]);
                    let t1 = Number(value.split(",")[1]);
                    if (type == attType) num += t1;
                });
            }
        });
        return Math.trunc(levelAttr) + Number(num);

    }

    private initAdvantageIcons(advantages: Array<number>) {
        this.advantageIcons.forEach((value: cc.Sprite, index, array) => {
            value.spriteFrame = null;
        });
        advantages.forEach((value, index, array) => {
            UIUtil.asyncSetImage(this.advantageIcons[index], Staff.getStaffAdvantageMaxIconUrl(value), false)
        });
        // Staff.initAdvantageIcon(advantages, this.advantageIcons);
    }

    onDestroy() {
        this.dispose.dispose();
    }

}
