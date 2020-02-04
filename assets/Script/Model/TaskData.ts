import {ClientEvents} from "../global/manager/ClientEventCenter";
import {JsonMgr} from "../global/manager/JsonManager";
import {IGoal, IMissionInfo, IMissionItem, IRespData} from "../types/Response";
import {DataMgr} from "./DataManager";


export class TaskData {
    // dailyMissionExp: number;
    receiveAward: boolean;
    receiveDailySize: number = 0;

    communityTasks: IMissionItem[] = [];
    targetTasks: Array<IMissionItem> = [];
    dailyTasks: Array<IMissionItem> = [];
    positionTasks: Array<IMissionItem> = [];
    unDocommunityTasks: IMissionItem[] = [];
    unDotargetTasks: Array<IMissionItem> = [];
    unDodailyTasks: Array<IMissionItem> = [];
    finishedTasks: Array<IMissionItem> = [];
    achievement: Array<IMissionItem> = [];
    private storeTask: IMissionItem[];

    userId: number;
    dailyNum: number = 0;
    targetNum: number = 0;
    communityNum: number = 0;
    achievementNum: number = 0;
    ble: boolean = false;
    dailyBle: boolean = false;
    targetBle: boolean = false;
    positionBle: boolean = false;
    communityBle: boolean = false;
    achievementBle: boolean = false;
    MainTaskJson: any = null;
    MainTaskIsCom: boolean = false;

    //已完成任务的xmlId
    taskXmlId: number = 0;
    //总计
    inTotal: Array<number>;
    //已达成
    reach: Array<number>;

    // goalData: IGoal = null;
    setTaskData = (res: IMissionInfo) => {
        // this.inTotal = [0, 0, 0, 0, 0, 0, 0];
        // this.reach = [0, 0, 0, 0, 0, 0, 0];
        this.communityTasks = res.communityMissions;
        this.dailyTasks = res.dailyMissions;
        this.targetTasks = res.mainMissions;
        this.positionTasks = res.positionMissions;
        this.storeTask = res.storeMissions;
        // this.dailyMissionExp = res.dailyMissionExp;
        // this.receiveAward = res.dailyMission.receiveAward;
        // this.achievement = res.achieveMissions;
        // this.achievementRedDot();
        this.getReceiveDailySize();
        this.sortTargetData();
        this.sortDailyData();
        this.sortPositionTask();
        this.redDot();
        this.getfinishedTasks();
        this.positionRedDot();

    };

    setMainTaskIsCom(com) {
        this.MainTaskIsCom = com;
    }

    getMainTaskIsCom() {
        return this.MainTaskIsCom;
    }

    setMainTaskJson(json) {
        this.MainTaskJson = json;
    }

    getMainTaskJson() {
        return this.MainTaskJson;
    }

    sortPositionTask = () => {
        if (this.positionTasks) {
            this.positionTasks.sort((a: IMissionItem, b: IMissionItem) => {
                let jsonA: IPositionTask = JsonMgr.getPositionTaskInfo(a.xmlId);
                let jsonB: IPositionTask = JsonMgr.getPositionTaskInfo(b.xmlId);
                return jsonA.taskSort - jsonB.taskSort;
            })
        }
    }

    getfinishedTasks() {
        let communityTasks: Array<IMissionItem> = [];
        let dailyTasks: Array<IMissionItem> = [];
        let targetTasks: Array<IMissionItem> = [];
        this.finishedTasks = [];
        for (let index in this.communityTasks) {
            if (this.communityTasks[index].completed) {
                this.finishedTasks.push(this.communityTasks[index]);
            } else {
                communityTasks.push(this.communityTasks[index])
            }
        }
        for (let index in this.dailyTasks) {
            if (this.dailyTasks[index].completed) {
                this.finishedTasks.push(this.dailyTasks[index]);
            } else {
                dailyTasks.push(this.dailyTasks[index])
            }
        }
        for (let index in this.targetTasks) {
            if (this.targetTasks[index].completed) {
                this.finishedTasks.push(this.targetTasks[index]);
            } else {
                targetTasks.push(this.targetTasks[index])
            }
        }
        this.unDocommunityTasks = communityTasks;
        this.unDodailyTasks = dailyTasks;
        this.unDotargetTasks = targetTasks;
    }

    getCommunity = () => {
        return this.communityTasks;
    };

    // setGoal = (resp: IRespData) => {
    //     this.goalData = resp.goal;
    //     // this.goalData.leftTime = resp.leftTime;
    // };
    // getGoal = () => {
    //     return this.goalData;
    // };

