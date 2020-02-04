import {IAssistRankItem, IRespData, IUserBaseItem} from "../../types/Response";
import {DataMgr} from "../../Model/DataManager";
import CommunityRank, {RankType} from "./CommunityRank";
import {UIUtil} from "../../Utils/UIUtil";
import {IncidentConf} from "../../Model/incident/jsonconfig/IncidentConf";
import {JsonMgr} from "../../global/manager/JsonManager";
import CommonSimItem from "../common/CommonSimItem";
import {CommonUtil, Reward} from "../../Utils/CommonUtil";
import {ResMgr} from "../../global/manager/ResManager";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {UIMgr} from "../../global/manager/UIManager";
import {MapMgr} from "../MapShow/MapInit/MapManager";
import FriendsScene from "../friends/friendsScene";
import FriendsList from "../friendsList/friendsList";
import CommunityActive from "./CommunityActive";
import {CompositeDisposable} from "../../Utils/event-kit";
import {DotInst, COUNTERTYPE} from "../common/dotClient";
import array = cc.js.array;
import {TextTipConst} from "../../global/const/TextTipConst";

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

@ccclass
export default class CommunityRankItem extends cc.Component {

    @property(cc.Label)
    rankLab: cc.Label = null;

    @property(cc.Label)
    rankName: cc.Label = null;

    @property(cc.Sprite)
    rankHead: cc.Sprite = null;

    @property(cc.Sprite)
    rankPro: cc.Sprite = null;

    @property(cc.Label)
    rankProLab: cc.Label = null;

    @property(cc.Layout)
    rankGiftLayout: cc.Layout = null;

    @property(cc.Prefab)
    rankGiftPrefab: cc.Prefab = null;

    @property(cc.Sprite)
    AllrankBg: cc.Sprite = null;

    @property(cc.Sprite)
    CommUtiyRankBg: cc.Sprite = null;

    @property(cc.Node)
    HeadTipsBtn: cc.Node = null;

    @property(cc.Button)
    visitTipsBtn: cc.Button = null;
    @property(cc.Button)
    followTipsBtn: cc.Button = null;

    @property(cc.Sprite)
    followTipsImg: cc.Sprite = null;

    @property(cc.Sprite)
    bgImg: cc.Sprite = null;

    @property(cc.Sprite)
    bgImg2: cc.Sprite = null;

    @property(cc.Sprite)
    oneselfTipsImg: cc.Sprite = null;

    @property(cc.SpriteFrame)
    private sf: Array<cc.SpriteFrame> = [];
    protected dispose: CompositeDisposable = new CompositeDisposable();
    isFocus: boolean;
    userId: number;
    index: number;
    degree: number;

    start() {

    }

    onLoad() {
        this.dispose.add(ClientEvents.COMMUNITY_RANK_TIPS.on(this.clearTips));
        this.rankHead.node.on(cc.Node.EventType.TOUCH_END, this.HeadTipsBtnClick);
        this.HeadTipsBtn.on(cc.Node.EventType.TOUCH_END, this.cancleTip);
        this.followTipsBtn.node.on("click", this.onfollowTips);
        this.visitTipsBtn.node.on("click", this.onVist);
    }

    private HeadTipsBtnClick = () => {
        DotInst.clientSendDot(COUNTERTYPE.communityActive, "3513", this.userId + "");
        if (this.userId != DataMgr.userData.id) {
            this.HeadTipsBtn.active = !this.HeadTipsBtn.active;
            ClientEvents.COMMUNITY_RANK_TIPS.emit(this.index);
        }
    };

    clearTips = (index) => {
        if (this.index != index) {
            if (this.HeadTipsBtn) {
                this.HeadTipsBtn.active = false;
            }
        }
    };


    onfollowTips = () => {
        DotInst.clientSendDot(COUNTERTYPE.communityActive, "3515", this.userId + "");
        if (this.isFocus) {
            HttpInst.postData(NetConfig.QUXIAOGUANZHU, [this.userId], (res: any) => {
                if (DataMgr.friendData && DataMgr.friendData.id == this.userId) {
                    DataMgr.friendData.friendFocus = false;
                }
                this.isFocus = false;
                DataMgr.loadFocusData(res);
                ClientEvents.EVENT_ADD_FRIEND.emit();
                UIMgr.showTipText(TextTipConst.CACLEGUANSUC);
                this.followTipsImg.spriteFrame = this.sf[0];
            })
        } else {
            {
                HttpInst.postData(NetConfig.GUANZHU, [this.userId], (res: any) => {
                    if (DataMgr.friendData && DataMgr.friendData.id == this.userId) {
                        DataMgr.friendData.friendFocus = true;
                    }
                    this.isFocus = true;
                    DataMgr.loadFocusData(res);
                    ClientEvents.EVENT_ADD_FRIEND.emit();
                    UIMgr.showTipText(TextTipConst.GUANGZHUSUC);
                    this.followTipsImg.spriteFrame = this.sf[1];
                });
            }
        }
    };

    onVist = () => {
        DotInst.clientSendDot(COUNTERTYPE.communityActive, "3514", this.userId + "");
        // cc.log("userId:" + this.userId);
        let marketId = DataMgr.iMarket.getMarketId();
        HttpInst.postData(NetConfig.VISIT_FRIEND, [this.userId, 1], (resp: IRespData) => {
            UIMgr.closeView(CommunityRank.url);
            UIMgr.closeView(CommunityActive.url);
            UIMgr.setHideCommunity(true);
            MapMgr.goOtherUserHouse(marketId);
            DataMgr.stopPolling();
            setTimeout(() => {
                UIMgr.showView(FriendsScene.url, null, null, (node: cc.Node) => {
                    node.getComponent(FriendsScene).loadFriends(resp);
                    node.zIndex = 99;
                    let node1: cc.Node = UIMgr.getView(FriendsList.url);
                    if (!node1) return;
                    node1.getChildByName("maskNode").active = false;
                });
            }, 900);

        });
    };


