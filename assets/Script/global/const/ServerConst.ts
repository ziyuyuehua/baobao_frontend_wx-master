/**
 * @Author whg
 * @Date 2019/6/19
 * @Desc
 */

export namespace ServerConst {
    //服务器版本名称
    // export let SERVER_VER: string = "shimingjie";  //史明洁
    //  export let SERVER_VER: string = "lida";  //李达
    // export let SERVER_VER: string = "hanyuanliang";   //韩元亮
    //  export let SERVER_VER: string = "moli";    //莫李

     // export let SERVER_VER: string = "202"; //内网202
    export let SERVER_VER: string = "1.0.22"; //线上

     // export let CENTER_URL: string = "http://10.2.0.202:8082/central/serverUrl"; //内网中控
    export let CENTER_URL: string = "https://g.nuojuekeji.com/central/serverUrl"; //线上中控

    export let SERVER_URL: string = null;
    export let JSON_URL: string = null;

    export let SHOW_LOG: boolean = true;

    export let access_token: string = "test";

    export let pay_env: number = 1; //支付0正式1沙箱

    // --------------------- BI监测 ---------------------
    export let trackon: boolean = false;
    export let gameid: string = "-1";

    // ---------------------我是分割线---------------------
    export let openid: string = "wzl03";

}