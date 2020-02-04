import { UIUtil } from "../Utils/UIUtil";
import {AudioMgr} from "../global/manager/AudioManager";
import {UIMgr} from "../global/manager/UIManager";


const {ccclass, property} = cc._decorator;

@ccclass
export default class SpecialEffects extends cc.Component {

    @property(cc.Node)
    private exp:cc.Node = null;
    @property(cc.Node)
    private gold:cc.Node = null;

    @property(cc.Animation)
    private anim:cc.Animation = null;
    @property(sp.Skeleton)
    private sp:sp.Skeleton = null;

    onLoad () {
        this.anim.on("stop",()=>{
            //cc.log("specialEnemyPool stop");
            this.node.active = false;

            if(UIMgr.specialBubblePool.size() >= UIMgr.specialBubbleNum){
                //cc.log("destroy specialEnemyPool");
                this.node.destroy();
            }else{
                //cc.log("put specialEnemyPool");
                UIMgr.specialBubblePool.put(this.node);
            }
        }, this);
    }

    load(exp,gold,vec){
        this.node.setPosition(vec);
        this.node.active = true;

        AudioMgr.playEffect("Audio/shouqian");
        this.exp.getComponent("NumberImgs").setNum(exp);
        this.gold.getComponent("NumberImgs").setNum(gold);
        this.sp.setAnimation(0,"animation",false);
        this.anim.play();
    }

    onDisable(){
        //cc.log("specialEnemyPool onDisable");
        //this.anim.off("stop");
    }




    // update (dt) {}
}
