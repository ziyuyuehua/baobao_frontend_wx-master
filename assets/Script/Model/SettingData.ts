import {IAudioSetting, IFanInfo, IFansInfo, IOwnFrameInfo, ISettingInfo} from "../types/Response";
import {HttpInst} from "../core/http/HttpClient";
import {NetConfig} from "../global/const/NetConfig";
import {DataMgr} from "./DataManager";

export class SettingData {

    musicSwitch: boolean = false;
    soundSwitch: boolean = false;
    frameId: number = 0;//好友框id
    frameingId: number = 0;//使用中的好友框id
    private fansData: IFanInfo[] = [];
    private frames: IOwnFrameInfo[] = [];
    private settingData: ISettingInfo = null;
    private page: number = 0;
    private leg: number = 0;
    private fansSiez: number = 0;

    setFansSzie(num: number) {
        this.fansSiez = num;
    }

    getFansSzie() {
        return this.fansSiez;
    }

    fill(data: IAudioSetting) {
        this.musicSwitch = data.music;
        this.soundSwitch = data.sound;
        DataMgr.initPhoneState(data.lowPhone);
    }

    setFansData(data: IFanInfo[]) {
        this.page = 1;
        this.leg = data.length;
        this.fansData = data;
    }

    setSettingInfo(data: ISettingInfo) {
        this.settingData = data;
    }

    getSettingInfo() {
        return this.settingData;
    }

    setOwnFrames(data: IOwnFrameInfo[]) {
        this.frames = data;
    }

    getOwnFrames() {
        return this.frames;
    }

    getMarketInfo() {
        return this.settingData.marketSetInfos;
    }

    getOwnFriendFrames() {
        return this.settingData.ownFriendFrames;
    }

    getFriendFrame() {
        return this.frameingId;
    }

    setFriendFrame(id: number) {
        this.frameingId = id;
    }

    getFansData() {
        return this.fansData;
    }

    get musicBol() {
        return this.musicSwitch;
    }

    get soundBol() {
        return this.soundSwitch;
    }

    setMusicBol(isBol: boolean) {
        this.musicSwitch = isBol;
    }

    setSoundBol(isBol: boolean) {
        this.soundSwitch = isBol;
    }

    updateFans = (index: number) => {
        let sum: number = (this.page * this.leg) > this.fansSiez ? this.fansSiez : (this.page * this.leg);
        if ((index === (sum - 5)) && (sum < this.fansSiez)) {
            this.page += 1;
            HttpInst.postData(NetConfig.FANS_INFO, [this.page], (res: IFansInfo) => {
                this.setFansCache(res.fans);
            });
        }
    };

    setFansCache(data: IFanInfo[]) {
        this.fansData = this.fansData.concat(data);
    }
}
