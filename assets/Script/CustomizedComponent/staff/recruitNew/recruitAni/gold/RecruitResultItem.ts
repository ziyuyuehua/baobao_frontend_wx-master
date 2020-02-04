/**
 * @author Lizhen
 * @date 2019/9/24
 * @Description:
 */
import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import {ResManager, ResMgr} from "../../../../../global/manager/ResManager";
import {JsonMgr} from "../../../../../global/manager/JsonManager";
import {GameComponent} from "../../../../../core/component/GameComponent";
import {UIUtil} from "../../../../../Utils/UIUtil";

@ccclass()
export class RecruitResultItem extends GameComponent{
    static url:string = "Prefab/recruit/RecruitResultItem";
    @property(cc.Sprite)
    icon:cc.Sprite = null;
    @property(cc.Sprite)
    type:cc.Sprite = null;
    @property(cc.Label)
    num:cc.Label = null;
    getBaseUrl() {
        return RecruitResultItem.url;
    }
    onEnable() {
    }
    initView(id:number,num:number){
        ResMgr.imgTypeJudgment(this.icon, id);
        this.num.string = num.toString();

        let json = JsonMgr.getInformationAndItem(id);
        ResMgr.getItemBox(this.type, "k" + json.color);

        UIUtil.asyncSetImage(this.node.getChildByName("itemBg").getComponent(cc.Sprite),ResManager.platformPath("images/staff/recruit/recruitresult/recruit_big_"+json.color));

        this.type.node.scale = 0.2;
        let scaleBg = cc.scaleTo(0.5,1);
        scaleBg.easing(cc.easeBackOut());
        this.type.node.runAction(cc.sequence(cc.delayTime(0),scaleBg));
    }
}
