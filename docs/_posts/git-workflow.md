---
title: Git Flow 团队协作规范
permalink: git-workflow
date: 2018-08-06 9:00
category: 设计
tags: [Git,规范]
---

# Git Flow 团队协作规范

<img src="../assets/images/git-workflow.png"/>



### 一、分支管理

1. `Production`
    图中的 `Master` 分支就是我们的 `Production` 分支。` Production` 分支是服务器正在运行的，合并上去之后需要打 ` Tag`。 

2. `Develop`

    Develop分支就是我们的 dev 分支，`develop`分支作为功能的集成分支。

3. `hotfix/*`

    但功能分支不是从`production`分支上拉出新分支，而是使用`dev`分支作为父分支。当新功能完成时，合并回`dev`分支。功能分支不允许直接合并到`production` 分支。

4. `release/*`

    功能发布分支，一旦`dev`分支上有了做一次发布（或者说快到了既定的发布日）的足够功能，就从`dev`分支上`fork`一个发布分支。 新建的分支用于开始发布循环，所以从这个时间点开始之后新的功能不能再加到这个分支上—— 这个分支只应该做`Bug`修复、文档生成和其它面向发布任务。 一旦对外发布的工作都完成了，发布分支合并到`production`分支并分配一个版本号打好`Tag`。 另外，这些从新建发布分支以来的做的修改要合并回`dev`分支。

5. `name/*`

    功能分支，`name` 为开发者的名称。当一个功能需要多个人进行合作开发的时候，用 `feature/*`


### 二、Git 使用规范



1. `commit` 的时候必须跟上` issue` 的 `ID`， 格式如下：

   ```
   Commit的内容 (#122)
   ```


### 三、工作流程

1. 控制分支的数量，不要随随便便创建功能分支。 分支应该有具体的功能点。
2. `Production` 分支不允许任务功能分支直接进行合并。
3. 当线上有问题时，从 `production` 切出 `hotfix/*` 分支，修复好以后合并到 `dev` 和 `production` 分支，然后删除分支。
4. 每周定一个版本，把要发版的功能切分支。发版流程为从` dev` 分支切出一个 `release/*` 分支，然后在如果有问题，都在 `release` 分支上进行解决，解决以后，把 `release` 合并到 `production` 和 `dev` 分支。



具体的操作流程请参考：[Git Flow 工作流程]( https://segmentfault.com/a/1190000002918123#articleHeader10)