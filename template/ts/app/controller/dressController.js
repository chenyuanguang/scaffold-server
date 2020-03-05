const dressService = require('../service/dressService');
const result = require('../common/result');

/**
 * 扮装
 */
class controller {

    /**
     * 创建
     * @param {*} ctx 
     */
    async create(ctx) {
        const params = ctx.request.body;
        
        const dress = await dressService.create(params);

        result(ctx, dress);
    }

    /**
     * 查询详情
     * @param {*} ctx 
     */
    async find(ctx) {
        const id = ctx.params.id;

        const dress = await dressService.find(id);
        result(ctx, dress);
    }

    /**
     * 列表查询
     * @param {*} ctx 
     */
    async query(ctx) {
        const params = ctx.query;

        const dress = await dressService.query(params);
        result(ctx, dress);
    }

    /**
     * 修改
     * @param {*} ctx 
     */
    async update(ctx) {
        const id = ctx.params.id;
        const params = ctx.request.body;

        await dressService.update(id, params);
        result(ctx);
    }

    /**
     * 删除
     * @param {*} ctx 
     */
    async del(ctx) {
        const id = ctx.params.id;

        await dressService.del(id);
        result(ctx);
    }

    /**
     * app端拉取资源
     * @param {*} ctx 
     */
    async pull(ctx) {
        const params = ctx.query;

        const dress = await dressService.pull(params);

        ctx.response.status = 200;
        ctx.response.type = 'application/json';
        ctx.response.body = dress;
    }
}

module.exports = new controller();