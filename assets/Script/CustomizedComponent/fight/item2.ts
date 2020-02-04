import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import {
    JsonMgr,
    ShopBattleConfig,
    ShopBattleCustomerInforConfig,
    ShopBattleTeamConfig
} from "../../global/manager/JsonManager";
import {ResMgr} from "../../global/manager/ResManager";

@ccclass()
export class item2 extends cc.Component{
    @property(cc.Sprite)
    icon:cc.Sprite = null;
    @property(cc.Sprite)
    ycIcon:cc.Sprite = null;
    @property(cc.Label)
    nameLabel:cc.Label = null;
    @property(cc.Label)
    scoreLabel:cc.Label = null;

    private itemData:ShopBattleCustomerInforConfig = null;
    private battleId:ShopBattleConfig = null;
    private fightJson:ShopBattleTeamConfig = null;
    onLoad(){
        this.node.opacity = 0;
        this.node.scaleX = 1.2;
        this.node.active = false;
    }
    public initData(data:ShopBattleCustomerInforConfig,battleId:ShopBattleConfig,isShow:boolean,cb:Function){
        this.itemData = data;
        this.battleId = battleId;
        this.fightJson =  JsonMgr.geShopBattleTeamConfig(this.battleId.staffTeamId);
        this.initView();
        if(isShow){
            this.showAni(cb);
        }else{
            this.node.active = true;
            this.node.opacity = 255;
            this.node.scaleX = 1;
            cb && cb();
        }
    }
    showAni(cb:Function){
        this.node.active = true;
        let fainIn = cc.fadeIn(0.8);
        let scale = cc.scaleTo(0.8,1);
        scale.easing(cc.easeBackOut());
        let call = cc.callFunc(()=>{
            cb && cb();
        })
        this.node.runAction(cc.sequence(cc.spawn(fainIn,scale),call));
    }
    initView(){
        ResMgr.setFightImage(this.icon, this.itemData.expressionIcon);
        this.nameLabel.string = "【"+this.fightJson.name+"】";
        this.scoreLabel.string = this.fightJson.score.toString();
    }
}
