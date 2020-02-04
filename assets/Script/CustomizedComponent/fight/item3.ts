import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import {ShopBattleConfig, ShopBattleCustomerInforConfig} from "../../global/manager/JsonManager";
import {UIUtil} from "../../Utils/UIUtil";
import {ResMgr} from "../../global/manager/ResManager";
import {itemPre} from "./itemPre";
import {Staff} from "../../Model/StaffData";

@ccclass()
export class item3 extends cc.Component{
    @property(cc.Sprite)
    icon:cc.Sprite = null;
    @property(cc.Sprite)
    staffIcon:cc.Sprite = null;
    @property(cc.Label)
    nameLabel:cc.Label = null;
    @property(cc.Node)
    bg:cc.Node = null;
    @property(cc.Prefab)
    rewardItem:cc.Prefab = null;

    private itemData:ShopBattleCustomerInforConfig = null;
    private battleId:ShopBattleConfig = null;

    private onePos = [cc.v2(80,-230)];
    private twoPos = [cc.v2(30,-230),cc.v2(125,-230)];
    private threePos = [cc.v2(80,-220),cc.v2(30,-245),cc.v2(125,-245)];
    private fourPos = [cc.v2(30,-220),cc.v2(125,-220),cc.v2(30,-245),cc.v2(125,-245)];
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
        this.initRewards();
        ResMgr.setFightImage(this.icon, this.itemData.expressionIcon);
        this.nameLabel.string = this.battleId.name;

        this.node.getChildByName("gkah").getComponent(cc.Label).node.color = new cc.Color(211, 116, 40);

        UIUtil.asyncSetImage(this.staffIcon, Staff.getStaffAvataUrlByResId(this.battleId.headIcon));

        switch (this.battleId.postId){
            case 0:
                this.node.getChildByName("gkah").getComponent(cc.Label).node.color = new cc.Color(211, 116, 40);
                this.node.getChildByName("gkah").getComponent(cc.Label).string = "收银员";
                break;
            case 1:
                this.node.getChildByName("gkah").getComponent(cc.Label).node.color = new cc.Color(88, 153, 0);
                this.node.getChildByName("gkah").getComponent(cc.Label).string = "售货员";
                break;
            case 2:
                this.node.getChildByName("gkah").getComponent(cc.Label).node.color = new cc.Color(208, 39, 37);
                this.node.getChildByName("gkah").getComponent(cc.Label).string = "揽客员";
                break;
            case 3:
                this.node.getChildByName("gkah").getComponent(cc.Label).node.color = new cc.Color(16, 130, 235);
                this.node.getChildByName("gkah").getComponent(cc.Label).string = "理货员";
                break;
        }

        switch (this.battleId.advantageId){
            case 1:
                this.node.getChildByName("tsjc").getComponent(cc.Label).node.color = new cc.Color(147, 11, 129);
                this.node.getChildByName("tsjc").getComponent(cc.Label).string = "海报推销员";
                break;
            case 2:
                this.node.getChildByName("tsjc").getComponent(cc.Label).node.color = new cc.Color(88, 153, 0);
                this.node.getChildByName("tsjc").getComponent(cc.Label).string = "书籍推销员";
                break;
            case 3:
                this.node.getChildByName("tsjc").getComponent(cc.Label).node.color = new cc.Color(208, 39, 37);
                this.node.getChildByName("tsjc").getComponent(cc.Label).string = "T恤推销员";
                break;
            case 4:
                this.node.getChildByName("tsjc").getComponent(cc.Label).node.color = new cc.Color(211, 116, 40);
                this.node.getChildByName("tsjc").getComponent(cc.Label).string = "抱枕推销员";
                break;
            case 5:
                this.node.getChildByName("tsjc").getComponent(cc.Label).node.color = new cc.Color(16, 130, 235);
                this.node.getChildByName("tsjc").getComponent(cc.Label).string = "光盘推销员";
                break;
        }
    }
    initRewards(){
        let arr = this.battleId.reward.split(";");
        let posArr = [];
        if(arr.length == 1){
            posArr = this.onePos;
        }else if(arr.length == 2){
            posArr = this.twoPos;
        }else if(arr.length == 3){
            posArr = this.threePos;
        }else if(arr.length == 4){
            posArr = this.fourPos;
        }
        for(let i = 0;i<arr.length;i++){
            let rewArr = arr[i].split(",");
            let rewardItem = cc.instantiate(this.rewardItem);
            rewardItem.parent = this.bg;
            rewardItem.setPosition(posArr[i]);
            let component:itemPre = rewardItem.getComponent(rewardItem.name);
            component.initView(parseInt(rewArr[0]),parseInt(rewArr[1]))
        }
    }
}
