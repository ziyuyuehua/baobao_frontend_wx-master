/**
 * @Author whg
 * @Date 2019/9/6
 * @Desc
 *  项目加载依赖，A开头确保先加载，然后依赖并加载UIUtil完成其他依赖正确加载
 *  PS：删掉此文件会出现循环依赖加载错误，导致项目运行不起来
 */

import {UIUtil} from "./Utils/UIUtil";

const {ccclass, property} = cc._decorator;

@ccclass
export class ADepender extends cc.Component {

    onLoad () {
        console.log(UIUtil.toString());
    }

}
