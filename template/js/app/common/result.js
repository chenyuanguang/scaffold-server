/**
 * 格式化controller返回结果
 */
module.exports = function(ctx, data, code) {
    if(!code || typeof(code) != 'number') {
        code = 200;
    }

    let result = {
        code: code
    }
    if(code < 400) {
        result.data = data?data:'success';
    } else {
        result.error = data?data:'error';
    }

    ctx.response.status = 200;
    ctx.response.type = 'application/json';
    ctx.response.body = result;
}