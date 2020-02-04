/**
 * @author Lizhen
 * @date 2019/11/28
 * @Description:
 */
export class StaffGiftData {
    public hasReward: boolean;
    public staffGiftsSize: number;
    public endTime: number;
    public advertCount: number;

    fill(StaffGiftData) {
        this.hasReward = StaffGiftData.hasReward;
        this.staffGiftsSize = StaffGiftData.staffGiftsSize;
        this.endTime = StaffGiftData.endTime;
        this.advertCount = StaffGiftData.advertCount;
    }
}