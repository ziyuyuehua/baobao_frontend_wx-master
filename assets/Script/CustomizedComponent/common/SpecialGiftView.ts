/**
 * Author: Ljx
 */
import {ButtonMgr} from "./ButtonClick";
import {UIMgr} from "../../global/manager/UIManager";
import {IFosterReward, IRespData} from "../../types/Response";
import {ResMgr} from "../../global/manager/ResManager";
import {JsonMgr} from "../../global/manager/JsonManager";
import {CommonUtil} from "../../Utils/CommonUtil";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SpecialGiftView extends cc.Component {

    static url = "common/SpecialGiftView";

    @property(sp.Skeleton)
    private title: sp.Skeleton = null;
    @property(cc.Node)
    private xian: cc.Node = null;
    @property(cc.Node)
    private desc: cc.Node = null;
    @property(cc.Prefab)
    private specialOneLine: cc.Prefab = null;
    @property(cc.Node)
    private sure: cc.Node = null;
    @property(cc.Prefab)
    private specialItemNode: cc.Prefab = null;

    private lineCount: number[] = [];
    private profitsData: IFosterReward[] = null;
    private specialLineArr: cc.Node[] = [];

    protected start(): void {
        this._bindEvent();
    }

    init(data: IFosterReward[]) {
        this.profitsData = data;
        let len = data.length - 2;
        CommonUtil.checkOneLineCount(len, this.lineCount);
        this.lineCount.forEach((value, key) => {
            let specialOneLine = cc.instantiate(this.specialOneLine);
            specialOneLine.opacity = 0;
            this.node.addChild(specialOneLine);
            this.specialLineArr.push(specialOneLine);
            specialOneLine.setPosition(0, this.xian.y - (key + 1) * 160);
            CommonUtil.numInit(value, specialOneLine, key > 0 ? len - value : 0, 20, this.specialItemNode, this.profitsData);
        });
        this.title.setStartListener(() => {
           setTimeout(() => {
                this.initAni();
           }, 500);
        });
        this.title.setAnimation(0, "animation", false);
        this.title.setCompleteListener(() => {
           this.title.setStartListener(null);
           this.title.clearTracks();
           this.title.setAnimation(0, "animation2", true);
        });
    }

    initAni  = () => {
        let index = 0;
        this.showAction(this.xian, index * .2);
        index++;
        this.showAction(this.desc, index * .2);
        index++;
        this.specialLineArr.forEach((value) => {
            this.showAction(value, index * .2);
            index++;
        });
        this.showAction(this.sure, index * .2);
    };

    showAction(node: cc.Node, delayTime: number) {
        node.runAction(cc.sequence(cc.delayTime(delayTime), cc.spawn(cc.moveBy(.2, 0, 20), cc.fadeIn(.2))));
    }

    private _bindEvent() {
        ButtonMgr.addClick(this.sure, this.closeHandle);
    }

    closeHandle = () => {
        UIMgr.closeView(SpecialGiftView.url);
    };

}
