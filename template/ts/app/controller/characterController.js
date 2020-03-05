const characterService = require('../service/characterService');
const result = require('../common/result');

/**
 * 人物
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
        if(!params.realName) {
            ctx.throw('角色名不能为空');
        }
        if(params.isProtagonist == undefined) {
            ctx.throw('请选择是否是主角');
        }

        const character = await characterService.create(params);

        result(ctx, character);
    }

    /**
     * 查询详情
     * @param {*} ctx 
     */
    async find(ctx) {
        const id = ctx.params.id;
        const character = await characterService.find(id);
        result(ctx, character);
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

        const characters = await characterService.query(params);
        result(ctx, characters);
    }

    /**
     * 修改
     * @param {*} ctx 
     */
    async update(ctx) {
        const id = ctx.params.id;
        const params = ctx.request.body;

        await characterService.update(id, params);
        result(ctx);
    }

    /**
     * 删除
     * @param {*} ctx 
     */
    async del(ctx) {
        const id = ctx.params.id;

        await characterService.del(id);
        result(ctx);
    }
}

module.exports = new controller();