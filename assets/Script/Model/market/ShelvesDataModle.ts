import { IShelves } from "../../types/Response";
import { JsonMgr } from "../../global/manager/JsonManager";

export class ShelvesDataModle {
    private ShelvesData: IShelves = null;   //后端返回的地板 货架 信息
    private ShelvesVo: IDecoShopJson = null;   //表结构

    pullData(_ShelvesData: IShelves) {
        this.ShelvesData = _ShelvesData;
        let xmldId: number = this.ShelvesData.xmlId;
        this.ShelvesVo = JsonMgr.getDecoShopJson(xmldId);
    }

    getShelevesXmlId() {
        return this.ShelvesData.xmlId;
    }

    //重新设置信息
    setShelvesData(_ShelvesData: IShelves) {
        if (_ShelvesData) {
            this.ShelvesData = _ShelvesData;
        }
    }

    getShelvesData() {
        return this.ShelvesData;
    }

    getShelfXmlData(): IDecoShopJson {
        return JsonMgr.getDecoShopJson(this.getShelevesXmlId());
    }

    //获取ID
    getShelvesId() {
        return this.ShelvesData.id;
    }

    //设置累计待领取售货金币
    setGoldIncome(goldNum: number) {
        this.ShelvesData.goldIncome = goldNum;
    }

    setSumExp(sumExp: number) {
        this.ShelvesData.sumExp = sumExp;
    }

    getGoldIncome() {
        return this.ShelvesData.goldIncome;
    }

    //返回人气值
    getPopularity() {
        if (!this.ShelvesVo) {
            cc.log("---------shelveVo......{}", this.ShelvesData.xmlId)
        }
        return this.ShelvesVo.Popularity;
    }
}

//主类型
export enum ShelvesType {
    FeaturesShelve = 1,     //功能性家具
    GroundShelve = 2,       //地面装饰
    WallShelve = 3,         //墙面装饰
    FloorShelve = 4,        //地板
    WallPaperShelve = 5,    //墙纸
    SpecialShelve = 6,      //特殊家具
    CheckoutShelve = 9      //收银台
}

//子类型
export enum subShelvesType {
    PostShelfType = 101,    //海报架
    BookShelfType = 102,     //书架
    ClothShelf = 103,         //衣架
    ShowShelf = 104,         //展示柜
    CDShelf = 105,  //光盘架
    CheckoutCounter = 106,  //收银台
    PottedPlant = 201,      //地面装饰
    WallLamp = 301,         //墙上装饰
    Floor = 401,            //地板
    Wallpaper = 501,         //墙纸
    Checkout = 901           //收银台
}

export enum mapShelvesType {
    ShelfType = 0,         //家具
    DecorationType = 1,         //装饰
    floorType = 2,              //墙纸/地板
}