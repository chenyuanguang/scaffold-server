const roomService = require('../service/roomService');
const result = require('../common/result');

/**
 * 房间
 */
class controller {

    /**
     * 创建
     * @param {*} ctx 
     */
    async create(ctx) {
        const params = ctx.request.body;
        
        const room = await roomService.create(params);

        result(ctx, room);
    }

    /**
     * 查询详情
     * @param {*} ctx 
     */
    async find(ctx) {
        const id = ctx.params.id;

        const room = await roomService.find(id);
        result(ctx, room);
    }

    /**
     * 列表查询
     * @param {*} ctx 
     */
    async query(ctx) {
        const params = ctx.query;

        const room = await roomService.query(params);
        result(ctx, room);
    }

    /**
     * 修改
     * @param {*} ctx 
     */
    async update(ctx) {
        const id = ctx.params.id;
        const params = ctx.request.body;

        await roomService.update(id, params);
        result(ctx);
    }

    /**
     * 删除
     * @param {*} ctx 
     */
    async del(ctx) {
        const id = ctx.params.id;

        await roomService.del(id);
        result(ctx);
    }

    async thumbnail() {
        
    }
}

module.exports = new controller();