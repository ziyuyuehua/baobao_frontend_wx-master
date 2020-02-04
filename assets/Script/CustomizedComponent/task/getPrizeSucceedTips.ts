import {CommonUtil} from "../../Utils/CommonUtil";
import {JsonMgr} from "../../global/manager/JsonManager";
import {ResMgr} from "../../global/manager/ResManager";
import {UIMgr} from "../../global/manager/UIManager";


const {ccclass, property} = cc._decorator;

@ccclass
export default class GetPrizeSucceedTips extends cc.Component {

   @property(cc.Sprite)
   private attachmentSprite:Array<cc.Sprite> = [];
   @property(cc.Sprite)
   private thePropsImg:Array<cc.Sprite> = [];
   @property(cc.Label)
   private thePropsNumber:Array<cc.Label> = [];
    reward: string;

    onLoad () {
        this.node.on(cc.Node.EventType.TOUCH_END,()=>{this.node.destroy()},this)
    }

    // start () {

    // }

     //附件初始化
     attachmentInit = (reward: string) => {
         this.reward = reward;
        let str = new Array();
        let attachmentData = new Array();
        str = reward.split(";");

        for (let a of str) {
            attachmentData.push(a.split(","))
        }
        for (let i = 0; i < (attachmentData.length > 4 ? 4 : attachmentData.length); i++) {
            let id = attachmentData[i];
            let t = JsonMgr.getInformationAndItem(id[0]);
            if (!t) {
                return;
            }
            let nodeBox: cc.Sprite = this.attachmentSprite[i].getComponent(cc.Sprite)
            ResMgr.getItemBox(nodeBox, "k" + t.color);

            let node: cc.Sprite = this.thePropsImg[i];
            ResMgr.imgTypeJudgment(node, parseInt(id[0]));

            this.thePropsNumber[i].string = CommonUtil.numChange(parseInt(id[1]), 1) + "";

            UIMgr.addDetailedEvent( this.attachmentSprite[i].node, parseInt(id[0]));

            this.attachmentSprite[i].node.active = true;
        }
    }


    quedingBtn(){
        this.node.destroy();
    }
    onDestroy(){
        UIMgr.showTipText("itemTips",this.reward);
    }
    // update (dt) {}
}
