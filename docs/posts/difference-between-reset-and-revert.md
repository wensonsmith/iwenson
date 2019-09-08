---
title: Git reset和revert的区别
permalink: difference-between-reset-and-revert
date: 2014-02-10 15:25:40
category: 折腾
tags: [Git]
---

## 两者的说明
- git reset 重置
- git revert 撤销

从字面上理解，重置是不管你做了多少次`commit`,一次性就撤回去了。

撤销的话，只能撤销某一次的`commit`。

譬如，

`commit-1， commit-2, commit-3, commit-4`

运行 `git reset --HARD HEAD~2`

重置到倒数第三个状态  ，那么还剩

`commit-1, commit-2`

运行  `git revert HEAD~2`

撤销倒数第二个状态， ，就是删除 `commit-2`，那么还剩

`commit-1,commit-3,commit-4`


## Git reset 的参数 --soft  --mixed --hard

先这么理解一下，比较好懂

1. `git reset -soft` : 取消了`commit`  

2. `git reset -mixed`（默认） : 取消了`commit` ，取消了`add`

3. `git reset -hard` : 取消了`commit` ，取消了`add`，取消源文件修改



`git reset head~1`,这个相当于带了`--mixed`参数， 这样已经修改的文件内容不会变，只不过`commit`信息没 了，需要重新进行`add` 然后再`commit`


`git reset --soft HEAD~1`, 这个相当于`git reset --mixed` 以后，又加上了 `git add` ,文件内容不会变，但是改动都放在了待提交区里面。  所以就可以用 `git reset --soft [ID]`来合并几次`commit`信息。


`git reset --hard HEAD~1`,不仅重置了`commit`信息，文件中已经修改的部分也会丢失。譬如想放弃所有更改干干净净回到某一个版本，就可以 `git reset --hard HEAD`
