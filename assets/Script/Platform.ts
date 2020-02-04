/**
 * @Author whg
 * @Date 2019/6/3
 * @Desc 平台相关的全局方法
 */

export class PlatformTransfer{
    type: number;
    data: Object;
    constructor(type: number, data?: Object){
        this.type = type;
        this.data = data || {};
    }

    static newParam(type: number, data?: Object): string{
        const transfer: PlatformTransfer = new PlatformTransfer(type, data);
        const json = JSON.stringify(transfer);
        cc.log("platform param="+json);
        return json;
    }
}

export enum PlatformUIName{
    RECHARGE = 1,   //app充值界面
    OPEN_VIP = 2,   //app开通vip会员界面
    BUY_STOCK = 3,  //app股票详情界面
}
