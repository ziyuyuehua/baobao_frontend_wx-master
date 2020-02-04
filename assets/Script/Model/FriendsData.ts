import {ClientEvents} from "../global/manager/ClientEventCenter";
import {HttpInst} from "../core/http/HttpClient";
import {NetConfig} from "../global/const/NetConfig";
import {StaffData} from "./StaffData";
import {DataMgr} from "./DataManager";
import {JsonMgr} from "../global/manager/JsonManager";
import {
    IFocusInfo,
    IFosterFriend,
    IFosterInfo,
    IFriendsFosterInfo,
    IFriendsInfo,
    IFriendsItem,
    IMarketStatus
} from "../types/Response";


export class Focus {

    focus: Array<IFriendsItem> = [];
    focusSize: number;
    newFocusSize: number = -1;
    searchFocus: Array<IFriendsItem>;
    searchFocusSize: number;
    itemSize: Array<number> = [];
    page: number = 1;
    leg: number = 10;
    friendsID: number = 0;
    setFocus = (response: IFriendsItem[]) => {
        this.page = 1;
        this.focus = response;
        this.leg = response.length;
        this.setItemSize();
    };

    setItemSize = () => {
        this.itemSize = [];
        let size: number = this.searchFocus ? this.searchFocus.length : this.focus.length;
        for (let i = 0; i < size; i++) {
            let marketStatus: IMarketStatus[] = this.searchFocus ? this.searchFocus[i].marketStatus : this.focus[i].marketStatus;
            let num: number = marketStatus.length === 1 ? 0 : marketStatus.length;
            this.itemSize.push((105 + num * 77));
        }
    };

    getItemSize = () => {
        return this.itemSize;
    };

    setNewFocusSize = (num: number) => {
        this.newFocusSize = num;
    };

    getNewFocusSize = () => {
        return this.newFocusSize;
    };

    setFriendsID = (index: number) => {
        this.friendsID = index;
    };

    getFriendsID = () => {
        return this.friendsID;
    };

    setSearchFocus = (data: IFriendsItem[]) => {
        this.searchFocus = data;
        this.setItemSize();
    };

    getSearchBoole = () => {
        return this.searchFocus;
    };

    getSearchFocus = (idx: number) => {
        return this.searchFocus[idx];
    };

    setFocusCache = (response: IFriendsItem[]) => {
        this.focus = this.focus.concat(response);
        this.setItemSize();
        ClientEvents.REFRESH_FOCUS_LIST.emit();
    };

    setFocusSize = (res: number, ble: boolean) => {
        if (ble) {
            this.focusSize = res;
        } else {
            this.focusSize = this.focus.length;
        }
    };

    upFocus = (index: number) => {
        let sum: number = (this.page * this.leg) > this.focusSize ? this.focusSize : (this.page * this.leg);
        if ((index === (sum - 5)) && (sum < this.focusSize)) {
            this.page += 1;
            HttpInst.postData(NetConfig.FOCUS_PAGING, [this.page], (res: IFriendsInfo) => {
                this.setFocusCache(res.focus);

            });
        }
    };

    getFocus = () => {
        return this.focus;
    };

    setFocusState = (idx: number, focus: boolean, mutualFocus: boolean) => {
        if (this.searchFocus) {
            this.searchFocus[idx].focus = focus;
            this.searchFocus[idx].mutualFocus = mutualFocus;
        } else {
            this.focus[idx].focus = focus;
            this.focus[idx].mutualFocus = mutualFocus;
        }
    };

    getFocusIdx = (index: number) => {
        return this.focus[index];
    };

    upSingleFriedns = (idx: number, num: number[]) => {
        let size = this.focus.length;
        for (let i = 0; i < size; i++) {
            if (this.focus[i].id === idx) {
                this.focus[i].recruit = num[0] > 0;
                let MarketId: number = DataMgr.getCurMarketId();
                let marketStatus: IMarketStatus = this.focus[i].marketStatus[MarketId - 1];
                marketStatus.status = (num[1] > 0 ? 2 : 0) + (num[2] > 0 ? 4 : 0);
                ClientEvents.HANDLE_SINGLE_FRIENDS.emit(idx);
                break;
            }
        }
    }

}

export class QueryFriend {
    queryFriend: Array<IFriendsItem>;

    setQueryFriend = (response: IFriendsItem[]) => {
        this.queryFriend = response;
    };

    upQueryFriend = (idx: number, focus: boolean, mutualFocus: boolean) => {
        this.queryFriend[idx].focus = focus;
        this.queryFriend[idx].mutualFocus = mutualFocus;
    }
}

export class Recommended {
    recommended: Array<IFriendsItem>;

    setRecommended = (response: IFriendsItem[]) => {
        this.recommended = response;
        ClientEvents.EVENT_LOAD_RECOMENDED.emit();
    };
    getRecommendedSize = () => {
        return this.recommended.length;
    };
    upResponse = (idx: number, focus: boolean, mutualFocus: boolean) => {
        this.recommended[idx].focus = focus;
        this.recommended[idx].mutualFocus = mutualFocus;
    }
}

