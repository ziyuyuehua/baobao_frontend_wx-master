import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import {ShopBattleConfig, ShopBattleCustomerInforConfig} from "../../global/manager/JsonManager";
import {ResMgr} from "../../global/manager/ResManager";

@ccclass()
export class item1 extends cc.Component{
    @property(cc.Sprite)
    icon:cc.Sprite = null;
    @property(cc.Label)
    label:cc.Label = null;
    @property(cc.Node)
    labelBg:cc.Node = null;

    private itemData:ShopBattleCustomerInforConfig = null;
    private battleId:ShopBattleConfig = null;
    onLoad(){
        this.node.opacity = 0;
        this.node.scaleX = 1.2;
        this.node.active = false;
    }
    public initData(data:ShopBattleCustomerInforConfig,battleId:ShopBattleConfig,isShow:boolean,cb:Function){
        this.itemData = data;
        this.battleId = battleId;
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
        cc.log(this.itemData.expressionIcon);
        ResMgr.setFightImage(this.icon, this.itemData.expressionIcon);
        this.label.string = this.itemData.CopyWriting;
        this.setLabelBg();
    }
    setLabelBg(){
        switch (this.itemData.chatType){
            case 1:
                ResMgr.setFightImage(this.labelBg.getComponent(cc.Sprite), "whiteBg", false, (spr:cc.SpriteFrame)=>{
                    if(this.itemData && this.itemData.CopyWriting.length <= 15){
                        this.labelBg.width = 10+this.itemData.CopyWriting.length*35;
                        this.label.node.y = -40;
                    }
                });
                break;
            case 2:
                ResMgr.setFightImage(this.labelBg.getComponent(cc.Sprite), "blackBg",false, (spr:cc.SpriteFrame)=>{
                    this.label.node.color = new cc.Color(255, 255, 255);
                    if(this.itemData && this.itemData.CopyWriting.length <= 15){
                        this.labelBg.width = 10+this.itemData.CopyWriting.length*35;
                        this.label.node.y = -40;
                    }
                });
                break;
        }
    }
}
