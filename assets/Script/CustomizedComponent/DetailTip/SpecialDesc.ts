import {JsonMgr} from "../../global/manager/JsonManager";
import {ResMgr} from "../../global/manager/ResManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SpecialDesc extends cc.Component {

    @property(cc.Sprite)
    private icon: cc.Sprite = null;

    private index: number = -1;
    private normalPos: cc.Vec2 = null;
    private specialPosArr: cc.Vec2[] = null;

    init(data: string, allLen: number, index: number, pos: cc.Vec2, posArr: cc.Vec2[]) {
        this.normalPos = pos;
        this.specialPosArr = posArr;
        this.index = index;
        this.setPos(allLen);
        this.initJustLabel(data, 0, this.icon.node.width);
    }

    setPos(len: number) {
        switch (len) {
            case 1:
                this.node.setPosition(this.normalPos);
                break;
            case 2:
                if (this.index === 0) {
                    this.node.setPosition(this.specialPosArr[0]);
                } else {
                    this.node.setPosition(this.specialPosArr[1]);
                }
                break;
        }
    }

    initJustLabel(data: string, zIndex: number, isNormal: number = 0) {
        let node = new cc.Node();
        let label: cc.Label = this.getLabel(node);
        label.string = data;
        node.color = this.getColor();
        node.width = 540;
        node.zIndex = zIndex;
        this.node.width += node.width - isNormal;
        this.node.addChild(node);
    }

    initWithIcon(id: number, zIndex: number) {
        let attribute = JsonMgr.getAttributeById(id);
        this.icon.node.zIndex = zIndex;
        this.icon.node.active = true;
        ResMgr.getAttributeIcon(this.icon, attribute.attributeIcon);
        this.initJustLabel(attribute.attributeName, 2);
    }

    getLabel(node: cc.Node) {
        let label = node.addComponent(cc.Label);
        label.fontSize = 26;
        label.lineHeight = 28;
        label.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        return label;
    }

    getColor() {
        return new cc.Color(173, 122, 97);
    }

}
