/// <reference path="./view.ts" />

interface UserInfo {
    openid: string;
    nickname: string;
    avatarUrl: string;
    level: number;
    avatarImage?: HTMLImageElement;
}

class FriendListView extends View {
    private friendList: UserInfo[];
    private viewport: Viewport;
    private offset = 0;
    private selectItem = 0;
    private pageNum: number;
    private curPage = 0;
    private bgImage: HTMLImageElement;
    private lvImage: HTMLImageElement;
    private selectbgImage: HTMLImageElement;

    constructor(data: any) {
        super();

        let selfOpenid = data.openid;
        this.onViewport(viewport);
        
        Promise.all([loadImage("odc/friend_dikuang.png"), loadImage("odc/dengjikuang.png"), loadImage("odc/xuanzezhuangtai.png"), new Promise((resolve) => {
            wx.getFriendCloudStorage({
                keyList: ['wxFriendRank'],
                success: (res) => {
                    this.friendList = (res.data as Array<any>).filter((value) => {
                        return value.openid != selfOpenid;
                    }).map<UserInfo>((value) => {
                        let level = 0;
                        try {
                            level = JSON.parse(value.KVDataList[0].value).wxgame.level;
                        } catch (e) {
                            console.error(e);
                        }
                        return { openid: value.openid, nickname: value.nickname, avatarUrl: value.avatarUrl, level };
                    });
                    // let len = this.friendList.length;
                    // for (let i = 0; i < len; i++) {
                    //     this.friendList.push(this.friendList[i]);
                    // }
                    // for (let i = 0; i < len; i++) {
                    //     this.friendList.push(this.friendList[i]);
                    // }
                    resolve();
                }
            });
        })]).then((values) => {
            this.bgImage = values[0];
            this.lvImage = values[1];
            this.selectbgImage = values[2];
            if (this.viewport) {
                this.drawFriendsList();
            }
        }).catch((e) => {
            console.error(e);
        });
    }

    onViewport(viewport: Viewport) {
        var x = viewport.x / pixelRatio / winRatio;
        var y = viewport.y / pixelRatio / winRatio;
        var width = viewport.width / pixelRatio / winRatio;
        var height = viewport.height / pixelRatio / winRatio;
        y = winHeight - height - y;
        if (this.viewport && this.viewport.width == width && this.viewport.height == height) return;
        this.viewport = { x, y, width, height };
        console.log("viewport", this.viewport);
        if (this.friendList && this.bgImage) {
            this.drawFriendsList();
        }
    }

    onEvent(event: number, data: any) {
        if (event == 100) {
            wx.shareMessageToFriend({
                openId: this.friendList[this.selectItem].openid,
                title: data.title,
                imageUrl: data.imageUrl,
                imageUrlId: data.imageUrlId
            });
        } else if (event == 101) {
            if (this.pageNum > 1) {
                this.curPage++;
                if (this.curPage >= this.pageNum) {
                    this.curPage = 0;
                }
                let sel = this.selectItem;
                this.selectItem = this.curPage * 4;
                this.drawItem(sel, true);
                this.drawItem(this.selectItem, true);
                this.drawPage(this.curPage);
            }
        }
    }

    private initContentCanvas() {
        let ratio = winRatio * pixelRatio;
        this.pageNum = Math.ceil(this.friendList.length / 4);
        contentCanvas.width = this.viewport.width * this.pageNum * ratio;
        contentCanvas.height = this.viewport.height * ratio;
        contentContext.restore();
        contentContext.save();
        contentContext.clearRect(0, 0, contentCanvas.width, contentCanvas.height);
        contentContext.scale(ratio, ratio);
    }

    private drawFriendsList() {
        if (this.friendList.length == 0) {
            loadImage("odc/maomao.png").then((image) => {
                sharedContext.drawImage(image, (this.viewport.width - 240) / 2, (this.viewport.height - 215) / 2, 240, 215);
            });
            return;
        }
        this.initContentCanvas();
        for (let i = 0; i < this.friendList.length; i++) {
            this.drawItem(i);
        }
        this.drawPage(0);
    }

