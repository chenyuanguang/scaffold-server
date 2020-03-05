/**
 * 分页处理
 */
module.exports = {
    /**
     * 分页参数处理
     * 返回null表示不分页
     * @param {json} params 
     */
    getPageParam(params) {
        if(!params) {
            return null;
        }
        
        let pageSize = 0;
        let pageNum = 0;

        if(params.pageSize || params.pageNum) {
            pageSize = params.pageSize?params.pageSize:10;
            pageNum = params.pageNum?params.pageNum:1;
        }

        if(pageSize > 0 && pageNum > 0) {
            return {
                limit: Number(pageSize),
                offset: (pageNum - 1) * pageSize
            }
        }

        return null;
    },

    /**
     * 分页或列表查询
     * 参数带pageSize（每页数据量）、pageNum（页数），且都大于0，返回分页；否则返回列表
     * @param {model} model sequelize model
     * @param {json} whereParam where条件
     * @param {json} pageParam pageSize、pageNum
     * @param {array} attributes 返回值，过滤字段
     * @param {array} include 联合查询model
     * @param {array} order 排序 [['id', 'DESC'],['name']]
     */
    async query(model, whereParam, pageParam, attributes, include, order) {
        const pageParams = this.getPageParam(pageParam);
        
        // 联合查询参数
        let includeParams = {};
        if(attributes && attributes.length>0) {
            includeParams.attributes = attributes;
        }
        if(include) {
            includeParams.include = include;
        }

        if(order) {
            includeParams.order = order;
        }

        let result = {};
        if(pageParams && pageParams.hasOwnProperty('limit') && pageParams.hasOwnProperty('offset')) {
            // 分页查询
            delete whereParam.pageSize;
            delete whereParam.pageNum;
            
            pageParams.where = whereParam;
            pageParams.raw = true;

            Object.assign(pageParams, includeParams);

            result = await model.findAndCountAll(pageParams);
        } else {
            // 列表查询
            let listParams = {
                where: whereParam,
                raw: true
            }

            Object.assign(listParams, includeParams);

            result = await model.findAll(listParams);
        }

        return result;
    },

    /**
     * 带group的分页、列表查询
     * @param {sequelize} queryObj sequelize对象
     * @param {json} where 查询条件
     * @param {json} page 分页参数
     */
    async queryByGroup(queryObj, where, page) {
        const pageParams = this.getPageParam(page);
        if(pageParams) {
            const rows = await queryObj.findAll(where);
            
            let result = rows.slice(pageParams.offset, pageParams.limit + pageParams.offset);
            return {
                count: rows.length,
                rows: result
            };
        } else {
            const result = await queryObj.findAll(where);
            return result;
        }
    }
}