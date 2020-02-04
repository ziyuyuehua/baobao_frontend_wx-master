// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
import {GameComponent} from "../../core/component/GameComponent";
import {TextIncidentConst, TextTipConst} from "../../global/const/TextTipConst";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import { DataMgr } from "../../Model/DataManager";
import {JsonMgr} from "../../global/manager/JsonManager";


const {ccclass, property} = cc._decorator;

@ccclass
export default class IncidentFollowView extends GameComponent
{

    @property(cc.RichText)
    contextRichTxt : cc.RichText = null;

    static url: string = "incident/IncidentFollowView";

    roleId : number = 0;
    
    // LIFE-CYCLE CALLBACKS:

    onLoad () 
    {
        this.roleId = this.node["data"];
    }

    start () {
        this.contextRichTxt.string = JsonMgr.getTips(TextTipConst.INCIDENT_FOLLOWTXT);
    }



    rtnHandleCallback()
    {//取消
        this.closeView();
    }

    handleCallBack()
    {//关注他
        HttpInst.postData(NetConfig.GUANZHU, [this.roleId], (res: any) => {
            DataMgr.friendData.friendFocus = true;
        });
        this.closeView();
    }

    getBaseUrl() {
        return IncidentFollowView.url;
    }
    // update (dt) {}
}
