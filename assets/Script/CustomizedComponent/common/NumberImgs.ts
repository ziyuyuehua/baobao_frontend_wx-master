import { CommonUtil } from "../../Utils/CommonUtil";
import {ResMgr} from "../../global/manager/ResManager";


const {ccclass, property} = cc._decorator;

@ccclass
export default class NumberImgs extends cc.Component {

    @property
    url:string = "";
    // onLoad () {}

    start () {

    }

    setNum(num: number){
        this.node.removeAllChildren();
        let numStr: string = CommonUtil.numChange(num);
        for(let i=0;i<numStr.length;i++){
            let char: string = numStr.charAt(i);
            if (char ===".") {
                char = "点";
            }
            let node: cc.Node = new cc.Node();
            let sprite: cc.Sprite = node.addComponent(cc.Sprite);
            ResMgr.getNumberImg(this.url,char,sprite);
            this.node.addChild(node);
        }
    }
    // update (dt) {}
}
