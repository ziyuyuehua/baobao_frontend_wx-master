import {GameComponent} from "../../core/component/GameComponent";
import {ButtonMgr} from "../common/ButtonClick";
import {JsonMgr} from "../../global/manager/JsonManager";
import CommonSimItem from "../common/CommonSimItem";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ActivePanel extends GameComponent {
    static url: string = "active/activePanel";

    @property([cc.Label])
    private labArr: cc.Label[] = [];

    @property(cc.Node)
    private aniNode: cc.Node = null;

    @property(cc.Node)
    private iconLay: cc.Node = null;

    @property(cc.Prefab)
    private propPre: cc.Prefab = null;

    @property(cc.Node)
    private checkBut: cc.Node = null;

    private itemId:number = 0;
    protected getBaseUrl(): string {
        return  ActivePanel.url;
    }

    onEnable() {
        this.onShowPlay(1, this.aniNode);
    }

    start () {
        ButtonMgr.addClick(this.checkBut,this.closeView)
        this.itemId = this.node['data'].itemID;
    }

    messShow=()=>{
        let item = cc.instantiate((this.propPre));
        let itemIcon:CommonSimItem = item.getComponent(CommonSimItem)
        this.iconLay.addChild((item))
        itemIcon.updateItem(this.itemId,null);

        let itemJson = JsonMgr.getInformationAndItem(this.itemId);
        this.labArr[0].string = itemJson.name;
        this.labArr[1].string = itemJson.description;
        if(itemJson.Popularity!=null){
            this.labArr[2].string = itemJson.Popularity;
        }else{
            this.labArr[2].node.active = false;
        }
        if(itemJson.acreage!=0){
            let acreNum = itemJson.acreage.split(",")
            this.labArr[3].string = acreNum[0];
        }else{
            this.labArr[3].node.active = false;
        }
    }
}
