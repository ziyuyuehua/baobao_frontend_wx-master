interface SystemInfo {
    screenWidth: number;
    screenHeight: number;
    pixelRatio: number;
}

declare namespace wx {
    export function onMessage(func: (data: any) => void): void;
    export function getSharedCanvas(): HTMLCanvasElement;
    export function createCanvas(): HTMLCanvasElement;
    export function createImage(): HTMLImageElement;
    export function getSystemInfoSync(): SystemInfo;
    export function getFriendCloudStorage(obj: {keyList: string[], success: (res: any)=>void}): void;
    export function onTouchStart(event: any);
    export function shareMessageToFriend(msg: Object);
}
