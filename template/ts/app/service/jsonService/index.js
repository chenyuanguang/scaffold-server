const smsMongoModel = require('../../model/smsMongoModel');
const characterMongoModel = require('../../model/characterMongoModel');
const cartoonMongoModel = require('../../model/cartoonMongoModel');
const publicCartoonMongoModel = require('../../model/publicCartoonMongoModel');
const chatMongoModel = require('../../model/chatMongoModel');
const logicMongoModel = require('../../model/logicMongoModel');
const itemMongoModel = require('../../model/itemMongoModel');
const publicChatMongoModel = require('../../model/publicChatMongoModel');
const publicLogicMongoModel = require('../../model/publicLogicMongoModel');
const publicItemMongoModel = require('../../model/publicItemMongoModel');
const packageMongoModel = require('../../model/packageMongoModel');
const chapterMongoModel = require('../../model/chapterMongoModel');
const gameMongoModel = require('../../model/gameMongoModel');
const paintMongoModel = require('../../model/paintMongoModel');
const cosService = require('../cosService');
const cartoonService = require('../cartoonService');
const smsService = require('../smsService');
const chapterService = require('../chapterService');
const fs = require('fs');
const ftp = require('ftp');
const path = require('path');
const request = require('request');
const archiver = require('archiver');
const config = require('../../../config/config');
const FtpDeploy = require("ftp-deploy");
const axios = require("axios");
const crypto = require("crypto");
const packageAppService = require("./packageAppService")

// 工具service


const toolService = require("./toolService")
const commonJsonService = require("./commonJsonService")
const resourceService = require("./resourceService")


/**
 * 格式化json
 */
class service {

