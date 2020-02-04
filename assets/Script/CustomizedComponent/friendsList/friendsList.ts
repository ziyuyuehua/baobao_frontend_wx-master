import FriendsItem from "./friendsItem";
import List from "../../Utils/GridScrollUtil/List";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {ButtonMgr} from "../common/ButtonClick";
import {DataMgr} from "../../Model/DataManager";
import {UIMgr} from "../../global/manager/UIManager";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {GameComponent} from "../../core/component/GameComponent";
import SearchNode from "../friends/searchNode";
import {Focus} from "../../Model/FriendsData";
import {IFriendsItem} from "../../types/Response";
import {COUNTERTYPE, DotInst} from "../common/dotClient";
import WxFriends from "../friends/wxFriends";
import {GameManager} from "../../global/manager/GameManager";
import {TextTipConst} from "../../global/const/TextTipConst";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FriendsList extends GameComponent {
    static url = 'friendsList/friendsList';

//垂直列表
    @property(List)
    friendsListV: List = null;
    @property(List)
    focusListV: List = null;
    @property(cc.Node)
    private openBtn: cc.Node = null;
    @property(cc.Node)
    private friendsScrollView: cc.Node = null;
    @property(cc.Node)
    private view: cc.Node = null;
    @property(cc.Node)
    private content: cc.Node = null;
    @property(cc.Node)
    private focusScrollView: cc.Node = null;
    @property(cc.Node)
    private view1: cc.Node = null;
    @property(cc.Node)
    private content1: cc.Node = null;
    @property(cc.Node)
    private downBtnNode: cc.Node = null;
    @property(cc.Sprite)
    private friendsBtn: cc.Sprite = null;
    @property(cc.Sprite)
    private focusBtn: cc.Sprite = null;
    @property([cc.Node])
    private haoyou: Array<cc.Node> = [];
    @property([cc.Node])
    private guanzhu: Array<cc.Node> = [];
    @property(cc.Button)
    private refreshBtn: cc.Button = null;
    @property(cc.Node)
    private addBtn: cc.Node = null;
    @property(cc.Node)
    private addWXBtn: cc.Node = null;
    @property(cc.Sprite)
    private addFriendsBtn: cc.Sprite = null;
    @property(cc.Node)
    private addFocusBtn: cc.Node = null;
    @property(cc.EditBox)
    private friendsSearchEditBox: cc.EditBox = null;
    @property(cc.EditBox)
    private focusSearchEditBox: cc.EditBox = null;
    @property(cc.Sprite)
    private friendsSearch: cc.Sprite = null;
    @property(cc.Sprite)
    private focusSearch: cc.Sprite = null;
    @property(cc.RichText)
    private friendsSize: cc.RichText = null;
    @property(cc.RichText)
    private focusSize: cc.RichText = null;
    @property([cc.SpriteFrame])
    private BtnSF: cc.SpriteFrame[] = [];//搜索//删除//好友按钮背景//添加按钮背景
    @property(cc.Node)
    // private inFosterCare: cc.Node = null;
    private cancelFocus: cc.Node = null;
    @property(cc.Label)
    private nameLaber: cc.Label = null;
    @property(cc.Node)
    private aboveBtnNode: cc.Node = null;
    @property(cc.Node)
    private focusTab: cc.Node = null;
    @property(cc.Node)
    private maskNode: cc.Node = null;
    @property(cc.Node)
    private TEXT_LABEL: cc.Node = null;
    @property(cc.Node)
    private lodingBtn: cc.Node = null;
    private friendsUserId: number = -1;
    private friendsFDId: number = -1;
    private listState: string = "all";//全部//half//一半
    private btnState: string = "friends";
    private friendsScroll: boolean = false;
    private focusScroll: boolean = false;
    private friendsItem: IFriendsItem = null;
    private cb: Function = null;
    private wxLoginBtn = null;


    getBaseUrl() {
        return FriendsList.url;
    }

    onLoad() {
        // if (ServerConst.isDefaultPlatform()) {
        // this.aboveBtnNode.active = false;
        // this.focusTab.active = true;
        this.onFocusBtn();
        // } else {
        //     this.loadFriends();
        // }
        this.addEvent(ClientEvents.EVENT_ADD_FRIEND.on(this.loadFocus));
        this.addEvent(ClientEvents.REFRESH_FOCUS_LIST.on(this.refreshFocusList));
        this.addEvent(ClientEvents.GO_HOME.on(this.GoHome));
        this.addEvent(ClientEvents.EVENT_CANCEL_FOCUS.on(this.cancelFocusBox));
        this.addEvent(ClientEvents.OPERATE_FRIENDs_HOME.on(this.refreshFriends));
    }

    protected onEnable(): void {
        if (this.wxLoginBtn != null) {
            this.wxLoginBtn.show();
        }
    }

    hideWxLoginBtn = () => {
        if (this.wxLoginBtn != null) {
            this.wxLoginBtn.hide();
        }
    };

    showWxLoginBtn = () => {
        if (this.wxLoginBtn != null) {
            this.wxLoginBtn.show();
        }
    };

    GoHome = (ble: boolean) => {
        this.switchBtn(false);
        this.listState = "all";
        let node1: cc.Node = UIMgr.getView(FriendsList.url);
        if (!node1) return;
        if (ble) {
            this.friendsFDId = -1;
            this.friendsUserId = -1;
            this.focusListV.selectedId = -1;
            // this.friendsListV.selectedId = -1;
            node1.getChildByName("maskNode").active = true;
        } else {
            node1.active = true;
            if (node1.active) {
                this.showWxLoginBtn();
            }
        }
    };

    slidingRange() {
        // if (this.BtnState()) {
        //     cc.log(this.friendsListV.scrollView.getScrollOffset());
        // } else {
        if (this.focusScroll) {
            let scrollView: cc.ScrollView = this.focusListV.scrollView;
            let offsetY: number = scrollView.getScrollOffset().y;
            if (offsetY > 90) {
                scrollView.content.y = 90;
            } else if (offsetY < -90) {
                scrollView.content.y = -90;
            }
            // }
        }
    };

    // loadFriends = () => {
    //     let data = DataMgr.getFriendsData();
    //     this.friendsListV.selectedId = -1;
    //     if (data && data.focusSize > 0) {
    //         this.friendsListV.scrollTo(0, 0);
    //         this.friendsListV.numItems = data.focusSize;
    //         let scrollView: cc.Node = this.friendsListV.scrollView.node;
    //         let content: cc.Node = this.friendsListV.scrollView.content;
    //         if (scrollView.height > content.height) {
    //             content.height = scrollView.height + 10;
    //         }
    //         this.addFriendsBtn.node.active = false;
    //     } else {
    //         this.friendsListV.numItems = 0;
    //         this.addFriendsBtn.node.active = true;
    //     }
    // };

    loadFocus = () => {
        let data = DataMgr.getFocusData();
        if (data.getSearchBoole()) {
            return;
        }
        this.focusListV.selectedId = -1;
        if (data && data.focusSize > 0) {
            this.focusListV.scrollTo(0, 0);
            this.focusListV.customSize = data.getItemSize();
            this.focusListV.numItems = data.focusSize;
            let scrollView: cc.Node = this.focusListV.scrollView.node;
            let content: cc.Node = this.focusListV.scrollView.content;
            this.focusScroll = false;
            if (scrollView.height > content.height) {
                content.height = scrollView.height + 10;
                this.focusScroll = true;
            }
            this.addFocusBtn.active = false;
        } else {
            this.focusListV.numItems = 0;
            this.addFocusBtn.active = true;
        }
    };

    refreshFocusList = () => {
        // if (this.BtnState()) {
        //     let data = DataMgr.getFriendsData();
        //     this.friendsListV.customSize = data.getItemSize();
        //     this.friendsListV.numItems = data.focusSize;
        // } else {
        let data = DataMgr.getFocusData();
        this.focusListV.customSize = data.getItemSize();
        this.focusListV.numItems = data.focusSize;
        // }
    };
    // BtnState = () => {
    //     return this.btnState === "friends";
    // };
    ListState = () => {
        return this.listState === "all";
    };

    start() {
        this.setLodingBtn();
        ButtonMgr.addClick(this.openBtn, () => {
            this.hideWxLoginBtn();
            this.node.parent.parent.active = false;

            // switch (this.listState) {
            //     case "all":
            //         this.node.parent.parent.active = false;
            //         break;
            //     case "half":
            //         this.switchBtn(false);
            //         this.listState = "all";
            //         break;
            // }
        });

        ButtonMgr.addClick(this.refreshBtn.node, this.refreshFriends);

        ButtonMgr.addClick(this.addBtn, () => {
            this.loadAddView();
        });
        ButtonMgr.addClick(this.addWXBtn, () => {//微信好友
            UIMgr.showView(WxFriends.url, cc.director.getScene());
        });

        // ButtonMgr.addClick(this.friendsBtn.node, () => {
        //     if (!this.BtnState()) {
        //         this.focusSearchBtn(true);
        //         this.btnState = "friends";
        //         this.focusScrollView.active = false;
        //         this.friendsScrollView.active = true;
        //         this.friendsBtn.spriteFrame = this.BtnSF[4];
        //         this.focusBtn.spriteFrame = this.BtnSF[3];
        //         this.addBtn.active = false;
        //     }
        // });

        ButtonMgr.addClick(this.focusBtn.node, this.onFocusBtn);

        // ButtonMgr.addClick(this.friendsSearch.node, () => {
        //     DotInst.clientSendDot(COUNTERTYPE.friend, "10201", this.friendsSearchEditBox.string);
        //     this.friendsSearchBtn();
        // });
        ButtonMgr.addClick(this.focusSearch.node, () => {
            this.focusSearchBtn();
        });
        ButtonMgr.addClick(this.addFocusBtn, () => {
            DotInst.clientSendDot(COUNTERTYPE.friend, "10202");
            this.loadAddView();
        });
        ButtonMgr.addClick(this.maskNode, () => {
            this.hideWxLoginBtn();
            this.node.parent.parent.active = false;
        });

    }

    refreshFriends = () => {
        if (this.refreshBtn.interactable) {
            this.refreshBtn.interactable = false;
            setTimeout(() => {
                if (this.refreshBtn) {
                    this.refreshBtn.interactable = true;
                }
            }, 3000);
            DotInst.clientSendDot(COUNTERTYPE.friend, "10212");
            // if (this.BtnState()) {
            //     cc.log("刷新好友");
            // } else {
            HttpInst.postData(NetConfig.FOCUS_PAGING, [1], (res) => {
                DataMgr.loadFocusData(res);
                this.loadFocus();
            });
            // }
        }
    };


    onFocusBtn = () => {
        // if (this.BtnState()) {
        // this.friendsSearchBtn(true);
        // this.btnState = "focus";
        // let data = DataMgr.getFocusData();
        // this.focusScrollView.active = true;
        // this.friendsScrollView.active = false;
        // if (!data) {
        //     HttpInst.postData(NetConfig.FOCUS_PAGING, [1], (res) => {
        //         DataMgr.loadFocusData(res);
        //         this.loadFocus();
        //     });
        // } else {
        this.loadFocus();
        // }
        // this.friendsBtn.spriteFrame = this.BtnSF[2];
        // this.focusBtn.spriteFrame = this.BtnSF[5];
        if (this.ListState()) {
            this.addBtn.active = true;
        }
        // }
    };

    loadAddView = () => {
        HttpInst.postData(NetConfig.RECOMMEND_FRIEND, [], (res: any) => {
            UIMgr.showView(SearchNode.url, cc.director.getScene(), null, () => {
                DataMgr.loadRecommended(res);
                // DataMgr.loadHasNewFans(res);
            });
        });
    };

    EditingDidBegan() {
        if (!this.ListState()) {
            this.switchBtn(false);
            this.listState = "all";
        }
    };

    setFriendsUserId = (idx: number) => {
        if (this.friendsUserId != idx) {
            // this.BtnState() ?
            // this.focusListV.selectedId = -1; //: this.friendsListV.selectedId = -1;
            if (this.ListState()) {
                this.switchBtn(true);
                this.listState = "half";
            }
            this.friendsUserId = idx;
        }
    };

    getFriendsUsetId = () => {
        return this.friendsUserId;
    };

    setFriendsFDId = (idx: number) => {
        this.friendsFDId = idx;
    };
    getFriendsFDId = () => {
        return this.friendsFDId;
    };

    switchBtn = (ble: boolean) => {
        if (this.node.parent.parent.active) {
            ble ? this.hideWxLoginBtn() : this.showWxLoginBtn();
        }
        this.node.width = ble ? 160 : 375;
        this.focusSearchEditBox.node.width = ble ? 130 : 300;
        this.TEXT_LABEL.width = ble ? 120 : 298;
        this.TEXT_LABEL.x = ble ? -57 : -148;
        // this.friendsSearchEditBox.node.width = ble ? 130 : 300;
        // let layout: cc.Layout = this.friendsBtn.getComponent(cc.Layout);
        let layout1: cc.Layout = this.focusBtn.getComponent(cc.Layout);

        // layout.paddingLeft = ble ? 10 : 30;
        // layout.paddingRight = ble ? 10 : 30;
        layout1.paddingLeft = ble ? 10 : 30;
        layout1.paddingRight = ble ? 10 : 30;

        let w: number = ble ? 131 : 346;
        // this.friendsScrollView.width = w;
        // this.view.width = w;
        // this.content.width = w;
        this.focusScrollView.width = w;
        this.view1.width = w;
        this.content1.width = w;

        // this.haoyou.forEach((item: cc.Node) => {
        //     item.active = !ble;
        // });
        this.guanzhu.forEach((item: cc.Node) => {
            item.active = !ble;
        });
        // let sf: cc.SpriteFrame = null;
        // ble ? sf = this.BtnSF[7] : sf = this.BtnSF[6];
        // this.addFriendsBtn.spriteFrame = sf;
        this.focusSearch.node.active = !ble;
        // this.friendsSearch.node.active = !ble;
        this.addBtn.active = !ble;
        this.addWXBtn.active = !ble;
        ble ? /*this.friendsListV.size =*/ this.focusListV.size = 130 : /*this.friendsListV.size =*/ this.focusListV.size = 345;
        ClientEvents.SWITCH_FRIENDS_STATE.emit(ble);
    };


    //列表渲染器
    onListVRender(item: cc.Node, idx: number) {
        let data: Focus = DataMgr.getFocusData();
        // if (this.BtnState()) {
        //     data = DataMgr.getFriendsData();
        // } else {
        // data = DataMgr.getFocusData();
        // }
        let data1: Array<IFriendsItem> = null;
        if (data.getSearchBoole()) {
            data1 = data.getSearchBoole();
        } else {
            data1 = data.getFocus();
        }
        data.upFocus(idx);
        let friendsItem: FriendsItem = item.getComponent(FriendsItem);
        friendsItem.itemInit(data1[idx], idx, !this.ListState());
    }

    //当列表项被选择...
    onListSelected(item: cc.Node, selectedId: number, lastSelectedId: number, val: number) {
        // if (!item)
        //     return;
        // let friendsData = DataMgr.friendsData;
        // let focusData = DataMgr.focusData;
        // let id: number = -2;
        // if (this.BtnState()) {
        //     if (friendsData.getSearchBoole()) {
        //         id = friendsData.getSearchFocus(selectedId).id;
        //     } else {
        //         id = friendsData.getFocusIdx(selectedId).id;
        //     }
        // } else {
        //     if (focusData.getSearchBoole()) {
        //         id = focusData.getSearchFocus(selectedId).id;
        //     } else {
        //         id = focusData.getFocusIdx(selectedId).id;
        //     }
        // }
        //
        // if (this.friendsUserId === id) {
        //     return;
        // } else {
        //     this.friendsUserId = id
        // }
        //
        // // let data: IFriendsItem[] = null;
        // // this.btnState === "friends" ? data = DataMgr.getFriendsData().focus : data = DataMgr.getFocusData().focus;
        // // HttpInst.postData(NetConfig.VISIT_FRIENG, [data[selectedId].id], this.Friends);访问好友家
        //
        // let list: List = item.getComponent(ListItem).list;
        // let str: string = '当前操作List为：' + list.node.name + '，当前选择的是：' + selectedId + '，上一次选择的是：' + lastSelectedId;
        // cc.log(str);
    }

    // Friends = (response: any) => {
    //     DataMgr.loadMap(response);
    //     UIMgr.showView("friendsList/friendsScene", null, null, (node: cc.Node) => {
    //         node.getComponent("friendsScene").loadFriends(response);
    //     });
    // };

    //搜索已有好友
    // friendsSearchBtn(ble: boolean = false) {
    //     if (this.BtnState()) {
    //         let data = DataMgr.getFriendsData();
    //         if (data && data.getSearchBoole()) {
    //             this.friendsSearchEditBox.string = "";
    //             this.friendsSearch.spriteFrame = this.BtnSF[0];
    //             data.setSearchFocus(null);
    //             this.friendsListV.scrollTo(0, 0);
    //             this.friendsListV.numItems = 10;
    //             this.friendsSize.node.active = false;
    //         } else {
    //             if (ble) {
    //                 return;
    //             }
    //             let size: number = data.focusSize;
    //             if (size <= 0) {
    //                 UIMgr.showTipText(TipConst.NOFRIDEN);
    //             } else {
    //                 let text = this.friendsSearchEditBox.string;
    //                 if (text) {
    //                     HttpInst.postData(NetConfig.QUERY_FOCUS_FRIEND, [text], (res: any) => {
    //                         DataMgr.getFriendsData().setSearchFocus(res);
    //                         this.friendsSearch.spriteFrame = this.BtnSF[1];
    //                         this.friendsListV.numItems = 10;
    //                         this.friendsListV.scrollTo(0, 0);
    //                         this.friendsSize.node.active = true;
    //                         this.friendsSize.string = "";
    //                     });
    //                 } else {
    //                     UIMgr.showTipText(TipConst.SOUSUONEIRONG);
    //                 }
    //             }
    //         }
    //     }
    // }


//搜索已有关注
    focusSearchBtn(ble: boolean = false) {
        // if (!this.BtnState()) {
        let data = DataMgr.getFocusData();
        if (data && data.getSearchBoole()) {
            this.focusListV.selectedId = -1;
            this.focusSearchEditBox.string = "";
            this.focusSearch.spriteFrame = this.BtnSF[0];
            data.setSearchFocus(null);
            // this.focusListV.scrollTo(0, 0);
            // this.focusListV.numItems = data.focusSize;
            HttpInst.postData(NetConfig.FOCUS_PAGING, [1], (res) => {
                DataMgr.loadFocusData(res);
                // DataMgr.loadHasNewFans(res);
                this.loadFocus();
            });
            this.focusSize.node.active = false;
        } else {
            if (ble) {
                return;
            }
            let size: number = data.focusSize;
            if (size <= 0) {
                UIMgr.showTipText(TextTipConst.NOFRIDEN);
            } else {
                let text = this.focusSearchEditBox.string;
                if (text) {
                    HttpInst.postData(NetConfig.QUERY_FOCUS_FRIEND, [text], (res: any) => {
                        if (res.queryFriend.length > 0) {
                            this.focusListV.selectedId = -1;
                            DataMgr.getFocusData().setSearchFocus(res.queryFriend);
                            this.focusListV.customSize = DataMgr.getFocusData().getItemSize();
                            this.focusSearch.spriteFrame = this.BtnSF[1];
                            this.focusListV.numItems = res.queryFriend.length;
                            this.focusListV.scrollTo(0, 0);
                            this.focusSize.node.active = true;
                            this.focusSize.string = "<color=#814434>筛选出</color><color=#3ca900>" + res.queryFriend.length + "</color><color=#814434>/" + DataMgr.getFocusData().focusSize + "个人</color>";
                        } else {
                            this.focusSearchEditBox.string = "";
                            UIMgr.showTipText(TextTipConst.NOQUERYFRIDEN);
                        }
                    });
                } else {
                    UIMgr.showTipText(TextTipConst.SOUSUONEIRONG);
                }
            }
        }
        // }
    }

    selectedId = (idx: number) => {
        if (idx < 0) {
            return;
        }
        /* this.BtnState() ? this.friendsListV.selectedId = idx : */
        this.focusListV.selectedId = idx;
    };

    onDestroy() {
        super.onDestroy();
    }

    //关闭取消关注确定弹窗
    cancelBtn() {
        // this.inFosterCare.active = false;
        this.cancelFocus.active = false;
    }

    cancelFocusBox = (res: IFriendsItem, cb: Function) => {
        this.cb = cb;
        this.friendsItem = res;
        this.cancelFocus.active = true;
        this.nameLaber.string = this.friendsItem.nickName + "是你互相关注的朋友，要取消对ta的关注吗？";
        // let data: FosterCareData = DataMgr.getFosterCare();
        // if (data !== null) {
        //     if (data.findFosterCare()) {
        //         this.inFosterCare.active = true;
        //     }
        // }
    };

    //取消关注确认按钮
    cancelFocusOkBtn() {
        this.cb();
        this.cancelFocus.active = false;

        // HttpInst.postData(NetConfig.QUXIAOGUANZHU, [this.friendsItem.id], () => {
        //     // DataMgr.loadFocusData(res);
        //     UIMgr.showTipText(TipConst.CACLEGUANSUC);
        //     this.cancelFocus.active = false;
        //     // //获取自己寄养出去的员工
        //     // HttpInst.postData(NetConfig.GET_FOSTER_INFO, [], (res: any) => {
        //     //
        //     // });
        // });
    }

    setLodingBtn() {
        (GameManager.WxServices._wxGetSetting(() => {
            if(this.lodingBtn){
                this.lodingBtn.active = false;
            }
        }, () => {
            if(this.lodingBtn){
                this.lodingBtn.active = true;
                this.createLoginBtn();
            }
        }));
    }

    private createLoginBtn(): void {
        let btnSize = cc.size(this.lodingBtn.width + 5, this.lodingBtn.height + 5);
        let frameSize = cc.view.getFrameSize();
        let winSize = cc.winSize;
        let cv: cc.Vec2 = this.addWXBtn.convertToWorldSpaceAR(this.lodingBtn.position);
        let cv1: cc.Vec2 = UIMgr.getCanvas().convertToNodeSpaceAR(cv);
        //适配不同机型来创建微信授权按钮
        let left = (winSize.width * 0.5 + cv1.x - btnSize.width * 0.5) / winSize.width * frameSize.width;
        let top = (winSize.height * 0.5 - cv1.y - btnSize.height * 0.5) / winSize.height * frameSize.height;
        let width = btnSize.width / winSize.width * frameSize.width;
        let height = btnSize.height / winSize.height * frameSize.height;

        this.wxLoginBtn = wx.createUserInfoButton({
            type: 'text',
            text: "",
            style: {
                left: left,
                top: top,
                width: width,
                height: height,
                lineHeight: 0,
                backgroundColor: '',
                color: '',
                textAlign: 'center',
                fontSize: 16,
                borderRadius: 4
            }
        });
        this.wxLoginBtn.show();

        this.wxLoginBtn.onTap((res: any) => {
            if (res.userInfo) {
                if(this.lodingBtn){
                    this.lodingBtn.active = false;
                }
                if (this.wxLoginBtn != null) {
                    this.wxLoginBtn.hide();
                    this.wxLoginBtn.destroy();
                }
                GameManager.WxServices._wxGetUserInfo(() => {
                    UIMgr.showView(WxFriends.url, cc.director.getScene());
                });
            } else {
                cc.log("wxLogin auth fail");
                wx.showToast({title: "授权失败,请重新授权"});
            }
        });
    }
}
