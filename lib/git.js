const { spawn, exec } = require("./childProcess");
const gitlab = require("./gitlab");
const gitP = require('simple-git/promise');
const pathRoot=require("./pathRoot")


// const spinner = require('./spinner')
// const chalk = require("chalk");
module.exports = {
  git(dir){
    return gitP(dir)
  },
  // 设置全局返回gitlab.token
  async gitlabToken(domain, username, password, executablePath) {
    let { data, err } = await exec("git config --global gitlab.token")
    console.log(data)
    //有token，直接返回
    data = data && data.replace(/^\s+|\s+$/g, "")
    if (data) {
      return { token: data }
    }

    //无token，注册
    if (domain && username && password) {
      const token = await gitlab.token(domain, username, password, executablePath)
      console.log(token)
      if (token) {
        await exec(`git config --global gitlab.token ${token}`)
        return { token }
      }
      // 注册失败返回null
      return { err: "注册失败" }
    }
    return { err: "填写gitlab域名、用户名、密码" }
  },
  // 初始化本地项目的git仓库并提交到远程
  async gitInitPush(baseConfig,gitlabConfig,ssh_url_to_repo) {
    let {projectName}=baseConfig
    let git=this.git(pathRoot.resolve())
    await git.init()
    await git.add(".")
    await git.commit(Date.now())
    await git.addRemote("origin",ssh_url_to_repo)
    //和远程交互时需要使用ssh所以使用系统的git命令进行操作
    await exec(`cd ${projectName} && git push origin master`)
    return 
  },
  // 创建gitlab仓库并将本地代码提交至gitlab仓库
  async run(baseConfig,gitlabConfig) {
    const { token } = await this.gitlabToken(gitlabConfig.gitlabUrl,gitlabConfig.gitlabName,gitlabConfig.gitlabPassword,"/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome")
    if (token) {
      let {id,ssh_url_to_repo}=await gitlab.createProject(gitlabConfig.gitlabUrl,token,baseConfig.projectName)
      if(!id){
        global.createStatus=3
        throw new Error("项目已存在")
      }
      await this.gitInitPush(baseConfig,gitlabConfig,ssh_url_to_repo)
      console.log("提交代码")
      return 
    }
    global.createStatus=2
    throw new Error("token不存在")
  }
}


