/**
 * @Description:
 * @Author: ljx
 * @date 2019/12/2
*/

export default class MoneyFlyData {
    private startPos: cc.Vec2 = null;

    getStartPos() {
        return this.startPos;
    }

    setStartPos(pos: cc.Vec2) {
        this.startPos = pos;
    }

    private static _instance: MoneyFlyData = null;
    static instance() {
        if(!MoneyFlyData._instance) {
           MoneyFlyData._instance = new MoneyFlyData();
        }
        return MoneyFlyData._instance;
    }

}

export const MFData: MoneyFlyData = MoneyFlyData.instance();