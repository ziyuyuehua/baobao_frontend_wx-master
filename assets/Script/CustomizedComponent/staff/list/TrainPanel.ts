import { GameComponent } from "../../../core/component/GameComponent";
import { TextTipConst } from "../../../global/const/TextTipConst";
import { AudioMgr } from "../../../global/manager/AudioManager";
import { JsonMgr } from "../../../global/manager/JsonManager";
import { UIMgr } from "../../../global/manager/UIManager";
import { DataMgr } from "../../../Model/DataManager";
import { Staff } from "../../../Model/StaffData";
import { ButtonMgr } from "../../common/ButtonClick";
import { TrainItem } from "./TrainItem";
import { ClientEvents } from "../../../global/manager/ClientEventCenter";

const { ccclass, property } = cc._decorator;

@ccclass
export class TrainPanel extends GameComponent {
    static url: string = "staff/list/trainPanelNew";

    @property(cc.Prefab)
    private trainItem: cc.Prefab = null;
    @property(cc.Node)
    private attrList: cc.Node = null;
    @property(cc.Node)
    private staffCom: cc.Node = null;
    @property(cc.Node)
    private blockPanel: cc.Node = null;
    // @property(AnimaAction)
    // private successAnima: AnimaAction = null;
    @property(cc.Animation)
    private success: cc.Animation = null;
    @property(sp.Skeleton)
    private successSk: sp.Skeleton = null;
    @property(cc.Animation)
    private bigSuccess: cc.Animation = null;
    @property(sp.Skeleton)
    private bigSuccessSk: sp.Skeleton = null;
    @property(cc.Animation)
    private superSuccessful: cc.Animation = null;
    @property(sp.Skeleton)
    private superSuccessfulSk: sp.Skeleton = null;
    @property(cc.Sprite)
    private successSp: Array<cc.Sprite> = [];
    @property(cc.Label)
    private successLabel: Array<cc.Label> = [];

    @property(cc.Node)
    private closeBtn: cc.Node = null;

    @property(cc.Node)
    private aniNode: cc.Node = null;

    @property(cc.SpriteFrame)
    private sf: Array<cc.SpriteFrame> = [];
    staff: Staff = null;
    @property(cc.Node)
    private btnMask: cc.Node = null;

    @property( cc.Sprite)
    private trainLead: cc.Sprite = null;

    trainNodeMap: Map<number, TrainItem> = new Map<number, TrainItem>();

    getBaseUrl() {
        return TrainPanel.url;
    }

    onEnable() {
        this.onShowPlay(2, this.aniNode);
    }

    start() {
        ButtonMgr.setInteractableNoClick(false);
        ButtonMgr.addClick(this.blockPanel, this.hide);
        ButtonMgr.addClick(this.closeBtn, this.hide);
        this.init(DataMgr.getChooseStaff());
        //this.dispose.add(ClientEvents.CLEAN_SOFT_LEAD.on(this.cleanSoft))
    }

    cleanSoft = (id: number) => {
        if (id == 3) {
            this.trainLead.node.active = false;
        }
    }

    onLoad() {
        this.dispose.add(ClientEvents.WAREHOUSE_UPDATE_WAREHOUSE.on(() => {
            this.updateItemNum();
        }))
    }

    updateItem(staff: Staff, updateIndex?: number) {
        this.staff = staff;
        let attrValues: Array<number> = staff.attrValues();
        staff.attrAdd().forEach((trainLv, index, array) => {
            let item: TrainItem = this.trainNodeMap.get(index);
            if (item && updateIndex == index) {
                item.init(this, index, trainLv, attrValues[index]);
            }
        });
    }

    updateItemNum() {
        let attrValues: Array<number> = this.staff.attrValues();
        this.staff.attrAdd().forEach((trainLv, index, array) => {
            let item: TrainItem = this.trainNodeMap.get(index);
            item.updateCost(trainLv);
        });
    }

