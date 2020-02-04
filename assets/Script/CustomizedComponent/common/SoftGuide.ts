import Arrow from "./Arrow";
import { UIUtil } from "../../Utils/UIUtil";
import { UIMgr } from "../../global/manager/UIManager";
import { DataMgr } from "../../Model/DataManager";
import { JsonMgr } from "../../global/manager/JsonManager";
import { StaffData } from "../../Model/StaffData";

export enum ARROW_DIRECTION {
    TOP,
    BOTTOM,
    LEFT,
    RIGHT,
}

export class GuideNodeManager {

    private static _instance: GuideNodeManager = null;

    static instance() {
        if (!GuideNodeManager._instance) {
            GuideNodeManager._instance = new GuideNodeManager();
        }
        return GuideNodeManager._instance;
    }

    private getCanvasOffset(direction: ARROW_DIRECTION, target: cc.Node, arrow: cc.Node): number {
        let arrowWidth = 20;
        switch (direction) {
            case ARROW_DIRECTION.TOP:
                return -target.width / 2 - arrow.width / 2 - arrowWidth;
            case ARROW_DIRECTION.BOTTOM:
                return target.height / 2 + arrow.height / 2 - 50;
            case ARROW_DIRECTION.LEFT:
                return target.width / 2 + arrow.width / 2 + arrowWidth;
            case ARROW_DIRECTION.RIGHT:
                return -target.width / 2 - arrow.width / 2 + arrowWidth;
            default:
                return 0;
        }
    }

    /**
     * @param target
     * @param direction
     * @param explain
     * @param cb 获取软引导节点，用于自己销毁
     * @param addCanvas 由于层级遮挡问题，是否添加到canvas
     * @param offset 想要的特殊的偏移量 Y
     * @param bindDispose
     * @param bubbleDoCb
     * @param offsetX 想要的特殊的偏移量 X
     * @param jianOffsetX 箭头偏移量 X
     */
    showSoftGuide(target: cc.Node, direction: ARROW_DIRECTION, explain: string, cb?: Function,
        addCanvas: boolean = false, offset: number = 0, bindDispose: boolean = false, bubbleDoCb?: Function, offsetX: number = 0, jianOffsetX: number = 0) {
        UIUtil.dynamicLoadPrefab("mainUI/arrow", (node: cc.Node) => {
            if (!target || !node) return;

            let guidePos = cc.v2(0, 0);
            let guideScript = node.getComponent(Arrow);
            let arrowWidth = 20;

            if (addCanvas) {
                let canvas = UIMgr.getCanvas();
                // let glPos = target.parent.convertToWorldSpaceAR(target.position);
                let glPos = target.convertToWorldSpaceAR(cc.v2(0, 0));
                let nodePos = canvas.convertToNodeSpaceAR(glPos);
                node.x = nodePos.x + (direction == ARROW_DIRECTION.LEFT || direction == ARROW_DIRECTION.RIGHT
                    ? this.getCanvasOffset(direction, target, node) : 0);
                node.y = nodePos.y + (direction == ARROW_DIRECTION.TOP || direction == ARROW_DIRECTION.BOTTOM
                    ? this.getCanvasOffset(direction, target, node) : 0);
                canvas.addChild(node, cc.macro.MAX_ZINDEX - 1);
            } else {
                let anchorPoint = target.getAnchorPoint();
                switch (direction) {
                    case ARROW_DIRECTION.TOP:
                        this.top(guidePos, node, target, arrowWidth, anchorPoint, offset);
                        break;
                    case ARROW_DIRECTION.BOTTOM:
                        this.down(guidePos, node, target, arrowWidth, anchorPoint, offset);
                        break;
                    case ARROW_DIRECTION.LEFT:
                        guidePos.x += target.width * 0.5 + node.width * 0.5 + arrowWidth - 50;
                        guidePos.y += offset;
                        break;
                    case ARROW_DIRECTION.RIGHT:
                        guidePos.x -= target.width * 0.5 + node.width * 0.5 + arrowWidth - 50;
                        guidePos.y += offset;
                        break;
                    default:
                        break;
                }
                target.addChild(node, cc.macro.MAX_ZINDEX - 1);
                node.setPosition(guidePos);
                node.x += offsetX;
            }
            node.active = true;
            guideScript.setDirection(direction, bindDispose, jianOffsetX);
            guideScript.setTipsLab(explain);
            cb && cb(node);
            bindDispose && guideScript.fadeIn();
            guideScript.runAction(bindDispose);
            guideScript.initCb(bubbleDoCb);
        });
    }

    top(guidePos: cc.Vec2, node: cc.Node, target: cc.Node, arrowWidth: number, anchorPoint: cc.Vec2, offset: number) {
        guidePos.y -= target.height * anchorPoint.y + node.height * 0.5 + arrowWidth - 60 + offset;
    }

    down(guidePos: cc.Vec2, node: cc.Node, target: cc.Node, arrowWidth: number, anchorPoint: cc.Vec2, offset: number) {
        guidePos.y += target.height * (1 - anchorPoint.y) + node.height * 0.5 + arrowWidth - 60 + offset;
    }

    //是否能显示红点
    canShowRed(): boolean {
        return !this.needGuide();
    }

    //是否需要显示软引导
    needGuide(): boolean {
        let guideArrow = JsonMgr.getConstVal("guideArrow");
        return DataMgr.getUserLv() < guideArrow;
    }

    //是否需要显示返回店铺软引导
    needGoHomeGuide(): boolean {
        let goHomeGuideArrow = JsonMgr.getConstVal("goHomeGuideArrow");
        return DataMgr.getUserLv() < goHomeGuideArrow;
    }

    canUpWork(): boolean {
        let staffData: StaffData = DataMgr.staffData;
        let emptyPostsIdx: number = staffData.findEmptyPostsIdx(DataMgr.getMarketId());
        let idleStaffIdx: number = staffData.findIdleStaffIdx();
        return emptyPostsIdx >= 0 && idleStaffIdx >= 0;
    }

}

export const GuideMgr: GuideNodeManager = GuideNodeManager.instance();
