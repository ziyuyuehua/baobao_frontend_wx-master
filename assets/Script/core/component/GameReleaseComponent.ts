/**
 * User: cJian
 * Date: 2019/8/8 6:57 PM
 * Note: ...
 */
import {GameComponent} from "./GameComponent";
import {UIUtil} from "../../Utils/UIUtil";

const {ccclass, property} = cc._decorator;

@ccclass
export abstract class GameReleaseComponent extends GameComponent {
    protected exceptDir:string = '';
    protected onDestroy() {
        super.onDestroy();

        // if(this.releaseKey != '') {
            UIUtil.releaseAllDeps(this.getBaseUrl(),this.exceptDir);
        // }
    }
}
