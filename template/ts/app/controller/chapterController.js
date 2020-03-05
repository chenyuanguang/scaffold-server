const chapterService = require('../service/chapterService');
const result = require('../common/result');

/**
 * 章节
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
        
        const cartoon = await chapterService.create(params);

        result(ctx, cartoon);
    }

    /**
     * 查询详情
     * @param {*} ctx 
     */
    async find(ctx) {
        const id = ctx.params.id;

        const cartoon = await chapterService.find(id);
        result(ctx, cartoon);
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

        const cartoon = await chapterService.query(params);
        result(ctx, cartoon);
    }

    /**
     * 修改
     * @param {*} ctx 
     */
    async update(ctx) {
        const id = ctx.params.id;
        const params = ctx.request.body;

        await chapterService.update(id, params);
        result(ctx);
    }

    /**
     * 删除
     * @param {*} ctx 
     */
    async del(ctx) {
        const id = ctx.params.id;

        await chapterService.del(id);

        result(ctx);
    }

    /**
     * app端拉去章节更新
     * @param {*} ctx 
     */
    async pull(ctx) {
        const id = ctx.params.id;

        const json = await chapterService.pull(id);
        
        ctx.response.status = 200;
        ctx.response.type = 'application/json';
        ctx.response.body = json;
    }

    /**
     * app端拉取章节sz资源文件
     * @param {*} ctx 
     */
    async pullResource(ctx) {
        const chapterId = ctx.params.id;

        const json = await chapterService.pullResource(chapterId);
        
        ctx.response.status = 200;
        ctx.response.type = 'application/json';
        ctx.response.body = json;
    }
}

module.exports = new controller();