### 目录
- [用户](#1-用户)
- &emsp;[手机号创建账号](#11-手机号创建账号)
- &emsp;[手机号登录](#12-手机号登录)
- &emsp;[用户详情](#13-用户详情)
- &emsp;[用户信息修改](#14-用户信息修改)
- &emsp;[发送手机验证码](#15-发送手机验证码)
- &emsp;[修改密码](#16-修改密码)
- &emsp;[忘记密码](#17-忘记密码)
- [账户](#2-账户)
- &emsp;[查询账户流水](#21-查询账户流水)
- &emsp;[查询活动流水](#22-查询活动流水)
- &emsp;[充值](#23-充值)
- &emsp;[充值校验](#24-充值校验)
- [公众号](#3-公众号)
- &emsp;[获取关联公众号连接](#31-获取关联公众号连接)
- &emsp;[查询关联公众号详情](#32-查询关联公众号详情)
- &emsp;[查询关联公众号列表](#33-查询关联公众号列表)
- &emsp;[同步公众号用户标签](#34-同步公众号用户标签)
- [活动](#4-活动)
- &emsp;[创建活动](#41-创建活动)
- &emsp;[修改活动](#42-修改活动)
- &emsp;[查询活动列表](#43-查询活动列表)
- &emsp;[查询活动详情](#44-查询活动详情)
- &emsp;[查询活动趋势](#45-查询活动趋势)
- &emsp;[活动退款](#46-活动退款)
- &emsp;[下载中奖报告](#47-下载中奖报告)
- &emsp;[下载活动报告](#48-下载活动报告)
- [记录](#5-记录)
- &emsp;[pv记录查询](#51-pv记录查询)
- [平台](#6-平台)
- &emsp;[平台配置](#61-平台配置)
- &emsp;[上传banner](#62-上传banner)

### API
base url
```
/api/v1
```
### 1. 用户
#### 1.1 手机号创建账号
***POST /regedit***

request:

参数 | 类型 | 必传 | 备注
---|---|---|---
phone | string | Y| 11位手机号码
pwd | string | Y| 密码
code | string | Y| 验证码
parent_id | string | N| 父账号id
```
{
	"phone": "18613818804",
	"pwd": "111111",
    "code:: "d4uj"
	"parent_id": "c79599f04abf11e9a5b91b382bda3e8e"
}
```
response:

参数 | 类型 | 备注
---|---|---
id | string | 用户id
```
{
    "code": 200,
    "data": "5e4164604f0711e9a63fe5cf8eda19d2"
}

```

#### 1.2 手机号登录
***POST /login***

request:

参数 | 类型 | 必传 | 备注
---|---|---|---
phone | string | Y| 11位手机号码
pwd | string | Y| 密码
```
{
	"phone":"18613818804",
	"pwd":"111111"
}
```
response:

参数 | 类型 | 备注
---|---|---
token | string | token
```
{
    "code": 200,
    "data":"ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SjFjMlZ5WDJsa0lqb2lOV1UwTVRZME5qQTBaakEzTVRGbE9XRTJNMlpsTldObU9HVmtZVEU1WkRJaUxDSndjbTlxWldOMFgybGtJam9pWkdaaVpHUmxaakF4TjJSaU1URmxPVGcxT0RnNE5Ua3lZV1kzWkRsaE5tUWlMQ0pwWVhRaU9qRTFOVE0xTWpNeU5ETXNJbVY0Y0NJNk1UVTFNelV6TURRME0zMC5pMUFJMmJzMXo5RTl6eFlGSHZKd0p6enplRUdybGgwZkZDdzBDdUV1S3pJ"
}
```

#### 1.3 用户详情
***GET /user/{id}***

header:
```
authorization: token
```
response:

参数 | 类型 | 备注
---|---|---
nickname | string | 昵称
weixin | string | 微信id
phone | string | 手机号码
is_phone_verified | string | 是否验证 1已验证
mail | string | 邮箱
balance | number | 余额
freePv | int | 剩余免费pv额度
pvMoney | number | 累计pv消费
```
{
    "code": 200,
    "data": {
        "nickname": null,
        "weixin": null,
        "phone": "18613818805",
        "is_phone_verified": 1,
        "mail": null,
        "balance": 100.99,
        "freePv": 1000
    }
}
```

#### 1.4 用户信息修改
***PUT /user***

header:
```
authorization: token
```
request:

参数 | 类型 | 必传 | 备注
---|---|---|---
phone | string | N| 11位手机号码
```
{
	"phone":"18613818804"
}
```
response:
```
{
    "code": 200,
    "data": "success"
}
```

#### 1.5 发送手机验证码
***GET /code***

request:

参数 | 类型 | 必传 | 备注
---|---|---|---
phone | string | Y| 11位手机号码
type | string | Y| 类型 regedit注册 retrieve找回密码


response:

参数 | 类型 | 备注
---|---|---
code | string | 验证码
```
{
    "code": 200,
    "data": "4444"
}
```

#### 1.6 修改密码
***POST /user/repwd***

request:

参数 | 类型 | 必传 | 备注
---|---|---|---
phone | string | Y| 11位手机号码
oldPwd | string | Y| 原密码
newPwd | string | Y| 新密码
```
{
	"phone":"18613818804",
	"oldPwd":"222222",
	"newPwd":"111111"
}
```

response:
```
{
    "code": 200,
    "data": "success"
}
```

#### 1.7 忘记密码
***POST /user/retrieve***

request:

参数 | 类型 | 必传 | 备注
---|---|---|---
phone | string | Y| 11位手机号码
code | string | Y| 验证码
pwd | string | Y| 新密码
```
{
	"phone":"18613818804",
	"code":"8917",
	"pwd":"222222"
}
```

response:
```
{
    "code": 200,
    "data": "success"
}
```

### 2 账户
#### 2.1 查询账户流水
***GET /account/serial***

header:
```
authorization: token
```
request:

参数 | 类型 | 必传 | 备注
---|---|---|---
sn | string | N| 订单编号
op | string | N| 操作 01充值 02红包活动回退 03活动消费 04活动初始充值 05活动续费；可传多个：01,02
opId | string | N | 操作id
status | int | N | 状态 0失败 1成功 2等待付款
begin_time | string | N| 开始时间
end_time | string | N| 结束时间
pageSize | int | N| 每页条数，不传查列表，传查分页
pageNum | int | N| 页数，不传查列表，传查分页

response:

参数 | 类型 | 备注
---|---|---
sn | string | 订单号
op | string | 操作
opId | string | 相关操作id
status | string | 状态 0未支付 1成功 2失败
pushName | string | 活动名称 op非01返回
wechatmpName | string | 公众号名称 op非01返回
```
不传pageSize、pageNum
{
    "code": 200,
    "data": [
        {
            "id": 4,
            "userId": "5e4164604f0711e9a63fe5cf8eda19d2",
            "sn": "201903180922227787",
            "money": "1000.0000",
            "op": "充值",
            "opId": "34342",
            "time": "2019-03-17T02:54:12.000Z",
            "status": 2
        }
    ]
}

传pageSize、pageNum
{
    "code": 200,
    "data": {
        "count": 1,
        "rows": [
            {
                "id": 41,
                "userId": "9c96d040512511e9a88be7cd0a7a88ae",
                "sn": "201940421010450200002874",
                "money": 100,
                "op": "02",
                "opId": "10",
                "nonceStr": null,
                "time": "2019-04-03T12:09:44.000Z",
                "status": 1,
                "failCause": null
            }
        ]
    }
}
```

#### 2.2 查询活动流水
***GET /account/serial/push***

header:
```
authorization: token
```
request:

参数 | 类型 | 必传 | 备注
---|---|---|---
pushId | int | N| 活动id
wechatmpId | int | N| 公众号id
pageSize | int | N| 每页条数，不传查列表，传查分页
pageNum | int | N| 页数，不传查列表，传查分页

response:

参数 | 类型 | 备注
---|---|---
wechatmpName | string | 公众号名称
pushName | string | 活动名称
time | int | 访问次数
pv_money | decimal | 消耗金额
time | date | 统计的时间段，格式：年-月-日 小时

```
不传pageSize、pageNum
{
    "code": 200,
    "data": [
        {
            "times": 2,
            "pvMoney": "0.0100",
            "time": "2019-03-27 15",
            "pushName": "9",
            "wechatmpName": "测试公众号2"
        },
        {
            "times": 1,
            "pvMoney": "0.0100",
            "time": "2019-03-27 14",
            "pushName": "9",
            "wechatmpName": "测试公众号2"
        }
    ]
}

传pageSize、pageNum
{
    "code": 200,
    "data": {
        "count": 20,
        "rows": [
            {
                "times": 1,
                "pvMoney": "100",
                "time": "2019-04-28 15",
                "pushName": "测试活动",
                "wechatmpName": "测试公众号2"
            }
        ]
    }
}
```

#### 2.3 充值
***GET /account/recharge***

header:
```
authorization: token
```
request:

参数 | 类型 | 必传 | 备注
---|---|---|---
mony | number | Y| 充值金额
op | number | N| 充值类型 01平台充值 04活动充值 05活动续费
pushId | number | N| 活动id，op为04、05时必传

response:

参数 | 类型 | 备注
---|---|---
data | string | 充值url，生成二维码，使用微信扫码
```
{
    "code": 200,
    "data": "weixin://wxpay/bizpayurl?pr=bshGNL7"
}
```

#### 2.4 充值校验
***GET /account/recharge/check***

header:
```
authorization: token
```

response:

```
{
    "code": 200,
    "data": "success"
}
```

### 3. 公众号
#### 3.1 获取关联公众号连接
***GET /wechatmp/bind/url***

header:
```
authorization: token
```

response:

```
{
    "code": 200,
    "data": "https://mp.weixin.qq.com/cgi-bin/componentloginpage?component_appid=wx04708f3827abecbe&pre_auth_code=preauthcode@@@wFGEkjTZiCEAI5wOch1VxTvmThHHdOu34CDQ3ABxDNexAYQriU4iGpmCvxjyL70b&redirect_uri=http://bzz.pighand.com/api/v1/wechatmp/bind/callback"
}
```

#### 3.2 查询关联公众号详情
***GET /wechatmp***

header:
```
authorization: token
```
request:


参数 | 类型 | 备注
---|---|---
wechatmpId | int | 公众号id

response:

参数 | 类型 | 备注
---|---|---
id | string | 公众号id
name | string | 公众号名称
userName | string | 公众号用户名
principalName | string | 主题名
alias | string | 微信号
headImg | string | 头像
qrcodeUrl | string | 二维码
serviceTypeInfo | string | 公众号类型 0订阅号 1老账号升级后的订阅号 2服务号
verifyTypeInfo | number | 认证状态 认证类型 -1未认证 0微信认证 1新浪认证
pushNum | int | 活动总数
activePushNum | int | 当前活动数
pvMoney | num | pv总消耗金额
pvMoneyToday | num | 今日pv总消耗金额
freePv | num | 免费额度
billingPv | number | 未入账计费pv个数
noFreePv | number | 计费pv量
noFreePvToday | number | 今日计费pv量
fans | number | 粉丝数
newFans | number | 昨日新粉丝数
push | list | 活动信息，参考4.2 查询活动列表
```
{
    "code": 200,
    "data": {
        "id": "1",
        "name": "测试公众号1",
        "created_time": "2019-03-27T06:40:42.000Z",
        "pushNum": 3,
        "activePushNum": 3,
        "pvMoney": 5686.7743,
        "freePv": 5000,
        "push": []
    }
}
```

#### 3.3 查询关联公众号列表
***GET /wechatmps***

header:
```
authorization: token
```
response:

参数 | 类型 | 备注
---|---|---
id | string | 公众号id
name | string | 公众号名称
userName | string | 公众号用户名
principalName | string | 主题名
alias | string | 微信号
headImg | string | 头像
qrcodeUrl | string | 二维码
serviceTypeInfo | string | 公众号类型 0订阅号 1老账号升级后的订阅号 2服务号
verifyTypeInfo | number | 认证状态 认证类型 -1未认证 0微信认证 1新浪认证
pushNum | int | 活动总数
activePushNum | int | 当前活动数
pvMoney | num | pv总消耗金额
pvMoneyToday | num | 今日pv总消耗金额
freePv | num | 免费额度
billingPv | number | 未入账计费pv个数
noFreePvToday | number | 今日计费pv量
noFreePv | number | 计费pv量
fans | number | 粉丝数
newFans | number | 昨日新粉丝数
push | list | 活动信息，参考4.2 查询活动列表
```
{
    "code": 200,
    "data": [
        {
            "id": "1",
            "name": "测试公众号1",
            "created_time": "2019-03-27T06:40:42.000Z",
            "pushNum": 3,
            "activePushNum": 3,
            "pvMoney": 5686.7743,
            "freePv": 5000,
            "push": []
        }
    ]
}
```

#### 3.4 同步公众号用户标签
***GET /wechatmp/sync***

header:
```
authorization: token
```

request:

参数 | 类型 | 必传 | 备注
---|---|---|---
wechatmpId | string | Y| 微信公众号id

response:

```
{
    "code": 200,
    "data": "success"
}

```

### 4. 活动
#### 4.1 创建活动
***POST /push***

header:
```
authorization: token
```

request:

参数 | 类型 | 必传 | 备注
---|---|---|---
wechatmpId | string | Y| 微信公众号id
name | string | Y| 活动名称
type | string | Y| 活动类型
preheatingText | string | N| 预热提醒
beginTime | date | N| 开始时间
endTime | string | N| 结束时间
redNum | nubmer | N| 红包个数
redMoney | nubmer | N| 单个红包金额
redTotal | nubmer | 红包总额
receiveTimes | number | N| 每人领取次数
receiveText | string | N| 超出领取次数提示
getMax | number | N| 最多领取个数
getSuccessText | string | N| 领取成功提示
getFailText | json array | N| 领取失败提示
probability | number | N| 概率
shareType | number | N| 分享类型0禁止分享 1分享好友 2分享朋友圈 3皆可
getType | number | N| 领取类型0皆可 1指定标签 2粉丝
getTag | string | N| 标签 tag1,tag2
endText | string | N| 结束提醒
status | number | N| 状态0停止 1启用
isShareReceive | boolean | N| 分享后领取
statisticsBd | string | N| 百度统计id
banner | file | banner图片
wechatmpTag | string | 自动打标签
```
{
    "wechatmpId": "1",
    "name": "测试活动",
    "type": "red",
    "preheatingText": "正在预热",
    "beginTime": "",
    "endTime": "",
    "redNum": 10,
    "redMoney": 1.00,
    "redTotal": 10,
    "receiveTimes": "",
    "receiveText": "",
    "getMax": "",
    "getSuccessText": "",
    "getFailText": [],
    "probability": 30,
    "shareType": "",
    "getType": "",
    "getTag": "tag1,tag2",
    "endText": "",
    "status": 0,
    "isShareReceive": true
}
```
response:

参数 | 类型 | 备注
---|---|---
id | string | 用户id
```
{
    "code": 200,
    "data": "5e4164604f0711e9a63fe5cf8eda19d2"
}

```

#### 4.2 修改活动
***PUT /push***

header:
```
authorization: token
```

request:

参数 | 类型 | 必传 | 备注
---|---|---|---
id | string | Y| 活动id
name | string | N| 活动名称
type | string | N| 活动类型
preheatingText | string | N| 预热提醒
beginTime | date | N| 开始时间
endTime | string | N| 结束时间
redNum | nubmer | N| 红包个数
redMoney | nubmer | N| 单个红包金额
redTotal | nubmer | 红包总额
receiveTimes | number | N| 每人领取次数
receiveText | string | N| 超出领取次数提示
getMax | number | N| 最多领取个数
getSuccessText | string | N| 领取成功提示
getFailText | json array | N| 领取失败提示
probability | number | N| 概率
shareType | number | N| 分享类型0禁止分享 1分享好友 2分享朋友圈 3皆可
getType | number | N| 领取类型0皆可 1指定标签 2粉丝
getTag | string | N| 标签 tag1,tag2
endText | string | N| 结束提醒
status | number | N| 状态0停止 1启用
isShareReceive | boolean | N| 分享后领取
statisticsBd | string | N| 百度统计id
banner | file | banner图片
wechatmpTag | string | 自动打标签
```
{
    "id": "1",
    "name": "测试活动",
    "type": "red",
    "preheatingText": "正在预热",
    "beginTime": "",
    "endTime": "",
    "redNum": 10,
    "redMoney": 1.00,
    "receiveTimes": "",
    "receiveText": "",
    "getMax": "",
    "getSuccessText": "",
    "getFailText": [],
    "probability": 30,
    "shareType": "",
    "getType": "",
    "getTag": "tag1,tag2",
    "endText": "",
    "status": 0,
    "isShareReceive": true
}
```
response:
```
{
    "code": 200,
    "data": "success"
}

```

#### 4.3 查询活动列表
***GET /pushs***

header:
```
authorization: token
```

request:

参数 | 类型 | 必传 | 备注
---|---|---|---
wechatmpId | string | Y| 微信公众号id

response:

参数 | 类型 | 备注
---|---|---
id | string | 活动id
wechatmpId | string | 微信公众号id
userId | string | 所属用户id
name | string | 活动名称
type | string | 活动类型
preheatingText | string | 预热提醒
beginTime | date | 开始时间
endTime | string | 结束时间
redNum | nubmer | 红包个数
redMoney | nubmer | 单个红包金额
redTotal | nubmer | 红包总额
receiveTimes | number | 每人领取次数
receiveText | string | 超出领取次数提示
getMax | number | 最多领取个数
getSuccessText | string | 领取成功提示
getFailText | json array | 领取失败提示
probability | number | 概率
shareType | number | 分享类型0禁止分享 1分享好友 2分享朋友圈 3皆可
getType | number | 领取类型0皆可 1指定标签 2粉丝
getTag | string | 标签 tag1,tag2
endText | string | 结束提醒
status | number | 状态0停止 1启用
isShareReceive | boolean | 分享后领取
operatingStatus | string | 活动状态 未开始 已结束 进行中
receiveUsers | number | 参与人数
receiveSuccess | number | 被领取红包数
receiveSuccessUsers | number | 获得红包人数
pv | number | pv总数
billingPv | number | 计费pv数
receiveMoney | number | 已消费红包
billingPvMoney | number | pv消费
billingPvTodayMoney | number | 今日pv总消费
balance | number | 红包余额
residueRedNum | number | 剩余红包数
addadUsers | number | 活动期间涨粉人数
addadCost | number | 涨粉均价（平均每个粉丝花费金额）
```
{
    "code": 200,
    "data": [
        {
            "id": 3,
            "userId": "5e4164604f0711e9a63fe5cf8eda19d2",
            "wechatmpId": "1",
            "name": "测试活动",
            "type": "red",
            "preheatingText": "正在预热",
            "beginTime": "2019-03-28T08:47:29.000Z",
            "endTime": "2019-04-01T08:47:37.000Z",
            "redNum": 5000,
            "redMoney": "4.10",
            "redTotal": 20500,
            "receiveTimes": 5,
            "receiveText": "够多了，不能再领了",
            "getMax": 1,
            "getSuccessText": "恭喜发财",
            "getFailText": ["下次再试"],
            "probability": 30,
            "shareType": 1,
            "getType": 1,
            "getTag": 1,
            "endText": "活动已结束",
            "status": 1,
            "isShareReceive": true,
            "operatingStatus": "已结束",
            "receiveUsers": 3,
            "receiveSuccess": 2,
            "receiveSuccessUsers": 1,
            "pv": 3,
            "billingPv": 1,
            "receiveMoney": 0.011,
            "billingPvMoney": 0.02,
            "balance": 1
        }
    ]
}
```

#### 4.4 查询活动详情
***GET /push***

header:
```
authorization: token
```

request:

参数 | 类型 | 必传 | 备注
---|---|---|---
pushId | string | Y| 活动id

response:

参数 | 类型 | 备注
---|---|---
id | string | 活动id
wechatmpId | string | 微信公众号id
userId | string | 所属用户id
name | string | 活动名称
type | string | 活动类型
preheatingText | string | 预热提醒
beginTime | date | 开始时间
endTime | string | 结束时间
redNum | nubmer | 红包个数
redMoney | nubmer | 单个红包金额
redTotal | nubmer | 红包总额
receiveTimes | number | 每人领取次数
receiveText | string | 超出领取次数提示
getMax | number | 最多领取个数
getSuccessText | string | 领取成功提示
getFailText | json array | 领取失败提示
probability | number | 概率
shareType | number | 分享类型0禁止分享 1分享好友 2分享朋友圈 3皆可
getType | number | 领取类型0皆可 1指定标签 2粉丝
getTag | string | 标签 tag1,tag2
endText | string | 结束提醒
status | number | 状态0停止 1启用
isShareReceive | boolean | 分享后领取
operatingStatus | string | 活动状态 未开始 已结束 进行中
receiveUsers | number | 参与人数
receiveUsersToday | number | 今日参与人数
receiveSuccess | number | 被领取红包数
receiveSuccessUsers | number | 获得红包人数
receiveSuccessUsersToday | number | 今日获得红包人数
pv | number | pv总数
pvToday | number | 今日pv总数
billingPv | number | 计费pv数
billingPvToday | number | 今日计费pv数
receiveMoney | number | 已消费红包
billingPvMoney | number | pv消费
billingPvTodayMoney | number | 今日pv总消费
url | string | 活动url
balance | number | 红包余额
residueRedNum | number | 剩余红包数
banner | string | banner图片url
wechatmpTag | string | 自动打标签
addadUsers | number | 活动期间涨粉人数
addadCost | number | 涨粉均价（平均每个粉丝花费金额）
```
{
    "code": 200,
    "data": {
        "id": 3,
        "userId": "5e4164604f0711e9a63fe5cf8eda19d2",
        "wechatmpId": "1",
        "name": "测试活动",
        "type": "red",
        "preheatingText": "正在预热",
        "beginTime": "2019-03-28T08:47:29.000Z",
        "endTime": "2019-04-01T08:47:37.000Z",
        "redNum": 5000,
        "redMoney": 4.10,
        "redTotal": 20500,
        "receiveTimes": 5,
        "receiveText": "够多了，不能再领了",
        "getMax": 1,
        "getSuccessText": "恭喜发财",
        "getFailText": ["下次再试"],
        "probability": 30,
        "shareType": 1,
        "getType": 1,
        "getTag": 1,
        "endText": "活动已结束",
        "status": 1,
        "isShareReceive": true,
        "operatingStatus": "已结束",
        "receiveUsersToday": 1,
        "receiveSuccessUsersToday": 0,
        "pvToday": 0,
        "billingPvToday": 0,
        "receiveUsers": 3,
        "receiveSuccess": 2,
        "receiveSuccessUsers": 2,
        "pv": 3,
        "billingPv": 2,
        "receiveMoney": 0.011,
        "billingPvMoney": 0.02,
        "url": "http://bzz.pighand.com/wx/10",
        "balance": 1
    }
}
```

#### 4.5 查询活动趋势
***GET /push/tendency***

header:
```
authorization: token
```

request:

参数 | 类型 | 必传 | 备注
---|---|---|---
pushId | string | Y| 活动id
date | string | N| 统计日期 yyyy-mm-dd

response:

参数 | 类型 | 备注
---|---|---
participation | number | 参加数
receive | number | 领取数
pv | number | 访问量
money | number | 金额
```
{
    "code": 200,
    "data": [
        {
            "time": "2019-03-27 15",
            "participation": 0,
            "receive": 0,
            "pv": 1,
            "money": 0
        },
        {
            "time": "2019-03-27 14",
            "participation": 0,
            "receive": 0,
            "pv": 1,
            "money": 0
        }
    ]
}
```

#### 4.6 活动退款
***GET /push/refund***

header:
```
authorization: token
```

request:

参数 | 类型 | 必传 | 备注
---|---|---|---
pushId | string | Y| 活动id

response:
```
{
    "code": 200,
    "data": 'success'
}
```

#### 4.8 下载活动报告
***GET /push/download/red***

header:
```
authorization: token
```

request:

参数 | 类型 | 必传 | 备注
---|---|---|---
pushId | string | Y| 活动id

#### 4.7 下载中奖报告
***GET /push/download/report***

header:
```
authorization: token
```

request:

参数 | 类型 | 必传 | 备注
---|---|---|---
pushId | string | Y| 活动id

### 5. 记录
#### 5.1 pv记录查询
***GET /serial/pv***

header:
```
authorization: token
```

request:

参数 | 类型 | 必传 | 备注
---|---|---|---
wechatmpId | string | N| 微信公众号id，与pushId必传一个
pushId | string | N| 活动id，与wechatmpId必传一个
isFree | boolean | N| true统计免费pv，false统计收费pv
groupBy | string | N| 统计方式 d按天统计 h按小时统计，不传默认d
groupTime | string | N| 统计时间 如传10；groupBy传d，则统计最近10天；groupBy传h，则统计最近10小时；
pageSize | int | N| 每页条数，不传查列表，传查分页
pageNum | int | N| 页数，不传查列表，传查分页

response:

参数 | 类型 | 备注
---|---|---
pv | number | 时间内pv总数
money | number | 时段内pv消费
userId | string | 活动创建用户
userPhone | string | 活动创建用户手机号码

```
传pageSize、pageNum
{
    "code": 200,
    "data": {
        "count": 4,
        "rows": [
            {
                "pv": 1,
                "time": "2019-04-28",
                "money": 0.01,
                "pushId": 10,
                "pushName": "测试活动",
                "userId": "5823be105d1311e9b184610954ed4918",
                "userPhone": "13333333333"
            }
        ]
    }
}
不传pageSize、pageNum
{
    "code": 200,
    "data": [
        {
            "pv": 1,
            "time": "2019-04-28",
            "money": 0.01,
            "pushId": 10,
            "pushName": "测试活动",
            "userId": "5823be105d1311e9b184610954ed4918",
            "userPhone": "13333333333"
        }
    ]
}
```



### 6. 平台
#### 6.1 平台配置
***GET /platform/config***

response:

参数 | 类型 | 备注
---|---|---
pvMoney | number | 每个pv价格
serviceCharge | number | 手续费

```
{
    "code": 200,
    "data": {
        "pvMoney": 0.0001,
        "serviceCharge": 10
    }
}
```

### 6. 平台
#### 6.2 上传banner
***POST /upload***

request:

参数 | 类型 | 必传 | 备注
---|---|---|---
file | file | Y| 上传文件

response:

参数 | 类型 | 备注
---|---|---
data | string | url路径

```
{
    "code": 200,
    "data": "https://r.cmcm.com/includes/assets/fcf969dd4ba0c57c818e33e8110330a2.jpg"
}
```