import { HttpInst } from "../../../core/http/HttpClient";
import { NetConfig } from "../../../global/const/NetConfig";
import { ClientEvents } from "../../../global/manager/ClientEventCenter";
import { JsonMgr } from "../../../global/manager/JsonManager";
import { ResMgr } from "../../../global/manager/ResManager";
import { UIMgr } from "../../../global/manager/UIManager";
import { DataMgr } from "../../../Model/DataManager";
import { Staff } from "../../../Model/StaffData";
import { UIUtil } from "../../../Utils/UIUtil";
import trainAttItem from "./TrainAttItem";
import { TrainPanel } from "./TrainPanel";
import { ButtonMgr } from "../../common/ButtonClick";
import {COUNTERTYPE, DotInst} from "../../common/dotClient";

const { ccclass, property } = cc._decorator;

class TrainEnum {
    index: number;
    name: string;
    color: cc.Color;
    rateStr: string;

    constructor(index: number, name: string, color: cc.Color, rateStr: string) {
        this.index = index;
        this.name = name;
        this.color = color;
        this.rateStr = rateStr;
    }
}

const TRAIN_ENUMS: Array<TrainEnum> = [
    new TrainEnum(1, "一阶", new cc.Color(128, 180, 88), "100%成功"),
    new TrainEnum(2, "二阶", new cc.Color(88, 160, 205), "50%成功"),
    new TrainEnum(3, "三阶", new cc.Color(183, 133, 88), "25%成功"),
    new TrainEnum(4, "四阶", new cc.Color(183, 133, 188), "5%成功"),
];

@ccclass
export class TrainItem extends cc.Component {

    @property(cc.Sprite)
    trainBg: cc.Sprite = null;
    @property(cc.Sprite)
    trainIcon: cc.Sprite = null;

    @property(cc.Label)
    trainAttrLabel: cc.Label = null;

    @property(cc.Sprite)
    trainLabel: cc.Sprite = null;

    @property(cc.Sprite)
    trainLvBg: cc.Sprite = null;

    @property(cc.Label)
    trainLvLabel: cc.Label = null;

    @property(cc.Button)
    trainBtn: cc.Button = null;
    @property(cc.Label)
    trainRateLabel: cc.Label = null;

    @property(cc.Node)
    private trainNode: cc.Node = null;

    @property(cc.Sprite)
    private trainItemBg: cc.Sprite = null;

    @property(cc.Sprite)
    private trainItemXian: cc.Sprite = null;

    @property(cc.Layout)
    private attLayout: cc.Layout = null;

    @property(cc.Prefab)
    private attPrefab: cc.Prefab = null;

    @property(cc.Node)
    oneNode: cc.Node = null;

    @property(cc.Sprite)
    itemQu: cc.Sprite = null;

    @property(cc.Sprite)
    itemIcon: cc.Sprite = null;

    @property(cc.RichText)
    ItemNum: cc.RichText = null;


    private trainPanel: TrainPanel = null;
    private attrIndex: number = -1;

    private sendAttrIndex: number = -1;

    private costArr: string[] = [];
    private trainLv: number = 0;
    private hasCost: boolean = true;
    private unEnoughItemId: number = 0;
    private itemId: number = 0;

    onLoad() {
        ButtonMgr.addClick(this.trainNode, this.trainStaff);
        ButtonMgr.addClick(this.itemIcon.node, () => {
            DotInst.clientSendDot(COUNTERTYPE.staff, "6026", this.itemId.toString());
            UIMgr.loadaccessPathList(this.itemId);
        });
    }

    init(trainPanel: TrainPanel, attrIndex: number, trainLv: number, attrVal: number) {
        this.trainLv = trainLv
        this.trainPanel = trainPanel;
        this.attrIndex = attrIndex;
        let trainEnum: TrainEnum = this.trainEnum(trainLv);
        this.sendAttrIndex = Staff.ATTR_INDEX[attrIndex];
        let attribute = JsonMgr.getAttribute()[Staff.ATTR_INDEX[attrIndex]];
        ResMgr.getBigAttributeIcon(this.trainIcon, attribute.attributeIcon);

        UIUtil.setLabel(this.trainAttrLabel, attribute.attributeName);
        this.trainLvBg.node.active = trainLv > 0;
        this.trainLvLabel.node.active = trainLv > 0;
        if (trainLv > 0) {
            UIUtil.setLabel(this.trainLvLabel, "+" + trainLv, trainEnum.color);
        }
        // ResMgr.getStaffUIIcon(this.trainBtn.getComponent(cc.Sprite), "train" + trainEnum.index);
        let trainTem = JsonMgr.getTranTem(Staff.ATTR_INDEX[attrIndex], trainEnum.index);
        ResMgr.setTrainBgXianIcon(this.trainLabel, "staff_peixun" + trainTem.stage);
        ResMgr.setTrainBgXianIcon(this.trainItemBg, "staff_di" + trainTem.stage);
        ResMgr.setTrainBgXianIcon(this.trainBtn.getComponent(cc.Sprite), "staff_anniu" + trainTem.stage);
        ResMgr.setTrainBgXianIcon(this.trainItemXian, "staff_dian" + trainTem.stage);
        ResMgr.setTrainBgXianIcon(this.trainBg, "staff_sxk" + trainTem.stage);

        this.costArr = trainTem.MaterialCost.split(";");
        this.updateCost(trainLv);
        cc.log(trainTem);

    }

