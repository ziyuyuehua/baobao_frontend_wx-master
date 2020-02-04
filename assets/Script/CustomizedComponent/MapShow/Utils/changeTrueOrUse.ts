export class ChangePosition {
    static trueUseOrShowUse = (useAcreage: number, reversal: boolean, trueUse: cc.Vec2 = null, showUse: cc.Vec2 = null): cc.Vec2 => {
        if (reversal) {
            if (useAcreage % 2 === 0) {
                return !trueUse ? cc.v2(showUse.x + 2 + (useAcreage / 2 - 1),
                    showUse.y - (useAcreage / 2 - 1)) : cc.v2(trueUse.x - 2 - (useAcreage / 2 - 1),
                        trueUse.y + (useAcreage / 2 - 1));

            } else {
                return !trueUse ? cc.v2(showUse.x + 1.5 + ((useAcreage - 1) / 2),
                    showUse.y + 0.5 - ((useAcreage - 1) / 2)) : cc.v2(trueUse.x - 1.5 - ((useAcreage - 1) / 2),
                        trueUse.y - 0.5 + ((useAcreage - 1) / 2));
            }
        }
        else {
            if (useAcreage % 2 === 0) {
                return !trueUse ? cc.v2(showUse.x - (useAcreage / 2 - 1),
                    showUse.y + 2 - (useAcreage / 2 - 1)) : cc.v2(trueUse.x + (useAcreage / 2 - 1),
                        trueUse.y - 2 + (useAcreage / 2 - 1));
            } else {
                return !trueUse ? cc.v2(showUse.x + 0.5 - ((useAcreage - 1) / 2),
                    showUse.y + 1.5 + ((useAcreage - 1) / 2)) : cc.v2(trueUse.x - 0.5 + ((useAcreage - 1) / 2),
                        trueUse.y - 1.5 - ((useAcreage - 1) / 2));
            }
        }
    }
}