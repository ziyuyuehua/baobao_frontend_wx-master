import { CompositeDisposable } from "../../Utils/event-kit";
import { ClientEvents } from "../../global/manager/ClientEventCenter";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

   
    private dispose: CompositeDisposable = new CompositeDisposable();

    onLoad () {
        this.dispose.add(ClientEvents.EVENT_SEE_FURNITURE.on(this.showData));
    }
    

    start () {

    }

    showData = (data:any) =>{
        ClientEvents.EVENT_ON_FURNITURE.emit(data);
    }
   
    onDestroy() {
        this.dispose.dispose();
    }
    // update (dt) {}
}
