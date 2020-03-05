/*
 * @Author: your name
 * @Date: 2019-12-27 11:08:28
 * @LastEditTime : 2020-01-10 14:14:21
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /liebao/internal-animefactory-server/app/service/verify.js
 */


module.exports = {
    page: {
        default: {
            icon: '请上传漫画icon',
            name: '请填写漫画名称',
            tags: '请选择标签',
            description: '请填写漫画简介',
            startPageImage: '请上传启动页图片',
        },
        homePage: {
            homePageTemplate: '请选择模板',
            homePageBgImage: '请上传背景',
            homePageSettingBtnImages: '请上传设置按键',
            homePageStartBtnImage: '请上传开始按钮',
        },
        settingPage: {
            settingPageBgImage: '请上传设置页背景',
            settingPageIconColor: '请选择设置页icon及开关颜色',
            settingPageQQGroup: '请填写加群反馈',
            settingPageBgMusic: '请上传背景音乐',
        },
        matertial: {
            matertialFontFamily: '请选择字体',
            matertialFontColor: '请选择字体颜色',
            matertialBackBtnImage: '请上传返回按键',
            matertialCTABtnImage: '请上传CTA按钮',
            matertialCTABtnColor: '请选择CTA按钮字体颜色',
            matertialBorderColor: '请选择弹窗边框及关闭按钮颜色',
        },
        chapterPage: {
            chapterBgImage: '请上传故事章节背景',
            chapterBtnImages: '请上传故事章节按键',
            // chapterLockImage: '章节锁', // 非必填
        },
        chatPage:{
            key:"openChat",
            openChat:false,
            homePageMessageBtnImages: '请上传讯息按键', // 如果开启聊天
            listBgImage: '请上传聊天背景', // 如果开启聊天
            listNavBgColor: '请选择聊天导航栏颜色', // 如果开启聊天
            contentOptionBgImage: '请上传聊天内容对话包按键', // 如果开启聊天
            contentOptionTextColor: '请选择聊天内容对话包按键字体颜色', // 如果开启聊天
            contentSendBtnImage: '请上传聊天内容发送按键', // 如果开启聊天
            contentMessageBgColors: '请选择聊天内容对话颜色', // 如果开启聊天
        },
        voicePage:{
            key:"openVoiceChat",
            openVoiceChat:false,
            homePageVoiceBtnImages: '请上传来电按键', // 如果开启来电
            voiceListBgImage: '请上传来电列表背景', // 如果开启来电
            voiceListNavBgColor: '请选择来电列表导航栏颜色', // 如果开启来电
            voiceListIncomingIcon: '请上传来电列表呼入icon', // 如果开启来电
            voiceModalBgImage: '请上传通话页面背景', // 如果开启来电
            voiceModalCloseBtnImage: '请上传通话页面结束按键', // 如果开启来电
            voiceModalAnswerBtnImage: '请上传通话页面接听按键', // 如果开启来电
            voiceCloseTitle: '请输来电入挂断弹窗标题', // 如果开启来电
            voiceCloseDescription: '请输入来电挂断弹窗文案', // 如果开启来电
            voiceCloseBtnText: '请输入来电挂断弹窗按钮文字', // 如果开启来电
        },
        sceneChatPage:{
            sceneChatSupportingBtnImage: '请上传场景对话配角对话框',
            sceneChatLeadingBtnImage: '请上传场景对话主角对话框',
            sceneChatAsideBtnImage: '请上传场景对话旁白对话框',
            sceneChatSupportingTextColor: '请选择场景对话配角字体颜色',
            sceneChatLeadingTextColor: '请选择场景对话主角字体颜色',
            sceneChatAsideTextColor: '请选择场景对话旁白字体颜色',
            sceneChatNameBgColor: '请选择场景对话姓名底色',
            sceneChatBtnText: '请填写场景对话按钮文案',
        },
        dressUpPage:{
            key:"openDressup",//开关
            openDressup:false,
            dressUpBgImage: '请上传换装打扮背景',
            homePageDressupBtnImages: '请上传装扮按键', // 如果开启装扮
            dressUpActiveColor: '请选择换装打扮导航栏颜色', // 如果开启装扮
            dressUpHairImage: '请上传换装打扮发型icon', // 如果开启装扮
            dressUpTopsImage: '请上传换装打扮上装icon', // 如果开启装扮
            dressUpBottomsImage: '请上传换装打扮下装icon', // 如果开启装扮
            dressUpSuitsImage: '请上传换装打扮套装icon', // 如果开启装扮
            dressUpShoesImage: '请上传换装打扮鞋子icon', // 如果开启装扮
            dressUpAccessoryImage: '请上传换装打扮配饰icon' // 如果开启装扮
        }
    }

}