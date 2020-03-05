const smsService = require('../service/smsService');
const result = require('../common/result');

/**
 * 短信
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
        if(!params.characters || params.characters.length == 0) {
            ctx.throw('对话人物不能为空');
        }
        if(!params.type) {
            ctx.throw('对话类型不能为空');
        }

        const sms = await smsService.create(params);

        result(ctx, sms);
    }

    /**
     * 查询详情
     * @param {*} ctx 
     */
    async find(ctx) {
        const id = ctx.params.id;
        const sms = await smsService.find(id);
        result(ctx, sms);
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
        const sms = await smsService.query(params);
        result(ctx, sms);
    }

    /**
     * 修改
     * @param {*} ctx 
     */
    async update(ctx) {
        const id = ctx.params.id;
        const params = ctx.request.body;

        await smsService.update(id, params);
        result(ctx);
    }

    /**
     * 删除
     * @param {*} ctx 
     */
    async del(ctx) {
        const id = ctx.params.id;

        await smsService.del(id);
        result(ctx);
    }
}

module.exports = new controller();