import { GameComponent } from "../../core/component/GameComponent";
import { ResManager } from "../../global/manager/ResManager";
import { ButtonMgr } from "../common/ButtonClick";

const { ccclass, property } = cc._decorator;

export interface PopulUpSucInter {
    beforPop: number,
    curPop: number,
    beforeSaleValue: number,
    afterSaleValue: number,
}

@ccclass
export default class PopularityUpSuc extends GameComponent {
    static url: string = "popularity/PopularityUpSuc";

    @property(cc.Node)
    closeNode: cc.Node = null;

    @property(cc.Label)
    beforPopularity: cc.Label = null;

    @property(cc.Label)
    curPopularity: cc.Label = null;

    @property(sp.Skeleton)
    staffSkelet: sp.Skeleton = null;

    @property([cc.Node])
    lvAttNodeArr: cc.Node[] = [];

    @property(cc.Label)
    private saleValueBefore: cc.Label = null;

    @property(cc.Label)
    private saleValueAfter: cc.Label = null;

    private otherAniIndex: number = 0;
    getBaseUrl() {
        return PopularityUpSuc.url
    }

    onLoad() {
        this.staffSkelet.setCompleteListener(() => {
            this.setOtherScale();
            this.staffSkelet.setAnimation(0, "animation2", true);
        })
        ButtonMgr.addClick(this.closeNode, this.closeOnly);
    }

    start() {
        let populData: PopulUpSucInter = this.node['data'];
        this.beforPopularity.string = populData.beforPop + "";
        this.curPopularity.string = populData.curPop + "";

        if(populData.beforeSaleValue < populData.afterSaleValue) {
            this.saleValueBefore.string = populData.beforeSaleValue.toString();
            this.saleValueAfter.string = populData.afterSaleValue.toString();
        } else {
            this.lvAttNodeArr[2].active = false;
            this.lvAttNodeArr.splice(2, 1);
        }
        for (let nid = 0; nid < this.lvAttNodeArr.length; nid++) {
            let node = this.lvAttNodeArr[nid];
            node.opacity = 0;
        }
        cc.loader.loadRes(ResManager.POPULARIRT_UP, sp.SkeletonData, () => {
        }, this.setLeftPawSpine);

    }

    setLeftPawSpine = (err: Error, res: sp.SkeletonData) => {
        if(err){
            cc.error(err);
            return;
        }
        if(!this.staffSkelet) return;
        this.staffSkelet.skeletonData = res;
        this.staffSkelet.setAnimation(0, "animation", false);
    }

    setOtherScale() {
        let animationNode = this.lvAttNodeArr[this.otherAniIndex];
        if (!animationNode) {
            this.otherAniIndex = 0;
            return;
        }
        let action1 = cc.sequence(cc.fadeTo(0.1, 255), cc.callFunc(() => {
            this.otherAniIndex++;
            this.setOtherScale();
        }));
        animationNode.runAction(action1);

    }

    // update (dt) {}
}
