import { Staff } from "../../../Model/StaffData";
import { sleep } from "./DiamondRecruitAni";
import { RecruitResult } from "../../../Model/RecruitData";
import { JsonMgr } from "../../../global/manager/JsonManager";
import { ResManager } from "../../../global/manager/ResManager";

const { ccclass, property } = cc._decorator;

@ccclass
export class UniqueAni extends cc.Component {
    @property(cc.Node)
    bglight: cc.Node = null;
    @property(cc.Node)
    itemBg: cc.Node = null;
    @property(cc.Node)
    ball: cc.Node = null;
    @property(cc.Node)
    staff: cc.Node = null;
    @property(cc.Node)
    staffAni: cc.Node = null;
    @property(cc.Node)
    shelf: cc.Node = null;
    @property(cc.Node)
    shelfIcon: cc.Node = null;
    @property(cc.Node)
    effect: cc.Node = null;

    @property(cc.Node)
    attrZL: cc.Node = null;
    @property(cc.Node)
    attrTL: cc.Node = null;
    @property(cc.Node)
    attrQH: cc.Node = null;
    @property(cc.Node)
    attrLQ: cc.Node = null;
    @property(cc.Node)
    attrRQ: cc.Node = null;
    
    @property(cc.Label)
    nameLabel: cc.Label = null;
    
    @property(cc.Node)
    closeBtn: cc.Node = null;

    spine: sp.Skeleton;

    spineRes: sp.SkeletonData;
    
    resolve: (skip: boolean) => void;
    
    readonly timeOutSeconds = 60;
    endTime: number;

    initAndPlay(result: RecruitResult) {
        // cc.find("Canvas").addChild(this.node);
        if (result.staff) {
            let spineUrl = Staff.getStaffSpineUrl(result.staff.artResId);
            cc.loader.loadRes(spineUrl, sp.SkeletonData, null, this.onSpineLoadComplete);
            this.ball.children[1].active = true;
        } else {
            this.ball.children[0].active = true;
        }

        { // ball action
            let action1 = cc.jumpTo(0.4, cc.v2(0, 40), 90, 1);
            let action2 = cc.scaleTo(0.4, 1, 1);
            this.ball.runAction(cc.spawn(action1, action2));
        }
        return sleep(0.3).then(() => {
            { // bg action
                this.bglight.active = true;
                this.bglight.runAction(cc.sequence(cc.scaleTo(0.3, 4), cc.callFunc(() => {
                    this.bglight.runAction(cc.repeatForever(cc.rotateBy(0.5, 10)));
                })));
            }
            return sleep(0.2);
        }).then(() => {
            this.effect.active = true;
        }).then(() => {
            return sleep(0.2);
        }).then(() => {
            this.itemBg.active = true;
            if (result.staff) {
                this.staff.active = true;
                this.attrZL.getComponent(cc.Label).string = result.staff.intelligence + "";
                this.attrTL.getComponent(cc.Label).string = result.staff.power + "";
                this.attrQH.getComponent(cc.Label).string = result.staff.patience + "";
                this.attrLQ.getComponent(cc.Label).string = result.staff.glamour + "";
                this.nameLabel.string = result.staff.getName();
            } else {
                this.shelf.active = true;
                let decoShopJson: IDecoShopJson = JsonMgr.getDecoShopJson(result.itemXmlId);
                this.attrRQ.getComponent(cc.Label).string = "+" + decoShopJson.Popularity;
                ResManager.getShelvesItemIcon(this.shelfIcon.getComponent(cc.Sprite), decoShopJson.icon, decoShopJson.mainType);
                this.nameLabel.string = decoShopJson.name;
            }
            if (this.spineRes) {
                this.spine.skeletonData = this.spineRes;
                this.spine.setSkin("weixiao");
                this.spine.setAnimation(0, "zhanli", true);
            }
            this.ball.active = false;
            let anim: cc.Animation = this.effect.getComponent(cc.Animation);
            anim.play(undefined, 0);
            anim.on("stop", () => this.effect.active = false);
        }).then<boolean>(() => {
            this.closeBtn.active = true;
            // this.closeBtn.scale = 0.1;
            // this.closeBtn.runAction(cc.scaleTo(0.2, 1));
            return new Promise((resolve) => {
                this.resolve = resolve;
                this.endTime = (new Date()).getTime() / 1000;
                // setTimeout(this.close.bind(this), 3000);
            });
        }).catch((e) => {
            console.error(e);
            this.node.removeFromParent(true);
        });
    }
    
    close () {
        this.node.removeFromParent(true);
        let time = (new Date()).getTime() / 1000;
        if (this.resolve) this.resolve((time - this.endTime) > this.timeOutSeconds);
    }

    onSpineLoadComplete = (err, res) => {
        if (err) {
            cc.error(err);
            return;
        }
        this.spine = this.staffAni.getComponent('sp.Skeleton');
        if (this.staff.active) {
            this.spine.skeletonData = res;
            this.spine.setSkin("weixiao");
            this.spine.setAnimation(0, "zhanli", true);
        } else {
            this.spineRes = res;
        }
    }
}
