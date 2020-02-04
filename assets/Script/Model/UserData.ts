import {IUser} from "../types/Response";
import {ClientEvents} from "../global/manager/ClientEventCenter";
import {ServerConst} from "../global/const/ServerConst";
import {DataMgr} from "./DataManager";

export class UserData {

    private user: IUser;

    fill(user: IUser) {
        this.user = user;
        // DataMgr.warehouseData.canExpand();
    }

    get id() {
        return this.user ? this.user.id : -1;
    }

    get staffId() {
        return this.user.staffId;
    }

    get positionId() {
        return this.user.positionId;
    }

    get openid() {
        return this.user ? this.user.openid : ServerConst.openid;
    }

    get level() {
        return this.user ? this.user.level : 0;
    }

    set level(level: number) {
        this.user.level = level;
    }

    get exp() {
        return this.user ? this.user.exp : 0;
    }

    set exp(exp: number) {
        this.user.exp = exp;
    }

    get gold() {
        return this.user ? this.user.gold : 0;
    }

    get diamond() {
        return this.user ? this.user.diamond : 0;
    }

    get nickName() {
        return this.user.nickName;
    }

    get shopWelcome() {
        // return this.user.shopWelcome;
        return "";
    }

    get incrHowLv() {
        return this.user.incrHowLv;
    }

    set incrHowLv(incrHowLv: number) {
        this.user.incrHowLv = incrHowLv;
    }

    get head() {
        return this.user.avatar;
    }

    get pendant() {
        return this.user.pendant;
    }

    get signature() {
        return this.user.signature;
    }

    get ownFriendFrames() {
        return this.user.ownFriendFrames;
    }

    get friendFrame() {
        return this.user.friendFrame;
    }

    set friendFocus(ble: boolean) {
        this.user.friendFocus = ble;
    }

    get friendFocus() {
        return this.user.friendFocus;
    }

    get renameEndTime() {
        return this.user.renameEndTime;
    }

    checkMoneyIsEnough(type: string, money: number) {
        switch (type) {
            case "-2":
                return this.gold >= money;
            case "-3":
                return this.diamond >= money;
        }
    }

    getCurrencyNum(id: number) {
        switch (id) {
            case -1:
                return this.exp;
            case -2:
                return this.gold;
            case -3:
                return this.diamond;
            default:
                throw new Error("unknown currency id=" + id);
        }
    }

    getPositionId() {
        return this.user.positionId;
    }

    getSex() {
        return this.user.sex;
    }

}

export class FriendUserData extends UserData {
    public hasRecruitBubble: boolean;
}
