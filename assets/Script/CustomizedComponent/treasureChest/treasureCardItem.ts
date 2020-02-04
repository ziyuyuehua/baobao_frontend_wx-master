import {JsonMgr} from "../../global/manager/JsonManager";
import {ResMgr} from "../../global/manager/ResManager";
import {ButtonMgr} from "../common/ButtonClick";
import {DataMgr} from "../../Model/DataManager";
import {UIMgr} from "../../global/manager/UIManager";
import treasureItemDetail from "./treasureItemDetail";
import {GameComponent} from "../../core/component/GameComponent";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
const {ccclass, property} = cc._decorator;
@ccclass
export default class treasureCardItem extends GameComponent {
    static url: string = "treasureChest/treasureCardItem";
    @property(cc.Sprite)
    colorIcon: cc.Sprite = null;
    @property(cc.Sprite)
    itemIcon: cc.Sprite = null;
    @property(cc.Label)
    nameLab: cc.Label = null;
    @property(cc.Node)
    star: cc.Node = null;
    @property(cc.Animation)
    rotateAni: cc.Animation = null;
    private itemID: number = 0;
    private itemIndex: number = 0;
    private startTime: number = 0;           //长按计时
    private endTime: number = 0;
    private isShowDetail: boolean = true;    //end时是否打开详情

    start() {
        this.addEvent(ClientEvents.CHOOSE_THIS_AWARD.on(this.chooseThisItem));
        ButtonMgr.addClick(this.node, this.openDetail, null, () => {
            this.startTime = new Date().getTime();
        });
    }

    chooseThisItem = () => {
        let selArr = DataMgr.getSelIdxArr();
        if (selArr.indexOf(this.itemIndex) >= 0) {
            let action = cc.sequence(cc.scaleTo(0.5, 0.9), cc.callFunc(() => {
                let action1 = cc.sequence(cc.scaleTo(0.5, 1), cc.callFunc(() => {
                    this.node.runAction(action);
                }));
                this.node.runAction(action1);
            }));
            this.node.stopAllActions();
            this.node.runAction(action);
        } else {
            this.node.stopAllActions();
            this.node.setScale(1, 1);
            this.node.opacity = 255;
        }
        ClientEvents.UPDATE_SURE_BTN.emit();
    };

    openDetail = () => {
        this.startTime = 0;
        if (this.isShowDetail)
            UIMgr.showView(treasureItemDetail.url, null, {id: this.itemID, index: this.itemIndex});
    };

    updateItem(id: number, selIndex: number) {
        this.itemID = id;
        this.itemIndex = selIndex;
        let dataVo = JsonMgr.getInformationAndItem(id);
        let color = (id >= 1000 && id < 9999) ? dataVo.star : dataVo.color;
        ResMgr.getTreasureBox(this.colorIcon, color);
        ResMgr.imgTypeJudgment(this.itemIcon, dataVo.id);
        this.nameLab.string = dataVo.name;
        for (let i = 1; i <= color; i++) {
            if (i == 6) {
                this.rotateAni.play();
                return;
            }
            this.star.getChildByName("starIcon" + i).active = true;
        }
    }

    protected getBaseUrl(): string {
        return treasureCardItem.url;
    }

    update(dt) {
        this.endTime = new Date().getTime();
        if (this.startTime > 0) {
            let touchTime = (this.endTime - this.startTime) / 1000;
            if (touchTime > 0.8) {
                if (DataMgr.getSelIdxArr().indexOf(this.itemIndex) >= 0) {
                    this.isShowDetail = false;
                    DataMgr.setSelIdxArr(this.itemIndex);
                    this.chooseThisItem();
                }
            } else {
                this.isShowDetail = true;
            }
        }
    }

}
