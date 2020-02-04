import {CompositeDisposable} from "../../Utils/event-kit";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {DataMgr} from "../../Model/DataManager";
import {TaskData} from "../../Model/TaskData";
import {UIMgr} from "../../global/manager/UIManager";
import TaskItem from "./taskItem";


const {ccclass, property} = cc._decorator;

@ccclass
export default class DailyTasks extends cc.Component {

    @property(cc.Prefab)
    private taskItem: cc.Prefab = null;
    @property(cc.Node)
    private content: cc.Node = null;
    //日常清空后显示
    @property(cc.Node)
    private nullTask: cc.Node = null;
    private dispose = new CompositeDisposable();
    @property(cc.Node)
    private redDotSprite: cc.Node = null;
    @property(cc.Node)
    private community: cc.Node = null;
    @property(cc.Node)
    private daily: cc.Node = null;
    @property(cc.Node)
    private target: cc.Node = null;

    contentY: number;


    onLoad() {
        this.dispose.add(ClientEvents.EVENT_TASK_REFRESH_LIST.on(this.choose));
    }

    start() {
        this.init();
    }

    choose = (key: string) => {
        if (key === "daily") {
            this.init();
        }
    };

    init = () => {
        this.contentY = this.content.y;
        this.content.removeAllChildren();
        let task: TaskData = DataMgr.taskData;
        let communityTask = task.unDocommunityTasks;
        let dailyTask = task.unDodailyTasks;
        let targetTask = task.unDotargetTasks;
        let finistedTask = task.finishedTasks;
        let total: number = communityTask.length + dailyTask.length + targetTask.length + finistedTask.length;
        // let receive: number = task.receiveDailySize;
        if (total == 0) {
            this.nullTask.active = true;
            return;
        }


        let communityCount = task.unDocommunityTasks.length;
        let dailyCount = task.unDodailyTasks.length;
        let targetCount = task.unDotargetTasks.length;
        let finishCount = task.finishedTasks.length;

        for (let i = 0; i < finishCount; i++) {
            let taskItem = cc.instantiate(this.taskItem);
            taskItem.name = i + "";
            this.content.addChild(taskItem);
            taskItem.getComponent(TaskItem).init(finistedTask[i]);
        }


        if (communityCount > 0) {
            let node: cc.Node = cc.instantiate(this.community);
            this.content.addChild(node);
            node.active = true;
        }

        for (let i = 0; i < communityCount; i++) {
            let taskItem = cc.instantiate(this.taskItem);
            taskItem.name = i + "";
            this.content.addChild(taskItem);
            taskItem.getComponent(TaskItem).init( communityTask[i]);
        }

        if (dailyCount > 0) {
            let node: cc.Node = cc.instantiate(this.daily);
            this.content.addChild(node);
            node.active = true;
        }


        for (let i = 0; i < dailyCount; i++) {
            let taskItem = cc.instantiate(this.taskItem);
            taskItem.name = i + "";
            this.content.addChild(taskItem);
            taskItem.getComponent(TaskItem).init(dailyTask[i]);
        }

        if (targetCount > 0) {
            let node: cc.Node = cc.instantiate(this.target);
            this.content.addChild(node);
            node.active = true;
        }


        for (let i = 0; i < targetCount; i++) {
            let taskItem = cc.instantiate(this.taskItem);
            taskItem.name = i + "";
            this.content.addChild(taskItem);
            taskItem.getComponent(TaskItem).init(targetTask[i]);
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
