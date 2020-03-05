const logicMongoModel = require('../model/logicMongoModel');

/**
 * 对话logic
 */
class service {
    
    /**
     * 创建
     * @param {*} params 
     */
    async create(params) {
        const logicModel = new logicMongoModel(params);
        await logicModel.save();

        return logicModel;
    }

    /**
     * 查询详情
     * @param {*} id 
     */
    async find(id) {
        const logic = await logicMongoModel.findOne({
            id: id
        });
        return logic;
    }

    /**
     * 列表查询
     */
    async query(params) {
        const logic = await logicMongoModel.find(params);
        return logic;
    }

    /**
     * 更新
     */
    async update(id, params) {
        delete params.id;
        delete params.chatId;
        await logicMongoModel.update({
            id: id
        }, params);
    }

    /**
     * 删除
     * @param {*} id 可多个，按英文逗号分隔
     */
    async del(id) {
        const ids = id.split(',');
        await logicMongoModel.deleteOne({
            id: {
                $in: ids
            }
        });
    }
}

module.exports = new service();