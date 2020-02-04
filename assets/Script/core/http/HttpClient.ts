/*
 * @Author: tyq
 * @Date: 2019-01-10
 * @Desc:
 * 服务端要注意开启允许跨域
 * PHP: header('Access-Control-Allow-Origin:http://xxx');
 */

import {ServerConst} from "../../global/const/ServerConst";
import {StringUtil} from "../../Utils/StringUtil";
import {HttpProcessor, HttpResponse} from "./HttpProcessor";
import {Queue} from "../../Utils/dataStructures/Queue";
import {DataMgr} from "../../Model/DataManager";
import {UIMgr} from "../../global/manager/UIManager";
import {COUNTERTYPE, DotInst} from "../../CustomizedComponent/common/dotClient";

export enum ServerStatus {
    ERROR = -1,
    STOP_SERVER = -2,
    SUCCESS = 200,
    JUMPCHARGE = 202027,
    JUMPCHARGEWX = 1903,    //微信支付不足
    WXPAYFAIL = 1904,   //支付失败
    RESETLOGIN = 1905,  //重新登录
}

export class HttpRequest {
    method: string;
    timeout: number;
    contentType: string;

    constructor(method: string, timeout: number, contentType: string = null) {
        this.method = method;
        this.timeout = timeout;
        this.contentType = contentType;
    }
}

class HttpTask {
    id: number;
    param: any;
    time: number;
    run: Function;
    isPolling: boolean;

    constructor(id: number, param: any, time: number, run: Function, isPolling: boolean) {
        this.id = id;
        this.param = param;
        this.time = time;
        this.run = run;
        this.isPolling = isPolling;
    }
}

const GET = new HttpRequest("GET", 3000);
const POST = new HttpRequest("POST", 10000, "application/json");
const PUT = new HttpRequest("PUT", 5000, "application/json");
const DELETE = new HttpRequest("DELETE", 5000, "application/json");

export class HttpClient {

    static instance: HttpClient = new HttpClient();

    private authorization: string = null;

    private sequenceId: number = 0; //http请求序列id
    private running: boolean = false; //是否当前正在执行并等待http请求任务返回
    private curHttpTask: HttpTask = null; //当前正在执行并等待的http请求任务
    private queue: Queue<HttpTask> = new Queue<HttpTask>(); //http请求任务执行队列

    private constructor() {
        //除了在各种http回调（onreadystatechange，onerror，ontimeout）会触发下一个队列执行外，
        //这里也新增一个每秒执行下一个队列的定时任务，避免遗漏，一段时间后发现不会出现遗漏则删掉此定时任务
        //setInterval(this.runNextHttpTask, 1000);
    }

    setAuthorization(authorization: string) {
        this.authorization = authorization;
    }

    postData(serviceMethod: [string, string], params: Array<any> = [], callback: Function = null,
        errorCb: Function = null, timeOutCb: Function = null, needPre: boolean = true) {

        //目前userId和marketId都放在header了所以这里不需要了
        //params.unshift(DataMgr.getUserId());
        //心跳打点
        let heard = DataMgr.getRememberHeard();
        if (heard != "") {
            DotInst.clientSendDot(COUNTERTYPE.heartBeat, null, null, null, null, heard);
        }
        this.post(ServerConst.SERVER_URL, {
            mod: serviceMethod[0],
            do: serviceMethod[1],
            p: params
        }, callback, errorCb, timeOutCb, needPre);
    }

    post(url: string, param: any, callback: Function = null, errorCb: Function = null, timeOutCb: Function = null, needPre: boolean = true) {
        this.send(POST, url, param, callback, errorCb, timeOutCb, needPre);
    }

    put(url: string, param: any, callback: Function) {
        this.send(PUT, url, param, callback);
    }

    delete(url: string, param: any, callback: Function) {
        this.send(DELETE, url, param, callback);
    }

    get(url: string, param: any, callback: Function) {
        url = this.getUrl(url, param);
        this.send(GET, url, {}, callback);
    }

    getUrl(url: string, param: any = null): string {
        if (param) {
            let paramStr = "";
            for (let key in param) {
                paramStr += StringUtil.format("&{0}={1}", key, param[key]);
            }
            url += "?" + paramStr.substr(1);
        }
        return url;
    }

    getFile(url: string, callback: Function) {
        this.send(GET, url, callback, null);
    }

    send(httpRequest: HttpRequest, url: string, param: any, callback: Function = null,
        errorCb: Function = null, timeOutCb: Function = null, needPre: boolean = true) {
        // if (!url.startsWith("http")) {
        //     url = ServerConst.SERVER_URL + url;
        // }

        const httpTask: HttpTask = this.newHttpTask(httpRequest, url, param, callback, errorCb, timeOutCb, needPre);
        if (httpTask.isPolling) {
            httpTask.run(); //轮询直接运行，不放到队列里面
        } else {
            if (this.running) {
                this.enqueueHttpTask(httpTask);
            } else {
                this.runHttpTask(httpTask);
            }
        }
    }

