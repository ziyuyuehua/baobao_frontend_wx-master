/**
 * @Description:
 * @Author: ljx
 * @date 2019/11/29
 */
import {UIMgr} from "../../global/manager/UIManager";
import ExpandFrame from "../ExpandFrame/ExpandFrame";
import {ICommonRewardInfo} from "../../types/Response";
import {CommonUtil} from "../../Utils/CommonUtil";
import {MFData} from "./MoneyFlyData";
import {DataMgr} from "../../Model/DataManager";
import {ClientEvents} from "../../global/manager/ClientEventCenter";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MoneyFly extends cc.Component {

    static url: string = "MoneyFly/MoneyFly";

    @property(cc.Node)
    private fatherNode: cc.Node = null;
    @property(cc.Sprite)
    private spriteArr: cc.Sprite[] = [];
    @property(cc.SpriteFrame)
    private SF: cc.SpriteFrame = null;//砖石

    private endPos: cc.Vec2 = null;

    static ItemOffsetPos: { x, y, delay }[] = [
        {x: 21, y: 44, delay: .17},
        {x: -39, y: 8, delay: .15},
        {x: -12, y: 31, delay: .14},
        {x: 8, y: 31, delay: .13},
        {x: 29, y: -18, delay: .1},
        {x: -39, y: 44, delay: .09},
        {x: -19, y: 53, delay: .07},
        {x: 27, y: 40, delay: .05},
        {x: 40, y: 9, delay: .04},
        {x: -18, y: -30, delay: .04},
        {x: 17, y: -29, delay: 0}
    ];
    private xlmId: number = 0;

    protected start(): void {
        // this.node.on(cc.Node.EventType.TOUCH_END, () => {
        //     UIMgr.closeView(ExpandFrame.url);
        // });
    }

    /**
     * @param reward 奖励
     * @param isTips
     */
    initFly(reward: ICommonRewardInfo[], isTips: boolean = true, xlmId?: number) {
        this.xlmId = xlmId;
        let ble = xlmId == -3;
        if (ble) {
            this.spriteArr.forEach((value: cc.Sprite) => {
                value.spriteFrame = this.SF;
            });
        }
        this.scheduleOnce(() => {
            let startPos = MFData.getStartPos();
            this.fatherNode.setPosition(this.node.convertToNodeSpaceAR(startPos));
            let pos = ble ? UIMgr.getDaimIconWorldPoint() : UIMgr.getGoldIconWorldPoint();
            this.endPos = pos ? this.fatherNode.convertToNodeSpaceAR(pos) : cc.v2(20, 748);
            if (isTips) {
                UIMgr.showTipText("获得", CommonUtil.putRewardTogether(reward));
            }
            this.fly();
        }, .1);
    }

    fly() {
        this.spriteArr.forEach((value, index) => {
            let data = MoneyFly.ItemOffsetPos[index];
            this.firstAni(data.x, data.y, .7, data.delay, value.node, index === this.spriteArr.length - 1 ? index : 0);
        });
    }

    firstAni(x: number, y: number, time: number, delay: number, node: cc.Node, index: number) {
        node.runAction(cc.sequence(cc.delayTime(delay), cc.spawn(cc.scaleTo(.3, .7, .7), cc.fadeIn(.6), cc.moveBy(time, x, y).easing(cc.easeCircleActionInOut())),
            cc.spawn(cc.scaleTo(.5, .44), cc.moveTo(.5 + delay, this.endPos).easing(cc.easeCubicActionIn())), cc.delayTime(.12 + delay), cc.callFunc(() => {
                node.active = false;
                if (index) {
                    if (this.xlmId < 0) {
                        DataMgr.isIncentive = false;
                    }
                    UIMgr.closeView(MoneyFly.url);
                }
            })));
    }
}
