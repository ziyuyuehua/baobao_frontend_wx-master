
import { ButtonMgr } from "../common/ButtonClick";
import { ClientEvents } from "../../global/manager/ClientEventCenter";

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
export default class FilterItem extends cc.Component {

    @property(cc.Label)
    typeName: cc.Label = null;

    private filiterData: IItemTypeJson = null;

    start() {
        ButtonMgr.addClick(this.node, this.choseType);
    }

    updateItem(jsonVo: IItemTypeJson) {
        this.filiterData = jsonVo;
        this.typeName.string = jsonVo.name;
    }

    choseType = () => {
        ClientEvents.CHOSE_FILITER_VIEW.emit(this.filiterData);
    }
    // update (dt) {}
}
