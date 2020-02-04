/**
 * @author Lizhen
 * @date 2019/9/27
 * @Description:
 */
import {FriendRecruitResult} from "../../../../../../Model/RecruitData";
import {GameComponent} from "../../../../../../core/component/GameComponent";
import {DataMgr} from "../../../../../../Model/DataManager";
import {CommonUtil} from "../../../../../../Utils/CommonUtil";
import {UIUtil} from "../../../../../../Utils/UIUtil";
import {ResManager} from "../../../../../../global/manager/ResManager";
import {JsonMgr} from "../../../../../../global/manager/JsonManager";
import {IAdvantage} from "../../../../../../types/Response";
import {Staff} from "../../../../../../Model/StaffData";
import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import Color = cc.Color;
import {IMarketModel} from "../../../../../../Model/market/MarketDataMoudle";

const RATE_COLORS: Array<cc.Color> = [
    new Color(50, 182, 194),
    new Color(210, 106, 180),
    new Color(255, 150, 0),
    new Color(243, 208, 91),
];

@ccclass()
export class FriendRecruitSurePanel extends GameComponent {
    static url: string = "Prefab/recruit/friend/FriendRecruitSurePanel";
    sureCb: Function = null;
    private goldRectuiData: FriendRecruitResult = null;
    private ballIndex: number = 0;

    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Label)
    costLabel: cc.Label = null;
    @property(cc.Label)
    friendCostLabel: cc.Label = null;
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
        return FriendRecruitSurePanel.url;
    }

    onEnable() {
        this.onShowPlay(2, this.node.getChildByName("bg"));
    }

    initPanel(data: FriendRecruitResult, index: number, cb: Function) {
        this.sureCb = cb;
        this.goldRectuiData = data;
        this.ballIndex = index;
        this.initView();
    }

    initView() {
        this.probabilityLabel.string = this.goldRectuiData.getProbability();
        this.probabilityLabel.node.color = this.colorArr[this.goldRectuiData.getStar() - 3];
        if (this.goldRectuiData.num == 1) {
            this.nameLabel.string = this.goldRectuiData.getName();
        } else {
            this.nameLabel.string = this.goldRectuiData.getName() + "*" + this.goldRectuiData.num;
        }
        this.initCost();
        this.initDes();
    }

    initCost() {
        let cost: string = DataMgr.getFriendRecruit().getRecruitGold(this.goldRectuiData.getStar(), this.ballIndex);
        let costArr = cost.split(";");
        this.costLabel.string = CommonUtil.numChange(Number(costArr[1].split(",")[1]));
        this.friendCostLabel.string = CommonUtil.numChange(Number(costArr[0].split(",")[1]));
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
        if(!this.spineNode){
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
        for (let i = 0; i < Math.min(5, this.goldRectuiData.getStar()); i++) {
            let starNode: cc.Node = new cc.Node();
            starNode.addComponent(cc.Sprite);
            starNode.parent = parentsNode;
            UIUtil.asyncSetImage(starNode.getComponent(cc.Sprite), ResManager.ITEM_BOX + "xing");
        }
    }

    sureHandler() {
        this.sureCb && this.sureCb();
        this.closeHandler();
    }

    closeHandler() {
        this.spine = null;
        this.node.removeFromParent(true);
    }
}