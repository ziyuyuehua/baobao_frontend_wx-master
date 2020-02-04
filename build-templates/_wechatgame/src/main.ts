/// <reference path="./friendlistview.ts" />
enum WxMessage {
    ShowFriendList = 0,
    ShareToFriend = 100
}

let currentView: View;

wx.onMessage((data) => {
    console.log("onMessage", data);
    if (data.fromEngine) {
        if (data.event === "mainLoop") {
            if (!data.value) {
                if (currentView) currentView.onClose();
                currentView = null;
            }
        } else if (data.event === "viewport") {
            viewport = { x: data.x, y: data.y, width: data.width, height: data.height };
            if (currentView) currentView.onViewport(data);
        }
    } else {
        if (data.type >= 100) {
            if (currentView) currentView.onEvent(data.type, data);
            return;
        }
        switch (data.type) {
            case WxMessage.ShowFriendList:
                currentView = new FriendListView(data);
                break;
            default: break;
        }
    }
});

wx.onTouchStart(e => {
    if (currentView) currentView.onTouchStart(e.touches);
});