    cancleTip = () => {
        if (this.HeadTipsBtn) {
            this.HeadTipsBtn.active = false;
        }
    };
    focusFriend = () => {
        if (this.isFocus) {
            HttpInst.postData(NetConfig.QUXIAOGUANZHU, [this.userId], () => {
                this.isFocus = false;
                this.followTipsImg.spriteFrame = this.sf[1];
            });
        } else {
            HttpInst.postData(NetConfig.GUANZHU, [this.userId], () => {
                this.isFocus = true;
                this.followTipsImg.spriteFrame = this.sf[1];
            });
        }
    };


    updateItem(dataVo: IAssistRankItem, curChose: RankType, index: number, isShowRankPro: boolean, firstDataVo?: IAssistRankItem) {
        if (this.index !== index) {
            this.cancleTip();
        }
        this.index = index;
        let userBase: IUserBaseItem = dataVo.member;
        this.isFocus = dataVo.focus;
        this.userId = userBase.userId;
        this.degree = dataVo.degree;
        if (userBase.avatar && userBase.avatar != "") {
            UIUtil.loadUrlImg(userBase.avatar, this.rankHead);
        } else {
            ResMgr.setMainUIIcon(this.rankHead, "mrtx");
        }
        let name = userBase.nickName;
        this.rankName.string = name.length > 4 ? name.slice(0,3) + "..." : name;
        this.rankLab.string = dataVo.rank + "";
        this.followTipsImg.spriteFrame = this.isFocus == true ? this.sf[1] : this.sf[0];
        this.oneselfTipsImg.node.active = this.userId == DataMgr.userData.id;// ? true : false;
        switch (curChose) {
            case RankType.Community:
                this.updateGiftCommunity(dataVo, firstDataVo);
                this.rankPro.node.active = isShowRankPro;
                break;
            case RankType.AllPoint:
                this.updateAllPointItem(dataVo);
                this.rankPro.node.active = false;
                break
        }
        this.followTipsBtn.node.active = !(this.userId <= 0);
        // if (this.userId <= 0) {
        // } else {
        //     this.followTipsBtn.node.active = true;
        // }
        // if (this.index % 2 == 0) {
        //     this
        // }
        // cc.log("是否显示进度条:"+isShowRankPro);
        // this.rankPro.node.active = isShowRankPro;
        this.bgImg.node.active = this.index % 2 == 0;// ? true : false;
        this.bgImg2.node.active = !this.bgImg.node.active;
    }

    updateGiftCommunity(dataVo: IAssistRankItem, firstDataVo?: IAssistRankItem) {
        let maxNum = DataMgr.activityModel.getMaxIndicient();
        let pro = 0;
        if (firstDataVo) {
            if (dataVo.member.userId == firstDataVo.member.userId) {
                pro = 1;
            } else {
                pro = dataVo.degree / firstDataVo.degree;
            }
            this.rankPro.node.setScale(pro, 1);
        }
        if (maxNum) {
            pro = dataVo.degree / maxNum;
        }
        if (pro == 0) {
            this.rankProLab.string = dataVo.degree + "";
        } else {
            this.rankProLab.string = dataVo.degree + "(" + (pro * 100).toFixed(1) + "%)";
        }

        let incidentId = DataMgr.activityModel.getIncidentId();
        let conf: IncidentConf = JsonMgr.getIncidentById(incidentId);
        let rewardId: number = conf.getassistanceRankReward();
        let rewardJson: IAssistanceRewardJson = JsonMgr.getIncidentRankRewardByType(rewardId, RankType.Community, dataVo.rank);
        this.updateBgState(true);
        this.updateGiftLayout(rewardJson.reward);
    }

    updateAllPointItem(dataVo: IAssistRankItem) {

        let pro = DataMgr.activityModel.getRankPro(dataVo.degree);
        this.rankPro.node.setScale(pro, 1);
        if (DataMgr.activityModel.getMaxProNum() == 0) {
            this.rankProLab.string = "暂无贡献";
        } else {
            this.rankProLab.string = dataVo.degree + "";
        }

        let rank = dataVo.rank;
        if (rank <= 3) {
            this.updateBgState(false);
            ResMgr.getItemIcon(this.AllrankBg, "rank" + rank)
        } else {
            this.updateBgState(true);
        }
        let rewardId = dataVo.rewardId;
        if (rewardId > 0) {
            let rewardJson: IAssistanceRewardJson = JsonMgr.getIncidentRankRewardById(rewardId);
            this.updateGiftLayout(rewardJson.reward);
        }
    }

    updateGiftLayout(reward: string) {
        let rewards: Reward[] = CommonUtil.toRewards(reward);
        this.rankGiftLayout.node.removeAllChildren();
        for (let index = 0; index < rewards.length; index++) {
            let node = cc.instantiate(this.rankGiftPrefab);
            let simItem: CommonSimItem = node.getComponent(CommonSimItem);
            simItem.setDotId(3516);
            simItem.updateItem(rewards[index].xmlId, rewards[index].number);
            this.rankGiftLayout.node.addChild(node);
        }
    }

    updateBgState(state) {
        this.CommUtiyRankBg.node.active = state;
        this.AllrankBg.node.active = !state;
    }

    // update (dt) {}
}