export class FosterCareData {
    fosterCare: Array<IFosterInfo>;
    staffIdArray: Array<number>;
    friendsIdArray: Array<number>;
    friendsStaffList: IFriendsFosterInfo;
    minTime: number;
    Time: Array<number>;
    remainTime: number[] = [];
    index: number;
    softLeftCount: number = 0;
    focus: IFocusInfo[] = [];
    friendId: number = 0;
    fosterFriends: IFocusInfo[] = [];
    page: number = 0;
    leg: number = 0;
    private focusSize: number = 0;

    setFocusSzie(num: number) {
        this.focusSize = num;
    }

    getFocusSize() {
        return this.focusSize;
    }

    setFosterFriends(res: IFocusInfo[]) {
        this.fosterFriends = res;
        this.page = 1;
        this.leg = res.length;
    }

    getFosterFriends() {
        return this.fosterFriends;
    }

    setFosterCare(res) {
        this.fosterCare = res;
        this.setStaffIdArray();
        this.setFriendsIdArray();
        this.minTime = Math.min.apply(null, this.Time);
        this.red();
    };

    upFocusData = (index: number) => {
        let sum: number = (this.page * this.leg) > this.focusSize ? this.focusSize : (this.page * this.leg);
        if ((index === (sum - 5)) && (sum < this.focusSize)) {
            this.page += 1;
            HttpInst.postData(NetConfig.FOSTER_FRIEND, [this.page], (res: IFosterFriend) => {
                this.setFocusCache(res.focus);
            });
        }
    };

    setFocusCache(data: IFocusInfo[]) {
        this.fosterFriends = this.fosterFriends.concat(data);
        ClientEvents.REFRESH_FOSTER_SCROLL.emit();
    }

    red = () => {
        let nowTimeStamp = DataMgr.getServerTime();
        let staff: StaffData = DataMgr.staffData;
        if (staff) {
            let IdleNum: number = staff.findIdleStaffNum();
            if (IdleNum === 0) {
                // ClientEvents.EVENT_FOSTER_CARE_RED_DOT.emit(false);
                return;
            }
        }
        let focus: Focus = DataMgr.getFocusData();
        if (focus) {
            let focusSize: number = focus.focusSize;
            if (focusSize === 0) {
                // ClientEvents.EVENT_FOSTER_CARE_RED_DOT.emit(false);
                return;
            }
        }
        let data: FosterCareData = DataMgr.getFosterCare();
        if (data) {
            let size: number = data.getFosterCareSize();
            if (size === 3) {
                let fosterTime: any = JsonMgr.getConstVal("fosterTime");
                let time = DataMgr.getFosterCare().minTime;
                if (nowTimeStamp > (time * 1000 + fosterTime * 3600000)) {
                    // ClientEvents.EVENT_FOSTER_CARE_RED_DOT.emit(true);
                } else {
                    // ClientEvents.EVENT_FOSTER_CARE_RED_DOT.emit(false);
                }
            } else {
                // ClientEvents.EVENT_FOSTER_CARE_RED_DOT.emit(true);
            }
        }
    };

    setFriendsStaffList = (res: any) => {
        this.friendsStaffList = res;
    };

    getFosterCareSize = () => {
        return this.fosterCare.length;
    };

    setStaffIdArray = () => {
        // let leg: number = this.fosterCare.length;
        // this.staffIdArray = new Array<number>();
        // this.Time = new Array<number>();
        // for (let i = 0; i < leg; i++) {
        //     this.staffIdArray.push(this.fosterCare[i].staffId);
        //     this.Time.push(this.fosterCare[i].fosterStarTime);
        // }
    };

    setFriendsIdArray = () => {
        let leg: number = this.fosterCare.length;
        this.friendsIdArray = new Array<number>();
        for (let i = 0; i < leg; i++) {
            this.friendsIdArray.push(this.fosterCare[i].friendId);
        }
    };

    findFosterCare = () => {
        let leg: number = this.fosterCare.length;
        for (let i = 0; i < leg; i++) {
            if (this.fosterCare[i].friendId === DataMgr.getFocusData().friendsID) {
                return this.fosterCare[i];
            }
        }
    }
}

export interface fosterList {
    fosterStarTime: number;
    friendId: number;
    staffId: number;
    artResId: number;
    // friendHead: string;
    friendName: string;
    friendLv: number;
    canGainExp: number
    //头像
    head: string;
    //头像边框
    pendant: string
}


export interface friends {
    focusHasNewFans: string;
    garbage: boolean;
    fans: boolean;
    focus: boolean;
    headurl: string;
    id: number;
    level: number;
    mutualFocus: boolean;
    nickName: string;
    openid: string;
    shopName: string;
    //头像
    head: string;
    //头像边框
    pendant: string
}
