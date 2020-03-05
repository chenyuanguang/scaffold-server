const paintService = require('../service/paintService');
const result = require('../common/result');

/**
 * 立绘
 */
class controller {

    /**
     * 创建
     * @param {*} ctx 
     */
    async create(ctx) {
        const params = ctx.request.body;
        if(!params.characterId) {
            ctx.throw('角色id不能为空');
        }
        
        const paint = await paintService.create(params);

        result(ctx, paint);
    }

    /**
     * 查询详情
     * @param {*} ctx 
     */
    async find(ctx) {
        const id = ctx.params.id;

        const paint = await paintService.find(id);
        result(ctx, paint);
    }

    /**
     * 列表查询
     * @param {*} ctx 
     */
    async query(ctx) {
        const params = ctx.query;
        if(!params.characterId) {
            ctx.throw('角色id不能为空');
        }

        const paint = await paintService.query(params);
        result(ctx, paint);
    }

    /**
     * 修改
     * @param {*} ctx 
     */
    async update(ctx) {
        const id = ctx.params.id;
        const params = ctx.request.body;

        await paintService.update(id, params);
        result(ctx);
    }

    /**
     * 删除
     * @param {*} ctx 
     */
    async del(ctx) {
        const id = ctx.params.id;

        await paintService.del(id);
        result(ctx);
    }
}

module.exports = new controller();