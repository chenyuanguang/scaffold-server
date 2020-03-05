const itemService = require('../service/itemService');
const result = require('../common/result');

/**
 * 对话item
 */
class controller {

    /**
     * 创建
     * @param {*} ctx 
     */
    async create(ctx) {
        const params = ctx.request.body;

        if(!params.chatId) {
            ctx.throw('对话包id不能为空');
        }
        const item = await itemService.create(params);

        result(ctx, item);
    }

    /**
     * 查询详情
     * @param {*} ctx 
     */
    async find(ctx) {
        const id = ctx.params.id;
        const character = await itemService.find(id);
        result(ctx, character);
    }

    /**
     * 列表查询
     * @param {*} ctx 
     */
    async query(ctx) {
        const params = ctx.query;
        if(!params.chatId) {
            ctx.throw('对话包id不能为空');
        }
        const characters = await itemService.query(params);
        result(ctx, characters);
    }

    /**
     * 修改
     * @param {*} ctx 
     */
    async update(ctx) {
        const id = ctx.params.id;
        const params = ctx.request.body;

        await itemService.update(id, params);
        result(ctx);
    }

    /**
     * 删除
     * @param {*} ctx 
     */
    async del(ctx) {
        const id = ctx.params.id;

        await itemService.del(id);
        result(ctx);
    }
}

module.exports = new controller();