    private newHttpTask(httpRequest: HttpRequest, url: string, param: any, callback: Function = null,
        errorCb: Function = null, timeOutCb: Function = null, needPre: boolean = true) {
        const isPolling: boolean = false;//param && param.do ? param.do.indexOf("polling") >= 0 : false;
        const run = () => {
            const xhr: XMLHttpRequest = cc.loader.getXMLHttpRequest();
            xhr.open(httpRequest.method, url, true);

            xhr.onreadystatechange = () => {
                const response: HttpResponse = HttpProcessor.getResponse(xhr);
                if (response) {
                    //只要后端response返回就代表网络处理结束，如果队列有下一个就可以执行http请求了，而不需要等待前端callback处理完毕
                    this.doneAndRunNext(isPolling);
                    if (response.result) {
                        HttpProcessor.processResponse(param, response.result, callback, needPre, errorCb);
                    } else {
                        errorCb && errorCb();
                    }
                }
            };

            xhr.onerror = (err) => {
                console.error("request error:" + err);
                this.doneAndRunNext(isPolling);
                DataMgr.setPlayAnimation(true);
                if (errorCb) {
                    errorCb();
                } else {
                    UIMgr.showTipText("服务器错误！！！");
                }
            };

            xhr.timeout = httpRequest.timeout;
            xhr.ontimeout = () => {
                timeOutCb && timeOutCb();
                xhr.abort();
                console.error("server timeout");
                this.doneAndRunNext(isPolling);
                DataMgr.setPlayAnimation(true);
                UIMgr.showTipText("服务器超时错误！！！");
            };

            if (httpRequest.contentType) {
                xhr.setRequestHeader("Content-Type", httpRequest.contentType);
            }
            if (this.authorization) {
                xhr.setRequestHeader("hlToken", this.authorization);
            }
            xhr.setRequestHeader("userId", DataMgr.getUserId() + "");
            xhr.setRequestHeader("marketId", DataMgr.getMarketId() + "");
            xhr.setRequestHeader("clientVersion", ServerConst.SERVER_VER);

            if (httpRequest == GET) {
                xhr.send();
            } else {
                xhr.send(JSON.stringify(param));
            }
        };

        if (!isPolling) {
            ++this.sequenceId;
        }
        return new HttpTask(this.sequenceId, param, /*Date.now()*/-1, run, isPolling);
    }

    private doneAndRunNext = (isPolling: boolean) => {
        if (isPolling) { //轮询不需要在队列内执行，直接过滤掉
            return;
        }
        if (ServerConst.SHOW_LOG && this.curHttpTask) {
            // console.timeEnd(this.curHttpTask.id + "-" + this.curHttpTask.param.do);
            console.warn("done HttpTask", this.curHttpTask.id, this.curHttpTask.param);
        }
        this.running = false;
        this.curHttpTask = null;
        this.runNextHttpTask();
    };

    private runNextHttpTask = () => {
        if (this.running || this.queue.isEmpty()) {
            //console.log("running=", this.running, "queue.isEmpty=", this.queue.isEmpty());
            return;
        }
        const httpTask: HttpTask = this.queue.dequeue();
        if (!httpTask) {
            return;
        }
        this.runHttpTask(httpTask, true);
    };

    private runHttpTask = (httpTask: HttpTask, isNext: boolean = false) => {
        if (ServerConst.SHOW_LOG) {
            console.warn("run " + (isNext ? "next " : "") + "HttpTask", httpTask.id, httpTask.param);
            // console.time(httpTask.id + "-" + httpTask.param.do);
        }
        this.running = true;
        this.curHttpTask = httpTask;
        httpTask.run();
    };

    private enqueueHttpTask = (httpTask: HttpTask) => {
        if (ServerConst.SHOW_LOG) {
            console.warn("enqueue HttpTask", httpTask.id, httpTask.param);
        }
        if (!this.queue.enqueue(httpTask)) {
            console.error("http queue is full", this.queue);
        }
    };

    /**
     * 添加get参数
     * @param url
     * @param name 参数名
     * @param value 参数值
     */
    private urlParam(url: string, name: string, value: string): string {
        url += (url.indexOf('?') == -1) ? '?' : '&';
        url += encodeURIComponent(name) + "=" + encodeURIComponent(value);
        return url;
    }

}

export const HttpInst: HttpClient = HttpClient.instance;
