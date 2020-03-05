

const pathResolve = require("./pathRoot").resolve
const fileHandle = require("./fileHandle")
const spinner = require('./spinner')
const chalk = require("chalk")

module.exports = function (templatePath) {
    return new Promise((resolve, reject) => {
        const waiting = spinner('downloading project')
        waiting.start()
        console.log(templatePath,pathResolve())
        try {
            fileHandle.delDir(pathResolve())
        } catch (error) {
            
        }
        fileHandle.copyDirSync(templatePath, pathResolve()).then(() => {
            waiting.stop()
            console.log(chalk.green(`==============🤟 下载模板成功  ===============`))
            resolve()
        }).catch((err) => {
            waiting.fail(chalk.red(err));
            console.log(`=======😂 下载模板出现问题哦！=======`)
            console.log("\n")
            waiting.stop()
            reject(err)
        });

        // Git
        // .Clone(gitPath, pathResolve())
        // .then(function (repo) {
        //     spinner.stop()
        //     resolve(repo)
        // })
        // .catch((err) => {
        //     console.log(err);
        //     reject(err)
        // });
    })
}