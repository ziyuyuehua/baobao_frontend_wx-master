/**
 * User: cJian
 * Date: 2019/8/9 2:51 PM
 * Note: ...
 */
import {CommonUtil} from "../../../Utils/CommonUtil";

export class IncidentShowConf {
    private json: IIncidentShowJson = null;

    constructor() {

    }

    init(json: IIncidentShowJson) {
        this.json = json;
    }

    getMapPos(): Array<number> {
        return this.json.mapPos.split(",").map(Number);
    }

    getMod() {
        return this.json.staffMod;
    }

    getTalk() {
        return this.json.staffTalk;
    }

    getName() {
        return this.json.staffName;
    }

    getBackground() {
        return this.json.background;
    }

    getAniType() {
        return this.json.aniType;
    }

    getEventModelId() {
        let modelIds: string[] = this.json.eventModelId.split(";");
        let nIndx = CommonUtil.getRandomNum(modelIds.length);
        return Number(modelIds[nIndx]);
    }

    getTargetPic() {
        return this.json.targetPic;
    }

    getAction() {
        return this.json.action;
    }

    getFace() {
        return this.json.face;
    }
}
