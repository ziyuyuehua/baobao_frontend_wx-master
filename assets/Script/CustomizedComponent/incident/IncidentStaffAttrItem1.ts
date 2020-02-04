import {Staff, StaffData,StaffAttr} from "../../Model/StaffData";
import {ResMgr} from "../../global/manager/ResManager";
import {JsonMgr} from "../../global/manager/JsonManager";
import {UIUtil} from "../../Utils/UIUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export class IncidentStaffAttrItem1 extends cc.Component {

    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property(cc.RichText)
    numLab: cc.RichText = null;
    private _attStr:string = '';

    private _curIconPos : cc.Vec2 = null;
    private _curLblPos : cc.Vec2 = null;
    private _offset : number = 0;

    onLoad() {
        this._curIconPos = this.icon.node.position;
        this._offset = this.icon.node.width;
        this._curLblPos = this.numLab.node.position;
    }
    initLevel(level:number) 
    {
        let ix = this._curIconPos.x + this._offset;
        this.icon.node.position = new cc.Vec2(ix,this._curIconPos.y);
        let lx = this._curLblPos.x + this._offset * 1.2;
        this.numLab.node.position =  new cc.Vec2(lx,this._curLblPos.y);
        UIUtil.asyncSetImage(this.icon,Staff.getAttrIconUrl(StaffAttr.level) );
        this.numLab.string = ">" + level;

        this.node.width = this.numLab.node.position.x + this.numLab.node.width;
    }
    initAttr1(attStr:string) {

        this.icon.node.position = this._curIconPos;
        this.numLab.node.position = this._curLblPos;
        this._attStr = attStr;
        //id,num
        let strs = this._attStr.split(',');

        let attribute = JsonMgr.getAttributeById(Number(strs[0]));
        //icon
        ResMgr.getBigAttributeIcon(this.icon, attribute.attributeIcon);
        this.numLab.string =attribute.attributeName + ">" + strs[1];
        this.node.width = this.numLab.node.position.x + this.numLab.node.width;
    }
    initAttr2(attrId:number,attrNum:number) {
        this.icon.node.position = this._curIconPos;
        this.numLab.node.position = this._curLblPos;
        let attribute = JsonMgr.getAttributeById(attrId);
        //icon
        ResMgr.getBigAttributeIcon(this.icon, attribute.attributeIcon);
        this.numLab.string =attrNum.toString();
    }

    start() {

    }
    onDestroy() {
        // this.dispose.dispose();
    }

    update(dt) {
    }

}

