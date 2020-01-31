---
title: Javascript 不同模块化方式的区别与联系
permalink: javascript-module
date: 2017-10-27 17:04:00
category: 学习
tags: [Javascript]
---

## 一、 先说两种加载方式 CommonJS 和 AMD

1. `CommonJS` 用于服务端，即 `nodeJs` 加载模块的方式。每个文件就是一个模块，有自己的作用域。在一个文件里面定义的变量、函数、类，都是私有的，对其他文件不可见。模块之间通过 `require` 进行加载。
2. AMD 加载方式用于浏览器环境中，因为浏览器从网络加载 JS 有延迟，无法像 nodeJs 服务器环境一样直接读文件。所以使用 `define('moduleName',['dependences'], function(){})` 这种方式定义模块。

关于两种方式的介绍，可以看阮一峰的文章： [JS 模块化：AMD 规范](http://www.ruanyifeng.com/blog/2012/10/asynchronous_module_definition.html)

## 二、基础知识

一个基础的知识是：`module.exports`、`exports` 和 `require` 这三个是 CommonJS 模块规范。

`export`、`export default` 和 `import` 属于 ES6 规范。  

在 ES6 之前，社区制定了一些模块加载方案，最主要的有 CommonJS 和 AMD 两种。前者用于服务器，后者用于浏览器。ES6 在语言标准的层面上，实现了模块功能，而且实现得相当简单，完全可以取代 CommonJS 和 AMD 规范，成为浏览器和服务器通用的模块解决方案。

具体介绍继续看阮一峰老师的 [ES6教程](http://es6.ruanyifeng.com/#docs/module)

从模块导出和导入来分：

导出模块：` module.exports` 、`exports`、`export`、`export default`

导入模块：`require`、`import`

## 三、 module.exports 和 exports 的关系

CommonJS规范规定，每个模块内部，`module`变量代表当前模块。这个变量是一个对象，它的`exports`属性（即`module.exports`）是对外的接口。加载某个模块，其实是加载该模块的`module.exports`属性。

```javascript
// file: calculate.js
let x = 5
let add = function(value) {
  return x + value
}
//使用 module.exports 输出变量
module.exports.x = x
//使用 exports 输出方法
exports.add = add

//file: index.js
let calculate = require('./calculate.js')

console.log(calculate.x)  //输出 5
console.log(calculate.add(1)) //输出 6
```

其实 `exports`变量指向 module.exports，即相当于在每个文件头部有这么一段代码

```javascript
let exports = module.exports
```

所以我们可以直接在 exports 对象上添加方法，表示对外输出接口。等同于在 module.exports 上添加方法。

需要注意的是，不能直接将exports变量指向一个值，因为这样等于切断了exports与module.exports的联系。



## 四、 export 和 export default 的关系

两者的区别主要在于 export 导出的是`一组`方法或者变量。 export default 只导出`一个`方法或变量。

举个栗子

```javascript
//calculate.js
let x = function
let y = function
let z = function

export {x, y, z}

//这时候可以使用 import 直接导入这三个方法
import {x, y, z} from './calculate'

//如果使用 export default
export default {x, y, z}
//那么 import 就只能导入一个变量
import Calculate from './calculate'
//然后再执行
Calculate.x
Calculate.y

//使用了 export {x, y, z}, 也想 import 为一个变量怎么办？
//可以这样

import * as Calculate from './calculate'

```



> 之前迷惑是没有区分开 CommonJS 和 ES6 模块加载之间的关系，原来的替换关系。