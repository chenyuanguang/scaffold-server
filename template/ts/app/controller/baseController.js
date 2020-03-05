const cosService = require('../service/cosService');
const jsonService = require('../service/jsonService');
const publicChatService = require('../service/publicChatService');
const cartoonService = require('../service/cartoonService');
const toolService = require('../service/jsonService/toolService');
const resourceService = require('../service/jsonService/resourceService');
const commonChatService = require('../service/jsonService/commonChatService');
const packageAppService = require('../service/jsonService/packageAppService');
const fs = require("fs");
const result = require('../common/result');
const send = require('koa-send');
const mongoose = require('../../config/mongo');
const config = require('../../config/config');


class controller {
    /**
     * 上传文件
     * @param {*} ctx 
     */
    async upload(ctx) {
        const file = ctx.request.files.file;

        const reader = fs.createReadStream(file.path);

        const id = mongoose.Types.ObjectId();
        const ext = file.name.split('.').pop();
        const filename = id + '.' + ext;

        const url = await cosService.upload(filename, file.name, file.type, reader);

        result(ctx, url);
    }
    async down(ctx) {
        const filename = ctx.query.filename;
        await send(ctx, filename, { root: './public' });
    }

    /**
     * 对话包json
     * @param {*} ctx 
     */
    async jsonByChat(ctx) {
        const id = ctx.params.id;
        const showUrl = ctx.query.showUrl;
        let type = ctx.query.type;

        if(!type) {
            type = 'chat';
        }

        const json = await commonChatService.jsonByChat(id, showUrl, type);

        result(ctx, json);
    }

    /**
     * 短息json
     * @param {*} ctx 
     */
    async jsonBySms(ctx) {
        const id = ctx.params.id;
        const json = await resourceService.jsonBySms(id);

        result(ctx, json);
    }



    /**
     * 自动打包app
     * @param {*} ctx 
     */
    async autoPackage(ctx) {
        const id = ctx.params.id;
        const version = ctx.query.version;
        const platform = ctx.query.platform;
        const packageId = await jsonService.createPackageLog(id, platform);
       
        jsonService.atuoPackage(id, version, packageId, platform);
  
        
        result(ctx);
    }

    /**
     * 自动打包资源
     * @param {*} ctx 
     */
    async autoResource(ctx) {
        const id = ctx.params.id;
        const resource = ctx.query.resource;
        const version = ctx.query.version;
        if(!resource) {
            ctx.throw(400, '请填写资源名');
        }
        // 发章节，先发游戏
        if(resource === 'chapter') {
            async function run(){
              // 同步数据（只同步与章节相关的chat，voice,scene）
                await publicChatService.syncChapter(id)
                await jsonService.autoResource(id, 'game', version); 
                await jsonService.autoResource(id, 'chatInChapter', version); 
                await jsonService.autoResource(id, 'voiceInChapter', version); 
                await jsonService.autoResource(id, 'sceneInChapter', version); 
                jsonService.autoResource(id, resource, version);
            } 

            run()

            result(ctx,{chapterPackage:1}); //先响应状态

        }else{
            await jsonService.autoResource(id, resource, version);
            result(ctx);
        }
    }



    /**
     * 查询打包资源状态
     * @param {*} ctx 
     */
    async getStatus(ctx) {
        const id = ctx.params.id;
        const token = ctx.state.token;
        let cartoon=await cartoonService.find(token.id,id) 
        result(ctx,{chapterPackage:cartoon.get('chapterPackage')});
    }

    /**
     * 跳转群组头像html
     * @param {*} ctx 
     */
    async groupAvatorHtml(ctx) {
        const avators = ctx.query.avators;

        const images = [];
        avators.split(',').forEach(el => {
            images.push(`https://${config.cos_bucket}.cos.${config.cos_region}.myqcloud.com/${config.cos_path}/${el}`);
        });

        ctx.state = {
            images: images.slice(0,4)
        };

        await ctx.render("avator", {});
    }

    /**
     * 条漫分块截取
     * @param {*} ctx 
     */
    async chapterHtml(ctx) {
        const chapterUrl = ctx.query.chapter;
        const position = ctx.query.position;
        const height = ctx.query.height;

        ctx.state = {
            image: chapterUrl,
            position,
            height
        };

        await ctx.render("chapter", {});
    }

    /**
     * 扮装缩略图
     * @param {*} ctx 
     */
    async thumbnailHtml(ctx) {
        const imageName = ctx.query.imageName;
        const positionX = ctx.query.positionX;
        const positionY = ctx.query.positionY;
        const width = ctx.query.width;
        const height = ctx.query.height;

        ctx.state = {
            image: `https://${config.cos_bucket}.cos.${config.cos_region}.myqcloud.com/${config.cos_path}/${imageName}.png`,
            positionX,
            positionY,
            width,
            height
        };

        await ctx.render("thumbnail", {});
    }

    /**
     * 打包成功通知
     * @param {*} ctx 
     */
    async notify(ctx) {
        const params = ctx.request.body;
        jsonService.notify(params);
        
        result(ctx);
    }

    /**
     * 查询最新打包
     * @param {*} ctx 
     */
    async queryPackage(ctx) {

    }

}

module.exports = new controller()