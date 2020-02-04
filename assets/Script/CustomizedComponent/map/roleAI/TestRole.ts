import {Role, RoleType} from "../Role";

/**
 * @Author whg
 * @Date 2019/4/16
 * @Desc 测试地图上的动画角色
 */

const {ccclass, property} = cc._decorator;

@ccclass
export class TestRole extends Role {

    static PREFIX: string = "test";

    showPosition() {
        return true;
    }

    getRoleType(): RoleType {
        return RoleType.TESTROLE;
    }
    getPrefix(): string {
        return TestRole.PREFIX;
    }

    sayHi(){
        cc.log(this.staffId, "TestRole Hi");
    }

}
