
const config = require('../../config/config');
const download = require('../../../lib/download');
const fileHandle = require('../../../lib/fileHandle');
const git = require('../../../lib/git');

const path = require("path")

const resolve = (local) => {
    return path.resolve(__dirname, "../../../", local)
}
/**
 * 漫画
 */
class service {

    /**
     * 创建配置项
     * @param {*} params 
     */
    async sendConfig(params) {
        global.createStatus=0
        
        let baseConfig=JSON.parse(decodeURIComponent(JSON.stringify(params.baseConfig)))

        //gitlab相关配置
        // let gitlabConfig=params.gitlabConfig
        // gitlabConfig.gitlabUrl=decodeURIComponent(gitlabConfig.gitlabUrl)
        // gitlabConfig.chromeUrl=decodeURIComponent(gitlabConfig.chromeUrl)
        // gitlabConfig.gitlabName=decodeURIComponent(gitlabConfig.gitlabName)
        // gitlabConfig.gitlabName=decodeURIComponent(gitlabConfig.gitlabName)

        //centry相关配置
        let centryConfig=params.centryConfig
        console.log(params)

        process.projectName=baseConfig.projectName

        const template = this.getTemplate(baseConfig.templateType)
        // console.log(template)
        // 下载模板
        await download(template)
        // 修改package.json
        await this.amendPackage(baseConfig)
        await this.amendProjectConfig(baseConfig)
        await git.run(baseConfig,gitlabConfig)
        global.createStatus=1
        process.exit()

    }
    getTemplate(templateType) {
        switch (templateType) {
            case "js": {
                return resolve("template/js")
            }
        }

    }
    // // 修改package.json文件

    async amendPackage(config) {
        let amendConfig = {
            name: config.projectName,
            author: config.author,
            description: config.description,
            email: config.email,
        }
        return fileHandle.amendJson(amendConfig,config.projectName)
    }
    //修改项目配置文件
    async amendProjectConfig(config) {
        let amendConfig = {
            host: config.host,
            port: config.port
        }
        await fileHandle.amendConfig(amendConfig,config.projectName)
    }

    // 响应创建状态
    async getCreateStatus(){
        return global.createStatus
    }
}
module.exports = new service();