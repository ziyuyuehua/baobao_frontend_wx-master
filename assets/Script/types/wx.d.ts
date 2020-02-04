// App 注册程序
interface IAppDescr {
    onLaunch?(): void;

    onShow?(): void;

    onHide?(): void;

    onError?(): void;

    [propName: string]: any;

    globalData?: any;

    getUserInfo?(obj: any): void;

    getCurrentPage?(): IPageDescr;
}

declare interface IApp {
    (obj: IAppDescr): void;

}

declare let App: IApp;

declare function getApp(): IAppDescr;

// Page 注册页面
interface IPageDescr {
    data?: Object;

    onLoad?(): void;

    onReady?(): void;

    onShow?(): void;

    onHide?(): void;

    onUnload?(): void;

    onPullDownRefresh?(): void;

    onReachBottom?(): void;

    onShareAppMessage?(): void;

    [propName: string]: any;

    setData?(obj: Object): void;

    forceUpdate?(): void;

    update?(): void;
}

declare interface IPage {
    (obj: IPageDescr): void;
}

declare let Page: IPage;


// API
interface IWxApi {
    triggerGC?(): void;
    onError?(err: any): void;
    onMemoryWarning?(fn: () => void): void;

    getSharedCanvas();
    getSharedCanvas();

    // 网络 API
    request?(obj: any): void;

    uploadFile?(obj: any): void;

    downloadFile?(obj: any): void;

    connectSocket?(obj: any): void;

    onSocketOpen?(obj: any): void;

    onSocketError?(obj: any): void;

    sendSocketMessage?(obj: any): void;

    onSocketMessage?(obj: any): void;

    closeSocket?(obj: any): void;

    onSocketClose?(obj: any): void;


    // 媒体 API
    chooseImage?(obj: any): void;

    previewImage?(obj: any): void;

    getImageInfo?(obj: any): void;

    startRecord?(obj?: any): void;

    stopRecord?(obj?: any): void;

    playVoice?(obj?: any): void;

    pauseVoice?(obj?: any): void;

    stopVoice?(obj?: any): void;

    getBackgroundAudioPlayerState?(obj: any): void;

    playBackgroundAudio?(obj: any): void;

    pauseBackgroundAudio?(obj: any): void;

    seekBackgroundAudio?(obj: any): void;

    stopBackgroundAudio?(obj: any): void;

    onBackgroundAudioPlay?(obj: any): void;

    onBackgroundAudioPause?(obj: any): void;

    onBackgroundAudioStop?(obj: any): void;

    createAudioContext?(audioId: string): any;

    chooseVideo?(obj: any): void;

    createVideoContext?(videoId: string): any;

    // 文件 API
    saveFile?(obj: any): void;

    getSavedFileList?(obj: any): void;

    getSavedFileInfo?(obj: any): void;

    removeSavedFile?(obj: any): void;

    openDocument?(obj: any): void;


    // 数据 API
    setStorage?(obj: any): void;

    setStorageSync?(key: string, data: Object | String): void;

    getStorage?(obj: any): void;

    getStorageSync?(key: string): any;

    getStorageInfo?(obj: any): void;

    getStorageInfoSync?(obj?: any): void;

    removeStorage?(obj: any): void;

    removeStorageSync?(key: string): void;

    clearStorage?(obj?: any): void;

    clearStorageSync?(obj?: any): void;

    // 位置 API
    getLocation?(obj?: any): void;

    chooseLocation?(obj: any): void;

    openLocation?(obj: any): void;

    createMapContext(mapId: string): any;

    // 设备 API
    getSystemInfo?(obj?: any): void;

    getSystemInfoSync?(obj?: any): any;

    getNetworkType?(obj: any): void;

    onAccelerometerChange?(obj: any): void;

    onCompassChange?(obj: any): void;

    makePhoneCall?(obj: any): void;

    scanCode?(obj: any): void;

    // 界面 API
    showToast?(obj: any): void;

    hideToast?(obj?: any): void;

    showModal?(obj: any): void;

    showActionSheet?(obj: any): void;

    setNavigationBarTitle?(obj: any): void;

    showNavigationBarLoading?(obj?: any): void;

    hideNavigationBarLoading?(obj?: any): void;

    navigateTo?(obj: any): void;

    redirectTo?(obj: any): void;

    switchTab?(obj: any): void;

    navigateBack?(obj?: any): void;

    stopPullDownRefresh?(obj?: any): void;

    hideKeyboard?(obj?: any): void;

    // 动画 API
    createAnimation?(obj?: any): void;

    // 绘图 API
    createContext?(obj?: any): any;

    createCanvasContext?(canvasId: string): any;

    drawCanvas?(obj: any): void;

    toTempFilePath?(obj: any): void;


    // 开放接口 API
    login?(obj: any): void;

    checkSession?(obj: any): void;

    getUserInfo?(obj: any): void;

    requestPayment?(obj: any): void;

    requestMidasPayment?(obj: any): void;

    createUserInfoButton?(obj: any): UserInfoButton;

    shareAppMessage?(obj: any): void;

    getSetting?(obj: any): void;

    onShow(obj: any): void;

    onHide(obj: any): void;

    // 开放域数据 API
    getOpenDataContext?(): OpenDataContext;

    getLaunchOptionsSync(): LaunchOption;

    updateShareMenu(obj: any): void;

    exitMiniProgram(object: any): void;

    getShareInfo(object: any): void;

    hideShareMenu(object: any): void;

    showShareMenu(object: any): void;

    onShareAppMessage(callback?: Function): void;

    updateShareMenu(object: any): void;

    createRewardedVideoAd(object: any): RewardedVideoAd;

    createFeedbackButton(object: any): any;

    navigateToMiniProgram(object: any): void;

    createBannerAd(object: any): BannerAd;

    openCustomerServiceConversation(obj?: any): void;

    authorize(obj: any): void;

    setUserCloudStorage(obj: any):void;
    
    setMessageToFriendQuery(obj: any): void;

    setPreferredFramesPerSecond(num:number):void;

    getUpdateManager():any;
}

interface OpenDataContext {
    postMessage(obj: any): void;

    canvas: HTMLCanvasElement;
}

interface UserInfoButton {
    show(): void;

    hide(): void;

    destroy(): void;

    onTap(callback: Function): void;

    offTap(callback: Function): void;

}

interface BannerAd {
    show(): Promise;

    hide(): void;

    destroy(): void;

    onResize(res: any): void;

    offResize(res: any): void;

    onLoad(callback: Function): void;

    offLoad(callback: Function): void;

    onError(callback: Function): void;

    offError(callback: Function): void;
}

interface RewardedVideoAd {

    load(): Promise;

    show(): Promise;

    onLoad(callback: Function): void;

    offLoad(callback: Function): void;

    onError(callback: Function): void;

    offError(callback: Function): void;

    onClose(callback: Function): void;

    offClose(callback: Function): void;
}

interface LaunchOption {
    scene: number;
    query: any;
    isSticky: boolean;
    shareTicket: string;
    referrerInfo: ReferrerInfo;
}

interface ReferrerInfo {
    appId: string;
    extraData: any;
}

declare let wx: IWxApi;