    /**
     * 打包资源
     * @param {int} cartoonId   漫画id
     * @param {*} resourceName  资源名
     * @param {*} version       版本号
     */
    async autoResource(cartoonId, resourceName, version) {
        const cartoon = await publicCartoonMongoModel.findOne({ cartoonId });

        // 包名
        let packageName = cartoon.get('packageName');
        if (!packageName) {
            packageName = await cartoonService.packageName(new Date());
        }

        // 创建资源包文件夹
        const packagePath = path.resolve(__dirname, `../../../public/${packageName}.${resourceName}`);
        toolService.__rmdir(packagePath, true);
        fs.mkdirSync(packagePath);

        const resourcePath = path.resolve(packagePath, `Resources`);
        fs.mkdirSync(resourcePath);

        // 新版本号，发版自动+1
        let newVersion = '1';
        if (version) {
            newVersion = version
        } else if (cartoon.get(`${resourceName}_Version`)) {
            newVersion = cartoon.get(`${resourceName}_Version`) * 1 + 1;
        }

        // 资源文件
        if (resourceName === 'homePage') {
             // 复制demo文件夹
             const demoPath = path.resolve(__dirname, `../../../public/packageDemo/android/Resources/mainscene`);
             toolService.copyDirectory(demoPath, resourcePath)
            // 主要界面（首页）
            await commonJsonService.packageFileMain(resourcePath, cartoonId, true);
        } else if (resourceName === 'settingPage') {
            // 主要界面（设置）
            await commonJsonService.cartoonSetting(resourcePath, cartoonId, true);
        } else if (resourceName === 'matertial') {
            // 复制demo文件夹
            const demoPath = path.resolve(__dirname, `../../../public/packageDemo/android/Resources/common`);
            toolService.copyDirectory(demoPath, resourcePath)
            // 主要界面（页面素材库）
            await commonJsonService.packageFileCommon(resourcePath, cartoonId, true);
        } else if (resourceName === 'chapterPage') {
            // 章节界面（页面素材库）
            await commonJsonService.packageFileChapter(resourcePath, cartoonId, true);

        }else if (resourceName === 'chatPage') {
            // 聊天界面（页面素材库）
            await commonJsonService.packageFileChat(resourcePath, cartoonId, true);
            
        }else if (resourceName === 'dressUpPage') {
            // 换装界面（页面素材库）
            await commonJsonService.packageFileDress(resourcePath, cartoonId, true);
            
        }else if (resourceName === 'chapter') {
            // 打包漫画下全部条漫
            await resourceService.__resourceChapter(resourcePath, cartoonId, packageName);
            // 记录章节资源打包成功
            await cartoonMongoModel.update({
                _id:cartoonId
            },{
                chapterPackage:2
            })
        } else if (resourceName === 'game') {
            // 打包漫画下全部游戏
            await resourceService.__resourceGame(resourcePath, cartoonId, packageName, newVersion);
        } else if (resourceName === 'chat') {
            // 打包漫画下全部聊天
            const sms = await smsMongoModel.find({
                cartoonId,
                deleted: false,
                type: {
                    $in: ['single', 'group']
                }
            });

            const smsIds = [];
            sms.forEach(el => {
                smsIds.push(el.id);
            });

            const chats = await publicChatMongoModel.find({
                smsId: {
                    $in: smsIds
                },
                deleted: false
            });

            for (let chat of chats) {
                await resourceService.__resourceChat(resourcePath, chat.chatId, 'chat', packageName);
            }
        } else if (resourceName === 'voice') {
            // 打包漫画下全部语音对话
            const sms = await smsMongoModel.find({
                cartoonId,
                deleted: false,
                type: 'voiceSingle'
            });

            const smsIds = [];
            sms.forEach(el => {
                smsIds.push(el.id);
            });

            await resourceService.__resourceVoice(resourcePath, smsIds, null, packageName);
        } else if (resourceName === 'scene') {
            // 打包漫画下全部场景
            const sms = await smsMongoModel.find({
                cartoonId,
                deleted: false,
                type: 'scene'
            });

            const smsIds = [];
            sms.forEach(el => {
                smsIds.push(el.id);
            });

            const chats = await publicChatMongoModel.find({
                smsId: {
                    $in: smsIds
                },
                deleted: false
            });

            for (let chat of chats) {
                await resourceService.__resourceChat(resourcePath, chat.chatId, 'scene', packageName);
            }
        } else if (resourceName === 'sceneInChapter') {
            // 打包章节中场景
            const chapters = await chapterMongoModel.find({
                cartoonId
            });

            const chatIds = [];
            chapters.forEach(chapter => {
                chapter.get('item').forEach(item => {
                    if (item._doc.sceneChatId) {
                        chatIds.push(item._doc.sceneChatId);
                    }
                })
            });

            const chats = await publicChatMongoModel.find({
                chatId: {
                    $in: chatIds
                },
                deleted: false
            });

            for (let chat of chats) {
                await resourceService.__resourceChat(resourcePath, chat.chatId, 'scene', packageName);
            }
        } else if (resourceName === 'chatInChapter') {
            // 打包章节中对话
            const chapters = await chapterMongoModel.find({
                cartoonId
            });

            const chatIds = [];
            chapters.forEach(chapter => {
                chapter.get('item').forEach(item => {
                    if (item._doc.chatId) {
                        chatIds.push(item._doc.chatId);
                    }
                })
            });

            const chats = await publicChatMongoModel.find({
                chatId: {
                    $in: chatIds
                },
                deleted: false
            });

            for (let chat of chats) {
                await resourceService.__resourceChat(resourcePath, chat.chatId, 'chat', packageName);
            }
        } else if (resourceName === 'voiceInChapter') {
            // 打包章节中语音来电
            const chapters = await chapterMongoModel.find({
                cartoonId
            });

            const chatIds = [];
            chapters.forEach(chapter => {
                chapter.get('item').forEach(item => {
                    if (item._doc.voiceChatId) {
                        chatIds.push(item._doc.voiceChatId);
                    }
                })
            });

            const chats = await publicChatMongoModel.find({
                chatId: {
                    $in: chatIds
                },
                deleted: false
            });

            let smsIds = new Set();
            for (let chat of chats) {
                smsIds.add(chat.get('smsId'));
            }
            await resourceService.__resourceVoice(resourcePath, Array.from(smsIds), chatIds, packageName);
        }

        // 删除本地文件
        console.log(packagePath + "over")
        // toolService.__rmdir(packagePath, true);

        // 修改资源库版本号
        await publicCartoonMongoModel.update({
            cartoonId
        }, {
            [`${resourceName}_Version`]: newVersion
        });

        // // 记录资源打包信息
        // const packageModel = new packageMongoModel({
        //     objectId: cartoonId,
        //     type: resourceName,
        //     packageName: packageName,
        //     version: newVersion,
        //     status: 2,  // 打包完成
        //     createdAt: new Date()
        // });
        // await packageModel.save();
    }

