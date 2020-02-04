import {GameComponent} from "../../core/component/GameComponent";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {JsonMgr} from "../../global/manager/JsonManager";
import {ResMgr} from "../../global/manager/ResManager";
import {DataMgr} from "../../Model/DataManager";
import {Staff} from "../../Model/StaffData";
import {ButtonMgr} from "../common/ButtonClick";
import {ArrowType} from "../common/Arrow";


const {ccclass, property} = cc._decorator;

@ccclass
export default class GiftGivingView extends GameComponent {
    static url: string = "favorability/GiftGivingView";

    @property(cc.Node)
    closeBtn: cc.Node = null;

    @property(cc.Slider)
    numSlider: cc.Slider = null;

    @property(cc.ProgressBar)
    itemProgressBar: cc.ProgressBar = null;

    @property(cc.Label)
    choseNum: cc.Label = null;

    @property(cc.Button)
    addBtn: cc.Button = null;

    @property(cc.Button)
    reduceBtn: cc.Button = null;

    @property(cc.Button)
    GiftGivingBtn: cc.Button = null;

    @property(cc.Sprite)
    itemQuIcon: cc.Sprite = null;

    @property(cc.Sprite)
    itemIcon: cc.Sprite = null;

    @property(cc.Label)
    itemName: cc.Label = null;

    @property(cc.Label)
    itemDesc: cc.Label = null;

    @property(cc.Node)
    private aniNode: cc.Node = null;


    private maxNum: number = 2;
    private curNum: number = 1;
    private itemId: number = 0;
    curStaff: Staff = null;
    costAllNum: number = 0;
    itemAddNum: number = 0;

    getBaseUrl() {
        return GiftGivingView.url;
    }

    onEnable() {
        this.onShowPlay(2, this.aniNode);
    }

    start() {
        ClientEvents.FAVOR_ARROW.emit(false);
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, () => {
            ClientEvents.FAVOR_ARROW.emit(true);
            this.closeView();
        });
        this.numSlider.node.on("slide", this.sliderHandler);
        ButtonMgr.addClick(this.addBtn.node, this.numAddHandler);
        ButtonMgr.addClick(this.reduceBtn.node, this.numReduceHandler);
        ButtonMgr.addClick(this.GiftGivingBtn.node, this.giftGivingHandler);
        this.itemId = this.node["data"];
        this.updateItem();


        this.curStaff = DataMgr.getChooseStaff();  //获取当前员工信息
        let favorJson: IFavorLevelJson = JsonMgr.getFavorLevelJson(this.curStaff.favorStage, this.curStaff.favorLevel); //获取员工好感度信息
        if (favorJson.cost) { //如果未达到满级
            let curFavorID: number = favorJson.id;
            let needMax: number = favorJson.cost - this.curStaff.favorExp;     //到满级最多能增加的好感度
            let AllJson = JsonMgr.getFavorLevelAllJson();
            for (let nid in AllJson) {
                if (AllJson[nid].id > curFavorID && AllJson[nid].cost) {
                    needMax = needMax + AllJson[nid].cost;  //当前好感度等级忠厚的所有等级升级所需好感度总和
                }
            }
            this.costAllNum = Math.ceil(needMax / this.itemAddNum);  //当前道具消耗的最大数量
        }

        this.updateSlider();

    }

    updateSlider() {
        this.curNum = this.curNum >= this.costAllNum ? this.costAllNum : this.curNum;
        this.curNum = this.curNum >= this.maxNum ? this.maxNum : this.curNum;
        this.choseNum.string = this.curNum + "/" + this.maxNum;
        this.numSlider.progress = this.curNum / this.maxNum;
        this.itemProgressBar.progress = this.curNum / this.maxNum;
        if (this.curNum <= 0) {
            this.reduceBtn.interactable = false;
            this.GiftGivingBtn.interactable = false;
        } else {
            this.reduceBtn.interactable = true;
            this.GiftGivingBtn.interactable = true;
        }
        this.addBtn.node.active = !(this.curNum >= this.maxNum || this.curNum >= this.costAllNum);
    }

    updateItem() {
        this.maxNum = DataMgr.warehouseData.getItemNum(this.itemId);
        let itemJson: IItemJson = JsonMgr.getItem(this.itemId);
        this.itemAddNum = itemJson.value;
        ResMgr.getItemBox(this.itemQuIcon, "k" + itemJson.color, 1);
        ResMgr.imgTypeJudgment(this.itemIcon, this.itemId);
        this.itemName.string = itemJson.name;
        this.itemDesc.string = itemJson.description;
    }


    //增加函数
    numAddHandler = () => {
        this.curNum++;
        this.updateSlider();
    }

    //减少函数
    numReduceHandler = () => {
        this.curNum--;
        this.updateSlider();
    }

    //赠送函数
    giftGivingHandler = () => {
        this.GiftGivingBtn.interactable = false;
        let staff: Staff = DataMgr.getChooseStaff();
        DataMgr.setPlayAnimation(false);
        DataMgr.setGiftType(this.itemId);
        HttpInst.postData(NetConfig.ADD_FAVOR_EXP, [staff.staffId, this.itemId, this.curNum], (response) => {
            this.sendFavorArrowMsg();
            this.GiftGivingBtn.interactable = true;
            this.closeView();
            DataMgr.staffData.FavorIsCollision = false;
            DataMgr.setResponseData(response);
            ClientEvents.PLAY_FAVORABLITY_ANi.emit(response, this.itemId);
        });
    }

    sendFavorArrowMsg() {
        if (DataMgr.userData.level < 7) {
            HttpInst.postData(NetConfig.SOFT_LED_INFO, [ArrowType.FavorArrow], (response) => {
                ClientEvents.FAVOR_ARROW.emit(false);
            });
        }
    }

    sliderHandler = () => {
        this.curNum = Math.floor(this.numSlider.progress * this.maxNum);
        this.updateSlider();
    }

}
