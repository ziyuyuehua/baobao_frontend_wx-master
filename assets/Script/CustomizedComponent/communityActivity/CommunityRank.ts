import {GameComponent} from "../../core/component/GameComponent";
import {UIMgr} from "../../global/manager/UIManager";
import {IAssistRankItem, IUserBaseItem, IAssistRankInfo} from "../../types/Response";
import List from "../../Utils/GridScrollUtil/List";
import {ButtonMgr} from "../common/ButtonClick";
import CommunityGift from "./CommunityGift";
import CommunityRankItem from "./CommunityRankItem";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {DataMgr, SHARE_TYPE} from "../../Model/DataManager";
import {DotInst, COUNTERTYPE} from "../common/dotClient";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {topUiType} from "../MainUiTopCmpt";
import {TextTipConst} from "../../global/const/TextTipConst";
import {JsonMgr} from "../../global/manager/JsonManager";
import {GameManager} from "../../global/manager/GameManager";

// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

export enum RankType {
    Community = 2,
    AllPoint = 1,
}

@ccclass
export default class CommunityRank extends GameComponent {
    static url: string = "CommunityActivity/CommunityRank"

    @property(cc.Node)
    aniNode: cc.Node = null;

    @property(cc.Node)
    returnBtn: cc.Node = null;

    @property(cc.Node)
    communityTab: cc.Node = null;

    @property(cc.Node)
    bg: cc.Node = null;

    @property(cc.Node)
    AllPointTab: cc.Node = null;

    @property(cc.Node)
    AllPointLab: cc.Node = null;

    @property(cc.Node)
    AllPointLab2: cc.Node = null;

    @property(cc.ScrollView)
    communityView: cc.ScrollView = null;

    @property(cc.Layout)
    AllPointView: cc.Layout = null;

    @property(cc.Prefab)
    AllPointPrefab: cc.Prefab = null;

    @property(cc.Node)
    tipNode: cc.Node = null;

    @property(cc.Label)
    tipLabel: cc.Label = null;

    @property(cc.Node)
    giftNode: cc.Node = null;

    @property(cc.Node)
    shareNode: cc.Node = null;

    private curChose: number = RankType.Community;
    private isInRank: boolean = false;
    private communityDataVo: IAssistRankItem[] = [];   //社区排行数据
    private allPointDataVo: IAssistRankItem = null;   //社区排行数据
    static showRankPro: boolean = false;

    getBaseUrl() {
        return CommunityRank.url
    }

