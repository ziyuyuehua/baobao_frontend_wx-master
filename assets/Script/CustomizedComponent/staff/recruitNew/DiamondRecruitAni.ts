import { RecruitResult } from "../../../Model/RecruitData";
import { Staff } from "../../../Model/StaffData";
import { UniqueAni } from "./DiamondRecruitUniqueAnim";
import { JsonMgr } from "../../../global/manager/JsonManager";

const { ccclass, property } = cc._decorator;

let timeoutVar: number;

export function sleep(time: number) {
    return new Promise((resolve) => {
        timeoutVar = setTimeout(() => { timeoutVar = undefined; resolve(); }, time * 1000);
    });
}

export function PromiseForEach<T, R>(arr: T[], cb: (i: T) => Promise<R>) {
    let realResult: R[] = []
    let result = Promise.resolve()
    arr.forEach((a, _i) => {
        result = result.then(() => {
            return cb(a).then((res) => {
                realResult.push(res)
            })
        })
    })

    return result.then(() => {
        return realResult
    })
}

@ccclass
export class DiamondRecruitAni extends cc.Component {
    @property(cc.Node)
    bg: cc.Node = null;
    @property(cc.Node)
    anim1: cc.Node = null;
    @property(cc.Node)
    anim2: cc.Node = null;
    @property(cc.Node)
    anim3: cc.Node = null;
    @property(cc.Node)
    anim4: cc.Node = null;

    @property(cc.Prefab)
    uniqueAni: cc.Prefab = null;

    callback: () => void;
    
    resultsNum = 1;

    initAndPlay(results: Array<RecruitResult>, callback: () => void) {
        this.callback = callback;
        cc.director.getScene().addChild(this.node,999);
        let maxStar = 3;
        this.resultsNum = results.length;
        for (let result of results) {
            if (!result.staff) {
                let decoShopJson: IDecoShopJson = JsonMgr.getDecoShopJson(result.itemXmlId);
                (<any>result).star = decoShopJson.color;
            } else {
                (<any>result).star = result.staff.star;
            }
            if (maxStar == 6 && (<any>result).star == 6) {
                maxStar = 10;
                break;
            }
            maxStar = Math.max(maxStar, (<any>result).star);
        }
        let spine = this.anim1.getComponent(sp.Skeleton);
        let spine1 = this.anim2.getComponent(sp.Skeleton);
        if (maxStar < 10) {
            spine.setAttachment("beijingguang", null);
        }
        if (maxStar >= 6) {
            this.anim2.active = true;
            spine.setAnimation(0, "animation", false);
            spine1.setAnimation(0, "animation", false);
            spine1.timeScale = 0.6;
            spine1.setCompleteListener(() => {
                spine1.setCompleteListener(null);
                spine1.timeScale = 1;
                this.playAnimation1(results, maxStar, spine, spine1);
            });
        } else {
            this.playAnimation1(results, maxStar, spine, spine1);
        }
    }

    playAnimation1 = (results: Array<RecruitResult>, maxStar: number, machineSpine: sp.Skeleton, stickiesSpine: sp.Skeleton) => {
        // if (maxStar <= 3) {
        //     this.playAnimation2(results, maxStar, machineSpine, stickiesSpine);
        // } else {
            machineSpine.setAnimation(0, "animation1", false);
            stickiesSpine.setAnimation(0, "animation1", false);
            machineSpine.setCompleteListener(() => {
                machineSpine.setCompleteListener(null);
                sleep(0.1).then(() => {
                    this.playAnimation2(results, maxStar, machineSpine, stickiesSpine);
                });
            });
        // }
    }
    
    playAnimation2 = (results: Array<RecruitResult>, maxStar: number, machineSpine: sp.Skeleton, stickiesSpine: sp.Skeleton) => {
        if (maxStar < 5) {
            machineSpine.setAnimation(0, "animation4", false);
        } else if (maxStar == 5) {
            machineSpine.setAnimation(0, "animation5", false);
        } else {
            machineSpine.setAnimation(0, "animation2", false);
        }
        stickiesSpine.setAnimation(0, "animation2", false);
        this.anim3.active = true;
        this.anim3.getComponent(sp.Skeleton).setAnimation(0, "animation", false);
        let loopCount = 0;
        this.anim3.getComponent(sp.Skeleton).setCompleteListener(() => {
            loopCount++;
            switch (loopCount) {
                case 1:
                    if (maxStar > 4) {
                        this.anim3.getComponent(sp.Skeleton).setAnimation(0, "animation2", false);
                        break;
                    }
                case 2:
                    if (maxStar > 5) {
                        this.anim3.getComponent(sp.Skeleton).setAnimation(0, "animation3", false);
                        break;
                    }
                case 3:
                    this.anim3.active = false;
                    this.anim3.getComponent(sp.Skeleton).setCompleteListener(null);
                    break;
            }
        });

        new Promise((resolve, reject) => {
            machineSpine.setCompleteListener(() => {
                this.anim3.active = false;
                machineSpine.setCompleteListener(null);

                PromiseForEach(results, (result: RecruitResult) => {
                    return this.playEggAnimation(result, machineSpine, stickiesSpine)
                }).then(() => {
                    resolve();
                }).catch((e) => {
                    reject(e);
                });
            });
        }).then(() => {
            this.callback();
            this.node.removeFromParent(true);
        }).catch((e) => {
            console.error(e);
            this.callback();
            this.node.removeFromParent(true);
        });
    }

    playEggAnimation = (result: RecruitResult, machineSpine: sp.Skeleton, stickiesSpine: sp.Skeleton) => {
        return Promise.resolve().then(() => {
            let qiuIndex = 1;
            if (result.staff) {
                qiuIndex =  Math.max(5, (<any>result).star + 2);
            } else {
                qiuIndex =  Math.max(1, (<any>result).star - 2);
            }
            machineSpine.setSkin("qiu" + qiuIndex);
            return sleep(0.1);
        }).then(() => {
            machineSpine.setAnimation(0, "animation3", false);
            stickiesSpine.setAnimation(0, "animation3", false);
            return sleep(0.2);
        }).then(() => {
            if ((<any>result).star == 6) {
                this.anim4.active = true;
                this.anim4.getComponent(sp.Skeleton).setAnimation(0, "animation2", false);
                this.anim4.getComponent(sp.Skeleton).setCompleteListener(() => {
                    this.anim4.active = false;
                });
            }

            if ((<any>result).star == 6 && this.resultsNum > 1) {
                return sleep(0.6).then(() => {
                    return this.playUniqueAnimation(result);
                }).then((skip: boolean) => {
                    if (skip) {
                        this.skipAnimation();
                    }
                    return sleep(0.2);
                });
            } else {
                return sleep(0.9);
            }
        });
    }

    skipAnimation = () => {
        if (timeoutVar) {
            clearTimeout(timeoutVar);
            timeoutVar = undefined;
        }
        this.callback();
        this.node.removeFromParent(true);
    }

    playUniqueAnimation = (result: RecruitResult) => {
        const anim: UniqueAni = cc.instantiate(this.uniqueAni).getComponent("DiamondRecruitUniqueAnim");
        this.node.addChild(anim.node);
        return anim.initAndPlay(result);
    }
}
