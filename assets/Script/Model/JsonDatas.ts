import { JsonMgr } from "../global/manager/JsonManager";

export default class JsonData {

    private static _instance: JsonData = null;

    static instance() {
        if (JsonData._instance == null) {
            JsonData._instance = new JsonData();
        }
        return JsonData._instance;
    }

    private _goodsJsonData: IGoodsJson = null;
    private _goodsTypeJsonData: IGoodsTypeJson = null;
    private _decoShopJsonData: IDecoShopJson = null;
    private _itemJsonData: IItemJson = null;
    private _sceneJsonData: ISceneJson = null;
    private _constJsonData = null;

    get goodsJsonData(): IGoodsJson {
        return this._goodsJsonData;
    }

    get goodsTypeJsonData(): IGoodsTypeJson {
        return this._goodsTypeJsonData;
    }

    get decoShopJsonData(): IDecoShopJson {
        return this._decoShopJsonData;
    }

    get itemJsonData(): IItemJson {
        return this._itemJsonData;
    }

    get sceneJsonData(): ISceneJson {
        return this._sceneJsonData;
    }

    get constJsonData(): any {
        return this._constJsonData;
    }

    getSceneJsonData(xmlId: number): ISceneJson {
        return this.sceneJsonData[xmlId];
    }

    initData = () => {
        this._goodsJsonData = JsonMgr.getOneKind("goods");
        this._goodsTypeJsonData = JsonMgr.getOneKind("goodsType");
        this._decoShopJsonData = JsonMgr.getOneKind("decoShop");
        this._itemJsonData = JsonMgr.getOneKind("item");
        this._sceneJsonData = JsonMgr.getOneKind("scene");
        this._constJsonData = JsonMgr.getOneKind("const");
    };

    getDecoShopXmlData(xmlId: number): IDecoShopJson {
        return this._decoShopJsonData[xmlId];
    }

    getGoodsXmlData(xmlId: number): IGoodsJson {
        return this.goodsJsonData[xmlId];
    }
}

export const JData: JsonData = JsonData.instance();
