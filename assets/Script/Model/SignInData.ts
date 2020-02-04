import {IDailyCheckIn} from "../types/Response";

export class SignInData {

    alreadyCheckin: Array<number>;// 几号签过到
    isCheckinToday: boolean;//今天是否签到


    setSignIn = (response: IDailyCheckIn) => {
        this.alreadyCheckin = response.alreadyCheckin;
        this.isCheckinToday = response.isCheckinToday;
    }
}