    init(staff: Staff) {
        // this.attrList.removeAllChildren();
        this.staff = staff;
        let attrValues: Array<number> = staff.attrValues();
        let hasItemArr: number[] = [];
        staff.attrAdd().forEach((trainLv, index, array) => {
            let item: TrainItem = this.trainNodeMap.get(index);
            if (!item) {
                item = cc.instantiate(this.trainItem).getComponent("TrainItem");
                this.attrList.addChild(item.node);
                this.trainNodeMap.set(index, item);
            }
            item.init(this, index, trainLv, attrValues[index]);
            cc.log("indexindex" + index);
            if (item.trainBtn.interactable) {
                hasItemArr.push(attrValues[index]);
            }

        });
        let index: number = this.getBigstValueIndex(hasItemArr);
        cc.log("index=====" + index);


        //培训选道具引导
        // if (index >= 0) {
        //     if (DataMgr.getGuideCompleteTimeById(ArrowType.StaffTraining) <= 0) {
        //         if (staff.level > Number(JsonMgr.getConstVal("trainOpenLv")) && staff.star > 3) {
        //             this.trainLead.node.active = true;
        //             cc.log("this.trainLead.node.y=====" + this.trainLead.node.y);
        //             cc.log("this.trainLead.node.y   ==  ===" + this.trainLead.node.y);
        //             let moveSpr = this.trainLead.node.getComponent(cc.Sprite);
        //             if (this.trainLead.node.active) {
        //                 let active1 = cc.repeatForever(cc.sequence(cc.moveTo(0.5, moveSpr.node.x, 60 - (126 * index)),
        //                     cc.moveTo(0.5, moveSpr.node.x, 40 - (126 * index))));
        //                 moveSpr.node.stopAllActions();
        //                 moveSpr.node.runAction(active1);
        //             } else {
        //                 moveSpr.node.stopAllActions();
        //             }
        //         } else {
        //             this.trainLead.node.active = false;
        //         }
        //     }
        // }


    }

    getBigstValueIndex(hasItemArr) {
        let arr = [Number(this.staff.getIntelligence()), Number(this.staff.getPower()), Number(this.staff.getPatience()), Number(this.staff.getGlamour())];
        let arr1 = hasItemArr;
        let max: number = Math.max(...arr1);
        let indexOfMax = arr.indexOf(max) == 1 ? 3 : (arr.indexOf(max) == 3 ? 1 : arr.indexOf(max));
        return indexOfMax;
    }

    showTip(key: number, sf: number) {
        let json = JsonMgr.getTrainMultiple();
        this.btnMask.active = true;
        setTimeout(() => {
            if(this.btnMask){
                this.btnMask.active = false;
            }
        }, 800);
        switch (key) {
            case json[0]:
                this.successSp[0].spriteFrame = this.sf[sf];
                this.successLabel[0].string = "+" + key;
                this.success.node.setSiblingIndex(99);
                this.success.play();
                this.successSk.setAnimation(0, "animation", false);
                AudioMgr.playEffect("Audio/staff/trainingOk", false);
                break;

            case json[1]:
                this.successSp[1].spriteFrame = this.sf[sf];
                this.successLabel[1].string = "+" + key;
                this.bigSuccess.node.setSiblingIndex(99);
                this.bigSuccess.play();
                this.bigSuccessSk.setAnimation(0, "animation", false);
                AudioMgr.playEffect("Audio/staff/trainingOk", false);
                break;

            case json[2]:
                this.successSp[2].spriteFrame = this.sf[sf];
                this.successLabel[2].string = "+" + key;
                this.superSuccessful.node.setSiblingIndex(99);
                this.superSuccessful.play();
                this.superSuccessfulSk.setAnimation(0, "animation", false);
                AudioMgr.playEffect("Audio/staff/trainingOk", false);
                break;
            default:
                cc.log("暴击率为" + key);
                break;
        }

    }

    playSuccessAnima() {
        // this.successAnima.showPlayOnce(() => {
        //     this.successAnima.hide();
        // });
    }

    hide = () => {
        this.closeOnly();
    };

    onDestroy() {
        this.dispose.dispose();
    }

    tipHandler() {
        UIMgr.showTextTip(TextTipConst.TrainingTip);
    }

}
