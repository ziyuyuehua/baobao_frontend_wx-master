import {HttpClient, HttpInst} from "../../../core/http/HttpClient";
import {NetConfig} from "../../../global/const/NetConfig";
import {UIUtil} from "../../../Utils/UIUtil";
import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {JumpConst} from "../../../global/const/JumpConst";
import {DataMgr} from "../../../Model/DataManager";
import {UIMgr} from "../../../global/manager/UIManager";
import {TypePanel} from "./TypePanel";
import {FunctionName, JsonMgr} from "../../../global/manager/JsonManager";
import {IRespData} from "../../../types/Response";


const {ccclass, property} = cc._decorator;

@ccclass
export default class JumpBulletin extends cc.Component {

    @property(cc.Sprite)
    private diamondBg: cc.Sprite = null;
    @property(cc.SpriteFrame)
    private diamondBgImg: cc.SpriteFrame = null;
    @property(cc.Node)
    private jumpBtn: cc.Node = null;

    private notices: any[] = [];
    private noticesItem: any = null;
    private i: number;

    onLoad() {
        let data: IRespData = this.node["data"];
        if (data && data.notices) {
            data.notices.sort((a, b) => {
                return a.priority - b.priority
            });
            this.notices = data.notices;
            this.forData();
        }

        // HttpInst.postData(NetConfig.NOTICE_LIST, [], (response) => {
        //     response.notices.sort((a, b) => {
        //         return a.priority - b.priority
        //     });
        //     this.notices = response.notices;
        //     this.forData();
        //     // DataMgr.announcementData.NoticeData = response.notices;
        //     // this.initScrillView();
        //     // this.setBarData();
        // });
    }

    start() {

    }

    forData = () => {
        let size: number = this.notices.length;
        if (size <= 0) {
            return;
        }
        for (let i = 0; i < size; i++) {
            if (this.notices[i].skipImg) {
                if (this.notices[i].skipImg !== "") {
                    this.noticesItem = this.notices[i];
                    this.i = i;
                    break;
                }
            }
        }

        if (this.noticesItem) {
            UIUtil.loadUrlImg(this.noticesItem.skipImg, this.diamondBg);
            let ble = JsonMgr.isFunctionOpen(FunctionName.notice);
            this.jumpBtn.active = this.noticesItem && ble;
        }
    };

    onJump() {
        ClientEvents.EVENT_OPEN_UI.emit(JumpConst.ANNOUNCEVIEWCUXIAO, this.i);
    }

    update(dt) {
        if (this.noticesItem) {
            let time: number = new Date().getTime();
            if (time > this.noticesItem.endTime) {
                this.diamondBg.spriteFrame = this.diamondBgImg;
                this.jumpBtn.active = false;
            }
        }
    }
}
