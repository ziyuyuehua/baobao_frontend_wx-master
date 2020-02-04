/**
*@Athuor ljx
*@Date 23:46
*/

const {ccclass, property} = cc._decorator;

@ccclass

export default class LabelType1 extends cc.Component {
    @property(cc.Label)
    private desc: cc.Label = null;
    @property(cc.Label)
    private beforeValue: cc.Label = null;
    @property(cc.Label)
    private afterLabel: cc.Label = null;

    init(before: number, now: number, desc: string) {
        this.desc.string = desc;
        this.beforeValue.string = before.toString();
        this.afterLabel.string = now.toString();
    }
}