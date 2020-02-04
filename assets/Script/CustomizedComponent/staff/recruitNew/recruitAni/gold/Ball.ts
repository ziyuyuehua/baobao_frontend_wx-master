/**
 * @author Lizhen
 * @date 2019/9/21
 * @Description:
 */
import ccclass = cc._decorator.ccclass;
import callFunc = cc.callFunc;
import {ClientEvents} from "../../../../../global/manager/ClientEventCenter";

@ccclass()
export class Ball extends cc.Component {
    private otherCenter: number = 5;
    private rotationType: number = 0;
    private BallPath: Array<any> = [];
    private isPlay: boolean = false;


    init() {
        this.rotationType = 0;
        this.otherCenter = 5;
        this.BallPath = [];
        this.isPlay = false;
    }

    initPath(id: number) {
        this.getBallPath(id);
    }

    onCollisionEnter(other, self) {
        if (this.isPlay) return;
        //self代表当前节点的的碰撞组件，other代表和self产生碰撞的其他碰撞组件
        if (other.tag == 5) {//第一排关闭物理系统
            cc.director.getPhysicsManager().enabled = false;
        }
        if (other.tag == 11) {//
            this.rotationType = 0;
            this.isPlay = true;
            let move1 = cc.jumpBy(0.2, cc.v2(0, -5), 10, 1);
            this.node.runAction(cc.sequence(move1, cc.delayTime(0.5), cc.callFunc(() => {
                ClientEvents.GOLD_RECRUIT.emit();
            })));
        }
        if (this.otherCenter >= other.tag) {
            this.otherCenter -= 1;
            if (self.tag == 6) {//6是球的tag值7碰撞过的
                this.jumpBall();
            }
        }
    }

    jumpBall() {
        this.node.stopAllActions();
        let jump;
        let path = this.BallPath.pop();
        if (path) {
            if (path == -1) {
                jump = cc.jumpBy(0.4, cc.v2(60, -140), Math.random() * 10 + 100, 1);
                this.rotationType = 5;
            } else {
                jump = cc.jumpBy(0.4, cc.v2(-60, -140), Math.random() * 10 + 100, 1);
                this.rotationType = -5;
            }
        }
        this.node.runAction(cc.sequence(jump, callFunc(() => {
            if (this.otherCenter == 0) {//最后一排打开物理系统
                cc.director.getPhysicsManager().enabled = true;
            }
        })));
    }

    update() {
        this.node.angle += this.rotationType;
    }

    private arr = [
        [0, 1, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
    ]

    getBallPath(id: number) {//根据球洞获得运动轨迹
        let index = id;
        let pathArr = [];
        for (let i = 5; i >= 0; i--) {
            if (i > 0) {
                if (this.arr[i].length > this.arr[i - 1].length) {
                    let arr1 = [];
                    if (this.arr[i - 1][index - 1]) {
                        if (this.arr[i - 1][index - 1] == 1) {
                            arr1.push(-1);
                        }
                    }
                    if (this.arr[i - 1][index]) {
                        if (this.arr[i - 1][index] == 1) {
                            arr1.push(1);
                        }
                    }
                    if (arr1.length == 1) {
                        pathArr.push(arr1[0]);
                        if (arr1[0] == -1) {
                            index -= 1;
                        }
                    } else {
                        if (Math.random() * 1 > 0.5) {
                            pathArr.push(1);
                        } else {
                            pathArr.push(-1);
                            index = index - 1;
                        }
                    }
                } else {
                    let arr2 = [];
                    if (this.arr[i - 1][index + 1]) {
                        if (this.arr[i - 1][index + 1] == 1) {
                            arr2.push(1);
                        }
                    }
                    if (this.arr[i - 1][index]) {
                        if (this.arr[i - 1][index] == 1) {
                            arr2.push(-1);
                        }
                    }
                    if (arr2.length == 1) {
                        pathArr.push(arr2[0]);
                        if (arr2[0] == 1) {
                            index += 1;
                        }
                    } else {
                        if (Math.random() * 1 > 0.5) {
                            pathArr.push(1);
                            index = index + 1;
                        } else {
                            pathArr.push(-1);
                        }
                    }
                }
            }
        }
        this.BallPath = pathArr;
    }
}