    private drawItem(i: number, clear = false) {
        const baseX = this.viewport.width * Math.floor(i / 4) + this.viewport.width / 2 * (i % 2);
        const baseY = this.viewport.height / 2 * Math.floor(i % 4 / 2);
        const itemWidth = this.viewport.width / 2;
        const itemHeight = this.viewport.height / 2;
        if (clear) contentContext.clearRect(baseX, baseY, itemWidth, itemHeight);

        if (this.selectItem == i) {
            drawSlicedImage(this.selectbgImage, contentContext, { x: baseX + 5, y: baseY + 5, width: itemWidth - 10, height: itemHeight - 10 });
        } else {
            drawSlicedImage(this.bgImage, contentContext, { x: baseX + 5, y: baseY + 5, width: itemWidth - 10, height: itemHeight - 10 });
        }
        contentContext.fillStyle = '#814D34';
        contentContext.save();
        contentContext.scale(1 / pixelRatio, 1 / pixelRatio);
        contentContext.font = (12 * pixelRatio) + 'px Arial';
        contentContext.textAlign = 'center';
        let nickname = this.friendList[i].nickname;
        if (nickname.length > 5) {
            nickname = nickname.substr(0, 4) + "...";
        }
        contentContext.fillText(nickname,
            (baseX  + itemWidth / 2) * pixelRatio, (baseY + itemHeight - 15) * pixelRatio);
        contentContext.restore();
        const avatarSize = 43;
        const x = baseX + (itemWidth - avatarSize) / 2;
        const y = baseY + (itemHeight - avatarSize) / 2 - 10;
        let drawLevel = () => {
            contentContext.drawImage(this.lvImage, x + avatarSize - 8, y + avatarSize - 15, 15, 18);
            contentContext.save();
            contentContext.scale(1 / pixelRatio, 1 / pixelRatio);
            contentContext.fillStyle = '#814D34';
            contentContext.font = (9 * pixelRatio) + 'px Arial';
            contentContext.textAlign = 'center';
            contentContext.fillText(this.friendList[i].level + "", (x + avatarSize - 1) * pixelRatio, (y + avatarSize - 1) * pixelRatio);
            contentContext.restore();
        };
        if (this.friendList[i].avatarImage) {
            contentContext.drawImage(this.friendList[i].avatarImage, x, y, avatarSize, avatarSize);
            drawLevel();
        } else {
            let avatar = wx.createImage();
            avatar.src = this.friendList[i].avatarUrl;
            avatar.onload = () => {
                this.friendList[i].avatarImage = avatar;
                contentContext.drawImage(avatar, x, y, avatarSize, avatarSize);
                drawLevel();
                this.drawItemList();
            };
            avatar.onerror = () => {
                drawLevel();
                this.drawItemList();
            }
        }
    }

    private drawPage(page: number) {
        this.drawItemList(page * this.viewport.width * winRatio * pixelRatio);
    }

    private drawItemList(offset?: number | undefined) {
        if (typeof offset === 'number') this.offset = offset;
        sharedContext.clearRect(0, 0, winWidth, winHeight);
        sharedContext.drawImage(contentCanvas, this.offset, 0,
            contentCanvas.width / this.pageNum, contentCanvas.height,
            0, 0, this.viewport.width, this.viewport.height);
    }

    onTouchStart(touches: Array<{ clientX: number, clientY: number }>) {
        console.log(touches);
        let touch = touches[0];
        let x = touch.clientX / winRatio - this.viewport.x;
        let y = touch.clientY / winRatio - this.viewport.y;
        let selectIndex = -1;
        if (x > 0 && x <= this.viewport.width / 2) {
            if (y > 0 && y <= this.viewport.height / 2) {
                selectIndex = this.curPage * 4;
            } else if (y < this.viewport.height) {
                selectIndex = this.curPage * 4 + 2;
            }
        } else if (x <= this.viewport.width) {
            if (y > 0 && y <= this.viewport.height / 2) {
                selectIndex = this.curPage * 4 + 1;
            } else if (y < this.viewport.height) {
                selectIndex = this.curPage * 4 + 3;
            }
        }
        if (selectIndex >= 0 && selectIndex < this.friendList.length && selectIndex != this.selectItem) {
            let preSel = this.selectItem;
            this.selectItem = selectIndex;
            this.drawItem(preSel, true);
            this.drawItem(selectIndex, true);
            this.drawItemList();
        }
    }
}
