import {GameComponent} from "../../core/component/GameComponent";
import treasureCardJiaItem from "./treasureCardJiaItem";
import List from "../../Utils/GridScrollUtil/List";
import {ButtonMgr} from "../common/ButtonClick";
import {ResMgr} from "../../global/manager/ResManager";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {DataMgr} from "../../Model/DataManager";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {JsonMgr} from "../../global/manager/JsonManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class selfChooseTreasure extends GameComponent {
    static url: string = "treasureChest/selfChooseTreasure";
    @property(cc.ScrollView)
    awardScroll: cc.ScrollView = null;
    @property(cc.Node)
    boxNode: cc.Node = null;
    @property(cc.Node)
    boxLight: cc.Node = null;
    @property(cc.Label)
    desLable: cc.Label = null;
    @property(cc.Sprite)
    boxIcon: cc.Sprite = null;
    @property(cc.Button)
    sureBtn: cc.Button = null;
    @property(cc.Animation)
    rotateAni: cc.Animation = null;
    @property(cc.Animation)
    boomAni: cc.Animation = null;
    @property(cc.Animation)
    openAni: cc.Animation = null;
    @property(cc.Node)
    backBtn: cc.Node = null;

    private boxId: number = 0;
    private awardArr: string[] = [];

    start() {
        this.boxId = this.node["data"];
        let itemVo: IItemJson = JsonMgr.getItem(this.boxId);
        this.awardArr = itemVo.uniqueValue.split(";");
        ResMgr.imgTypeJudgment(this.boxIcon, this.boxId);
        ButtonMgr.addClick(this.backBtn, this.closeHandler);
        ButtonMgr.addClick(this.sureBtn.node, this.confirmHandler);
        this.boxAnimation();
        this.sureBtn.interactable = false;
        this.addEvent(ClientEvents.UPDATE_SURE_BTN.on(() => {
            if (DataMgr.getSelIdxArr().length == DataMgr.getSelMaxNum()) {
                this.sureBtn.interactable = true;
                this.desLable.string = "点击确定领取奖励";
            } else {
                this.desLable.string = "还可选择" + (DataMgr.getSelMaxNum() - DataMgr.getSelIdxArr().length) + "个奖励";
                this.sureBtn.interactable = false;
            }
        }))
    }

    boxAnimation() {
        let action = cc.sequence(
            cc.spawn(cc.moveTo(0.2, this.boxNode.x, this.boxNode.y + 360), cc.scaleTo(0.3, 1.1)),
            cc.moveTo(0.1, this.boxNode.x, this.boxNode.y + 340),
            cc.moveTo(0.1, this.boxNode.x, this.boxNode.y + 360),
            cc.callFunc(() => {
                this.boomAni.play();
                this.boxLight.active = true;
                this.boomAni.on(cc.Animation.EventType.FINISHED, () => {
                    this.boomAni.node.active = false;
                    let action = cc.sequence(
                        cc.scaleTo(0.4, 1.1),
                        cc.spawn(cc.moveTo(0.3, this.boxNode.x, this.boxNode.y - 380), cc.scaleTo(0.3, 0.6)),
                        cc.moveTo(0.1, this.boxNode.x, this.boxNode.y - 360),
                        cc.moveTo(0.1, this.boxNode.x, this.boxNode.y - 380),
                        cc.callFunc(() => {
                            this.awardScroll.getComponent(List).numItems = Math.ceil(this.awardArr.length / 3);
                            this.awardScroll.node.y = 600 - ((4 - Math.ceil(this.awardArr.length / 3)) * 110);
                            this.desLable.node.active = true;
                        }));
                    this.boxNode.runAction(action);
                })
            })
        );
        this.boxNode.runAction(action);
    }

    confirmHandler = () => {
        HttpInst.postData(NetConfig.OPEN_CANCHOOSE_BOX, [this.boxId, DataMgr.getSelIdxArr()], () => {
            ClientEvents.UPDATE_ITEM_HOUSE.emit();
            this.closeHandler();
        });
    };

    closeHandler = () => {
        this.closeOnly && this.closeOnly();
        DataMgr.nullSelIdxArr();
    };

    onListVRender(item: cc.Node, idx: number) {
        let action = cc.sequence(cc.fadeTo((idx + 1) * 0.5, 255), cc.callFunc(() => {
            this.openAni.node.active = true;
            this.openAni.play();
            let type: number = this.awardArr.length == 4 ? 2 : 3;
            this.openAni.on(cc.Animation.EventType.FINISHED, () => {
                this.openAni.node.active = false;
                if (idx == Math.ceil(this.awardArr.length / type)) {
                    this.rotateAni.play();
                }
            });
            let Item: treasureCardJiaItem = item.getComponent(treasureCardJiaItem);
            let awardData = [];
            let maxNum: number = idx * type + type;
            if (maxNum > this.awardArr.length) {
                maxNum = this.awardArr.length;
            }
            for (let nid = idx * type; nid < maxNum; nid++) {
                awardData.push(this.awardArr[nid]);
            }
            Item.updateItem(awardData, idx, type);
        }));
        this.node.runAction(action);
    }

    protected getBaseUrl(): string {
        return selfChooseTreasure.url;
    }

}
