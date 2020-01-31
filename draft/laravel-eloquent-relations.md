---
title: Laravel Eloquent 关系表增删改查
permalink: laravel-eloquent-relations
date: 2020-01-15 13:55
category: 编程
tags: [Laravel, Eloquent]
---

1. 一对一, One To One， Has One Through

   一个用户有一个手机号，一个手机号也只能有一个用户

   

   ```
   User {
   	name: string
   }
   
   Phone {
   	user_id: integer
   }
   ```

   User hasOne Phone

2. 一对多，One To Many, Has Many Through

3. 多对多, Many To Many

