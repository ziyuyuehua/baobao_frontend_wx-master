import { Reward, CommonUtil } from "../../Utils/CommonUtil";
import CommonSimItem from "../common/CommonSimItem";

// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommunityGiftAllItem extends cc.Component {

    @property(cc.Label)
    intervalLab: cc.Label = null;

    @property(cc.Layout)
    giftLayout: cc.Layout = null;

    @property(cc.Prefab)
    rankGiftPrefab: cc.Prefab = null;

    start() {

    }

    updateItem(rankWard: IAssistanceRewardJson) {
        let beforRank = rankWard.range[0];
        let endRank = rankWard.range[1];
        if (beforRank == 0) {
            this.intervalLab.string = "前" + endRank + "%";
        } else {
            this.intervalLab.string = "前" + beforRank + "% ~ " + endRank + "%"
        }

        let rewards: Reward[] = CommonUtil.toRewards(rankWard.reward);
        this.giftLayout.node.removeAllChildren();
        for (let index = 0; index < rewards.length; index++) {
            let node = cc.instantiate(this.rankGiftPrefab);
            let simItem: CommonSimItem = node.getComponent(CommonSimItem);
            simItem.updateItem(rewards[index].xmlId, rewards[index].number);
            this.giftLayout.node.addChild(node);
        }

    }

    // update (dt) {}
}
