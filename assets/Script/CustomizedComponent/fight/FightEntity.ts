import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import {Staff} from "../../Model/StaffData";

@ccclass()
export class FightEntity extends cc.Component{
    @property(cc.Node)
    spineNode:cc.Node = null;
    @property(cc.Node)
    guangNode:cc.Node = null;

    @property(sp.Skeleton)
    shuxingSk:sp.Skeleton = null;
    @property(sp.Skeleton)
    heroSk:sp.Skeleton = null;
    private entityData:any = null;
    private delayTime:number = 0;
    private isLoght:boolean = false;
    private isEnemy: boolean = false;
    initData(data:any, isLoght:boolean, delayTime:number, isEnemy: boolean){
        this.entityData = data;
        this.delayTime = delayTime;
        this.isLoght = isLoght;
        this.isEnemy = isEnemy;
        this.initSpine();
    }
    initSpine(){
        let spineUrl = this.getStaffSpineUrl();
        // cc.log("isEnemy", this.isEnemy, "fight init url", spineUrl);
        cc.loader.loadRes(spineUrl, sp.SkeletonData, null, this.onComplete);
    }
    private spine: sp.Skeleton = null;
    onComplete = (err, res) => {
        if (err) {
            cc.error(err);
            return;
        }
        if(!this.spineNode){
            return;
        }
        this.spine = this.spineNode.getComponent('sp.Skeleton');
        this.spine.skeletonData = res;
        this.spine.setAnimation(0, "zhanli", true);
        this.spine.setSkin("weixiao");
        this.playMovie();
    };
    playMovie(){//播放出场动画
        let move = cc.moveTo(0.3,cc.v2(0,10));
        move.easing(cc.easeBackOut());
        let faceIn = cc.fadeIn(0.3);
        let faceIn2 = cc.fadeIn(0.2);
        let call = cc.callFunc(()=>{
            this.guangNode.active = this.isLoght;
            if(this.isLoght){
                this.heroSk.animation = "renwuguang";
                this.heroSk.setCompleteListener(()=>{
                    this.shuxingSk.animation = "shuxingjiacheng";
                })
            }
        });
        this.spineNode.runAction(cc.sequence(cc.spawn(move,faceIn),call));
    }
    clearRes(){
        let skeletonData = this.spine.skeletonData;
        if(skeletonData){
            // let spineUrl = this.getStaffSpineUrl();
            // cc.log("isEnemy", this.isEnemy, "fight clear url", spineUrl);
            let deps = cc.loader.getDependsRecursively(skeletonData);
            deps.forEach((item) => {
                cc.loader.release(item);
                // cc.log(">>> FightEntity release", item);
            });
            this.spine.skeletonData = null;
        }

        this.node.removeFromParent(true);
        this.node.destroy();
    }
    private getStaffSpineUrl(){
        return Staff.getStaffSpineUrl(this.entityData, this.isEnemy);
    }
}
