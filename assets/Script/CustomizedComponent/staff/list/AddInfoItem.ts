import PeopleGoodAtItem from "./PeopleGoodAtItem";
import {JsonMgr} from "../../../global/manager/JsonManager";
import {DataMgr} from "../../../Model/DataManager";
import {ResMgr} from "../../../global/manager/ResManager";
import {Staff, StaffAdvantage} from "../../../Model/StaffData";
import {UIUtil} from "../../../Utils/UIUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AddInfoItem extends cc.Component {

    @property(cc.Label)
    goodAtLab: cc.Label = null;
    @property(cc.Label)
    speedAddLab: cc.Label = null;

    @property(cc.Sprite)
    goodTypeIcon: cc.Sprite = null;

    @property(cc.Label)
    nextLabel: cc.Label = null;

    @property(cc.ScrollView)
    peopleScrollView: cc.ScrollView = null;

    @property(cc.Prefab)
    ScrollItem: cc.Prefab = null;

    loadView(staffAdv: StaffAdvantage, staffIds: number[]) {
        let staffIdNum: number = staffIds ? staffIds.length : 0;
        let hasStaff: boolean = staffIdNum > 0;

        let xmlSkillBonus: ISkillBonusJson = hasStaff ? JsonMgr.getSkillBonusByNum(staffIdNum) : null;
        if(hasStaff){
            UIUtil.setLabel(this.speedAddLab, "+"+(xmlSkillBonus.speedAdd * 100)+"%")
        }
        UIUtil.visible(this.speedAddLab, hasStaff);

        let nextSkillBonus: ISkillBonusJson = JsonMgr.getSkillBonus(hasStaff ? xmlSkillBonus.id + 1 : 1);
        this.nextLabel.string = nextSkillBonus
            ? "距离下一次加成等级（" + staffIdNum + "/" + nextSkillBonus.needStaff + "）"
            : "加成已经达到最高等级";

        let widths: number = 0;
        for (let nid = 1; nid <= staffIdNum; nid++) {
            let item: PeopleGoodAtItem = cc.instantiate(this.ScrollItem).getComponent(PeopleGoodAtItem);
            item.node.setPosition(item.node.getContentSize().width * (nid - 1)*0.46, 0);
            item.loadItem(staffIds[nid - 1]);
            widths += item.node.getContentSize().width;
            this.peopleScrollView.content.addChild(item.node);
        }
        this.peopleScrollView.content.setContentSize(widths, this.peopleScrollView.content.height);

        UIUtil.setLabel(this.goodAtLab, Staff.getStaffAdvStr(staffAdv)+"售卖");
        ResMgr.setStaffGoodAtIcon(this.goodTypeIcon, "goodType" + staffAdv);
    }

}
