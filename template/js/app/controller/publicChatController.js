
/*
 * @Author: your name
 * @Date: 2019-12-09 17:56:57
 * @LastEditTime : 2019-12-27 17:50:58
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /liebao/internal-animefactory-server/app/controller/chatController.js
 */
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

        const chat = await publicChatService.create(params);

        result(ctx, chat);
    }

    /**
     * 查询详情
     * @param {*} ctx 
     */
    async find(ctx) {
        const id = ctx.params.id;
        const chat = await publicChatService.find(id);
        result(ctx, chat);
    }

    /**
     * 修改
     * @param {*} ctx 
     */
    async update(ctx) {
        const id = ctx.params.id;
        const params = ctx.request.body;

        await publicChatService.update(id, params);
        result(ctx);
    }

    /**
     * 删除
     * @param {*} ctx 
     */
    async del(ctx) {
        const id = ctx.params.id;

        await publicChatService.del(id);
        result(ctx);
    }
    /**
     * @description: 拉取
     * @param {type} 
     * @return: 
     */
    async pull(ctx){
        const id = ctx.params.id;
        const data = await publicChatService.pull(id)

        ctx.response.status = 200;
        ctx.response.type = 'application/json';
        ctx.response.body = data;
    }
    
    /**
     * 导出场景资源
     * @param {*} ctx 
     */
    async exportScene(ctx) {
        const id = ctx.params.id;
        
        const type=ctx.query.type

        const url = await publicChatService.exportScene(id,type);
        ctx.redirect(url)
    }
   /**
     * @description: 发布
     * @param {type} 
     * @return: 
     */
    async public(ctx) {
        const params = ctx.params;

        if(!params.id) {
            ctx.throw('传入对话id');
        }
        // 查找是文章的对话还是列表的对话
        // const type=await publicChatService.getChatType()
        // if(type!=params.type){
        //     ctx.throw('当前对话是属于：'+type);
        // }

        await publicChatService.public(params)

        result(ctx,{msg:"已发布"});
    }
    /**
     * @description: 手动同步数据接口
     * @param {type} 
     * @return: 
     */
    async sync(ctx) {

        await publicChatService.sync()

        result(ctx,{msg:"chat已经同步"});
    }
}

module.exports = new controller();