// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class announceData {

    private noticeData: any[] = []; //公告列表
    private lastReadNoticeId: number = -1;

    set NoticeData(data: any[]) {
        data.sort((a, b) => {
            return a.priority - b.priority
        });
        this.noticeData = data;
    }

    get NoticeData() {
        return this.noticeData;
    }
    set LastReadNoticeId(data: number) {
        this.lastReadNoticeId = data;
    }

    get LastReadNoticeId() {
        return this.lastReadNoticeId;
    }
}
