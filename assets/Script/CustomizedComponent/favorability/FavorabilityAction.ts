import {GameComponent} from "../../core/component/GameComponent";
import {StaffRole} from "../staff/list/StaffRole";
import {ButtonMgr} from "../common/ButtonClick";
import {Staff} from "../../Model/StaffData";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {FavorAniType} from "./FavorHelp";
import CommonGiftItem from "../common/CommonGiftItem";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FavorabilityAction extends GameComponent {

    static url: string = "favorability/FavorabilityAction";

    @property(sp.Skeleton)
    staffSkelet: sp.Skeleton = null;

    @property(StaffRole)
    staffRole: StaffRole = null;

    @property(cc.Node)
    closeNode: cc.Node = null;

    @property([cc.Node])
    lvAttNodeArr: cc.Node[] = [];

    @property(cc.Node)
    unLockOther: cc.Node = null;

    @property(cc.Layout)
    itemLayOut: cc.Layout = null;

    @property(cc.Prefab)
    ItemPrefab: cc.Prefab = null;

    private otherAniIndex: number = 0;

    getBaseUrl() {
        return FavorabilityAction.url
    }

    onLoad() {
        ButtonMgr.addClick(this.closeNode, () => {
            this.closeOnly();
        });
        this.staffSkelet.setCompleteListener(() => {
            this.staffSkelet.setAnimation(0, "animation2", true);
            this.setOtherScale();
        })
    }

    start() {
        for (let nid = 0; nid < this.lvAttNodeArr.length; nid++) {
            let node = this.lvAttNodeArr[nid];
            node.opacity = 0;
        }
        let staff: Staff = this.node['data'].data;
        this.staffRole.init(staff);
        this.unLockOther.active = false;
        this.staffSkelet.setAnimation(0, "animation", false);
    }

    setOtherScale() {
        let animationNode = this.lvAttNodeArr[this.otherAniIndex];
        if (!animationNode) {
            this.otherAniIndex = 0;
            return;
        }
        let action1 = cc.sequence(cc.fadeTo(0.1, 255), cc.callFunc(() => {
            this.otherAniIndex++
            this.setOtherScale();
        }));
        animationNode.runAction(action1);
    }
}
