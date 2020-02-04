import { DotVo, COUNTERTYPE, dotClient, DotInst } from "../common/dotClient";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HelpItem extends cc.Component {

    @property(cc.Node)
    arrow: cc.Node = null;

    @property(cc.Label)
    detailed: cc.Label = null;

    @property(cc.Label)
    private titleLabel: cc.Label = null;

    @property(cc.Node)
    private expandNode: cc.Node = null;

    @property(cc.Node)
    private expandTopNode: cc.Node = null;

    @property(cc.Node)
    private expandLabelNode: cc.Node = null;

    @property(cc.Label)
    private expandTitle: cc.Label = null;

    @property(cc.Node)
    private expandParNode: cc.Node = null;

    @property(cc.Node)
    private pointNode: cc.Node = null;

    @property(cc.Node)
    private fPointNode: cc.Node = null;

    private switch: boolean = true;

    private itemId: number = 0;

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_END, () => {

            DotInst.clientSendDot(COUNTERTYPE.setting, "3003", this.itemId + "");

            if (this.switch) {
                this.arrow.rotation = -90;
                this.expandNode.active = false;
                this.expandTopNode.active = true;
                this.expandLabelNode.active = true;
                this.switch = false;
            } else {
                this.arrow.rotation = 0;
                this.expandNode.active = true;
                this.expandTopNode.active = false;
                this.expandLabelNode.active = false;
                this.switch = true;
            }
        }, this);
    }

    start() {
    }

    init = (item: any) => {
        this.itemId = item.id;
        let str: string = item.id + "." + item.question
        this.titleLabel.string = str;
        this.expandTitle.string = str;
        this.detailed.string = item.answer;
        let width1: number = str.length * 27.55;
        let width2: number = this.arrow.getContentSize().width;
        let width3: number = this.expandParNode.getContentSize().width;
        let width: number = Math.floor(width3 - width2 - width1);
        this.pointNode.setContentSize(cc.size(width, 3));
        this.fPointNode.setContentSize(cc.size(width, 3));
    }
    // update (dt) {}
}
