<!--
 * @Author: your name
 * @Date: 2019-12-10 16:36:52
 * @LastEditTime : 2020-01-09 18:47:45
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /liebao/internal-animefactory-server/note.md
 -->
#

## 项目结构


## 数据库

### 对话类

- chat具体的对话包
- sms对话包的父级，对话块
- items对话信息
- logics对话包内左侧的对话逻辑


### 漫画信息记录

- cartoons 

### 章节相关信息

- chapters

### 用户相关信息

- characters

### 换装相关信息

- dresses

### 游戏相关

- games

### 打包相关

- packages



**注：**
- http://animefactory.cmcm.com/api/v1/chat/export/5dd2175c23d824242275e241
- http://animefactory.cmcm.com/api/v1/chat/export/5ddd0eb16299f659cc4dc4ac



## 发布功能

### 对话列表接口增加字段
> http://animefactory.cmcm.com/api/v1/sms?cartoonId=5df35cb52670106974a16ea8

**字段**
- status:0/1  ===> 0有更新（创建或修改后未发布），1无更新
- type:0/1/2  ===> 0:未分配   1:已发布到列表  2:已发布到章节
- text:"1,0"  ===> 当type为2时，此字段存在，字符串1为章，0为节


### 增加发布接口

> /api/v1/chat/public/{id}

- id:为对话id
- 聊天，语音，场景，发布后，才会在新的版本中显示


- 






## 整理结构

### 打包apk

- 先从publicpackageDemo中复制文件夹目录
- 然后packageAppService.__copyResource实现当前漫画资源的下载与压缩
- 




### 设置页面的信息
> apk包的android/Resources/

- common: 主要页面/页面素材库
- mainsence: 主要页面/首页
- setting:主要页面/设置页
- sectionscene:故事章节
- chatscene:聊天页面

- 关于语音来电和场景对话首页信息和内容打包在一起