    /**
     * 创建打包记录，直接前端返回，防止同步方法相应时间过长
     */
    async createPackageLog(cartoonId, platform) {
        // 同一时间只能打一个包
        const packageIng = await packageMongoModel.findOne({
            type: {
                $in: ['android', 'ios']
            },
            status: 1
        });


        if (packageIng) {
            throw new Error('同时只能打一个包，清稍后再试');
        }

        const cartoon = await publicCartoonMongoModel.findOne({ cartoonId });
        // 创建包文件夹
        let packageName = cartoon.get('packageName');

        // 记录app打包信息
        const packageModel = new packageMongoModel({
            objectId: cartoonId,
            type: platform,
            taskCode: '',
            packageName: packageName,
            version: '',
            status: 1,  // 打包中
            createdAt: new Date()
        });
        await packageModel.save();

        return packageModel.id;
    }
 // 打包开始15分钟后，如果未打包成功，默认打包失败
    _packageErrorVersion(packageId){
        let time=setTimeout(async()=>{
            await toolService.updateCartoonPackage(packageId)
        },1000*60*35)
        return ()=>{
            clearTimeout(time)
        }
    }



    /**
     * 自动打包
     * @param {*} cartoonId 
     * @param {*} version    自定义版本号
     * @param {*} packageId  打包记录id
     */
    async atuoPackage(cartoonId, version, packageId, platform) {
        try {
            const cartoon = await publicCartoonMongoModel.findOne({ cartoonId });
            if (cartoon) {
                // 创建包文件夹
                let packageName = cartoon.get('packageName');
                if (!packageName) {
                    packageName = await cartoonService.packageName(new Date());
                }
                // 复制demo文件夹
                const packagePath = path.resolve(__dirname, `../../../public/${packageName}`);
                const demoPath = path.resolve(__dirname, `../../../public/packageDemo`);
                toolService.copyDirectory(demoPath, packagePath)

                // 新版本号，发版自动+1
                let newVersion = '1.0.0';
                if (version) {
                    newVersion = version
                } else if (cartoon.get('version') && typeof cartoon.get('version') === "string") {
                    newVersion = await toolService.getVersion(cartoon.get('version'), "add")
                }

                // 修改库版本号（版本号先修改成最新的，如果打包失败，再减回原版本号）
                await publicCartoonMongoModel.update({
                    cartoonId
                }, {
                    version: newVersion,
                });
                await cartoonMongoModel.update({
                    _id:cartoonId
                }, {
                    version: newVersion,
                });

                // 更新package的版本号
                await packageMongoModel.update({
                    _id: packageId
                }, {
                    version: newVersion
                });

                //复制压缩ios和android资源（只复制相对应的平台）
                //==实现apk下载漫画资源与压缩
                //==打包apk资源上传ftp管理
                await packageAppService.__copyResource(platform, packagePath, cartoon, newVersion, packageName)

                // apk的资源包打包（资源sz文件）
                // == 每次打包更新资源
                // == 资源在腾讯云cos存储管理（每次上传覆盖上一次资源）

                //章节资源
                await this.autoResource(cartoonId, 'chapter');
                // // 更新游戏资源
                await this.autoResource(cartoonId, 'game');
                // // 更新对话资源
                await this.autoResource(cartoonId, 'chat');
                // // 更新场景资源
                await this.autoResource(cartoonId, 'scene');
                // // 更新语音资源
                await this.autoResource(cartoonId, 'voice');
                // // 更新章节中语音资源
                await this.autoResource(cartoonId, 'voiceInChapter');

                // 打包开始15分钟后，如果未打包成功，默认打包失败
                const timeCb=this._packageErrorVersion(packageId)

                if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'pro') {
                    // 上传ftp
                    const ftpDeploy = new FtpDeploy();
                    const ftpConf = {
                        user: config.ftp_user,
                        password: config.ftp_pwd,
                        host: config.ftp_host,
                        port: config.ftp_port,
                        localRoot: packagePath,
                        remoteRoot: "/" + packageName,
                        include: ['*', '**/*'],
                        deleteRemote: false,
                        forcePasv: true
                    };

                    await new Promise(function (resolve, reject) {
                        ftpDeploy
                            .deploy(ftpConf)
                            .then(res => {
                                console.log("upload ftp finished:", res);
                                resolve('success')
                            })
                            .catch(err => {
                                reject(err);
                            });
                    });

                    // 调打包平台接口自动打包
                    const buildPlantResult = await this.__notifyBuildPlant([{
                        "value_name": "packagename",
                        "value_key": "packagename",
                        "default_value": packageName,
                        "value_type": 1,
                        "description": ""
                    },
                    {
                        "value_name": "IS_IOS",
                        "value_key": "IS_IOS",
                        "default_value": platform && platform === 'ios' ? "True" : "False",
                        "value_type": 3,
                        "description": ""
                    },
                    {
                        "value_name": "打包类型",
                        "value_key": "p_build_type",
                        "default_value": "product",
                        "value_type": 1,
                        "description": ""
                    },{
                        "value_name": "upload_testflight",
                        "value_key": "upload_testflight",
                        "default_value": platform && platform === 'ios' ? "True" : "False",
                        "value_type": 3,
                        "description": ""
                    }]);
                     //停止打包超时计时器
                     timeCb()
                    if (buildPlantResult.status == 200 && buildPlantResult.data.code == 200) {
                        // 修改库版本号
                        await publicCartoonMongoModel.update({
                            cartoonId
                        }, {
                            packageName: packageName
                        });

                        // 更新app打包信息
                        await packageMongoModel.update({
                            _id: packageId
                        }, {
                            taskCode: buildPlantResult.data.data.task_code,
                            packageName: packageName
                        });
                       
                    } else {
                        if (buildPlantResult.data.msg) {
                            throw new Error(buildPlantResult.data.msg);
                        } else {
                            throw new Error(buildPlantResult.data);
                        }
                    }
                }else{
                    // 开发环境直接删除package包，版本减1
                     // 修改库版本号-1
                    let reduceVersion=await toolService.getVersion(newVersion, "reduce")
                    
                    await publicCartoonMongoModel.update({
                        cartoonId
                    }, {
                        version:reduceVersion ,
                    });

                    await cartoonMongoModel.update({
                        _id:cartoonId
                    }, {
                        version:reduceVersion ,
                    });

                    // 删除无用的package
                    await packageMongoModel.deleteOne({
                        _id: packageId
                    });

                }

                // 删除apk文件包
                console.log("apk-over")
                // toolService.__rmdir(packagePath, true);


            }
        } catch (e) {
            await packageMongoModel.update({
                _id: packageId
            }, {
                err: e.message,
                status: 0
            });
            throw e;
        }
    }

    /**
     * 通知打包平台打包
     * @param {array} params 
     */
    async __notifyBuildPlant(params) {

        return await axios({
            method: 'POST',
            url: config.build_platform,
            data: {
                "task_out_cim": 1,
                "repos_code": config.build_repos_code,
                "caller_name": "wangshuli@cmcm.com",
                "repos_name": "CartoonFactory",
                "branch": "master",
                "params": params
            }
        })
    }

    /**
     * 打包成功通知
     */
    async notify(params) {
        console.log('------打包通知--------');
        console.log(params);
        console.log('---------------------');

        // params={ pkg_url: 'ftp://CartoonFactoryres@62.234.188.175/master/20200110.476/cartoonfactory_20200110.476.ipa',
        // task_code: 'BTF20011051771' }


        const packageModel = await packageMongoModel.findOne({
            taskCode: params.task_code
        });
        const packageName = packageModel.get('packageName');

        // 打包失败
        if (!params.pkg_url.startsWith('ftp')) {
            await packageMongoModel.update({
                taskCode: params.task_code
            }, {
                err: params.pkg_url,
                status: 0,   // 打包失败
                isRead: false
            });

            // 修改库版本号-1
            let cartoonId = packageModel.get('objectId')
            let reduceVersion=await toolService.getVersion(packageModel.get('version'), "reduce")
            await publicCartoonMongoModel.update({
                cartoonId
            }, {
                version:reduceVersion ,
            });
            await cartoonMongoModel.update({
                _id:cartoonId
            }, {
                version:reduceVersion ,
            });
            

            return;
        }
        // 如果是ios不用下载
        if(params.pkg_url.endsWith(".ipa")){
            let updatePamrams = {
                status: 2,   // 打包成功
                isRead: false
            };
            updatePamrams.url = params.pkg_url;
            await packageMongoModel.update({
                taskCode: params.task_code,
            }, updatePamrams);
            return 
        }


        // 下载打包成功的APP(针对android)
        const client = new ftp();
        client.connect({
            host: config.ftp_host,
            port: config.ftp_port,
            user: config.ftp_apk_user,
            password: config.ftp_apk_pwd,
            keepalive: 1000
        });

        const pkgUrls = params.pkg_url.split('master')[1].split('/');
        const isApp = params.pkg_url.indexOf('.apk') == -1 && params.pkg_url.indexOf('.ipa') == -1 ? false : true;

        // 切换路径
        const downPath = '/master' + pkgUrls.slice(0, isApp ? pkgUrls.length - 1 : pkgUrls.length).join('/');
        let { err: ea, dir } = await new Promise((resolve, reject) => {
            client.cwd(downPath, (err, dir) => {
                resolve({ err: err, dir: dir });
            })
        });

        let appExtName;
        let appFilePath;
        let url;
        let resourcePath;
        if (isApp) {
            // app名
            let appFulName = pkgUrls[pkgUrls.length - 1];
            const appFulNames = appFulName.split('.');
            appExtName = appFulNames[appFulNames.length - 1];

            // 从ftp下载app
            const appName = packageName + '.' + packageModel.get('version') + '.' + appExtName;
            appFilePath = path.resolve(__dirname, `../../../public/${appName}`);
            await new Promise((resolve, reject) => {
                // // 如果是ios
                // if(appExtName==="ipa"){
                //     appFulName=appFulName+"/Unity-iPhone.ipa"
                // }
                client.get(appFulName, (err, rs) => {
                    rs.on('close', function () { resolve() });
                    rs.pipe(fs.createWriteStream(appFilePath));
                });
            });

            // 上传cos
            if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'pro') {
                const appReader = fs.createReadStream(appFilePath);
                url = await cosService.upload(`${appName}`, `${appName}`, `application/${appExtName}`, appReader);
            }
        } else {
            const chapters = await chapterMongoModel.find({
                cartoonId: packageModel.get('objectId')
            });

            resourcePath = path.resolve(__dirname, `../../../public/${packageName}.resource.down`);
            await toolService.__rmdir(resourcePath, true);
            fs.mkdirSync(resourcePath);

            for (let i = 0; i < chapters.length; i++) {
                // 切换目录
                try {
                    await new Promise((resolve, reject) => {
                        client.cwd(`section_${(i + 1)}`, (err, dir) => {
                            resolve({ err: err, dir: dir });
                        })
                    });
                } catch (e) {
                }

                const sectionPath = path.resolve(resourcePath, `section_${(i + 1)}`);
                fs.mkdirSync(sectionPath);

                for (let j = 0; j < chapters[i].get('item').length; j++) {
                    // 下载文件
                    try {
                        const filePath = path.resolve(sectionPath, `part_${(j + 1)}.sf`);
                        await new Promise((resolve, reject) => {
                            client.get(`part_${(j + 1)}.sf`, (err, rs) => {
                                rs.on('close', function () { resolve() });
                                rs.pipe(fs.createWriteStream(filePath));
                            });
                        });

                        // 上传cos
                        if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'pro') {
                            const appReader = fs.createReadStream(filePath);
                            let url = await cosService.upload(`${packageName}.resource.chapter.section_${(i + 1)}.part_${(j + 1)}.sf`, null, `application/sf`, appReader);
                            console.log(url);
                        }
                    } catch (e) {
                    }
                }
            }
        }

        let updatePamrams = {
            status: 2,   // 打包成功
            isRead: false
        };

        if (isApp) {
            updatePamrams.url = url;

            // 删除本地文件
            fs.unlinkSync(appFilePath);
        } else {
            updatePamrams.resourcePath = params.pkg_url
            await toolService.__rmdir(resourcePath, true);
        }

        await packageMongoModel.update({
            taskCode: params.task_code,
        }, updatePamrams);
    }

}

module.exports = new service();