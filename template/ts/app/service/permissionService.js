/*
 * @Author: your name
 * @Date: 2020-01-07 14:05:41
 * @LastEditTime : 2020-01-08 13:44:59
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /liebao/internal-animefactory-server/app/service/permissionService.js
 */
const userMongoModel = require("../model/userMongoModel")
const permissionMongoModel = require("../model/permissionMongoModel")


class permissionService {

    /**
     * 创建用户权限
     * @param {json} token 
     * @param {json} user 
     */
    async create(token, param) {

        //检验用户是否存在
        let findUser = await userMongoModel.findOne({ user_id: param.user_id })
        if (findUser) {

            // 更新用户信息
            ////是否开启
            let disabled=true
            
            if(param.cartoons.length==0){
                disabled=true
            }else{
                disabled=param.disabled?true:false
            }
            await userMongoModel.updateOne({ user_id: param.user_id }, {
                initialed: true,  //开通
                disabled:disabled,
                phone:param.phone
            })

            let permissionUser = await permissionMongoModel.findOne({
                user_id: param.user_id
            })

            if (permissionUser) {
                // let arr=permissionUser.get("cartoons").map((item)=>{
                //     return item.cartoonId
                // })
                // let cartoons=JSON.parse(param.cartoons).reduce((pre, cur) => {
                //     if (!arr.includes(cur)) {
                //         pre.push({
                //             cartoonId: cur,
                //             isRead: true,       //查看权限
                //             isAmend: true,      //修改权限
                //             isDelete: false,    //删除权限
                //             isPublic: true    //发布权限
                //         })
                //     }
                //     return pre
                // }, [])

                // cartoons=[...permissionUser.get("cartoons"),
                // ...cartoons]

                let cartoons=param.cartoons.map((item) => {
                    return {
                        cartoonId: item,
                        isRead: true,       //查看权限
                        isAmend: true,      //修改权限
                        isDelete: false,    //删除权限
                        isPublic: true    //发布权限
                    }
                })

                await permissionMongoModel.update({
                    user_id: param.user_id
                },{
                    cartoons:cartoons
                })
            } else {
                param.cartoons = param.cartoons.map((item) => {
                    return {
                        cartoonId: item,
                        isRead: true,       //查看权限
                        isAmend: true,      //修改权限
                        isDelete: false,    //删除权限
                        isPublic: true    //发布权限
                    }
                })
                let addUserPermission = new permissionMongoModel(param)
                addUserPermission.save()
            }

        } else {
            throw new Error('用户不存在');
        }
        return { msg: "添加权限成功" }
    }

     /**
     * 获取用户权限
     * @param {json} token 
     * @param {json} user 
     */
    async get(token,user_id) {
        return await permissionMongoModel.findOne({
            user_id:user_id
        })
    }

}

module.exports = new permissionService();