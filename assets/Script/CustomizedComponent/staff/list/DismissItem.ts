import { UIUtil } from "../../../Utils/UIUtil";
import { Staff } from "../../../Model/StaffData";

const { ccclass, property } = cc._decorator;

@ccclass
export class DismissItem extends cc.Component {

    @property([cc.Sprite])
    starIcons: Array<cc.Sprite> = [];

    @property(cc.Sprite)
    staffBg: cc.Sprite = null;

    @property(cc.Sprite)
    staffIcon: cc.Sprite = null;
    
    @property(cc.Sprite)
    uniqueBg:cc.Sprite = null;

    init(staff: Staff) {
        this.initStarIcons(staff);
        UIUtil.asyncSetImage(this.staffBg, staff.getStarBorderUrl(), false);
        UIUtil.asyncSetImage(this.staffIcon, staff.getAvatarUrl(), false);
        // UIUtil.visible(this.uniqueBg, staff.isUnique());
    }

    private initStarIcons(staff: Staff) {
        Staff.initStarIcon(staff.star, this.starIcons);
    }

}
