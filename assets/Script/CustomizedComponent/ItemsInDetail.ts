import {JsonMgr} from "../global/manager/JsonManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ItemsInDetail extends cc.Component {
    //售卖货物
    private goods: string =null;

    onLoad () {
        this.loadFurniture();
    }

    start () {

    }

    // update (dt) {}


    //加载详细数据
    loadFurniture = () => {

        let FurnitureJson = JsonMgr.getFurniture(1);

        //返回按钮
        cc.find("fanhuiButton",this.node).on("click", () => {
            this.node.destroy();
        });

        //摆放按钮
        cc.find("baifangButton",this.node).on("click", () => {
            this.node.destroy();
        });

        //家具名称
        cc.find("furnitureNameLabel",this.node).getComponent(cc.Label).string = FurnitureJson["name"];
        //家具图片
        cc.loader.loadRes("images/" + FurnitureJson["icon"], cc.SpriteFrame, (err, spriteFrame) => {
            cc.find("furnitureSprite",this.node).getComponent(cc.Sprite).spriteFrame =  spriteFrame;
        });
        //家具现拥有数量
        cc.find("furnitureNumLabel",this.node).getComponent(cc.Label).string = "";
        //售卖货物

        let saleGoods = [ {101:"书籍"}, {102:"光盘"}, {103:"游戏"}, {104:"手办"}, {105:"周边"}];
        
        for (let a of saleGoods) { 

            if (a[FurnitureJson["subType"]]) {
                this.goods = a[FurnitureJson["subType"]];
                break;
             }
         }
        cc.find("saleGoodsLabel",this.node).getComponent(cc.Label).string = this.goods;
        //属性加成

        cc.find("attributeLabel",this.node).getComponent(cc.Label).string = JsonMgr.getProperty(FurnitureJson["value"][0])["name"];
        cc.find("sellSpeedLabel",this.node).getComponent(cc.Label).string = "+" + FurnitureJson["value"][1];
        //占地类型
        cc.find("groundTypeSprite",this.node)
        //回收价格
        cc.find("recyclingLabel",this.node).getComponent(cc.Label).string = FurnitureJson["recoveryPrice"];

    }




}
