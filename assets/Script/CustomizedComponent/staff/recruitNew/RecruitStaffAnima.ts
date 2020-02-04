/**
 * @Author whg
 * @Date 2019/5/8
 * @Desc
 */
import {TypePanel} from "./TypePanel";
import {UIUtil} from "../../../Utils/UIUtil";

const {ccclass, property} = cc._decorator;

@ccclass
export class RecruitStaffAnima extends cc.Component {

    @property(sp.Skeleton)
    private spine: sp.Skeleton = null;

    @property(TypePanel)
    private typePanel: TypePanel = null;

    @property(cc.Sprite)
    private mailboxImage: cc.Sprite = null;

    private index: number = 0;

    onLoad() {
        this.spine.setAnimation(0, "ling", false);
        this.spine.setCompleteListener((entry) => {
            let animationName = entry.animation ? entry.animation.name : "";
            if (animationName == "ling") {
                this.spine.setAnimation(0, "yi", false);
            } else if (animationName == "yi") {
                this.spine.setAnimation(0, "er", false);
            } else if (animationName == "er") {
                this.spine.setAnimation(0, "san", false);
            } else if (animationName == "san") {
                this.spine.setAnimation(0, "si", false);
            } else if (animationName == "si") {
                //this.spine.setAnimation(0, "beifen", false);
                this.node.destroy();
                this.typePanel.show();
                UIUtil.hide(this.mailboxImage);
            }/* else if (animationName == "beifen") {
                this.spine.setAnimation(0, "yuanshi", false);
            } else if (animationName == "yuanshi") {
                this.node.destroy();
                this.typePanel.show();
            }*/
        });
    }

}
