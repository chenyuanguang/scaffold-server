/*
 * @Author: your name
 * @Date: 2020-01-07 12:21:22
 * @LastEditTime : 2020-01-08 13:48:39
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /liebao/internal-animefactory-server/app/controller/permissionController.js
 */

const permissionService = require('../service/permissionService');
const result = require('../common/result');

class userController {

    /**
     * 创建用户权限
     * @param {*} ctx 
     */
    async create(ctx) {
        let param= ctx.request.body;
        const token = ctx.state.token;

        // 管理员用户无权创建，只有超级管理员用户能创建
        if(token.permission !== 0) {
            ctx.throw(403, '无权创建用户权限');
        }
        if(!param.cartoons){
            ctx.throw(403, '请上传漫画');
        }
        if(param.cartoons.length>0&&typeof param.cartoons[0]!="string"){
            ctx.throw(403, '请上传漫画id,id为字符串');
        }
    
        if(!param.user_id){
            ctx.throw(403, '请上传用户');
        }
        if(!param.phone){
            ctx.throw(403, '请上传手机号');
        }

        const id = await permissionService.create(token, param);
        return result(ctx, {});
    }

}

module.exports = new userController();