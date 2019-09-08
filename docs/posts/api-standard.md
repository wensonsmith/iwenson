---
title: 接口开发规范
permalink: api-standard
date: 2018-06-05 14:28
category: 设计
tags: [规范, RESTful, API]
---

#  接口开发规范

## 一、HTTP状态码

HTTP 定义了一系列可以用在接口返回的[有含义的状态码](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes)。下面是常用状态码解释

- `200` `OK` - 表示 GET\PUT\PATCH\DELETE 操作成功的状态，也可以用于不新建资源的 POST 请求成功状态
- `201` `Created` - 表示POST 新建数据成功的状态
- `204` `No Content`- 用于DELETE 将资源成功删除后
- `301`  `Moved Permanently` 资源的URI被转移，需要使用新的URI访问
- `304` `Not Modified` - 有一些类似于204状态，服务器端的资源与客户端最近访问的资源版本一致，并无修改，不返回资源消息体。可以用来降低服务端的压力
- `400` `Bad Request` - 用于客户端一般性错误返回, 在其它4xx错误以外的错误，也可以使用400，具体错误信息可以放在body中
- `401` `Unauthorized` - 未认证，用户没有进行登录
- `403` `Forbidden` - 已经认证，但是没有权限进行操作
- `404` `Not Found` - 所访问内容不存在
- `405` `Method Not Allowd` - HTTP的方法不支持，例如某些只读资源，可能不支持POST/DELETE。但405的响应header中必须声明该URI所支持的方法
- `429` `Too Many Requests` - 请求太频繁被限制
- `500` `500 Internal Server Error`  - 服务器内部错误



## 二、HTTP 请求方法

- **GET** 方法用来获取资源
- **PUT** 方法可用来新增/更新Store类型的资源
- **PUT **方法可用来更新一个资源
- **POST **方法可用来创建一个资源
- **POST **方法可用来触发执行一个Controller类型资源
- **DELETE **方法用于删除资源



##  二、 路径规范

### 1. 关于分隔符 `/` 的使用

```
"/"分隔符一般用来对资源层级的划分，例如 http://api.canvas.restapi.org/shapes/polygons/quadrilaterals/squares

对于REST API来说，"/"只是一个分隔符，并无其他含义。为了避免混淆，"/"不应该出现在URL的末尾。例如以下两个地址实际表示的都是同一个资源：
http://api.canvas.restapi.org/shapes/
http://api.canvas.restapi.org/shapes

REST API对URI资源的定义具有唯一性，一个资源对应一个唯一的地址。为了使接口保持清晰干净，如果访问到末尾包含 "/" 的地址，服务端应该301到没有 "/"的地址上。当然这个规则也仅限于REST API接口的访问，对于传统的WEB页面服务来说，并不一定适用这个规则。
```

### 2. 路径中使用连字符 `-` 待提下划线 `_`

```
连字符"-"一般用来分割URI中出现的字符串(单词)，来提高URI的可读性，例如：  
http://api.example.restapi.org/blogs/mark-masse/entries/this-is-my-first-post  

使用下划线"_"来分割字符串(单词)可能会和链接的样式冲突重叠，而影响阅读性。但实际上，"-"和"_"对URL中字符串的分割语意上还是有些差异的："-"分割的字符串(单词)一般各自都具有独立的含义，可参见上面的例子。而"_"一般用于对一个整体含义的字符串做了层级的分割，方便阅读，例如你想在URL中体现一个ip地址的信息：210_110_25_88 .

对于参数名称，使用下划线进行连接，比如 app_id
```

### 3. 路径中统一使用小写字母

```
根据RFC3986定义，URI是对大小写敏感的，所以为了避免歧义，我们尽量用小写字符。但主机名(Host)和scheme（协议名称:http/ftp/...）对大小写是不敏感的。
```

 

 ## 三、 资源的类型

### 1. 文档（Document）

```markdown
文档是资源的单一表现形式，可以理解为一个对象，或者数据库中的一条记录。在请求文档时，要么返回文档对应的数据，要么会返回一个指向另外一个资源(文档)的链接。以下是几个基于文档定义的URI例子：
http://api.soccer.restapi.org/leagues/seattle 
http://api.soccer.restapi.org/leagues/seattle/teams/trebuchet 
http://api.soccer.restapi.org/leagues/seattle/teams/trebuchet/players/mike
```

 ### 2. 集合（Collection）

```
集合可以理解为是资源的一个容器(目录)，我们可以向里面添加资源(文档)。例如：
http://api.soccer.restapi.org/leagues 
http://api.soccer.restapi.org/leagues/seattle/teams
http://api.soccer.restapi.org/leagues/seattle/teams/trebuchet/players
```

### 3. 仓库（Store）

```
仓库是客户端来管理的一个资源库，客户端可以向仓库中新增资源或者删除资源。客户端也可以批量获取到某个仓库下的所有资源。仓库中的资源对外的访问不会提供单独URI的，客户端在创建资源时候的URI除外。例如：
PUT /users/1234/favorites/alonso
上面的例子我们可以理解为，我们向一个id是1234的用户的仓库(收藏夹)中，添加了一个名为alonso的资源。通俗点儿说：就是用户收藏了一个自己喜爱的球员阿隆索。
```

### 4. 控制器（Controller）

```
控制器资源模型，可以执行一个方法，支持参数输入，结果返回。 是为了除了标准操作:增删改查(CRUD)以外的一些逻辑操作。控制器(方法)一般定义子URI中末尾，并且不会有子资源(控制器)。例如我们向用户重发ID为245743的消息：
POST /alerts/245743/resend
```

 

## 四、 命名规范

- 文档(Document)类型的资源用**名词(短语)单数**命名
- 集合(Collection)类型的资源用**名词(短语)复数**命名
- 仓库(Store)类型的资源用**名词(短语)复数**命名
- 控制器(Controller)类型的资源用**动词(短语)**命名
- URI中有些字段可以是变量，在实际使用中可以按需替换