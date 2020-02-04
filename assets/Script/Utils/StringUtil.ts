/*
 * @Author: tyq 
 * @Date: 2019-01-06 
 * @Desc: string工具类
 */

export class StringUtil {

    //获取url参数内对应key的value值
    static getUrlParam(key: string) {
        if(!window.location.search){
            return null; //微信版本没有此变量
        }
        const reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
        const r = window.location.search.substr(1).match(reg);
        if (r != null) return decodeURI(r[2]);
        return null;
    }

    //首字母大写
    static firstCharUpper(str: string) {
        return str.replace(str[0], str[0].toUpperCase());
    }

    //首字母小写
    static firstCharLower(str: string) {
        return str.replace(str[0], str[0].toLowerCase());
    }

    //js实现用传递的值替换占位符{0} {1} {2}
    static format(str: string, ...args: any[]): string {
        if (args.length == 0) return str;
        for (let i = 0; i < args.length; i++)
            str = str.replace(new RegExp("\\{" + i + "\\}", "g"), args[i]);
        return str;
    }

}
