const {ccclass, property} = cc._decorator;

@ccclass
export class AnimaAction extends cc.Component {

    @property(cc.Sprite)
    sprite: cc.Sprite = null;

    @property([cc.SpriteFrame])
    spriteFrames: Array<cc.SpriteFrame> = [];

    @property(cc.Float)
    perFrameTime: number = 0.1;

    @property(cc.Boolean)
    playOnLoad: boolean = false;

    @property(cc.Boolean)
    loop: boolean = false;

    playing: boolean = false;
    time: number = 0;

    endCb: Function = null;

    onLoad () {
        if(!this.sprite){
            this.sprite = this.addComponent(cc.Sprite);
        }
        if(this.playOnLoad){
            if(this.loop){
                this.playLoop();
            }else{
                this.playOnce();
            }
        }
    }

    showPlayLoop(){
        this.show();
        this.playLoop();
    }

    playLoop(){
        if(this.spriteFrames.length <= 0){
            return;
        }
        this.time = 0;
        this.loop = true;
        this.playing = true;
        this.endCb = null;

        this.sprite.spriteFrame = this.spriteFrames[0];
    }

    showPlayOnce(endCb: Function = null){
        this.show();
        this.playOnce(endCb);
    }

    playOnce(endCb: Function = null){
        if(this.spriteFrames.length <= 0){
            return;
        }
        this.time = 0;
        this.loop = false;
        this.playing = true;
        this.endCb = endCb;

        this.sprite.spriteFrame = this.spriteFrames[0];
    }

    start () {

    }

    stopAndHide(){
        this.stop();
        this.hide();
    }

    stop(){
        this.playing = false;
    }

    update (dt: number) {
        if(!this.node.active || !this.playing){
            return;
        }
        this.time += dt;
        let index: number = Math.floor(this.time/this.perFrameTime);
        if(this.loop){
            if(index >= this.spriteFrames.length){
                index = 0;
                this.time = 0;
                //index -= this.spriteFrames.length;
                //this.time -= (this.spriteFrames.length * this.perFrameTime);
            }
            this.sprite.spriteFrame = this.spriteFrames[index];
        }else{
            if(index >= this.spriteFrames.length){
                index = 0;
                this.time = 0;
                this.playing = false;
                this.endCb && this.endCb();
            }else{
                this.sprite.spriteFrame = this.spriteFrames[index];
            }
        }
    }

    show(){
        if(!this.node.active){
            this.node.active = true;
        }
    }

    hide() {
        if (this.node.active) {
            this.node.active = false;
        }
    }

}
