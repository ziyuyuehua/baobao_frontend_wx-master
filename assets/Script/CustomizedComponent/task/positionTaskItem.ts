// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {ButtonMgr} from "../common/ButtonClick";
import {JsonMgr} from "../../global/manager/JsonManager";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {CommonUtil} from "../../Utils/CommonUtil";

const {ccclass, property} = cc._decorator;

@ccclass
export default class positionTaskItem extends cc.Component {

    @property(cc.Label)
    taskName: cc.Label = null;

    positionTaskJson: IPositionTask = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    initTaskItem(taskInfo) {
        this.positionTaskJson = JsonMgr.getPositionTaskInfo(taskInfo.xmlId);
        this.taskName.string = this.positionTaskJson.taskDescribe + ": " + CommonUtil.numChange(taskInfo.current) + '/' + CommonUtil.numChange(this.positionTaskJson.targetNum);
        if (taskInfo.completed) {
            this.taskName.string = this.positionTaskJson.taskDescribe + ": 已完成";
        }
    }

    start() {
    }


    // update (dt) {}
}
