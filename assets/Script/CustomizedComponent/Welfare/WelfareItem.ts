import List from "../../Utils/GridScrollUtil/List";
import {JsonMgr} from "../../global/manager/JsonManager";
import FavorabilityGiftItem from "../favorability/FavorabilityGiftItem";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {TimeUtil} from "../../Utils/TimeUtil";
import {ButtonMgr} from "../common/ButtonClick";
import {UIMgr} from "../../global/manager/UIManager";
import {DataMgr} from "../../Model/DataManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class WelfareItem extends cc.Component {

    @property(cc.Label)
    nameLab: cc.Label = null;

    @property(cc.Label)
    timeLab: cc.Label = null;

    @property(cc.Node)
    desLab: cc.Node = null;

    @property(cc.Node)
    jumpBtn: cc.Node = null;

    @property(cc.Node)
    isReceived: cc.Node = null;

    @property(cc.ScrollView)
    awardScroll: cc.ScrollView = null;

    awardList = [];
    adverData = null;
    jumpId: number = 0;

    // onLoad () {}

    start() {
        ButtonMgr.addClick(this.jumpBtn, this.jump)
    }

    updateItem(data) {
        this.awardList = [];
        this.jumpId = data.jump;
        this.nameLab.string = data.name;
        HttpInst.postData(NetConfig.ADVER_AWARD_COUNTS, [data.id], (res) => {
            if (!this.timeLab) return;
            this.adverData = res;
            if (data.advType == 7) {
                this.awardList.push({
                    xmlId: this.adverData.maxSale.xmlId,
                    number: this.adverData.maxSale.num
                });
                let allCount: number = data.count;
                if (this.adverData.isVip) {
                    allCount = data.count + data.vipcount;
                }
                this.jumpBtn.active = this.adverData.adCount < allCount;
                if (this.adverData.adCount >= allCount) {
                    this.isReceived.active = true;
                    cc.log(JSON.stringify(this.adverData));
                    this.timeLab.string = "明日" + TimeUtil.getDataHour(this.adverData.timeEnd) + "点刷新";
                } else {
                    this.timeLab.string = "今日领取次数:" + this.adverData.adCount + "/" + allCount;
                }
            } else {
                if (this.adverData.adCount >= data.count) {
                    this.isReceived.active = true;
                    this.timeLab.string = "明日" + TimeUtil.getDataHour(this.adverData.timeEnd) + "点刷新";
                } else {
                    this.timeLab.string = "今日领取次数:" + this.adverData.adCount + "/" + data.count;
                }
                this.jumpBtn.active = this.adverData.adCount < data.count;
                if (data.rewardType == 1) {
                    this.desLab.active = true;
                    if (data.reward1)
                        this.awardList = JsonMgr.getDropArrByDropId(data.reward1);
                } else {
                    if (data.reward2) {
                        let strList = data.reward2.split(";");
                        for (let i in strList) {
                            this.awardList.push({
                                xmlId: Number(strList[i].split(",")[0]),
                                number: Number(strList[i].split(",")[1])
                            });
                        }
                    }
                }

            }
            this.awardList.sort((a, b) => {
                let colorA: number = JsonMgr.getInformationAndItem(a.xmlId).color;
                let colorB: number = JsonMgr.getInformationAndItem(b.xmlId).color;
                if (colorA != colorB)
                    return colorB - colorA;
                else
                    return b.xmlId - a.xmlId;
            });
            this.awardScroll.getComponent(List).numItems = this.awardList.length;
            if (this.awardList.length <= 4) {
                this.awardScroll.node.width = 70 * this.awardList.length;
            } else {
                this.awardScroll.node.width = 330;
            }
        });
    }

    jump = () => {
        ClientEvents.CLOSE_WELFARE_VIEW.emit();
        if (this.jumpId > 0) {  //跳转界面
            ClientEvents.EVENT_OPEN_UI.emit(this.jumpId);
        } else {                //电影院场景
            UIMgr.resetViewToMovie();
        }
    }

    onListVRender(item: cc.Node, idx: number) {
        let awardItem: FavorabilityGiftItem = item.getComponent(FavorabilityGiftItem);
        awardItem.node.setScale(1.1);
        awardItem.setFontSize(18);
        awardItem.updateItem(this.awardList[idx].xmlId, this.awardList[idx].number);
    }

    // update (dt) {}
}
