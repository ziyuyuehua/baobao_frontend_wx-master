import {DataMgr} from "../../Model/DataManager";


const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    private content: cc.Node = null;
    // @property(cc.Prefab)
    // private tabList: cc.Prefab = null;
    @property(cc.ProgressBar)
    private ProgressBar:Array< cc.ProgressBar> = [];
    @property(cc.Label)
    private inTotalLabel:cc.Label = null;
    private Belong: Array<string> = [];

    onLoad() {
        this.Belong = ["收集狂魔", "鬼才经营", "崽崽养成", "交际之花", "探索之路", "大家风范"];
    }

    start() {
        // this.initTabList();
    }

    initTabList = () => {
        // this.content.removeAllChildren();
        // this.Belong.forEach((srt: string,id:number) => {
        //     let tabList = cc.instantiate(this.tabList);
        //     this.content.addChild(tabList);
        //     tabList.getComponent("tabList").init(srt,id+1);
        // });
        // this.initPointsNum();
    }



    initPointsNum = () =>{
        let data = DataMgr.taskData;
        this.ProgressBar.forEach((item:cc.ProgressBar,id:number)=>{
            item.progress = data.reach[id] / data.inTotal[id];
        });
        this.inTotalLabel.string = data.reach[6] +"/"+ data.inTotal[6];
    }
    // update (dt) {}
}

