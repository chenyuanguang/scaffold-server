const dressMongoModel = require('../model/dressMongoModel');
const toolService = require('./jsonService/toolService');
const cosService = require('./cosService');
const mongoose = require('../../config/mongo');
const config = require('../../config/config');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

/**
 * 扮装
 */
class service {
    
    /**
     * 创建
     * @param {*} params 
     */
    async create(params) {
        // 处理缩略图
        if(params.image && params.rect) {
            const thumbnail = await this.__thumbnail(
                params.image,
                params.rect.width,
                params.rect.height,
                params.rect.left,
                params.rect.top
            );

            if(thumbnail) {
                params.thumbnail = thumbnail;
            }
        }

        params.createdAt = new Date();
        const dressModel = new dressMongoModel(params);
        await dressModel.save();

        return dressModel;
    }

    /**
     * 查询详情
     * @param {*} id 
     */
    async find(id) {
        const dress = await dressMongoModel.findById(id);
        if(!dress) {
            throw new Error('扮装不存在');
        }

        return dress;
    }

    /**
     * 列表查询
     */
    async query(params) {
        const dresss = await dressMongoModel.find(params);

        return dresss;
    }

    /**
     * 更新
     */
    async update(id, params) {
        // 处理缩略图
        if(params.image && params.rect) {
            const thumbnail = await this.__thumbnail(
                params.image,
                params.rect.width,
                params.rect.height,
                params.rect.left,
                params.rect.top
            );

            if(thumbnail) {
                params.thumbnail = thumbnail;
            }
        }

        params.updatedAt = new Date();
        await dressMongoModel.update({
            _id: id
        }, params);
    }

    /**
     * 删除
     * @param {*} id 
     */
    async del(id) {
        await dressMongoModel.deleteOne({
            _id: id
        });
    }

    /**
     * 生成缩略图
     * @param {*} imageUrl 
     * @param {*} width 
     * @param {*} height 
     * @param {*} left 
     * @param {*} top 
     */
    async __thumbnail(imageUrl, width, height, left, top) {
        // 图片名
        const imageName = toolService.__getAvatorName(imageUrl);

        const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
        const page = await browser.newPage();

        const screenWidth = 80;
        await page.setViewport({
            width: screenWidth,
            height: screenWidth,
            deviceScaleFactor: 1,
        });    
        const zoom = screenWidth/width;
        const x = left * zoom;
        const y = top * zoom;
        const imageWidth = 734 * zoom;
        const imageHeight = imageWidth / (734 / 1428);

        await page.goto(`http://localhost:${config.port}/api/v1/view/thumbnail?imageName=${imageName}&width=${imageWidth}&height=${imageHeight}&positionX=${x}&positionY=${y}`);

        const basePath = path.resolve(__dirname,`../../public/`);
        const newName = `${mongoose.Types.ObjectId()}.png`;
        const newPath = path.resolve(basePath, newName);
        await page.screenshot({path: newPath, omitBackground: true});
        await browser.close();

        // 上传cos
        if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'pro') {
            const reader = fs.createReadStream(newPath);
            return await cosService.upload(newName, newName, 'image/png', reader);
        }

        fs.unlinkSync(newPath);
    }

    /**
     * app端拉取资源
     */
    async pull(params) {
        params.online = 'true';
        const dresss = await dressMongoModel.find(params);

        let clothtype;
        switch(params.type) {
            case 'hair':
                clothtype = 0
                break;
            case 'Tops':
                clothtype = 1
                break;
            case 'bottoms':
                clothtype = 2
                break;
            case 'suits':
                clothtype = 3
                break;
            case 'shoes':
                clothtype = 4
                break;
            case 'accessory':
                clothtype = 5
                break;
        }

        return {
            clothtype,
            clothlist: dresss
        };
    }

}

module.exports = new service();