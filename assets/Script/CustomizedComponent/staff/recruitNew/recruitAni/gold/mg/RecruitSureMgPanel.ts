/**
 * @author Lizhen
 * @date 2019/10/23
 * @Description:
 */
import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import { GameComponent } from "../../../../../../core/component/GameComponent";
import { RecruitResult } from "../../../../../../Model/RecruitData";
import { ARROW_DIRECTION, GuideMgr } from "../../../../../common/SoftGuide";
import { DataMgr } from "../../../../../../Model/DataManager";
import { CommonUtil } from "../../../../../../Utils/CommonUtil";
import { UIUtil } from "../../../../../../Utils/UIUtil";
import { ResManager } from "../../../../../../global/manager/ResManager";
import { JsonMgr } from "../../../../../../global/manager/JsonManager";
import { IAdvantage } from "../../../../../../types/Response";
import { UIMgr } from "../../../../../../global/manager/UIManager";
import CommonInsufficient, { InsufficientType } from "../../../../../common/CommonInsufficient";
import { Staff } from "../../../../../../Model/StaffData";
import { GuideIdType } from "../../../../../../global/const/GuideConst";
import { HttpInst } from "../../../../../../core/http/HttpClient";
import { NetConfig } from "../../../../../../global/const/NetConfig";
import {IMarketModel} from "../../../../../../Model/market/MarketDataMoudle";

