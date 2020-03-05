const characterMongoModel = require('../model/characterMongoModel');
const paintMongoModel = require('../model/paintMongoModel');

/**
 * 人物
 */
class service {
    
    /**
     * 创建
     * @param {*} params 
     */
    async create(params) {
        params.createdAt = new Date();
        params.deleted = false;
        const characterModel = new characterMongoModel(params);
        await characterModel.save();

        return characterModel;
    }

    /**
     * 查询详情
     * @param {*} id 
     */
    async find(id) {
        const character = await characterMongoModel.findById(id);
        if(!character || character.get('deleted')) {
            throw new Error('人物不存在');
        }

        // 立绘信息
        await this.__format([character]);

        return character;
    }

    /**
     * 列表查询
     */
    async query(params) {
        params.deleted = false;
        const characters = await characterMongoModel.find(params);

        // 立绘信息
        await this.__format(characters);
        return characters;
    }

    /**
     * 更新
     */
    async update(id, params) {
        delete params._id;
        delete params.deleted;
        params.updatedAt = new Date();
        await characterMongoModel.update({
            _id: id
        }, params);
    }

    /**
     * 删除
     * @param {*} id 
     */
    async del(id) {
        await characterMongoModel.update({
            _id: id
        }, {
            deleted: true,
            deletedAt: new Date()
        });
    }

    /**
     * 格式化立绘信息
     * @param {*} chapters 
     */
    async __format(chapters) {
        for(let chapter of chapters) {
            const paints = await paintMongoModel.find({
                characterId: chapter.id
            });
            
            chapter._doc.paints = paints;
        }
    }
}

module.exports = new service();