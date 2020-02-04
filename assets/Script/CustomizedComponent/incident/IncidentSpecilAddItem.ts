import { UIUtil } from "../../Utils/UIUtil";
import { IncidentSpecialInfo } from "./IncidentSpecialInfo";



// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html



const {ccclass, property} = cc._decorator;

@ccclass
export default class IncidentSpecilAddItem extends cc.Component {

    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property(cc.Label)
    desc: cc.Label = null;

    orginColor : cc.Color = null;

    init(info : IncidentSpecialInfo)
    {
        this.orginColor = this.desc.node.color;
        if(info.iconUrl != null)
        {
            UIUtil.asyncSetImage(this.icon, info.iconUrl,false);
        }
        if(info.useColor)
        {
            this.desc.node.color = new cc.Color(0,0,255,255);
        }else
        {
            this.desc.node.color = this.orginColor;
        }
        if(info.descTxt != null)
        {
            this.desc.string = info.descTxt;
        }
    }

    // update (dt) {}
}
