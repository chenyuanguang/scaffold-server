/*
 * @Author: your name
 * @Date: 2019-12-17 14:54:43
 * @LastEditTime: 2019-12-17 15:19:43
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /liebao/internal-animefactory-server/app/controller/publicLogicController.js
 */
const logicService = require('../service/logicService');
const result = require('../common/result');

/**
 * 对话logic
 */
class controller {

    /**
     * 创建
     * @param {*} ctx 
     */
    async create(ctx) {
        const params = ctx.request.body;

        const logic = await logicService.create(params);

        result(ctx, logic);
    }

    /**
     * 查询详情
     * @param {*} ctx 
     */
    async find(ctx) {
        const id = ctx.params.id;
        const character = await logicService.find(id);
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
        const characters = await logicService.query(params);
        result(ctx, characters);
    }

    /**
     * 修改
     * @param {*} ctx 
     */
    async update(ctx) {
        const id = ctx.params.id;
        const params = ctx.request.body;

        await logicService.update(id, params);
        result(ctx);
    }

    /**
     * 删除
     * @param {*} ctx 
     */
    async del(ctx) {
        const id = ctx.params.id;

        await logicService.del(id);
        result(ctx);
    }
}

module.exports = new controller();