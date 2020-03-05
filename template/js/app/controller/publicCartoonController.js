/*
 * @Author: your name
 * @Date: 2019-12-24 15:48:58
 * @LastEditTime : 2020-01-13 16:01:22
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /liebao/internal-animefactory-server/app/controller/publicCartoonController.js
 */
const publicCartoonService = require('../service/publicCartoonService');
const cartoonService = require('../service/cartoonService');
const result = require('../common/result');

/**
 * 漫画
 */
class controller {

    /*
     * 手动同步
     * @param {*} ctx 
     */
    async sync(ctx) {

        await publicCartoonService.sync();

        result(ctx, "同步成功");
    }


    /**
     * 发布
     * @param {*} ctx 
     */
    async public(ctx) {
        const packageName = ctx.params.packageName;
        const params = ctx.query;
        if(params.resourceName){
            const results = await publicCartoonService.public(packageName, params);
            result(ctx, {verify:results, [params.resourceName+"Status"]: 1 }); //先响应状态
           
        }else{
            ctx.throw(403,"传入resourceName")
        }
        
        
    }
  /**
     * 查询发布状态
     * @param {*} ctx 
     */
    async getStatus(ctx) {
        const packageName = ctx.params.packageName;
        const token = ctx.state.token;
        const params=ctx.query
        let cartoon=await cartoonService.find(token.id,null,packageName) 

        result(ctx,{[params.resourceName+"Status"]:cartoon.get(params.resourceName+"Status")});
    }


    /**
     * app端拉取数据资源配置
     * @param {*} ctx 
     */
    async pull(ctx) {
        const packageName = ctx.params.packageName;

        const json = await publicCartoonService.pull(packageName);

        ctx.response.status = 200;
        ctx.response.type = 'application/json';
        ctx.response.body = json;
    }
}

module.exports = new controller();