@ccclass()
export class RecruitSureMgPanel extends GameComponent {
    static url: string = "Prefab/recruit/mg/RecruitSureMgPanel";
    callback: (sure: boolean) => void = null;
    private goldRectuiData: RecruitResult = null;
    private ballIndex: number = 0;

    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Label)
    costLabel: cc.Label = null;
    @property(cc.Label)
    probabilityLabel: cc.Label = null;

    @property(cc.Node)
    desNode: cc.Node = null;
    @property(cc.Label)
    tuijianLabel: cc.Label = null;
    @property(cc.Node)
    starNode: cc.Node = null;
    @property(cc.Node)
    allSHuNode: cc.Node = null;
    @property(cc.Node)
    typeNode: cc.Node = null;

    @property(cc.Node)
    colorNode: cc.Node = null;
    @property(cc.Label)
    peopleLabel: cc.Label = null;
    @property(cc.Label)
    huojiaDes: cc.Label = null;
    @property(cc.Sprite)
    huojiaIcon: cc.Sprite = null;
    @property(cc.Label)
    huojiaSY: cc.Label = null;

    @property(cc.Node)
    spineNode: cc.Node = null;

    private colorArr = [cc.color(19, 126, 189), cc.color(255, 77, 245), cc.color(206, 87, 0), cc.color(74, 188, 48)];

    getBaseUrl() {
        return RecruitSureMgPanel.url;
    }

    onEnable() {
        this.onShowPlay(2, this.node.getChildByName("bg"));
    }

    initPanel(data: RecruitResult, index: number, cb: (sure: boolean) => void, guide: boolean) {
        this.callback = cb;
        this.goldRectuiData = data;
        this.ballIndex = index;
        this.initView();
        if (guide) {
            let endSoftGuide: ISoftGuideJson = JsonMgr.getSoftGuideJsoById(GuideIdType.FunGold, 6);
            if (endSoftGuide && DataMgr.getGuideCompleteTimeById(endSoftGuide.id) <= 0) {
                HttpInst.postData(NetConfig.SOFT_LED_INFO, [endSoftGuide.id], (response) => {
                    GuideMgr.showSoftGuide(this.desNode.getChildByName("sureBtn"), ARROW_DIRECTION.TOP, endSoftGuide.displayText, null, false, 0, false, () => {
                        this.sureHandler();
                    });
                });
            }
        }
    }

    initView() {
        UIUtil.asyncSetImage(this.desNode.getComponent(cc.Sprite), ResManager.GOLD_RECTUI + "d" + this.goldRectuiData.getStar(), false);
        this.probabilityLabel.string = this.goldRectuiData.getProbability();
        this.probabilityLabel.node.color = this.colorArr[this.goldRectuiData.getStar() - 3];
        let cost: number = DataMgr.getRecruit().getRecruitGold(this.goldRectuiData.getStar());
        if (DataMgr.getRecruit().freeIndex != this.ballIndex) {
            this.costLabel.string = CommonUtil.numChange(cost);
            this.costLabel.node.color = cc.color(255, 255, 255);
        } else {
            this.costLabel.string = "免费";
            this.costLabel.node.color = cc.color(22, 74, 41);
        }
        if (this.goldRectuiData.num == 1) {
            this.nameLabel.string = this.goldRectuiData.getName();
        } else {
            this.nameLabel.string = this.goldRectuiData.getName() + "*" + this.goldRectuiData.num;
        }
        this.initDes();
    }

    initDes() {
        if (this.goldRectuiData.staff) {
            this.desNode.getChildByName("staff").active = true;
            this.tuijianLabel.string = "推荐岗位：" + this.goldRectuiData.staff.getSuggestJobName();
            this.initSpine();
            this.initStaffAttribute();
            this.initStar(this.starNode);
            this.initStarType();
        } else {
            let decoShopJson: IDecoShopJson = JsonMgr.getDecoShopJson(this.goldRectuiData.itemXmlId);
            this.desNode.getChildByName("huojia").active = true;
            this.initStar(this.colorNode);
            this.peopleLabel.string = decoShopJson.Popularity.toString();
            this.huojiaDes.string = decoShopJson.description;
            this.huojiaIcon.node.scale = 1.4;
            ResManager.getShelvesItemIcon(this.huojiaIcon, decoShopJson.icon, decoShopJson.mainType);
            this.huojiaSY.string = "基础收益:   "+IMarketModel.getSaleValue(decoShopJson).toString();
        }
    }
    initSpine() {
        let spineUrl = Staff.getStaffSpineUrl(this.goldRectuiData.staff.artResId);
        cc.loader.loadRes(spineUrl, sp.SkeletonData, null, this.onComplete);
    }
    private spine: sp.Skeleton = null;
    onComplete = (err, res) => {
        if (err) {
            cc.error(err);
            return;
        }
        if (!this.spineNode) {
            return;
        }
        this.spine = this.spineNode.getComponent('sp.Skeleton');
        this.spine.skeletonData = res;
        this.spine.setAnimation(0, "zhanli", true);
        this.spine.setSkin("weixiao");
    };
    initStaffAttribute() {
        for (let i = 0; i < this.goldRectuiData.staff.attrValues().length; i++) {
            let num: number = this.goldRectuiData.staff.attrValues()[i];
            this.allSHuNode.getChildByName("attribute" + (i + 1)).getChildByName("attr" + (i + 1)).getComponent(cc.Label).string = num.toString();
        }
    }
    initStarType() {
        let typeArray: Array<IAdvantage> = this.goldRectuiData.staff.advantages;
        if (typeArray.length == 0) {
            // this.desNode.getChildByName("staff").getChildByName("type").active = false;
        } else {
            for (let i = 0; i < typeArray.length; i++) {
                let starNode: cc.Node = new cc.Node();
                starNode.addComponent(cc.Sprite);
                starNode.parent = this.typeNode;
                UIUtil.asyncSetImage(starNode.getComponent(cc.Sprite), this.goldRectuiData.staff.getAdvantageMaxIconUrl(typeArray[i].type));
            }
        }
    }
    initStar(parentsNode: cc.Node) {
        parentsNode.width = Math.min(5, this.goldRectuiData.getStar()) * 40;
        for (let i = 0; i < Math.min(5, this.goldRectuiData.getStar()); i++) {
            let starNode: cc.Node = new cc.Node();
            starNode.addComponent(cc.Sprite);
            starNode.parent = parentsNode;
            UIUtil.asyncSetImage(starNode.getComponent(cc.Sprite), ResManager.ITEM_BOX + "xing");
        }
    }

    sureHandler() {
        let cost: number = DataMgr.getRecruit().getRecruitGold(this.goldRectuiData.getStar());
        if (DataMgr.userData.gold >= cost || DataMgr.getRecruit().freeIndex == this.ballIndex) {
            this.callback && this.callback(true);
            this.closeOnly();
        } else {
            UIMgr.showView(CommonInsufficient.url, cc.director.getScene(), InsufficientType.Gold);
        }
    }

    closeHandler() {
        this.closeOnly();
        this.callback && this.callback(false);
    }
}
