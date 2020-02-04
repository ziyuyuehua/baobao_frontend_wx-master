import {NetConfig} from "../../global/const/NetConfig";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {itemType, JsonMgr} from "../../global/manager/JsonManager";
import {ResMgr} from "../../global/manager/ResManager";
import {UIMgr} from "../../global/manager/UIManager";
import {DataMgr} from "../../Model/DataManager";
import {Staff, StaffData} from "../../Model/StaffData";
import {HttpInst} from "../../core/http/HttpClient";
import {CompositeDisposable} from "../../Utils/event-kit";
import {ButtonMgr} from "../common/ButtonClick";
import FavorabilityUpView from "./FavorabilityUpView";
import GiftGivingView from "./GiftGivingView";
import {ArrowType} from "../common/Arrow";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FavorabilityUpScItem extends cc.Component {

    @property(cc.Sprite)
    itemQuIcon: cc.Sprite = null;

    @property(cc.Sprite)
    itemIcon: cc.Sprite = null;

    @property(cc.Label)
    itemNumber: cc.Label = null;

    private initialPos: cc.Vec2;
    private isMove: boolean = false;    //是否移动过
    private itemId: number = 0;
    private itemNum: number = 0;
    protected dispose: CompositeDisposable = new CompositeDisposable();

    start() {
        //开启碰撞
        let man = cc.director.getCollisionManager();
        man.enabled = true;

        this.dispose.add(ClientEvents.WAREHOUSE_UPDATE_WAREHOUSE.on(() => {
            this.itemNum = DataMgr.warehouseData.getItemNum(this.itemId);
            this.itemNumber.string = this.itemNum + "";
        }));
        ButtonMgr.addClick(this.itemQuIcon.node, this.touchEnd, this.touchMove, this.touchStart, () => {
            cc.log("------测试 this.caccle");
        });

    }

    updateItem(itemId: number) {
        this.itemId = itemId;
        this.itemNum = DataMgr.warehouseData.getItemNum(itemId);
        this.itemNumber.string = this.itemNum + "";
        let itemJson: IItemJson = JsonMgr.getItem(itemId);
        ResMgr.getItemBox(this.itemQuIcon, "k" + itemJson.color, 0.8);
        ResMgr.imgTypeJudgment(this.itemIcon, itemId);
    }

    touchStart = () => {
        ClientEvents.FAVOR_ARROW.emit(false);
        this.isMove = false;
        if (this.itemNum <= 0) {
            return;
        }
        this.initialPos = this.itemQuIcon.node.position;
    }

    touchMove = (event) => {
        if (this.itemNum <= 0) {
            return;
        }
        let startPos = event.currentTouch._startPoint;
        let endPos = event.currentTouch._point;
        let xCha: number = Math.abs(endPos.x) - Math.abs(startPos.x);
        let yCha: number = Math.abs(endPos.y) - Math.abs(startPos.y);
        if (Math.abs(yCha) > 10 || Math.abs(xCha) > 10) {
            this.isMove = true;
            let location = this.node.convertToNodeSpaceAR(event.touch.getLocation());
            this.itemQuIcon.node.position = location;
        }
    }

    touchEnd = () => {
        let itemJsons: IItemJson[] = JsonMgr.getItemsByType(itemType.FavorUpType);
        let isGuide: boolean = false;
        for (let i in itemJsons) {
            if (DataMgr.warehouseData.getItemNum(itemJsons[i].id) > 0) {
                isGuide = true;
                break;
            }
        }
        ClientEvents.FAVOR_ARROW.emit(isGuide);
        if (this.isMove) {
            this.itemQuIcon.node.position = this.initialPos;
            let staffData: StaffData = DataMgr.staffData;
            if (staffData.FavorIsCollision) {
                let staff: Staff = staffData.getChooseStaff();
                DataMgr.setPlayAnimation(false);
                DataMgr.setGiftType(this.itemId);
                HttpInst.postData(NetConfig.ADD_FAVOR_EXP, [staff.staffId, this.itemId, 1], (response) => {
                    cc.log(response);
                    staffData.FavorIsCollision = false;
                    DataMgr.setResponseData(response);
                    this.sendFavorArrowMsg();
                    ClientEvents.PLAY_FAVORABLITY_ANi.emit(response);
                    ClientEvents.UPDATE_STAFF_ITEM.emit();
                });
            }
        } else {
            let itemNum: number = DataMgr.warehouseData.getItemNum(this.itemId);
            if (itemNum <= 0) {
                UIMgr.loadaccessPathList(this.itemId, FavorabilityUpView.url);
            } else {
                UIMgr.showView(GiftGivingView.url, null, this.itemId);
            }
        }
    }

    sendFavorArrowMsg() {
        if (DataMgr.userData.level < 7) {
            HttpInst.postData(NetConfig.SOFT_LED_INFO, [ArrowType.FavorArrow], (response) => {
                ClientEvents.FAVOR_ARROW.emit(false);
            });
        }
    }

    onDestroy() {
        this.dispose.dispose();
    }
}


