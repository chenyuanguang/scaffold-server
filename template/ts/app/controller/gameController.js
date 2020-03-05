const gameService = require('../service/gameService');
const result = require('../common/result');

/**
 * 游戏
 */
class controller {

    /**
     * 创建
     * @param {*} ctx 
     */
    async create(ctx) {
        const params = ctx.request.body;
        if(!params.cartoonId) {
            ctx.throw('漫画id不能为空');
        }
        
        const game = await gameService.create(params);

        result(ctx, game);
    }

    /**
     * 查询详情
     * @param {*} ctx 
     */
    async find(ctx) {
        const id = ctx.params.id;

        const game = await gameService.find(id);
        result(ctx, game);
    }

    /**
     * 列表查询
     * @param {*} ctx 
     */
    async query(ctx) {
        const params = ctx.query;
        if(!params.cartoonId) {
            ctx.throw('漫画id不能为空');
        }

        const game = await gameService.query(params);
        result(ctx, game);
    }

    /**
     * 修改
     * @param {*} ctx 
     */
    async update(ctx) {
        const id = ctx.params.id;
        const params = ctx.request.body;

        await gameService.update(id, params);
        result(ctx);
    }

    /**
     * 删除
     * @param {*} ctx 
     */
    async del(ctx) {
        const id = ctx.params.id;

        await gameService.del(id);
        result(ctx);
    }

    /**
     * app端拉游戏更新
     * @param {*} ctx 
     */
    async pull(ctx) {
        const id = ctx.params.id;

        const results = await gameService.pull(id);
        ctx.response.status = 200;
        ctx.response.type = 'application/json';
        ctx.response.body = results;
    }
}

module.exports = new controller();