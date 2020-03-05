/*
 * @Author: your name
 * @Date: 2020-01-06 18:55:39
 * @LastEditTime : 2020-01-08 18:03:37
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /liebao/internal-animefactory-server/app/controller/userController.js
 */
const userService = require('../service/userService');
const result = require('../common/result');


class userController {

 
    /**
     * 获取用户信息
     * @param {*} ctx 
     */
    async get(ctx) {
        
        const user = await userService.findById(ctx.state.token);

        return result(ctx, user);
    }
    /**
     * 获取用户列表
     * @param {*} ctx 
     */
    async getList(ctx) {
        let token=ctx.state.token
        if(token.permission===0){
            let users = await userService.getList();
            return result(ctx, users);
        }else{
            ctx.throw(400, "无权限获取用户列表");
        }
    }

    
    /**
     * 修改用户信息
     * @param {*} ctx 
     */
    async update(ctx){
        const id = ctx.params.id;
        const params = ctx.request.body;
        const token = ctx.state.token;
        if(!id){
            ctx.throw(400, "传入用户user_id");
        }
        if(params.disabled==undefined){
            ctx.throw(400, "传入字段disabled");
        }

        //只有管理员才可以修改用户信息
        if(token.permission===0){
            await userService.update(id,params);
            return result(ctx);
        }else{
            ctx.throw(400, "无权修改用户信息");
        }
    }

    // async rePwd(ctx) {
    //     const params = ctx.request.body;
    //     if(!params.userId) {
    //         ctx.throw(400, '请输入用户id');
    //     }
    //     if(!params.new_pwd) {
    //         ctx.throw(400, '请输入新密码');
    //     }
    //     await userService.rePwd(ctx.state.token, params.userId, params.old_pwd, params.new_pwd);

    //     return result(ctx);
    // }
}

module.exports = new userController();