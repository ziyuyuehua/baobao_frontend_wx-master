/**
 * @author Lizhen
 * @date 2019/9/18
 * @Description:
 */
import {GameComponent} from "../../core/component/GameComponent";
import {PostsModel} from "../../Model/staff/PostsModel";
import {JobType} from "../../Model/StaffData";
import {DataMgr} from "../../Model/DataManager";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;

@ccclass()
export class ChoiceShopItem extends GameComponent{
    static url: string = "Prefab/fight/ChoiceShopItem";

    private itemData:PostsModel = null;

    @property(cc.Label)
    shopNameLabel:cc.Label = null;
    @property(cc.Label)
    indexLabel:cc.Label = null;
    @property(cc.Node)
    selectNode:cc.Node = null;

    @property(cc.Label)
    syLabel:cc.Label = null;
    @property(cc.Label)
    lihLabel:cc.Label = null;
    @property(cc.Label)
    lhLabel:cc.Label = null;
    @property(cc.Label)
    shLabel:cc.Label = null;
    getBaseUrl(){
        return ChoiceShopItem.url;
    }
    load(){
        this.addEvent(ClientEvents.REFUSE_SHOP_CHOICE.on(this.initSelect.bind(this)));
    }
    init(data: PostsModel, index: number, cb: Function) {
        this.itemData = data;
        this.initView();
        this.initSelect();
        cb && cb();
    }
    initView(){
        this.shopNameLabel.string = this.itemData.marketId+"的店铺名字";
        this.indexLabel.string = this.itemData.marketId.toString();
        this.shLabel.string = Math.floor(this.itemData.getPost(JobType.saleman).sumScore).toString();
        this.lihLabel.string = Math.floor(this.itemData.getPost(JobType.tallyman).sumScore).toString();
        this.syLabel.string = Math.floor(this.itemData.getPost(JobType.cashier).sumScore).toString();
        this.lhLabel.string = Math.floor(this.itemData.getPost(JobType.touter).sumScore).toString();
    }
    initSelect(){
        if(DataMgr.fightViewData.shopSelect == this.itemData.marketId){
            this.selectNode.active = true;
        }else{
            this.selectNode.active = false;
        }
    }
    choiceHandler(){
        DataMgr.fightViewData.shopSelect = this.itemData.marketId;
        ClientEvents.REFUSE_SHOP_CHOICE.emit();
    }
}