const puppeteer = require('puppeteer-core');
const spinner = require('./spinner')
const chalk = require("chalk")
const request = require("./request")
const axios = require("axios")
const fetch = require("node-fetch")
module.exports = {
    // 获取token
    async token(domain, username, password, executablePath) {
        const waiting = spinner('注册gitlab-token')
        waiting.start()
        let browser = null
        console.log(domain, username, password, executablePath)
        try {
            browser = await puppeteer.launch({
                executablePath: executablePath,
                headless: false
            });
            const page = await browser.newPage();
            await page.goto(`https://${domain}/users/sign_in`);

            await page.type('#username', username, { delay: 100 }); // 
            await page.type('#password', password, { delay: 100 }); // 输入变慢，像一个用户
            await page.click(".btn-success")
            await page.goto(`https://${domain}/profile/personal_access_tokens`)

            // 注册token
            await page.type('#personal_access_token_name', 'node_auto', { delay: 100 }); // 输入token的名
            await page.click("#personal_access_token_scopes_api");//开启api
            await page.click("#personal_access_token_scopes_read_user");//开启读取用户
            await page.click("#personal_access_token_scopes_read_repository");//开启读取仓库
            await page.click("#personal_access_token_scopes_write_repository");//开启创建仓库

            const [response] = await Promise.all([
                page.waitForNavigation(), // 等待连接跳转完成
                page.click(".prepend-top-default .qa-create-token-button")//注册
            ]);
            const token = await page.$eval("#created-personal-access-token", (el) => {
                return el.value
            })
            await browser.close();
            waiting.stop()
            console.log(chalk.green(" 🤟gitlab-token:" + token))
            console.log("/n")
            return token
        } catch (error) {
            console.log(chalk.red(error))
            console.log("/n")
            if (browser) {
                browser.close();
            }
        }
        return null
    },
    // 创建gitlab仓库
    async createProject(domain, token, projectName) {
        const baseUrl = `https://${domain}/api/v4/`
        console.log(token)
        console.log(token.length)
        const res=await fetch(baseUrl+'projects'+"?private_token="+token+"&name="+projectName, {
            method: 'post',
            body: JSON.stringify({
                name:projectName
            })
        }).then(res => res.json())
        console.log(res)
        return res
    }
}