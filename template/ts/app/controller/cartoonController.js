/*
 * @Author: your name
 * @Date: 2019-12-04 14:42:52
 * @LastEditTime : 2020-01-08 17:57:57
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /liebao/internal-animefactory-server/app/controller/cartoonController.js
 */
const cartoonService = require('../service/cartoonService');
const result = require('../common/result');

/**
 * 漫画
 */
class controller {

    /**
     * 创建
     * @param {*} ctx 
     */
    async create(ctx) {
        const params = ctx.request.body;
        const token = ctx.state.token;
        if(token.permission===0){
            const cartoon = await cartoonService.create(token.id, params);

            result(ctx, cartoon);
        }else{
            ctx.throw('无权限创建漫画');
        }
      
    }

    /**
     * 查询详情
     * @param {*} ctx 
     */
    async find(ctx) {
        const id = ctx.params.id;
        const token = ctx.state.token;

        const cartoon = await cartoonService.find(token.id, id);
        result(ctx, cartoon);
    }

    /**
     * 列表查询
     * @param {*} ctx 
     */
    async query(ctx) {
        const params = ctx.query;
        const token = ctx.state.token;

        const cartoon = await cartoonService.query(token, params);
        result(ctx, cartoon);
    }

    /**
     * 修改
     * @param {*} ctx 
     */
    async update(ctx) {
        const id = ctx.params.id;
        const params = ctx.request.body;
        const token = ctx.state.token;

        await cartoonService.update(token.id, id, params);
        result(ctx);
    }

    /**
     * 删除
     * @param {*} ctx 
     */
    async del(ctx) {
        const id = ctx.params.id;
        const token = ctx.state.token;
        // if(token.permission===0){
            await cartoonService.del(token.id, id);
            result(ctx);
        // }else{
        //     ctx.throw('无权限删除漫画');
        // }
      
    }
    /**
     * 删除
     * @param {*} ctx 
     */
    async delReal(ctx) {
        const id = ctx.params.id;
        await cartoonService.delReal(id);
        result(ctx);
       
      
    }
    

    /**
     * app端拉取数据资源配置
     * @param {*} ctx 
     */
    async pull(ctx) {
        const packageName = ctx.params.packageName;

        const json = await cartoonService.pull(packageName);

        ctx.response.status = 200;
        ctx.response.type = 'application/json';
        ctx.response.body = json;
    }
}

module.exports = new controller();