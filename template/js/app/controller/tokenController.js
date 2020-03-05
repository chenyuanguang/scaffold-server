/*
 * @Author: your name
 * @Date: 2020-01-03 14:55:09
 * @LastEditTime : 2020-01-08 13:51:01
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /liebao/internal-animefactory-server/app/controller/tokenController.js
 */
const tokenService = require('../service/tokenService');
const result = require('../common/result');
const unionCmoa = require('../common/union/cmOa');
const updateQuery = require('../common/updateQuery');
// http://62.234.146.38:3003/token/union?redirect_url=http://62.234.146.38:3003/token/union/callback
class tokenController {

    /**
     * 跳转三方登录
     * @param {*} ctx 
     */
    async toUnionLogUrl(ctx) {
       let params=ctx.query
        let url = await unionCmoa.getLoginUrl( params.redirect_url);
        console.log(url)
        ctx.redirect(url);

        // if(ctx.state.token.type == 'token') {
        //     ctx.redirect(url);
        // } else {
        //     return result(ctx, url);
        // }
    }

    /**
     * 验证三方用户
     * @param {*} ctx 
     */
    async unionCallback(ctx) {
        const params = ctx.request.query;
        // const token = ctx.state.token;

        try {
            const userToken = await tokenService.unionCallback(params);

            if(params.redirect_url) {
                ctx.set("Authorization",userToken)
                // ctx.redirect(decodeURIComponent(params.redirect_url));
                ctx.redirect(updateQuery(decodeURIComponent(params.redirect_url), 'token', userToken));
            } else {
                return result(ctx, userToken);
            }
        } catch(e) {
            if(params.err_url) {
                ctx.redirect(params.err_url + encodeURIComponent(e.message));
            } else {
                ctx.throw(400, e.message);
            }
        }
    }
}

module.exports = new tokenController();