    sortDailyData = () => {
        this.dailyTasks.sort((a: IMissionItem, b: IMissionItem) => {
            let aJson = JsonMgr.getDailyTask(a.xmlId);
            let bJson = JsonMgr.getDailyTask(b.xmlId);
            if (!aJson) {
                cc.log("任务ID" + a.xmlId + "不存在", a);
            }
            if (!bJson) {
                cc.log("任务ID" + b.xmlId + "不存在", b);
            }
            let diff = bJson.taskSort - aJson.taskSort;
            return -diff;
        });
        let leg = this.dailyTasks.length;
        for (let j = 0; j < leg; j++) {
            if (!this.dailyTasks[j].completed) {
                this.dailyTasks.push(this.dailyTasks[j]);
                this.dailyTasks.splice(j, 1);
                leg--;
                j--;
            }
        }
        this.communityTasks.sort((a: IMissionItem, b: IMissionItem) => {
            let aJson = JsonMgr.getActivityTask(a.xmlId);
            let bJson = JsonMgr.getActivityTask(b.xmlId);
            if (!aJson) {
                cc.log("任务ID" + a.xmlId + "不存在", a);
            }
            if (!bJson) {
                cc.log("任务ID" + b.xmlId + "不存在", b);
            }
            let diff = bJson.taskSort - aJson.taskSort;
            return -diff;
        });
        let leg1 = this.communityTasks.length;
        for (let j = 0; j < leg1; j++) {
            if (!this.communityTasks[j].completed) {
                this.communityTasks.push(this.communityTasks[j]);
                this.communityTasks.splice(j, 1);
                leg1--;
                j--;
            }
        }
        this.dailyRedDot();
        // ClientEvents.EVENT_REFRESH_MAIN_UI_TASK.emit();
    };

    sortTargetData = () => {
        this.targetTasks.sort((a: IMissionItem, b: IMissionItem) => {
            let aJson = JsonMgr.getMainTask(a.xmlId);
            let bJson = JsonMgr.getMainTask(b.xmlId);
            if (!aJson) {
                cc.log("任务ID" + a.xmlId + "不存在", a);
            }
            if (!bJson) {
                cc.log("任务ID" + b.xmlId + "不存在", b);
            }
            let diff = bJson.taskSort - aJson.taskSort;
            return -diff;
        });
        let leg = this.targetTasks.length;
        for (let j = 0; j < leg; j++) {
            if (!this.targetTasks[j].completed) {
                this.targetTasks.push(this.targetTasks[j]);
                this.targetTasks.splice(j, 1);
                leg--;
                j--;
            }
        }
        this.targetRedDot();
    };

    getReceiveDailySize = () => {
        this.receiveDailySize = 0;
        let leg = this.dailyTasks.length;
        for (let i = 0; i < leg; i++) {
            if (this.dailyTasks[i].receivedAward) {
                this.receiveDailySize++;
            }
        }
    };

    redDot = () => {
        let targetBle: boolean = this.targetBle;
        if (JsonMgr.getConstVal("taskPanelCollectLevel") > DataMgr.userData.level) {
            targetBle = false;
        }
        this.ble = /*this.dailyBle || */targetBle || this.communityNum > 0 /*|| this.communityBle*/;
        ClientEvents.EVENT_TASK_RED_DOT.emit(this.ble);
        ClientEvents.EVENT_COMMUNITY_RED.emit(this.communityNum > 0);
        this.communityBle = this.communityNum > 0;
        this.communityNum = 0;
    };


    dailyRedDot = () => {
        let leg = this.dailyTasks.length;
        for (let i = 0; i < leg; i++) {
            if (this.dailyTasks[i].completed) {
                if (!this.dailyTasks[i].receivedAward) {
                    this.dailyNum++;
                    break;
                }
            }
        }
        let leg1 = this.communityTasks.length;
        for (let i = 0; i < leg1; i++) {
            if (this.communityTasks[i].completed) {
                if (!this.communityTasks[i].receivedAward) {
                    this.dailyNum++;
                    this.communityNum++;
                    break;
                }
            }
        }
        if (this.dailyNum > 0) {
            this.ble = true;
            this.dailyBle = true;
            ClientEvents.EVENT_TASK_TAB_RED_DOT.emit("daily", true);
            this.dailyNum = 0;
        } else {
            this.dailyBle = false;
            ClientEvents.EVENT_TASK_TAB_RED_DOT.emit("daily", false);
            this.dailyNum = 0;
        }
    };

