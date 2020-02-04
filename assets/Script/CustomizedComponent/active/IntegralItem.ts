import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {IActivityGoal, IRespData} from "../../types/Response";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {JsonMgr} from "../../global/manager/JsonManager";
import CommonSimItem, {SetBoxType} from "../common/CommonSimItem";
import {DataMgr} from "../../Model/DataManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class IntegralItem extends cc.Component {

    @property(cc.Prefab)
    private iconPrefab: cc.Prefab = null;
    @property(cc.Node)
    private iconNode: cc.Node = null;
    @property(cc.Label)
    private iconName: cc.Label = null;
    @property(cc.ProgressBar)
    private progressBar: cc.ProgressBar = null;
    @property(cc.Label)
    private newTargetLab: cc.Label = null;
    @property(cc.Label)
    private nowTargetLab: cc.Label = null;
    @property([cc.Node])
    private exchangeBtn: cc.Node[] = [];
    @property(cc.Label)
    private numLab: cc.Label = null;

    private activeId = null;

    start() {
    }

    loadItem = (JsonSort: IActivityStore[], Data: IActivityGoal, index: number, integralNumber: number) => {
        let json: IActivityStore[] = JsonMgr.getActivityStore(Data.templateId, 2);
        let firstNum = json[0].id - 1;
        let itemnum = JsonSort[index].id - firstNum;
        this.numLab.string = "【" + itemnum + "】";
        this.activeId = JsonSort[index].id;
        let id = JsonSort[index].itemId.split(",");

        let SetBoxType = DataMgr.activeShopData.getItemBoxType(parseInt(id[0]));
        let node: cc.Node = cc.instantiate(this.iconPrefab);
        node.getComponent(CommonSimItem).updateItem(parseInt(id[0]), parseInt(id[1]),SetBoxType);
        this.iconNode.addChild(node);

        let item = JsonMgr.getInformationAndItem(parseInt(id[0]));
        if (!item || !item.name) {
            this.iconName.string = "未找到名称"+id[0];
        }else{
            this.iconName.string = item.name;
        }

        let price: number = parseInt(JsonSort[index].price.split(",")[1]);
        this.progressBar.progress = (integralNumber <= price) ? (integralNumber / price) : 1;
        this.newTargetLab.string = integralNumber + "";
        this.nowTargetLab.string = "/" + price;
        //price:额度
        //integralNumber：现有积分
        //Data.alreadyRecieveds.indexOf(json[index].id)！=-1 已领取
        // this.targetLab.string = integralNumber >= price ? "<color=#90583A>积分达标！</c>" : "<color=#90583A>还差</c><color=#20ac4e>" + (price - integralNumber) + "</color><color=#90583A>积分</c>";
        if (integralNumber >= price) {
            if (Data.alreadyRecieveds.indexOf(JsonSort[index].id) == -1) {
                this.loadActive(0);
            } else {
                this.loadActive(2);
            }
        } else {
            this.loadActive(1);
        }
    };

    loadActive = (idx: number) => {
        this.exchangeBtn.forEach((node: cc.Node, id: number) => {
            node.active = id === idx;
        });
    };

    onExchangeprop() {
        HttpInst.postData(NetConfig.REC_GOAL_REW, [this.activeId], (Response: IRespData) => {
            ClientEvents.REFRESH_INTEGRAL.emit();
        })
    }
}
