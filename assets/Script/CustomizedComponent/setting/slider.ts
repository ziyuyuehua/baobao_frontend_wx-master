const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {


    onLoad() {
        let slider = this.getComponent(cc.Slider);
        let progressbar = this.getComponent(cc.ProgressBar);

        if (slider == null || progressbar == null) {
            return;
        }

        progressbar.progress = slider.progress;

        slider.node.on('slide', function (event) {
            progressbar.progress = slider.progress;
        }, this);
    }

    start() {

    }

    // update (dt) {}
}
