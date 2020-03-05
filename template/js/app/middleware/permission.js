/*
 * @Author: your name
 * @Date: 2019-12-04 14:42:52
 * @LastEditTime : 2020-01-10 17:37:37
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /liebao/internal-animefactory-server/app/middleware/permission.js
 */
const jwt = require('jsonwebtoken');
const config = require('../../config/config');
module.exports = async (ctx, next) => {
    const header = ctx.header;
    if (header['authorization']) {
    
        // 签名校验
        try {
            let authorization = new Buffer(header['authorization'], 'base64').toString()
            let token = await jwt.verify(authorization,new Buffer(config.private_key, 'base64').toString());
            console.log(token)
            ctx.state.token = token;
        } catch (e) {
            let errorMsg = '签名异常';
            if (e.name == 'TokenExpiredError') {
                errorMsg = 'token失效';
            }
            let error = new Error(errorMsg);
            error.status = 403;
            throw error;
        }
    } else {
        ctx.throw(403, '无权限');
        // ctx.state.token = {
        //     userId: "1"
        // }
    }

    await next();
}