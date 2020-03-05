
const baseService = require('../service/baseService');

const result = require('../common/result');


class controller {
     /**
     * 页面
     * @param {*} ctx 
     */
    async view(ctx) {
        await ctx.render("index",{})
    }
    async gitlab(ctx) {
        await ctx.render("gitlab",{})
    }
    async centry(ctx) {
        await ctx.render("centry",{})
    }
    /**
     * 创建项目
     * @param {*} ctx 
     */
    async sendConfig(ctx) {
        const params = ctx.request.body;
        baseService.sendConfig(params);
        result(ctx);
    }
    async getCreateStatus(ctx) {

        let status=await baseService.getCreateStatus();
        result(ctx,{status});
    }
    
  
}

module.exports = new controller()