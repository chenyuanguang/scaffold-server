
const userMongoModel=require("../model/userMongoModel")
const permissionMongoModel=require("../model/permissionMongoModel")


class userService {

    /**
     * 创建用户
     * @param {json} token 
     * @param {json} user 
     */
    async create(token, user) {
        //检验用户是否存在

        let findUser=await userMongoModel.findOne({union_id:user.union_id})
        if(!findUser){
            let addUser=new userMongoModel(user)
            addUser.save()
            return user;
        }else{
            await userMongoModel.update({
                union_id:user.union_id
            },{
                update_time:user.update_time
            })
            let findUser=await userMongoModel.findOne({union_id:user.union_id})
            return findUser.toObject()
        }
        
    }
    /**
     * @description:获取用户列表
     * @param {type} 
     * @return: 
     */

    async getList(){
        // 查询所有用户
        let users=await userMongoModel.find({
            permission:{
                $in:[0,1]
            }
        })
        let resultUsers=[]
        for(let item of users){
            let user=item.toObject()
            let permission=await permissionMongoModel.findOne({
                user_id:user.user_id
            })
           
            user.cartoons=permission?permission.get("cartoons"):[]
            delete user.is_deleted
            delete user.created_time
            delete user.is_mail_verified
            resultUsers.push(user)
        }

        return resultUsers

    }
    /**
     * 更新用户
     * @param {json} token 
     * @param {json} user 
     */
    async update(id, user) {

        await userMongoModel.update({
            user_id:id
        },{
            disabled:user.disabled
        })
        return 
    }

    /**
     * 删除用户
     * @param {json} token 
     * @param {string} id 
     */
    // async delete(token, id) {
    //     // 权限校验
    //     await this.isMyUser(token, id);

    //     await db.transaction(async(t) => {
    //         await daUserModel.update({is_deleted: true}, {where: {id:id}}, {transaction:t});
            
    //         if(daUserInfoModel.findById(id)) {
    //             await daUserInfoModel.update({deleted_time: new Date()}, {where: {id:id}}, {transaction:t});
    //         } else {
    //             await daUserInfoModel.create({id:id, deleted_time: new Date()}, {transaction:t});
    //         }
    //     }).catch(function(err){
    //         throw new Error(err);
    //     });
    // }

    /**
     * 详情查询
     * @param {json} token 
     * @param {string} id 
     */
    async findById(token) {
        // 权限校验

        let user = await userMongoModel.findOne({
            user_id:token.id
        });
        let permission=await permissionMongoModel.findOne({
            user_id:token.id
        })
        
        user=user.toObject()

        user.cartoons=permission?permission.get("cartoons"):[]

        delete user.is_deleted;
        return user;
    }

    /**
     * 修改密码
     * @param {json} token 
     * @param {string} userId 
     * @param {string} old_pwd  原密码
     * @param {string} new_pwd  新密码
     */
    // async rePwd(token, userId, old_pwd, new_pwd) {
    //     await this.isMyUser(token, userId);

    //     let user = await daUserModel.findById(userId);
    //     if(user.pwd && !await salt.comparePassword(old_pwd, user.pwd)) {
    //         let error = new Error('原密码错误');
    //         error.status = 400;
    //         throw error;
    //     }

    //     await daUserModel.update({pwd: await salt.generatePassword(new_pwd)}, {where: {id: userId}});
    // }

    
}

module.exports = new userService();