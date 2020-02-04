/**
*@Athuor ljx
*@Date 14:43
*/
import {ButtonMgr} from "../common/ButtonClick";
import {UIMgr} from "../../global/manager/UIManager";
import ExpandFrame from "./ExpandFrame";
import {ExpUtil} from "../MapShow/Utils/ExpandUtil";
import {CoordinateTranslate} from "../../Utils/CoordinateTranslate";
import {MapMgr} from "../MapShow/MapInit/MapManager";
import {CompositeDisposable} from "../../Utils/event-kit";
import {ClientEvents} from "../../global/manager/ClientEventCenter";

const {ccclass, property} = cc._decorator;

@ccclass

export default class ExpandNode extends cc.Component {
    static url = "expandFrame/expandNode";

    private isMove: boolean = false;

    init() {
        this.setNodePos();
    }

    setNodePos() {
        let pos = ExpUtil.getNextTimeNodePos();
        this.node.setPosition(CoordinateTranslate.changeToGLPosition(pos));
    }

    checkMove = (event: cc.Event.EventTouch) => {
        this.isMove = UIMgr.moveOverried(event);
    };
}