    updateCost(trainLv) {
        this.attLayout.node.active = this.costArr.length != 1;
        this.oneNode.active = this.costArr.length == 1;
        if (this.costArr.length == 1) {
            this.updateOneCost(this.costArr[0].split(","));
        } else {
            this.attLayout.node.removeAllChildren();
            this.hasCost = true;
            for (let nid = 1; nid <= this.costArr.length; nid++) {
                let node = cc.instantiate(this.attPrefab);
                let trainItem: trainAttItem = node.getComponent(trainAttItem);

                let costIdNumArr: string[] = this.costArr[nid - 1].split(",");
                trainItem.updateItem(costIdNumArr)

                let costId: number = Number(costIdNumArr[0]);
                let costNum: number = Number(costIdNumArr[1]);
                let bagNum: number = DataMgr.getItemNum(costId);

                if (bagNum >= costNum) {
                } else {
                    this.unEnoughItemId = costId;
                    this.hasCost = false;
                }
                this.attLayout.node.addChild(node);
            }
        }
        this.trainBtn.interactable = this.hasCost && !Staff.isMaxTrainLv(trainLv);
    }

    updateOneCost(costIdNumArr: string[]) {
        this.itemId = Number(costIdNumArr[0]);
        let costNum: number = Number(costIdNumArr[1]);
        let itemTem = JsonMgr.getItem(this.itemId);
        ResMgr.getItemBox(this.itemQu, "k" + itemTem.color, 0.5);
        ResMgr.getItemIcon(this.itemIcon, itemTem.icon);


        let bagNum: number = DataMgr.getItemNum(this.itemId);
        let color: string = "";
        if (bagNum >= costNum) {
            color = "#0cba24"
        } else {
            color = "#F63434"
            this.unEnoughItemId = Number(costIdNumArr[0]);
            this.hasCost = false;
        }

        this.ItemNum.string = "<color=" + color + ">" + bagNum + "<color=#814d34>/" + costNum + "</color>"
    }

    openSource = (btn) => {
        let costIdNumArr: string[] = this.costArr[Number(btn.target.name) - 1].split(",");
        let costId: number = Number(costIdNumArr[0]);
        UIMgr.loadaccessPathList(costId);
    }

    private trainEnum(trainLv: number): TrainEnum {
        let index: number = Math.floor(trainLv / 50) - (trainLv % 50 == 0 ? 1 : 0);
        const trainEnum: TrainEnum = TRAIN_ENUMS[Math.max(0, index)];
        if (!trainEnum) {
            return TRAIN_ENUMS[TRAIN_ENUMS.length - 1];
        }
        return trainEnum;
    }

    private trainAttrName(attrIndex: number): string {
        switch (attrIndex) {
            case 0:
                return "智慧";
            case 1:
                return "灵巧";
            case 2:
                return "亲和";
            case 3:
                return "体力";
        }
    }

    trainStaff = () => {
        if (Staff.isMaxTrainLv(this.trainLv)) {
            UIMgr.showTipText("已经达到培训极限了~");
            return;
        }
        if (!this.hasCost) {
            UIMgr.loadaccessPathList(this.unEnoughItemId);
            return
        }
        let staff: Staff = this.trainPanel.staff; //DataMgr.getStaffData().getChooseStaff();
        cc.log("train", staff.staffId, this.attrIndex, "clicked");

        if (Staff.isMaxTrainLv(staff.attrAdd()[this.attrIndex])) {
            cc.log(this.attrIndex + " isMaxTrainLv can not train");
            return;
        }
        HttpInst.postData(NetConfig.trainStaff,
            [staff.staffId, this.sendAttrIndex], (response: any) => {
                DotInst.clientSendDot(COUNTERTYPE.staff, "6003", staff.staffId.toString(),  this.sendAttrIndex.toString(), response.isSuccess.toString());
                staff = DataMgr.updateStaff(response);
                ClientEvents.UPDATE_STAFF.emit(staff);
                //ClientEvents.CLEAN_SOFT_LEAD.emit(2);
                if(!this.trainPanel) return;
                this.trainPanel.updateItem(staff, this.attrIndex);
                if (response.isSuccess) {
                    this.trainPanel.showTip(response.isSuccess, this.attrIndex);

                    //培训引导一次后结束
                    //HttpInst.postData(NetConfig.SOFT_LED_INFO, [ArrowType.StaffTraining]);
                }
            });
    };

}
