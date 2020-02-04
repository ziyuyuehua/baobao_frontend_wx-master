// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

export enum FavorType {
    NONE = 0,                   //不增加什么
    ItemGift = 1,               //获得道具
    StaffAttNum = 2,            //提高员工属性（数值）
    StaffAttBai = 3,            //提高员工属性（百分比）
    StaffAction = 4,            //解锁员工动作  -
    StaffAllNum = 5,            //提高全部员工属性（数值）
    StaffAllBai = 6,            //提高全部员工属性（百分比）
    UnlockTheLines = 7,         //解锁台词  -
    UnlockSpecialFriend = 8,     //解锁特殊好友框   -
    UnlockChangeBatch = 9       //解锁换一批    -
}

export enum FavorAniType {
    STAFFATT = 1,
    ITEM = 2,
    ACTION = 3,
    SPECIAL = 4
}