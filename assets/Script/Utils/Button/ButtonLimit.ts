const {ccclass, property} = cc._decorator;

@ccclass
export class ButtonLimit extends cc.Component {

    @property(cc.Integer)
    private limitSecond: number = 1;

    private clicked: boolean = false;
    private clickEvents = null;

    start () {
        const button = this.getComponent(cc.Button);
        if(!button){
            return;
        }

        this.clickEvents = button.clickEvents;
        this.node.on("click", () => {
            // button.interactable = false;
            if(this.clicked){
                //console.log("ButtonLimit had clicked");
                return;
            }
            //console.time("ButtonLimit click");
            this.clicked = true;
            button.clickEvents = [];
            this.scheduleOnce((dt) => {
                button.clickEvents = this.clickEvents;
                // button.interactable = true;
                this.clicked = false;
                //console.timeEnd("ButtonLimit click");
            }, this.limitSecond);
        }, this);
    }

}
