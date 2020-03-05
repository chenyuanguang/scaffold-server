const roomMongoModel = require('../model/roomMongoModel');

/**
 * 房间
 */
class service {
    
    /**
     * 创建
     * @param {*} params 
     */
    async create(params) {
        params.createdAt = new Date();
        const roomModel = new roomMongoModel(params);
        await roomModel.save();

        return roomModel;
    }

    /**
     * 查询详情
     * @param {*} id 
     */
    async find(id) {
        const room = await roomMongoModel.findById(id);
        if(!room) {
            throw new Error('扮装不存在');
        }

        return room;
    }

    /**
     * 列表查询
     */
    async query(params) {
        const rooms = await roomMongoModel.find(params);

        return rooms;
    }

    /**
     * 更新
     */
    async update(id, params) {
        params.updatedAt = new Date();
        await roomMongoModel.update({
            _id: id
        }, params);
    }

    /**
     * 删除
     * @param {*} id 
     */
    async del(id) {
        await roomMongoModel.deleteOne({
            _id: id
        });
    }

}

module.exports = new service();