/*
 * @Author: chenyuanguang
 * @Date: 2019-12-09 17:56:57
 * @LastEditTime: 2019-12-13 10:57:59
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /liebao/internal-animefactory-server/app/service/packageService.js
 */
const packageMongoModel = require('../model/packageMongoModel');

/**
 * 打包信息实时获取
 */
class service {

    /**
     * 查询
     */
    async query(packageName, type) {
        let queryParams = {
            type: {
                $in: ['android', 'ios']
            }
        };
        if (packageName) {
            queryParams.packageName = packageName;
        }
        if (type) {
            queryParams.type = type;
        }

        const packageInfo = await packageMongoModel.findOne(queryParams, null, { sort: { createdAt: -1 } });

        queryParams.$or = [
            { status: 0 },
            { status: 2 }
        ];

       
        console.log(packageInfo)
        // 当前包状态为2时，查询最新的有效版本
        if (packageInfo) {

                let packageApk = []
                let types = ["ios", "android"]
                for (const item of types) {
                    const packageModelHistory = await packageMongoModel.findOne({
                        packageName: packageName,
                        type: item,
                        url: {
                            $exists: true
                        }
                    }, null, { sort: { createdAt: -1 } });
                    if (packageModelHistory) {
                        packageApk.push(packageModelHistory)
                    }
                }
                //如果没有打包成功的历史package版本，返回version为“”，无packageApk字段
                if (packageApk.length === 0&&packageInfo.get("status") !==1) {
                    packageInfo._doc.version = ""
                } else {
                    packageInfo._doc.packageApk = packageApk
                }
                
                if(packageInfo.get("status")===2){
                    await packageMongoModel.updateMany(queryParams, {
                        isRead: true
                    });
                }

        }
        const result={
            version:packageInfo.get("version"),
            type:packageInfo.get("type"),
            objectId:packageInfo.get("objectId"),
            // isRead:packageInfo.get("isRead"),
            status:packageInfo.get("status"),
            packageApk:packageInfo.get("packageApk")?packageInfo.get("packageApk"):[],
        }

        return result || {};
    }

}

module.exports = new service();