    onEnable() {
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.ordinary);
        this.onShowPlay(2, this.aniNode);
    }

    onDisable(): void {
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.ordinary);
    }

    onLoad() {
        ButtonMgr.addClick(this.returnBtn, () => {
            DotInst.clientSendDot(COUNTERTYPE.communityActive, "3518");
            this.closeOnly()
        });
        ButtonMgr.addClick(this.communityTab, this.communityTabHandler);
        ButtonMgr.addClick(this.AllPointTab, this.AllPointTabHandler);
        ButtonMgr.addClick(this.tipNode, this.tipHandler);
        ButtonMgr.addClick(this.giftNode, this.openGiftHandler);
        ButtonMgr.addClick(this.shareNode, this.shareHandler)
    }

    shareHandler = () => {
        DotInst.clientSendDot(COUNTERTYPE.share, "14003");
        let shareJs: IShareJson = JsonMgr.getShareJsonByType(SHARE_TYPE.rank);
        GameManager.WxServices.shareGame(shareJs.word, shareJs.pictrue);
    };

    openGiftHandler = () => {
        DotInst.clientSendDot(COUNTERTYPE.communityActive, "3517")
        UIMgr.showView(CommunityGift.url);
    }

    tipHandler = () => {
        if (this.curChose == RankType.Community) {
            UIMgr.showTextTip(TextTipConst.communityRankTip);
        } else if (this.curChose == RankType.AllPoint) {
            UIMgr.showTextTip(TextTipConst.allPointTip);
        }
    }

    communityTabHandler = () => {
        if (this.curChose == RankType.Community) {
            return;
        }
        DotInst.clientSendDot(COUNTERTYPE.communityActive, "3512", "1")
        this.curChose = RankType.Community;
        this.updateTabbarView();
    }


    AllPointTabHandler = () => {
        if (this.curChose == RankType.AllPoint) {
            return;
        }
        DotInst.clientSendDot(COUNTERTYPE.communityActive, "3512", "2")
        this.curChose = RankType.AllPoint
        this.updateTabbarView();
    }


    setTabbar(state) {
        this.communityTab.getChildByName("chose").active = state;
        this.communityTab.getChildByName("unchose").active = !state;
        this.AllPointLab.active = state;
        this.communityTab.zIndex = state ? 1 : -1;
        this.AllPointTab.getChildByName("chose").active = !state;
        this.AllPointTab.getChildByName("unchose").active = state;
        this.AllPointLab2.active = !state;
        this.AllPointTab.zIndex = !state ? 1 : -1;
        this.communityView.node.active = state;
        this.AllPointView.node.active = !state;
        this.giftNode.active = !state;
        if (state) {
            this.returnBtn.x = 0
        } else {
            this.returnBtn.x = -118
        }

        HttpInst.postData(NetConfig.ASSIST_RANK, [state], (res: any) => {
            let result = <IAssistRankInfo>res.assistanceRank;
            cc.log("result:{}", result);
            this.communityDataVo = result.list;
            if (this.communityDataVo[0]) {
                CommunityRank.showRankPro = this.communityDataVo[0].degree > 0 ? true : false;
            }
            if (state) {
                this.tipLabel.string = "贡献度达到100%之后，仍可继续协助参与排行";
                this.updateCommUnityView();
            } else {
                this.updateAllPointView();
                this.communityDataVo.forEach((key) => {
                    if (key.member.userId == DataMgr.userData.id) {
                        this.isInRank = true;
                        this.allPointDataVo = key;
                    }
                })
                if (this.allPointDataVo) {
                    if (this.allPointDataVo.rewardId == 0) {
                        this.tipLabel.string = "当前" + this.communityDataVo[3].rank + "名之前，可在活动结束时领取全球奖励";
                    } else if (this.allPointDataVo.rank != 1 && this.allPointDataVo.rewardId != this.communityDataVo[0].rewardId && this.allPointDataVo.rewardId != 0) {
                        for (let i = this.communityDataVo.length - 1; i >= 0; i--) {
                            if (this.communityDataVo[i].rewardId != this.allPointDataVo.rewardId) {
                                this.tipLabel.string = "当前" + this.communityDataVo[i].rank + "名之前，可在活动结束时领取更高档奖励";
                                break;
                            }
                        }
                    } else {
                        if (this.allPointDataVo.rewardId == this.communityDataVo[0].rewardId) {
                            for (let i = 0; i < this.communityDataVo.length; i++) {
                                if (this.communityDataVo[i].rewardId != this.communityDataVo[0].rewardId) {
                                    this.tipLabel.string = "当前" + this.communityDataVo[i - 1].rank + "名之前，可在活动结束时领取最高档奖励";
                                    break;
                                }
                            }
                        }
                    }
                } else {
                    this.tipLabel.string = "当前" + this.communityDataVo[this.communityDataVo.length - 1].rank + "名之前，可在活动结束时领取全球奖励";
                }
            }
        });
    }

    updateTabbarView() {
        this.communityDataVo = [];
        if (this.curChose == RankType.Community) {
            this.setTabbar(true);
        } else if (this.curChose == RankType.AllPoint) {
            this.setTabbar(false);
        }

    }

    updateCommUnityView() {
        let scrollList: List = this.communityView.getComponent(List);
        scrollList.numItems = this.communityDataVo.length;
    }

    updateAllPointView() {
        this.AllPointView.node.removeAllChildren();
        DataMgr.activityModel.resetMaxProNum();
        // cc.log("communityDataVo:{}", this.communityDataVo);
        // cc.log("showRankPro:" + CommunityRank.showRankPro);
        for (let index = 0; index < this.communityDataVo.length; index++) {
            let node = cc.instantiate(this.AllPointPrefab);
            let rankItem: CommunityRankItem = node.getComponent(CommunityRankItem);
            rankItem.updateItem(this.communityDataVo[index], this.curChose, index, CommunityRank.showRankPro);
            this.AllPointView.node.addChild(node);
        }
    }

    start() {
        this.updateTabbarView();
    }

    onlistVHandler(item: cc.Node, idx: number) {
        let rankItem: CommunityRankItem = item.getComponent(CommunityRankItem);
        // cc.log("communityDataVo:{}", this.communityDataVo);
        // cc.log("showRankPro:" + CommunityRank.showRankPro);
        rankItem.updateItem(this.communityDataVo[idx], this.curChose, idx, CommunityRank.showRankPro, this.communityDataVo[0]);
    }

    // update (dt) {}
}
