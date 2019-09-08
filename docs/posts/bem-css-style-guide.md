---
title: CSS BEM 编程规范
date: 2018-06-05 15:39
permalink: bem-css-style-guide
category: 设计
tags: [规范,CSS]
---

# CSS 编程规范
## 一、 BEM含义

**B** - Block， `模块`，有独立含义的实体 

Standalone entity that is meaningful on its own.

例如： `header`, `container`, `menu`, `checkbox`, `input`

**E** - Element，`元素`，`模块` 的一部分，没有独立的含义，并且在语义上与其 Block 相关联。

A part of a block that has no standalone meaning and is semantically tied to its block.

例如：`menu item`, `list item`, `checkbox caption`, `header title`

**M** - Modifier, `变形\特殊化`，块或元素上的标志，用它们来改变外观或行为

A flag on a block or element. Use them to change appearance or behavior.

例如：`disabled`, `highlighted`, `checked`, `fixed`, `size big`, `color yellow`



如果感觉不好理解，可以参考阅读[BEM 的定义](https://www.w3cplus.com/css/bem-definitions.html)。

下图中，绿色代表 `Block`, 蓝色的代表 `Element`, 红色的代表 `Modifier`。

 ![img](http://getbem.com/assets/github_captions.jpg)



## 二、BEM 书写规范

- 以中划线连接单词，不论是 Block 还是 Element，如  `.logo` `.img-slider`

- 使用一个下划线表示 Block 和 ELement 的联系， 如 `.logo_img`  `.img-slider_item`

- 使用两个下划线表示特殊化，如`.logo_img__white`表示在 `.logo_img` 的基础上特殊化

- 状态类直接使用单词，参考上面的关键词，如 `.active ` 、 `.checked`

- 模块采用关键词命名，如`.slide, .modal, .tips, .tabs`，特殊化采用上面两个下划线表示，

  如`.img-slide__full, .modal__pay, .tips__up, .tabs__simple`

- js操作的类统一加上`js-`前缀

- 不要超过四个class组合使用，如`.a.b.c.d`

## 三、常见class关键词

- 布局类：header, footer, container, main, content, aside, page, section
- 包裹类：wrap, inner
- 区块类：region, block, box
- 结构类：hd, bd, ft, top, bottom, left, right, middle, col, row, grid, span
- 列表类：list, item, field
- 主次类：primary, secondary, sub, minor
- 大小类：s, m, l, xl, large, small
- 状态类：active, current, checked, hover, fail, success, warn, error, on, off
- 导航类：nav, prev, next, breadcrumb, forward, back, indicator, paging, first, last
- 交互类：tips, alert, modal, pop, panel, tabs, accordion, slide, scroll, overlay,
- 星级类：rate, star
- 分割类：group, seperate, divider
- 等分类：full, half, third, quarter
- 表格类：table, tr, td, cell, row
- 图片类：img, thumbnail, original, album, gallery
- 语言类：cn, en
- 论坛类：forum, bbs, topic, post
- 方向类：up, down, left, right
- 其他语义类：btn, close, ok, cancel, switch; link, title, info, intro, more, icon; form, label, search, contact, phone, date, email, user; view, loading...

## 四、参考文档

1. BEM介绍 [BEM introduction](http://getbem.com/introduction/)
2. [BEM 的定义](https://www.w3cplus.com/css/bem-definitions.html)
3. [如何命名 CSS](http://imweb.io/topic/5623c25734764b2c16769749)