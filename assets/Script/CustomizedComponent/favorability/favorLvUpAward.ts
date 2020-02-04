import {GameComponent} from "../../core/component/GameComponent";
import {ButtonMgr} from "../common/ButtonClick";
import List from "../../Utils/GridScrollUtil/List";
import InviteAwardItem from "../InviteActivity/InviteAwardItem";
import {AWARD_TYPE} from "../InviteActivity/InviteActivity";
import favorLvUpAwardItem from "./favorLvUpAwardItem";
import {JsonMgr} from "../../global/manager/JsonManager";
import {sleep} from "../staff/recruitNew/DiamondRecruitAni";

const {ccclass, property} = cc._decorator;

@ccclass
export default class favorLvUpAward extends GameComponent {

    static url: string = "favorability/favorLvUpAward";

    @property(sp.Skeleton)
    favorAni: sp.Skeleton = null;

    @property(cc.Node)
    sureBtn: cc.Node = null;

    @property(cc.Prefab)
    awardItem: cc.Prefab = null;

    @property(cc.ScrollView)
    private scrollNode: cc.ScrollView = null;

    startLv: number = 0;
    endLv: number = 0;
    favoeStage: number = 0;
    staffId: number = 0;
    awardFavorIdArr: number[] = [];


    start() {
        this.startLv = this.node["data"].startLv;
        this.endLv = this.node["data"].endLv;
        this.favoeStage = this.node["data"].favorStage;
        this.staffId = this.node["data"].staffId;
        this.favorAni.node.active = true;
        this.favorAni.setAnimation(0, "animation", false);
        this.favorAni.setCompleteListener(() => {
            this.favorAni.setAnimation(0, "animation2", true);
        })
        this.awardFavorIdArr = [];
        for (let i = this.startLv; i <= this.endLv; i++) {
            let favorLvJson: IFavorLevelJson = JsonMgr.getFavorLevelJson(this.favoeStage, i);
            this.awardFavorIdArr.push(favorLvJson.id);
        }
        this.scrollNode.getComponent(List).numItems = this.awardFavorIdArr.length;
        ButtonMgr.addClick(this.sureBtn, () => {
            this.closeOnly();
        })
    }

    onListVRender(item: cc.Node, idx: number) {
        let action = cc.sequence(cc.fadeTo(0.1 * (idx + 1), 255), cc.callFunc(() => {
            let awardItem: favorLvUpAwardItem = item.getComponent(favorLvUpAwardItem);
            awardItem.updateItem(this.awardFavorIdArr[idx], this.staffId);
        }))
        this.node.runAction(action);
    }

    protected getBaseUrl(): string {
        return favorLvUpAward.url;
    }

    // update (dt) {}
}
