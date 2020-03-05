const packageService = require('../service/packageService');
const result = require('../common/result');

class controller {

    /**
     * 查询最新打包
     * @param {*} ctx 
     */
    async query(ctx) {
        const packages = await packageService.query(ctx.query.packageName, ctx.query.type);

        result(ctx, packages);
    }

}

module.exports = new controller()