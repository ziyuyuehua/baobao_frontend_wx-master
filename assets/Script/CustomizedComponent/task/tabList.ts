import {DataMgr} from "../../Model/DataManager";
import {JsonMgr} from "../../global/manager/JsonManager";


const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property(cc.Prefab)
    private achievementItem: cc.Prefab = null;
    @property(cc.Node)
    private switchImg: cc.Node = null;
    @property(cc.Node)
    private loadNode: cc.Node = null;
    @property(cc.Label)
    private tabLabel: cc.Label = null;
    private ble: boolean = false;
    @property(cc.Node)
    private redDot:cc.Node = null;
    onLoad() {
        this.switchImg.on(cc.Node.EventType.TOUCH_END, this.switchBtn);
    }

    start() {

    }

    switchBtn = () => {
        if (this.ble) {
            this.ble = false;
            this.switchImg.rotation = 0;
            this.loadNode.active = this.ble;
        } else {
            this.ble = true;
            this.switchImg.rotation = 90;
            this.loadNode.active = this.ble;
        }
    }

    init = (str: string, id: number) => {
        let task = DataMgr.taskData;
        let data = task.achievement;
        this.tabLabel.string = str;
        let size = data.length;
        for (let i = 0; i < size; i++) {
            let json = JsonMgr.getAchieveTask(data[i].xmlId);
            if (id === json.belong) {
                let achievementItem = cc.instantiate(this.achievementItem);
                this.loadNode.addChild(achievementItem);
                achievementItem.getComponent("achievementItem").init(data[i],json);
            }
        }
    }

    refreshRedDot = ()=>{
        this.redDot.active = true;
    }
    // update (dt) {}
}
