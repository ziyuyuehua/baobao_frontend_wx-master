const {ccclass, property} = cc._decorator;

@ccclass
export class LoadingView extends cc.Component {

    static url: string = "common/loadingView";

    @property(sp.Skeleton)
    private loadingSpine: sp.Skeleton = null;

    play() {
        this.loadingSpine.paused = false;
        this.loadingSpine.setAnimation(0, "loading_little", true);
    }

    stop() {
        this.loadingSpine.paused = true;
        // this.loadingSpine.clearTracks();
    }
}
