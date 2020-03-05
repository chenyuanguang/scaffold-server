const paintMongoModel = require('../model/paintMongoModel');

/**
 * 立绘
 */
class service {
    
    /**
     * 创建
     * @param {*} params 
     */
    async create(params) {
        params.createdAt = new Date();
        const paintModel = new paintMongoModel(params);
        await paintModel.save();

        return paintModel;
    }

    /**
     * 查询详情
     * @param {*} id 
     */
    async find(id) {
        const paint = await paintMongoModel.findById(id);
        if(!paint) {
            throw new Error('立绘不存在');
        }

        return paint;
    }

    /**
     * 列表查询
     */
    async query(params) {
        const paints = await paintMongoModel.find(params);

        return paints;
    }
    /**
     * 更新
     */
    async update(id, params) {
        params.updatedAt = new Date();
        await paintMongoModel.update({
            _id: id
        }, params);
    }

    /**
     * 删除
     * @param {*} id 
     */
    async del(id) {
        await paintMongoModel.deleteOne({
            _id: id
        });
    }
}

module.exports = new service();