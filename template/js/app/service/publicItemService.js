const itemMongoModel = require('../model/itemMongoModel');

/**
 * 对话item
 */
class service {
    
    /**
     * 创建
     * @param {*} params 
     */
    async create(params) {
        const itemModel = new itemMongoModel(params);
        await itemModel.save();

        return itemModel;
    }

    /**
     * 查询详情
     * @param {*} id 
     */
    async find(id) {
        const item = await itemMongoModel.findOne({
            id: id
        });
        return item;
    }

    /**
     * 列表查询
     */
    async query(params) {
        const item = await itemMongoModel.find(params);
        return item;
    }

    /**
     * 更新
     */
    async update(id, params) {
        delete params.id;
        await itemMongoModel.update({
            id: id
        }, params);
    }

    /**
     * 删除
     * @param {*} id 
     */
    async del(id) {
        await itemMongoModel.deleteOne({
            id: id
        });
    }
}

module.exports = new service();