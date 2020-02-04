import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {CompositeDisposable} from "../../Utils/event-kit";
import {UIUtil} from "../../Utils/UIUtil";
import {DataMgr} from "../../Model/DataManager";
import {UIMgr} from "../../global/manager/UIManager";
import TaskItem from "./taskItem";


const {ccclass, property} = cc._decorator;

@ccclass
export default class TargetTasks extends cc.Component {
    @property(cc.Prefab)
    private taskItem: cc.Prefab = null;
    @property(cc.Node)
    private content: cc.Node = null;
    private dispose = new CompositeDisposable();
    @property(cc.Node)
    private redDotSprite: cc.Node = null;
    contentY: number;

    onLoad() {
        this.dispose.add(ClientEvents.EVENT_TASK_REFRESH_LIST.on(this.choose));
    }

    start() {

        this.init();
    }

    choose = (key: string) => {
        if (key === "target") {
            this.init();
        }
    };

    init = () => {

        this.content.removeAllChildren();
        let initCount = DataMgr.taskData.targetTasks.length;
        for (let i = 0; i < initCount; i++) {
            let taskItem = cc.instantiate(this.taskItem);
            taskItem.name = i + "";
            this.content.addChild(taskItem);
            taskItem.getComponent(TaskItem).init(DataMgr.taskData.targetTasks[i]);
        }
    };

    scrollScroll() {
        let num = this.content.y - this.contentY;
        if (Math.abs(num) > 10) {
            UIMgr.closePanel();
            this.contentY = this.content.y;
        }
    }

    onDestroy() {
        this.dispose.dispose();
    }


    // update (dt) {}
}
