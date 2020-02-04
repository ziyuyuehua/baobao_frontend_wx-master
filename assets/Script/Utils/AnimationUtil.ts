/**
 *@Athuor ljx
 *@Date 21:42
 */
import {GameComponent} from "../core/component/GameComponent";
import {UIUtil} from "./UIUtil";
import {AnimationData, CommonAniUtil} from "./CommonAnimation";

const {ccclass, property} = cc._decorator;

@ccclass

export default class AnimationUtil extends cc.Component {
    static url = "Map/moneyExpMove";

    @property(cc.Node)
    private aniNodeArr: cc.Node[] = [];
    @property(cc.Label)
    private moneyLabel: cc.Label = null;
    @property(cc.Label)
    private expLabel: cc.Label = null;

    init(aniData: AnimationData) {
        let data = this.initData(aniData);
        let worldPos = aniData.node.convertToWorldSpaceAR(cc.v2(0, 0));
        this.node.setPosition(this.node.parent.convertToNodeSpaceAR(worldPos));
        this.moneyLabel.string = data.money.toString();
        this.expLabel.string = data.exp.toString();
        this.aniNodeArr.forEach((value, key) => {
            value.runAction(cc.sequence(cc.delayTime((.4 * key)), cc.fadeIn(data.fadeInTime),
                cc.delayTime(data.stayTime),
                cc.spawn(cc.moveBy(data.upMoveTime, data.upMoveOffset),
                    cc.fadeOut(data.fadeOutTime))));
        });
        setTimeout(() => {
            this.aniNodeArr.forEach((value) => {
                value.x -= data.upMoveOffset.x;
                value.y -= data.upMoveOffset.y;
                CommonAniUtil.backNodeToPool(this.node);
            });
        }, ((this.aniNodeArr.length - 1) * .4 + 1) * 1000);
    }

    initData(aniData: AnimationData): AnimationData {
        return {
            node: aniData.node,
            money: aniData.money,
            exp: aniData.exp,
            fadeInTime: aniData.fadeInTime ? aniData.fadeInTime : .2,
            stayTime: aniData.stayTime ? aniData.stayTime : .2,
            upMoveTime: aniData.upMoveTime ? aniData.upMoveTime : .8,
            upMoveOffset: aniData.upMoveOffset ? aniData.upMoveOffset : cc.v2(0, 30),
            fadeOutTime: aniData.fadeOutTime ? aniData.fadeOutTime : .8
        }
    }
}
