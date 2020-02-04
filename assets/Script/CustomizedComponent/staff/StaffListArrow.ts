

const {ccclass, property} = cc._decorator;

@ccclass
export default class StaffListArrow extends cc.Component {


    // onLoad () {}

    start () {

    }
    //员工升级
    loadStaffListArrow=()=>{
        // cc.find("arrow1",this.node).active = true;
        // cc.find("staffDetail/right/buttons/levelBtn",this.node).once("click",()=>{
        //     cc.log("arrow1")
        //
        //     cc.find("arrow1",this.node).active = false;
        //     this.scheduleOnce(()=>{
        //
        //     cc.find("popupLayer/levelPanel/levelOnekey/arrow2",this.node).active = true;
        //     cc.find("popupLayer/levelPanel/levelOnekey",this.node).once("click",()=>{
        //
        //         cc.find("popupLayer/levelPanel/levelOnekey/arrow2",this.node).active = false;
        //         cc.find("popupLayer/levelPanel/lvUseBtn/arrow3",this.node).active = true;
        //         cc.find("popupLayer/levelPanel/lvUseBtn",this.node).once("click",()=>{
        //
        //             cc.find("popupLayer/levelPanel/lvUseBtn/arrow3",this.node).active = false;
        //             cc.find("popupLayer/levelPanel/lvUpPopup/lvUpCloseIcon/arrow4",this.node).active = true;
        //             cc.log("arrow4")
        //             cc.find("popupLayer/levelPanel/lvUpPopup/lvUpCloseIcon",this.node).once(cc.Node.EventType.TOUCH_END,()=>{
        //
        //                 cc.find("popupLayer/levelPanel/lvUpPopup/lvUpCloseIcon/arrow4",this.node).active = false;
        //                 cc.find("popupLayer/levelPanel/lvBackBtn/arrow5",this.node).active = true;
        //                 cc.find("popupLayer/levelPanel/lvBackBtn",this.node).once("click",()=>{
        //
        //                     cc.find("popupLayer/levelPanel/lvBackBtn/arrow5",this.node).active = false;
        //                     cc.find("staffContent/dissmissMode/backBtn/arrow6",this.node).active = true;
        //                 },this);
        //             },this);
        //         },this);
        //     },this);
        //     },0.1);
        // },this);
    }
    //员工上岗
    loadJobsArrow=()=>{
        // cc.find("staffContent/arrow7",this.node).active = true;
        // cc.find("staffContent/recruitOrJobBtn",this.node).once("click",()=>{
        //     cc.find("staffContent/arrow7",this.node).active = false;
        //     cc.find("staffContent/dissmissMode/backBtn/arrow8",this.node).active = true;
        // },this);
    }

    // update (dt) {}
}
