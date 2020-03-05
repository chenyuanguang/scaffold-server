/*
 * @Author: your name
 * @Date: 2019-12-09 17:56:57
 * @LastEditTime : 2020-01-08 14:41:26
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /liebao/internal-animefactory-server/app/controller/chatController.js
 */
const chatService = require('../service/chatService');
const publicChatService = require('../service/publicChatService');
const result = require('../common/result');

/**
 * 对话
 */
class controller {

    /**
     * 创建
     * @param {*} ctx 
     */
    async create(ctx) {
        const params = ctx.request.body;

        if(!params.smsId) {
            ctx.throw('短信id不能为空');
        }

        const chat = await chatService.create(params);

        result(ctx, chat);
    }

    /**
     * 查询详情
     * @param {*} ctx 
     */
    async find(ctx) {
        const id = ctx.params.id;
        const chat = await chatService.find(id);
        result(ctx, chat);
    }

    /**
     * 修改
     * @param {*} ctx 
     */
    async update(ctx) {
        const id = ctx.params.id;
        const params = ctx.request.body;

        await chatService.update(id, params);
        result(ctx);
    }

    /**
     * 删除
     * @param {*} ctx 
     */
    async del(ctx) {
        const id = ctx.params.id;

        await chatService.del(id);
        await publicChatService.del(id);
        result(ctx);
    }

    /**
     * 恋恋导出场景和语音来电
     * @param {*} ctx 
     */
    async exportScene(ctx) {
        const id = ctx.params.id;
        const type=ctx.query.type
        const url = await chatService.exportScene(id,type);
        result(ctx,{url})
    }
   
}

module.exports = new controller();