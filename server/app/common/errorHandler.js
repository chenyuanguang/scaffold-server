const result = require('../common/result');

/**
 * 异常统一处理
 */
module.exports = async (ctx, next) => {
    try {
        await next();
    } catch(e) {
        console.log(e.stack);
        const status = e.status?e.status:500;
        result(ctx, e.message, status);
    }
}