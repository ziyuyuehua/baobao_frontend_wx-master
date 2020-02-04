/**
*@Athuor ljx
*@Date 16:03
*/
import {GameComponent} from "../../core/component/GameComponent";
import {IFosterReward} from "../../types/Response";
import {ButtonMgr} from "./ButtonClick";
import {CommonUtil} from "../../Utils/CommonUtil";

const {ccclass, property} = cc._decorator;

@ccclass

export default class SpecialGetReward extends GameComponent {
    static url = "common/SpecialGetReward";

    @property(cc.Node)
    private aniNode: cc.Node = null;
    @property(cc.Node)
    private sure: cc.Node = null;
    @property(cc.Label)
    private moneyLabel: cc.Label = null;
    @property(cc.Label)
    private expLabel: cc.Label = null;
    @property(cc.Node)
    private moneyNode: cc.Node = null;
    @property(cc.Node)
    private expNode: cc.Node = null;
    @property(cc.Prefab)
    private oneLine: cc.Prefab = null;
    @property(cc.Prefab)
    private specialItem: cc.Prefab = null;
    @property(cc.Node)
    private specialTip: cc.Node = null;

    private materialArr: IFosterReward[] = null;
    private lineCount: number[] = [];

    protected onEnable(): void {
        this.onShowPlay(2, this.aniNode);
    }

    protected start(): void {
        this._bindEvent();
    }

    private _bindEvent() {
        ButtonMgr.addClick(this.sure, this.closeOnly);
    }

    init(data: IFosterReward[]) {
        this.materialArr = data;
        let money: number = 0;
        let exp: number = 0;
        data.forEach((value) => {
            switch (value.xmlId) {
                case -1:
                    exp += value.num;
                    break;
                case -2:
                    money += value.num;
                    break;
            }
        });
        let moneyResult = money > 0;
        let expResult = exp > 0;
        this.moneyLabel.node.active = moneyResult;
        this.expLabel.node.active = expResult;
        this.moneyNode.active = moneyResult;
        this.expNode.active = expResult;
        this.moneyLabel.string = money.toString();
        this.expLabel.string = exp.toString();
        let len = this.materialArr.length - 2;
        CommonUtil.checkOneLineCount(len, this.lineCount);
        this.lineCount.forEach((value, key) => {
            let specialOneLine = cc.instantiate(this.oneLine);
            this.specialTip.addChild(specialOneLine);
            specialOneLine.setPosition(0, -(key * (115 + 20) + 20));
            CommonUtil.numInit(value, specialOneLine, key > 0 ? len - value : 0, 20, this.specialItem, this.materialArr);
        });
    }

    protected getBaseUrl(): string {
        return SpecialGetReward.url;
    }

}