import {DataMgr, IPhoneState} from "../../Model/DataManager";
import {UIMgr} from "../../global/manager/UIManager";
import {TextTipConst} from "../../global/const/TextTipConst";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {MapPeople} from "./MapPeople";
import {CommonPopup} from "../common/CommonPopup";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {JsonMgr} from "../../global/manager/JsonManager";

const {ccclass, property} = cc._decorator;

@ccclass
export class FrameMonitor extends cc.Component {

    private checkUserLv: number = 3; //用户到达等级开始检测
    private countInterval: number = 15; //定时任务执行间隔（秒）
    private countSecond: number = 10; //计数时长（秒）

    private check: boolean = false;
    private sumFrame: number = 0;
    private sumSecond: number = 0;

    onLoad() {
        this.schedule(() => {
            this.check = true;
            this.sumFrame = 0;
            this.sumSecond = 0;
        }, this.countInterval);
    }

    update(dt: number){
        if(DataMgr.isLowPhone() || DataMgr.getUserLv() <= this.checkUserLv || MapPeople.isGeneratingPeople){
            return;
        }
        let commonPopup = UIMgr.getView(CommonPopup.url);
        if(commonPopup){
            return;
        }
        let cancelLowCount = DataMgr.getCancelLowCount();
        // cc.log("cancelLowCount", cancelLowCount);
        if(cancelLowCount >= 2){
            return;
        }

        if(this.check){
            this.sumFrame++;
            this.sumSecond += dt;
            if(this.sumSecond >= this.countSecond){
                this.check = false;
                let fps: number = ~~(this.sumFrame/this.sumSecond);
                // cc.warn("sumFrame", this.sumFrame, ~~(this.sumSecond)+"s", "FPS", fps);
                if(fps < 30){
                    cc.error("fps < 30 !!!");
                    UIMgr.showCommonPopup(JsonMgr.getTips(TextTipConst.CHANGE_PHONE_STATE), () => {
                        ClientEvents.MAP_CLEAR_PEOPLE.emit();
                        let phoneState: IPhoneState = DataMgr.switchPhoneState();
                        ClientEvents.CHANGE_PHONE_STATE.emit(phoneState);
                        HttpInst.postData(NetConfig.SET_SETTING,
                            [DataMgr.settingData.musicSwitch, DataMgr.settingData.soundSwitch, DataMgr.isLowPhone()]);
                    });
                }
            }
        }
    }

}
