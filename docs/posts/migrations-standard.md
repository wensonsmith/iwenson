---
title: 数据库及迁移规范
permalink: migrations-standards
date: 2015-11-12 18:52:32
category: 设计
tags: [MySQL,规范]
---

## 一、Migrations 起名规则

即 `动作_表名`, 动作包括 `create`, `add`, `delete` ,`alter`。 这样起名的好处是，比较好查找一个表的改动。

如果改变了多个字段， 仅需要写其中一个字段的名称即可。

```
[action]_[table_name]
```

示例：

1. 增加一个`example_table` 表，因为他没有影响字段，则命名为：

    ```sh
    create_example_table
    ```

2. 在`example`表中添加一个字段 `user_name`,  或者删除 `example_table` 表命名为：

    ```sh
    alter_example_table
    ```

3. 删除 `example_table` , 命名为：

    ```sh
    delete_example_table
    ```

## 二、Migrations 书写规范

1. 如果是 `create` 生成表的 `migration` , 需要在头部添加注释， 解释该表的作用

    ```php

    <?php

    /*
     * 该表主要是用来示范注释， 说明这个表的作用
     * author: 小黑
     * time: 2015-11-11 18:09
    */
    class m151002_121202_example_table_create extends Migration
    {
        ·····
    }

    ```

2. 在一些需要有默认值的字段，请务必加上 `Default`。


- 所有字段的定义都需要加上注释
- 字符型的默认值为一个空字符值串 ' ' ；  
- 数值型的默认值为数值0；逻辑型的默认值为数值0

    ```php
    public function up()
    {
        //用户是否是新用户字段
    	$this->addColumn("wx_user", 'is_new', 'integer(1) NOT NULL DEFAULT 0 COMMENT "是否是新用户"');
    }
    ```
