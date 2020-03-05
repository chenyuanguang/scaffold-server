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
const commonChatService = require("./commonChatService")

/**
 * 格式化json
 */
class service {

    /**
     * 短息json
     * @param {*} smsId 
     */
    async jsonBySms(smsId) {
        // 短信json
        const smsJson = await commonChatService.__getSmsJson(smsId);

        // 短信资源打包
        const zipFile = await commonChatService.__getZipFiles(smsId);
        const zipFilePath = path.resolve(__dirname, `../../../public/${smsId}.zip`);
        await toolService.__zip(zipFilePath, zipFile);

        // 打包后文件上传cos
        const reader = fs.createReadStream(zipFilePath);

        // 资源上传cos，以短信id为名，客户端通过固定url+短信id下载
        if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'pro') {
            const url = await cosService.upload(`${smsId}.zip`, `${smsId}.zip`, 'application/zip', reader);
            console.log(url);
        }

        // 删除本地文件
        zipFile.forEach(el => fs.unlinkSync(el));

        return smsJson;
    }


    /**
        * 打包章节条漫
        * @param {*} basePath 
        * @param {*} cartoonId 
        */
    async __resourceChapter(basePath, cartoonId, packageName) {
        // 创建资源文件夹
        const resourcePath = path.resolve(basePath, `story`);
        await toolService.__rmdir(resourcePath, true);
        fs.mkdirSync(resourcePath);

        const chapters = await chapterMongoModel.find({
            cartoonId: cartoonId
        });

        // 章节json、切图
        for (let i = 0; i < chapters.length; i++) {
            const chapter = chapters[i];

            // 章节文件夹
            const sectionName = `section_${(i + 1)}`;
            const chapterPath = path.resolve(resourcePath, sectionName)
            fs.mkdirSync(chapterPath);

            // 条漫切图,按高度1334截取成块
            for (let j = 0; j < chapter.get('item').length; j++) {
                const item = chapter.get('item')[j];

                // part文件夹
                const partName = `part_${(j + 1)}`;
                const partPath = path.resolve(chapterPath, partName)
                fs.mkdirSync(partPath);

                let dataJson = [];
                const zipFile = [];

                const block = item.get('height') ? item.get('height') / 1334 : 1;
                for (let n = 0; n < block; n++) {
                    const imgName = `img-${(n + 1)}`;

                    let thisDataJson = {
                        image: imgName
                    }
                    if (n < block - 1) {
                        thisDataJson.layoutType = 0;
                    } else {
                        thisDataJson.layoutType = 1;
                        thisDataJson.layoutName = 'part_item_next_normal.json';
                        thisDataJson.content = item.get('button');
                    }
                    dataJson.push(thisDataJson);

                    // 名称：章节index_条漫index_块index
                    const itemPath = path.resolve(partPath, `${imgName}.jpg`)
                    const position = `-${n * 1334}px`;
                    await chapterService.formatChapter(item.url, itemPath, position, item.get('height') ? item.get('height') : 1334);
                    zipFile.push(itemPath);
                }

                const storyJsonPath = path.resolve(partPath, `data.json`);
                fs.writeFileSync(storyJsonPath, JSON.stringify(dataJson));
                zipFile.push(storyJsonPath);

                // 压缩zip
                const zipFilePath = path.resolve(partPath, `${partName}.sz`);
                await toolService.__zip(zipFilePath, zipFile);

                // 上传cos
                if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'pro') {
                    const zipReader = fs.createReadStream(zipFilePath);
                    const cosPath = `${packageName}.resource.chapter.${sectionName}.${partName}.sz`;
                    const url = await cosService.upload(cosPath, cosPath, `application/sz`, zipReader);
                    console.log(url);
                }

                // 修改数据版本
                const cartoon = await publicCartoonMongoModel.findOne({ cartoonId });
                await publicCartoonMongoModel.updateOne({
                    cartoonId
                }, {
                    chapterDataVersion: cartoon.get('chapterDataVersion') ? cartoon.get('chapterDataVersion') : 1
                });
            }
        }
    }

    /**
     * 打包游戏
     * @param {*} basePath 
     * @param {*} cartoonId 
     */
    async __resourceGame(basePath, cartoonId, packageName, version) {
        // 创建资源文件夹
        const resourcePath = path.resolve(basePath, `game`);
        await toolService.__rmdir(resourcePath, true);
        fs.mkdirSync(resourcePath);

        const games = await gameMongoModel.find({
            cartoonId: cartoonId
        })

        const cartoon = await publicCartoonMongoModel.findOne({ cartoonId });

        for (let game of games) {
            if (!game.get('name')) {
                continue;
            }
            const zipFile = [];

            // 单个游戏目录
            const gamePath = path.resolve(resourcePath, game.get('name'));
            fs.mkdirSync(gamePath);

            let gameJson;
            let buttonName=""
            let buttonPath=""

            let backName=""
            let backPath=""
            // 按钮图
            if (cartoon.get('matertialCTABtnImage')) {
                buttonName = toolService.__getAvatorName(cartoon.get('matertialCTABtnImage'));
                buttonPath = path.resolve(gamePath, buttonName + '.png');

                await toolService.__downImg(buttonPath, cartoon.get('matertialCTABtnImage'));
                zipFile.push(buttonPath);
            }


            // 返回图
            if (cartoon.get('matertialBackBtnImage')) {
                const backName = toolService.__getAvatorName(cartoon.get('matertialBackBtnImage'));
                const backPath = path.resolve(gamePath, backName + '.png');

                await toolService.__downImg(backPath, cartoon.get('matertialBackBtnImage'));
                zipFile.push(backPath);

            }

            if (game.get('type') === 'mix') {
                // 合成类游戏
                gameJson = {};

                gameJson.name = game.get('name');
                gameJson.time = game.get('maxSeconds');
                gameJson.version = version;

                // 背景图
                let bgTextureName=""
                let bgTexturePath=""
                if (game.get('bgImage')) {
                    bgTextureName = toolService.__getAvatorName(game.get('bgImage'));
                    gameJson.bgTexture = bgTextureName;
                    bgTexturePath = path.resolve(gamePath, bgTextureName + '.jpg');

                    await toolService.__downImg(bgTexturePath, game.get('bgImage'));
                    zipFile.push(bgTexturePath);
                }


                // 背景按钮
                let bottomTextureName=""
                let bottomTexturePath=""
                if (game.get('bgImageBottom')) {
                    bottomTextureName = toolService.__getAvatorName(game.get('bgImageBottom'));
                    gameJson.bottomTexture = bottomTextureName;
                    bottomTexturePath = path.resolve(gamePath, bottomTextureName + '.jpg');
                    await toolService.__downImg(bottomTexturePath, game.get('bgImageBottom'));
                    zipFile.push(bottomTexturePath);

                }

                // 容器图
                let containerName=""
                let containerPath=""
                if (game.get('containerImage')) {
                    containerName = toolService.__getAvatorName(game.get('containerImage'));
                    gameJson.container = containerName;
                    containerPath = path.resolve(gamePath, containerName + '.png');
                    await toolService.__downImg(containerPath, game.get('containerImage'));
                    zipFile.push(containerPath);
                }


                // 结果图
                let resultImgName=""
                let resultImgPath=""
                if (game.get('resultImage')) {
                    resultImgName = toolService.__getAvatorName(game.get('resultImage'));
                    gameJson.resultImg = resultImgName;
                    resultImgPath = path.resolve(gamePath, resultImgName + '.png');
                    await toolService.__downImg(resultImgPath, game.get('resultImage'));
                    zipFile.push(resultImgPath);
                }


                // 拼接图
                let comMat = [];
                for (let minItem of game.get('mixItems')) {
                    if (minItem.image) {
                        const minItemName = toolService.__getAvatorName(minItem.image);
                        const minItemPath = path.resolve(gamePath, minItemName + '.png');

                        await toolService.__downImg(minItemPath, minItem.image);
                        zipFile.push(minItemPath);
                    }


                    comMat.push({
                        url: minItemName,
                        type: minItem.type === 'need' ? 1 : 0
                    });
                }
                gameJson.comMat = comMat;

                gameJson.startPopUp = {
                    "buttonImage": buttonName,
                    "buttonText": game.get('startBtnText'),
                    "closeImage": backName,
                    "desc": game.get('description'),
                    "dialogBorderImage": "common_bubble",
                    "title": game.get('name')
                }

                gameJson.endPopUp = {
                    "buttonImage": buttonName,
                    "buttonText": game.get('successBtnText'),
                    "closeImage": backName,
                    "desc": game.get('successText'),
                    "dialogBorderImage": cartoon.get('matertialBorderColor'),
                    "title": game.get('continueBtnText'),
                    "topImg": ""
                }

                gameJson.failPopUp = {
                    "buttonImage": buttonName,
                    "buttonText": game.get('failureBtnText'),
                    "closeImage": "",
                    "desc": game.get('failureText'),
                    "dialogBorderImage": "common_bubble",
                    "topImg": ""
                }
            } else if (game.get('type') === 'card') {
                // 抽卡类
                gameJson = {};

                gameJson.nextContent = game.get('continueBtnText');
                gameJson.isRetry = game.get('ifAgain') || false;
                gameJson.retryContent = game.get('againBtnText');
                gameJson.gameTime = game.get('maxSeconds');

                // 背景图
                let bgName=""
                let bgPath=""
                if (game.get('bgImage')) {
                    bgName = toolService.__getAvatorName(game.get('bgImage'));
                    gameJson.bg = bgName;
                    bgPath = path.resolve(gamePath, bgName + '.jpg');
                    await toolService.__downImg(bgPath, game.get('bgImage'));
                    zipFile.push(bgPath);
                }



                // 卡片背景图
                let cardBackName=""
                let cardBackPath=""
                if (game.get('cardBgImage')) {
                    cardBackName = toolService.__getAvatorName(game.get('cardBgImage'));
                    gameJson.cardBack = cardBackName;
                    cardBackPath = path.resolve(gamePath, cardBackName + '.jpg');
                    await toolService.__downImg(cardBackPath, game.get('cardBgImage'));
                    zipFile.push(cardBackPath);
                }


                // 卡片
                const cards = [];
                for (let cardImage of game.get('cardImages')) {
                    if (cardImage) {
                        const cardName = toolService.__getAvatorName(cardImage);
                        const cardPath = path.resolve(gamePath, cardName + '.jpg');

                        await toolService.__downImg(cardPath, cardImage);
                        cards.push(cardName);
                        zipFile.push(cardPath);
                    }


                }
                gameJson.cardFront = cards;

                gameJson.startPopUp = {
                    "buttonImage": buttonName,
                    "buttonText": game.get('startBtnText'),
                    "closeImage": backName,
                    "desc": game.get('description'),
                    "dialogBorderImage": cartoon.get('matertialBorderColor'),
                    "fontName": cartoon.get('matertialFontFamily'),
                    "title": game.get('name')
                }
            } else if (game.get('type') === 'find') {
                // 找茬类
                gameJson = [];

                // 背景图
                let bgName=""
                let bgPath=""
                if (game.get('bgImage')) {
                    bgName = toolService.__getAvatorName(game.get('bgImage'));
                    bgPath = path.resolve(gamePath, bgName + '.jpg');
                    await toolService.__downImg(bgPath, game.get('bgImage'));
                    zipFile.push(bgPath);
                }



                // 物品图
                let mainImageName=""
                let mainImagePath=""
                if (game.get('mainImage')) {
                    mainImageName = toolService.__getAvatorName(game.get('mainImage'));
                    mainImagePath = path.resolve(gamePath, mainImageName + '.png');
                    await toolService.__downImg(mainImagePath, game.get('mainImage'));
                    zipFile.push(mainImagePath);
                }



                gameJson = [
                    {
                        "name": "background",
                        "components":
                            [
                                {
                                    "name": "rectTransform",
                                    "sizeDelta": {
                                        "x": 1080,
                                        "y": 2560
                                    },
                                    "anchoredPosition": {
                                        "x": 0,
                                        "y": 0
                                    },
                                    "pivot": {
                                        "x": 0.5,
                                        "y": 0.5
                                    },
                                    "anchorMin": {
                                        "x": 0.5,
                                        "y": 0.5
                                    },
                                    "anchorMax": {
                                        "x": 0.5,
                                        "y": 0.5
                                    }
                                },
                                {
                                    "name": "rawImage",
                                    "texture": bgName
                                }
                            ]
                    },
                    {
                        "name": "backBtn",
                        "components":
                            [
                                {
                                    "name": "rectTransform",
                                    "sizeDelta": {
                                        "x": 200,
                                        "y": 200
                                    },
                                    "anchoredPosition": {
                                        "x": 146,
                                        "y": -146
                                    },
                                    "anchorMin": {
                                        "x": 0,
                                        "y": 1
                                    },
                                    "anchorMax": {
                                        "x": 0,
                                        "y": 1
                                    }
                                },
                                {
                                    "orderSubIdame": "image",
                                    "sprite": backName
                                },
                                {
                                    "name": "button",
                                    "action": "settings_scene_back"
                                }
                            ]
                    },
                    {
                        "name": "findObject",
                        "components": [
                            {
                                "name": "rectTransform",
                                "sizeDelta": {
                                    "x": game.get('rect').width,
                                    "y": game.get('rect').height
                                },
                                "anchoredPosition": {
                                    "x": game.get('rect').left,
                                    "y": game.get('rect').top * -1
                                },
                                "anchorMin": {
                                    "x": 0,
                                    "y": 1
                                },
                                "anchorMax": {
                                    "x": 0,
                                    "y": 1
                                },
                                "pivot": {
                                    "x": 0,
                                    "y": 1
                                }
                            },
                            {
                                "name": "image",
                                "sprite": mainImageName
                            },
                            {
                                "name": "button",
                                "action": "find_scene_item"
                            }
                        ]
                    }
                ]

                const dataJson = [{
                    "dialogTp": "0",
                    "title": game.get('name'),
                    "desc": game.get('description'),
                    "buttonText": game.get('startBtnText'),
                    "fontName": cartoon.get('matertialFontFamily'),
                    "gameTime": game.get('maxSeconds'),
                    "dialogBorderImage": "common_dialog_border",
                    "buttonImage": buttonName,
                    "closeImage": "icon_close",
                }, {
                    "dialogTp": "1",
                    "title": game.get('failureText'),
                    "desc": "",
                    "buttonText": game.get('failureBtnText'),
                    "fontName": cartoon.get('matertialFontFamily'),
                    "gameTime": game.get('maxSeconds'),
                    "dialogBorderImage": "common_dialog_border",
                    "buttonImage": buttonName,
                    "closeImage": "icon_close",
                }, {
                    "dialogTp": "2",
                    "title": game.get('successText'),
                    "desc": "",
                    "buttonText": game.get('successBtnText'),
                    "fontName": cartoon.get('matertialFontFamily'),
                    "gameTime": "0",
                    "dialogBorderImage": "common_dialog_border",
                    "buttonImage": buttonName,
                    "closeImage": "icon_close",
                }];

                // data json
                const jsonPath = path.resolve(gamePath, 'data.json');
                fs.writeFileSync(jsonPath, JSON.stringify(dataJson));
                zipFile.push(jsonPath);
            } else if (game.get('type') === 'jigsaw') {
                // 拼图
                gameJson = {};

                // 背景图
                let bgName=""
                let bgPath=""
                if (game.get('bgImage')) {
                    bgName = toolService.__getAvatorName(game.get('bgImage'));
                    bgPath = path.resolve(gamePath, bgName + '.jpg');
                    await toolService.__downImg(bgPath, game.get('bgImage'));
                    zipFile.push(bgPath);
                }



                // 开始按钮
                let startBtnImageName=""
                let startBtnImagePath=""
                if (game.get('startBtnImage')) {
                    startBtnImageName = toolService.__getAvatorName(game.get('startBtnImage'));
                    startBtnImagePath = path.resolve(gamePath, startBtnImageName + '.png');

                    await toolService.__downImg(startBtnImagePath, game.get('startBtnImage'));
                    zipFile.push(startBtnImagePath);
                }



                // 完成图
                let mainImageName=""
                let mainImagePath=""
                if (game.get('mainImage')) {
                    mainImageName = toolService.__getAvatorName(game.get('mainImage'));
                    mainImagePath = path.resolve(gamePath, mainImageName + '.png');
                    await toolService.__downImg(mainImagePath, game.get('mainImage'));
                    zipFile.push(mainImagePath);
                }



                gameJson = {
                    "windowStart": {
                        "title": game.get('name'),
                        "desc": game.get('description'),
                        "buttonText": game.get('startBtnText'),
                        "fontName": cartoon.get('matertialFontFamily'),
                        "gameTime": 0.0,
                        "dialogTp": 0,
                        "dialogBorderImage": cartoon.get('matertialBorderColor'),
                        "buttonImage": buttonName,
                        "closeImage": backName
                    },
                    "windowSuccess": {
                        "title": game.get('successText'),
                        "desc": null,
                        "buttonText": game.get('successBtnText'),
                        "fontName": cartoon.get('matertialFontFamily'),
                        "gameTime": 0.0,
                        "dialogTp": 0,
                        "dialogBorderImage": cartoon.get('matertialBorderColor'),
                        "buttonImage": buttonName,
                        "closeImage": backName
                    },
                    "windowFail": {
                        "title": game.get('failureText'),
                        "desc": null,
                        "buttonText": game.get('failureBtnText'),
                        "fontName": cartoon.get('matertialFontFamily'),
                        "gameTime": 0.0,
                        "dialogTp": 0,
                        "dialogBorderImage": cartoon.get('matertialBorderColor'),
                        "buttonImage": buttonName,
                        "closeImage": backName
                    },
                    "bg": bgName,
                    "puzzleBgColor": game.get('stageBgColor'),
                    "puzzleImage": mainImageName,
                    "startBtn": startBtnImageName,
                    "timeLimit": game.get('maxSeconds')
                }
            }

            const jsonPath = path.resolve(gamePath, 'layout.json');
            fs.writeFileSync(jsonPath, JSON.stringify(gameJson));
            zipFile.push(jsonPath);

            // 压缩zip
            const zipFilePath = path.resolve(gamePath, `${game.id}.sz`);
            await toolService.__zip(zipFilePath, zipFile);

            // 上传cos
            if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'pro') {
                const zipReader = fs.createReadStream(zipFilePath);
                const cosPath = `${packageName}.resource.game.${game.id}.sz`;
                const url = await cosService.upload(cosPath, cosPath, `application/sz`, zipReader);
                console.log(url);
            }

            // 未打包的修改为已打包
            if (!game.get('isPackage')) {
                await gameMongoModel.updateOne({
                    _id: game.id
                }, {
                    isPackage: true
                });
            }
        }
    }



    /**
     * 导出工厂-漫画中所有语音来电
     * @param {*} smsIds 
     * @param {*} chatIds 短信中的对话 
     * @param {*} packageName 
     * @param {*} extName 
     */
    async __resourceVoice(_basePath, smsIds, chatIds, packageName, extName) {
        const smses = await smsMongoModel.find({
            _id: {
                $in: smsIds
            }
        });

        if (smses.length == 0) {
            return;
        }

        // 创建目录
        const basePath = path.resolve(_basePath);
        await toolService.__rmdir(basePath, true);
        fs.mkdirSync(basePath);

        // 下载背景图
        let themeBgName = '';
        const cartoon = await publicCartoonMongoModel.findOne({ cartoonId: smses[0].get('cartoonId') });
        if (cartoon.get('voiceListBgImage')) {
            themeBgName = toolService.__getAvatorName(cartoon.get('voiceListBgImage'));
            const themeBgPath = path.resolve(basePath, `${themeBgName}.jpg`);

            await toolService.__downImg(themeBgPath, cartoon.get('voiceListBgImage'));


        }

        // 下载呼入图标
        let themeIconName;
        if (cartoon.get('voiceListIncomingIcon')) {
            themeIconName = toolService.__getAvatorName(cartoon.get('voiceListIncomingIcon'));
            const themeIconPath = path.resolve(basePath, `${themeIconName}.jpg`);
            await toolService.__downImg(themeIconPath, cartoon.get('voiceListIncomingIcon'));
        }


        // theme json
        const themeJsonPath = path.resolve(basePath, `theme.json`);
        fs.writeFileSync(themeJsonPath, JSON.stringify({
            Bg: themeBgName,
            GuideColor: cartoon.get('voiceListNavBgColor'),
            IncomingIcon: themeIconName
        }));

        // page json
        // 通用页面背景图
        let pageBgName;
        if (cartoon.get('voiceModalBgImage')) {
            pageBgName = toolService.__getAvatorName(cartoon.get('voiceModalBgImage'));
            const pageBgPath = path.resolve(basePath, `${pageBgName}.jpg`);
            await toolService.__downImg(pageBgPath, cartoon.get('voiceModalBgImage'));
        }

        // 接听图标
        let pageAnswerName;
        if (cartoon.get('voiceModalAnswerBtnImage')) {
            pageAnswerName = toolService.__getAvatorName(cartoon.get('voiceModalAnswerBtnImage'));
            const pageAnswerPath = path.resolve(basePath, `${pageAnswerName}.png`);
            await toolService.__downImg(pageAnswerPath, cartoon.get('voiceModalAnswerBtnImage'));
        }

        // 挂断图标
        let pageCloseName;
        if (cartoon.get('voiceModalCloseBtnImage')) {
            pageCloseName = toolService.__getAvatorName(cartoon.get('voiceModalCloseBtnImage'));
            const pageClosePath = path.resolve(basePath, `${pageCloseName}.png`);
            await toolService.__downImg(pageClosePath, cartoon.get('voiceModalCloseBtnImage'));
        }

        // 主角头像
        const protagonist = await characterMongoModel.findOne({
            cartoonId: cartoon.get("cartoonId"),
            isProtagonist: true
        });
        const protagonistName = toolService.__getAvatorName(protagonist.get('avator'));
        await smsService.formatImg([`${protagonistName}.png`], protagonistName, basePath);


        const pageJsonPath = path.resolve(basePath, `page.json`);
        fs.writeFileSync(pageJsonPath, JSON.stringify({
            bg: pageBgName,
            protagonistIcon: protagonistName,
            answerIcon: pageAnswerName,
            hangUpIcon: pageCloseName,
            hangUpDialog: {
                title: cartoon.get('voiceCloseTitle'),
                desc: cartoon.get('voiceCloseDescription'),
                buttonText: cartoon.get('voiceCloseBtnText')
            }
        }));

        // 对话json
        let infos = [];
        for (let sms of smses) {
            const defCharacter = await characterMongoModel.findById(sms.get('characters')[0]);

            // 下载头像
            const avatorName = toolService.__getAvatorName(defCharacter.get('avator'));
            await smsService.formatImg([`${avatorName}.png`], avatorName, basePath);

            let info = {
                NpcId: defCharacter.id,
                HeadIcon: avatorName,
                NpcName: defCharacter.get('realName'),
                TopicList: []
            };
            const chats = await publicChatMongoModel.find({
                smsId: sms.id
            });

            for (let chat of chats) {
                let chatId = chat.get("chatId")
                if (chatIds && chatIds.length > 0) {
                    // 章节中的语音，单独发布

                    if (chatIds.indexOf(chatId) !== -1) {
                        // 临时文件夹
                        const tmpPath = path.resolve(basePath, `${chatId}`);
                        fs.mkdirSync(tmpPath);

                        let chatJson = await commonChatService.jsonByChat(chatId, false, 'voice', tmpPath);
                        let tmpJson = { ...info };
                        tmpJson.TopicList = [chatJson];

                        // theme json
                        const tmpThemeJsonPath = path.resolve(tmpPath, `theme.json`);
                        fs.writeFileSync(tmpThemeJsonPath, JSON.stringify({
                            Bg: themeBgName,
                            GuideColor: cartoon.get('voiceListNavBgColor'),
                            IncomingIcon: themeIconName
                        }));

                        // page json
                        const tmpPageJsonPath = path.resolve(tmpPath, `page.json`);
                        fs.writeFileSync(tmpPageJsonPath, JSON.stringify({
                            bg: pageBgName,
                            protagonistIcon: protagonistName,
                            answerIcon: pageAnswerName,
                            hangUpIcon: pageCloseName,
                            hangUpDialog: {
                                title: cartoon.get('voiceCloseTitle'),
                                desc: cartoon.get('voiceCloseDescription'),
                                buttonText: cartoon.get('voiceCloseBtnText')
                            }
                        }));

                        // json
                        const jsonPath = path.resolve(tmpPath, `data.json`);
                        fs.writeFileSync(jsonPath, JSON.stringify({
                            Infos: [tmpJson]
                        }));

                        // 压缩zip
                        const zipFilePath = path.resolve(tmpPath, `resource.zip`);
                        await toolService.__zip(zipFilePath, null, tmpPath);

                        // 上传cos
                        if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'pro') {
                            const zipReader = fs.createReadStream(zipFilePath);
                            const cosPath = `${packageName}.resource.voice.${chatId}.${extName ? extName : 'sz'}`;
                            const zipUrl = await cosService.upload(cosPath, cosPath, 'application/sz', zipReader);
                            console.log('chat url: ' + zipUrl);

                            // 删除目录
                            await toolService.__rmdir(tmpPath, true);
                        }
                    }
                } else {
                    let chatJson = await commonChatService.jsonByChat(chatId, false, 'voice', basePath);

                    info.TopicList.push(chatJson);
                }
                //下载音频
                const itemss = await publicItemMongoModel.find({
                    chatId: chatId
                });
                for (let voice of itemss) {
                    if (voice.get("voice")) {
                        const voiceName = toolService.__getAvatorName(voice.get("voice"));
                        const voicePath = path.resolve(basePath, `${voiceName}.ogg`);
                        console.log(voiceName, voicePath)
                        await toolService.__downImg(voicePath, voice.get('voice'));
                    }
                }
            }
            // 如果NpcName在选项中存在，直接合并TopicList
            let state = infos.find((item) => {
                if (item.NpcName === info.NpcName) {
                    item.TopicList.push(...info.TopicList)
                    return true
                } else {
                    return false
                }
            })
            if (!state) {
                infos.push(info);
            }
        }
        // 非章节中的语音整体发布
        if (!chatIds || chatIds.length === 0) {
            // json
            const jsonPath = path.resolve(basePath, `data.json`);
            fs.writeFileSync(jsonPath, JSON.stringify({
                Infos: infos
            }));

            // 压缩zip
            const zipFilePath = path.resolve(basePath, `resource.zip`);
            await toolService.__zip(zipFilePath, null, basePath);

            // 上传cos
            if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'pro') {
                const zipReader = fs.createReadStream(zipFilePath);
                const cosPath = `${packageName}.resource.voice.${cartoon.get("cartoonId")}.${extName ? extName : 'sz'}`;
                const zipUrl = await cosService.upload(cosPath, cosPath, 'application/sz', zipReader);
                console.log('chat url: ' + zipUrl);
            }
        }
    }
    /**
     * 导出聊天、场景、恋恋导出语音包
     * @param {*} chatId    对话id
     * @param {*} chatType  对话类型 chat聊天、scene场景、voiceSingle恋恋导出语音包
     */
    async __resourceChat(_basePath, chatId, chatType, packageName, extName) {
        const chat = await publicChatMongoModel.findOne({ chatId });

        if (chat) {
            const zipFile = [];

            // 创建目录
            const basePath = path.resolve(_basePath, chatId);
            await toolService.__rmdir(basePath, true);
            fs.mkdirSync(basePath);

            // json、角色头像
            const jsonPath = path.resolve(basePath, `data.json`);
            const json = await commonChatService.jsonByChat(chatId, false, chatType, basePath);
            fs.writeFileSync(jsonPath, JSON.stringify(json));
            zipFile.push(jsonPath);

            if (chatType === 'scene' || chatType === 'voiceSingle') {
                // 聊天框
                const sms = await smsMongoModel.findById(chat.get('smsId'));
                const cartoon = await publicCartoonMongoModel.findOne({ cartoonId: sms.get('cartoonId') });

                const border = {
                    "ProtagonistChatBorder": "",
                    "SupportingRoleChatBorder": "",
                    "NarrationChatBorder": "",
                    "ButtonText": cartoon.get('sceneChatBtnText'),
                    "NameBgColor": cartoon.get('sceneChatNameBgColor'),
                    "ProtagonistFontColor": cartoon.get('sceneChatLeadingTextColor'),
                    "SupportingRoleFontColor": cartoon.get('sceneChatSupportingTextColor'),
                    "NarrationFontColor": cartoon.get('sceneChatAsideTextColor')
                };
                // 主角对话框
                if (cartoon.get('sceneChatLeadingBtnImage')) {
                    const fileName = toolService.__getAvatorName(cartoon.get('sceneChatLeadingBtnImage'));
                    border.ProtagonistChatBorder = fileName;

                    const filePath = path.resolve(basePath, `${fileName}.png`);
                    await toolService.__downImg(filePath, cartoon.get('sceneChatLeadingBtnImage'));
                }
                // 配角对话框
                if (cartoon.get('sceneChatSupportingBtnImage')) {
                    const fileName = toolService.__getAvatorName(cartoon.get('sceneChatSupportingBtnImage'));
                    border.SupportingRoleChatBorder = fileName;

                    const filePath = path.resolve(basePath, `${fileName}.png`);
                    await toolService.__downImg(filePath, cartoon.get('sceneChatSupportingBtnImage'));
                }
                // 旁白对话框
                if (cartoon.get('sceneChatAsideBtnImage')) {
                    const fileName = toolService.__getAvatorName(cartoon.get('sceneChatAsideBtnImage'));
                    border.NarrationChatBorder = fileName;

                    const filePath = path.resolve(basePath, `${fileName}.png`);
                    await toolService.__downImg(filePath, cartoon.get('sceneChatAsideBtnImage'));
                }

                const borderJsonPath = path.resolve(basePath, `border.json`);
                fs.writeFileSync(borderJsonPath, JSON.stringify(border));

                // 立绘图
                const items = await publicItemMongoModel.find({
                    chatId: chatId
                });

                const paintIds = new Set();
                for (let item of items) {
                    if (item.get('paintId') && item.get('paintId') !== 0 && item.get('paintId') !== "0") {
                        paintIds.add(item.get('paintId'));
                    }
                }
                const paints = await paintMongoModel.find({
                    _id: {
                        $in: Array.from(paintIds)
                    }
                });

                // 下载立绘图
                for (let paint of paints) {
                    const imgName = toolService.__getAvatorName(paint.get('bodyImage'));
                    const imgPath = path.resolve(basePath, `${imgName}.png`);
                    await toolService.__downImg(imgPath, paint.get('bodyImage'));
                    zipFile.push(imgPath);
                }
                console.log(111, chat.get('backgrounds'))
                // 下载背景图
                if (chat.get('backgrounds')) {
                    for (let background of chat.get('backgrounds')) {
                        const imgName = toolService.__getAvatorName(background.url);
                        const imgPath = path.resolve(basePath, `${imgName}.png`);
                        await toolService.__downImg(imgPath, background.url);
                        zipFile.push(imgPath);
                    }
                }
                //下载音频
                const itemss = await publicItemMongoModel.find({
                    chatId: chatId
                });
                for (let voice of itemss) {
                    if (voice.get("voice")) {
                        const voiceName = toolService.__getAvatorName(voice.get("voice"));
                        const voicePath = path.resolve(basePath, `${voiceName}.ogg`);
                        console.log(voiceName, voicePath)
                        await toolService.__downImg(voicePath, voice.get('voice'));
                        zipFile.push(voicePath);
                    }
                }
            }

            // 压缩zip
            const zipFilePath = path.resolve(basePath, `resource.zip`);
            await toolService.__zip(zipFilePath, null, basePath);

            // 上传cos
            if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'pro') {
                const zipReader = fs.createReadStream(zipFilePath);
                const cosPath = `${packageName}.resource.${chatType}.${chatId}.${extName ? extName : 'sz'}`;
                const zipUrl = await cosService.upload(cosPath, cosPath, 'application/sz', zipReader);
                console.log('chat url: ' + zipUrl);

                // 删除目录
                await toolService.__rmdir(basePath, true);

                return zipUrl;
            }
        }
    }
}

module.exports = new service();