    targetRedDot = () => {
        let leg = this.targetTasks.length;
        for (let i = 0; i < leg; i++) {
            if (this.targetTasks[i].completed) {
                if (!this.targetTasks[i].receivedAward) {
                    this.targetNum++;
                    break;
                }
            }
        }
        if (this.targetNum > 0) {
            this.ble = true;
            this.targetBle = true;
            ClientEvents.EVENT_TASK_TAB_RED_DOT.emit("target", true);
            this.targetNum = 0;
        } else {
            this.targetBle = false;
            ClientEvents.EVENT_TASK_TAB_RED_DOT.emit("target", false);
            this.targetNum = 0;
        }
    };

    achievementRedDot = () => {
        let leg = this.achievement.length;
        for (let i = 0; i < leg; i++) {
            this.num(this.achievement[i]);
            if (this.achievement[i].completed) {
                if (!this.achievement[i].receivedAward) {
                    this.achievementNum++;
                }
            }
        }
        if (this.achievementNum > 0) {
            this.ble = true;
            this.achievementBle = true;
            ClientEvents.EVENT_TASK_TAB_RED_DOT.emit("achievement", true);
            this.achievementNum = 0;
        } else {
            this.achievementBle = false;
            ClientEvents.EVENT_TASK_TAB_RED_DOT.emit("achievement", false);
            this.achievementNum = 0;
        }
    };

    positionRedDot = () => {
        for (let i in this.positionTasks) {
            if (!(this.positionTasks[i].completed)) {
                this.positionBle = false;
                ClientEvents.EVENT_TASK_TAB_RED_DOT.emit("position", false);
                ClientEvents.UPDATE_TASK_BTN.emit();
                ClientEvents.EVENT_REFRESH_MAIN_UI_TASK.emit();
                return;
            }
        }
        this.positionBle = true;
        let positionJson: IPositionJson = JsonMgr.getPositionJson(DataMgr.userData.getPositionId());
        if (positionJson && !positionJson.nextId) {
            this.positionBle = false;
        }
        ClientEvents.EVENT_REFRESH_MAIN_UI_TASK.emit();
        ClientEvents.EVENT_TASK_TAB_RED_DOT.emit("position", this.positionBle);
        ClientEvents.UPDATE_TASK_BTN.emit();
    }

    setPositionTaskRed(bel) {
        this.positionBle = bel;
    }

    getPositionTaskRed() {
        return this.positionBle;
    }

    num = (data: IMissionItem) => {
        let json = JsonMgr.getAchieveTask(data.xmlId);
        let key = json.belong;
        this.inTotal[6] = this.inTotal[6] + json.piont;
        switch (key) {
            case 1:
                this.inTotal[key - 1] = this.inTotal[key - 1] + json.piont;
                if (data.receivedAward) {
                    this.reach[key - 1] = this.reach[key - 1] + json.piont;
                }
                break;
            case 2:
                this.inTotal[key - 1] = this.inTotal[key - 1] + json.piont;
                if (data.receivedAward) {
                    this.reach[key - 1] = this.reach[key - 1] + json.piont;
                }
                break;
            case 3:
                this.inTotal[key - 1] = this.inTotal[key - 1] + json.piont;
                if (data.receivedAward) {
                    this.reach[key - 1] = this.reach[key - 1] + json.piont;
                }
                break;
            case 4:
                this.inTotal[key - 1] = this.inTotal[key - 1] + json.piont;
                if (data.receivedAward) {
                    this.reach[key - 1] = this.reach[key - 1] + json.piont;
                }
                break;
            case 5:
                this.inTotal[key - 1] = this.inTotal[key - 1] + json.piont;
                if (data.receivedAward) {
                    this.reach[key - 1] = this.reach[key - 1] + json.piont;
                }
                break;
            default:
                this.inTotal[key - 1] = this.inTotal[key - 1] + json.piont;
                if (data.receivedAward) {
                    this.reach[key - 1] = this.reach[key - 1] + json.piont;
                }
                break;
        }
    };

    getStoreTask() {
        return this.storeTask;
    }

    setStoreTask(task: IMissionItem[]) {
        this.storeTask = task;
    }

    checkStoreTaskHasComplete() {
        let result: boolean = true;
        this.storeTask.forEach((value) => {
            if (!value.completed) {
                result = false;
            }
        });
        return result;
    }
}
