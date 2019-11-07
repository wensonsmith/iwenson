---
title: Laravel 使用 CURD 之外-前言
permalink: laravel-beyond-curd-preface
date: 2019-11-07 15:12:22
category: 学习
tags: [PHP,Laravel]
---

> 原文请查看：[https://stitcher.io/blog/laravel-beyond-crud](https://stitcher.io/blog/laravel-beyond-crud)

- [00. 前言](https://iwenson.com/laravel-beyond-curd-preface)
- [01. 领域 Domains](https://iwenson.com/laravel-beyond-crud-domains)
- [02. Working with data](https://stitcher.io/blog/laravel-beyond-crud-02-working-with-data) 翻译中
- [03. Actions](https://stitcher.io/blog/laravel-beyond-crud-03-actions) 翻译中
- [04. Models](https://stitcher.io/blog/laravel-beyond-crud-04-models) 翻译中
- 05.Managing Domains: coming soon
- 06.Models with the state pattern: coming soon
- 07.Enums: coming soon
- More chapters are in the making

## 0x01 前言

>  写给维护大中型 Laravel 项目PHP程序员的博客系列

多年来我已经开发和维护多个大中型 web 应用。这些项目最少是一个团队开发了一年，通常会更久。与普通的 Laravel CURD项目相比，他们更难以维护。

这段时间我研究了以下几个可以让我和团队改善项目可维护性的架构，这样一来不论对我们还是对客户，会让开发变得简单些：DDD（领域驱动开发）、Hexagonal Architecture （六边形架构？）、Event Sourcing（事件溯源）。

因为这些项目虽然不小，但是也没有特别巨大，所以这些范式对项目几乎都设计过度了。最重要的是我们要不断的处理BUG，赶 Deadline，意味着我们没有很多时间去调整架构。

通常来讲，这些项目开发周期都在 6 个月到 1 年左右，有一个 3 到 6人的团队。 项目上线后，大多数项目还要持续到进行改进。

在这个系列中，我将会写这几年在设计项目中所获得的知识。我将会仔细点研究 Laravel 的开发方式，看看哪些对我们有用。如果你正在负责这样的大项目，这个系列将会给你在管理中实用且务实的解决方案。

我将会说明理论（theory）、模式（patterns）和原则（principles），这些都将在真实的 web 应用中进行讲解。

这个系列的目的就是给你解决现实问题的具体方法，可以让你立马用在自己的项目上。Enjoy！

## 0x02 关于我

我的名字是 Brent， 25 岁的比利时程序员。过去 5 年中专注于 PHP 开发，另外我从 13 岁就开始编程啦！

作为专业，我主要是开发大中型的web应用和接口。现在我在 Spatie 公司用 Laravel 进行开发，在此之前我使用 Symfony 和一些公司自研框架。