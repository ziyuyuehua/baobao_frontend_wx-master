import {UIUtil} from "../../Utils/UIUtil";

const {ccclass, property} = cc._decorator;

@ccclass
export abstract class GameSpine extends cc.Component{

    protected url: string = null;

    @property(cc.Boolean)
    protected loadSpine: boolean = true;

    @property(sp.Skeleton)
    protected spine: sp.Skeleton = null;

    onLoad(){
        if(this.loadSpine){
            this.setUrl(this.getSpineUrl());
        }
    }

    protected setUrl(url: string) {
        this.url = url;
        UIUtil.asyncSetSpine(this.spine, this.url, this.doOnComplete);
    }

    play(name: string, loop: boolean = true){
        if(!this.spine){
            cc.log("not init this.spine");
            return;
        }
        this.spine.setAnimation(0, name, loop)
    }

    abstract getSpineUrl(): string;
    abstract doOnComplete(): void;

}
