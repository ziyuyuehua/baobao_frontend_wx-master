/**
 * @author Lizhen
 * @date 2019/9/28
 * @Description:
 */
import {GameComponent} from "../../../../../../core/component/GameComponent";
import {UIUtil} from "../../../../../../Utils/UIUtil";
import {UIMgr} from "../../../../../../global/manager/UIManager";
import ccclass = cc._decorator.ccclass;
import {HttpInst} from "../../../../../../core/http/HttpClient";
import {NetConfig} from "../../../../../../global/const/NetConfig";
import {DataMgr} from "../../../../../../Model/DataManager";
import property = cc._decorator.property;
import { JsonMgr } from "../../../../../../global/manager/JsonManager";
@ccclass()
export class FriendMessage extends GameComponent{
    static url: string = "Prefab/recruit/friend/FriendMessage";
    @property(cc.EditBox)
    editBox:cc.EditBox = null;
    private cb:Function = null;
    getBaseUrl() {
        return FriendMessage.url;
    }
    onEnable() {
        this.onShowPlay(2, this.node.getChildByName("bg"));
    }
    init(isSuc: boolean, cb:Function){
        this.cb = cb;
        if (isSuc) {
            this.editBox.maxLength = 25;
            this.editBox.string = JsonMgr.getConstVal("friendFairSuccessMessage");
        } else  {
            this.editBox.maxLength = 50;
            this.editBox.string = JsonMgr.getConstVal("friendFairFailMessage");
        }
    }
    sureHandler(){
        HttpInst.postData(NetConfig.sendMessage,
            [DataMgr.friendData.id,this.editBox.string,this.node["data"]], (response) => {
                this.cb && this.cb();
                this.closeOnly();
        });
    }
}
