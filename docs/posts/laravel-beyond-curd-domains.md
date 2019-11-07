---
title: Laravel 使用 CURD 之外-领域（Domain）
permalink: laravel-beyond-curd-domains
date: 2019-11-07 16:19:32
category: 学习
tags: [PHP,Laravel]
---



> 原文请查看：[https://stitcher.io/blog/laravel-beyond-crud](https://stitcher.io/blog/laravel-beyond-crud)

## 0x01 面向领域的Laravel

> 人类分类思考，我们的代码应该映射这一点

首先说明，我没有提出这个术语 『领域』- 我从流行的开发模式 DDD 中学来的。引用牛津词典， 『领域』 可以描述为 『一个特定范围的活动或知识』。

我这里所说的『领域』和DDD中的不同，不过有相似之处。如果你比较熟悉DDD，你会在这本书中找到相似点。在用到时我尽可能的说出其相似和差异之处。

所谓『领域』，你也可以称之为『组』（groups）、『模块』（modules），有一些人称之为『服务』（services）。无论你喜欢哪个名称，领域描述了您要解决的一系列业务问题（domains describe a set of the business problems you're trying to solve）。

稍等，我意识到我刚才用到了一个『企业级』的术语：『业务问题』（the business problem）。通读全书，你会注意到，我尽量避开理论，高层管理和业务方面的问题。我也是一个程序员，所以我倾向于让事情具体化。所以简单来说可以称之为『项目』（project）。

举个栗子：一个管理酒店预订的应用，它要管理顾客、预订、发票、酒店库存等。

现代的web框架会告诉你一组关联的概念（译者注：比如MVC），然后在代码中分割成几部部分：controller 在controllers下面，model 在models下面。你学会了。

但是有客户曾经让你『快开发controllers』，或者『多花点时间在models』上面吗？不，他们只会让你开发发票、顾客管理或者预订功能。

这些分组就是我所谓的领域。旨在把项目中属于同一事项的概念放在一起。这看起来不是很重要，不过它比你想象的复杂。本书这部分集中于一系列的规则和原则，以使你的代码井井有条。

很显然我没法给你一个数学公式，几乎所有事情都取决于你正在工作的具体项目。所以不要想着这本书给你一套固定的规则。而是为你提供了一些想法，您可以根据自己的喜好使用和拓展这些想法。

这是学习的机会，不仅仅是一套可以应对不同问题的方法。

## 0x02 领域和应用

如果我们总结一下，很明显会有问题：我们要做多少？ 举个栗子，你可以把有关发票的所有一切放在一起：models、controllers、resouces、validation rules、jobs ...

传统的HTTP应用中还有一个问题：通常controllers和models并不是一对一的关系。当然，在 REST APIs 和大多数常见的CURD controller中有可能是一对一的关系，不幸的是这只是特例。举例来说『发票』不能简单的隔离开，他需要发送给『顾客』，也需要对『预订』进行开票等等。

这就是为什么我们需要区别开什么是领域内代码，什么不是。

一方面是代表所有事务逻辑的领域，另一方面要讲领域代码和框架进行整合，对外提供服务。应用程序为用户提供了方便使用领域的基础结构。

## 0x03 实际应用

在实际应用中怎么做呢？ 领域会包含models、query builders、domain events、validation rules 等。我们将深入研究这些概念。

应用层会有一个或者多个应用。每个应用可以看作为可以使用所有领域的独立程序。换句话说，应用间不进行沟通。

比如一个标准HTTP管理后台和REST API 是两个程序，也可以把命令行（console） artisan看做为 Laravel 自己的一个程序。

综上，面向领域项目文件夹结构如下所示：

```php
One specific domain folder per business concept
app/Domain/Invoices/
    ├── Actions
    ├── QueryBuilders
    ├── Collections
    ├── DataTransferObjects
    ├── Events
    ├── Exceptions
    ├── Listeners
    ├── Models
    ├── Rules
    └── States

app/Domain/Customers/
    // …
```



应用层文件夹结构：

```
The admin HTTP application
app/App/Admin/
    ├── Controllers
    ├── Middlewares
    ├── Requests
    ├── Resources
    └── ViewModels

The REST API application
app/App/Api/
    ├── Controllers
    ├── Middlewares
    ├── Requests
    └── Resources

The console application
app/App/Console/
    └── Commands
```

## 0x04 关于命名空间

你可能已经发现上面的例子没有遵循 Laravel 的约定把`\App`作为唯一根命名空间。由于应用只是我们项目点一部分，而且还可以有多个，所以把`\App`作为所有内容的根目录没有意义。

注意如果你执意要按照 Laravel 默认的目录结构，也是能做到的。这样一来就需要使用 `\App\Domain` 和 `\App\Api`命名空间。根据你自己的喜好来。

如果要分隔根命名空间，需要对Laravel启动过程进行一些修改。

首先，需要把所有根空间注册到`composer.json`

```json
{
    // …

    "autoload" : {
        "psr-4" : {
            "App\\" : "app/App/",
            "Domain\\" : "app/Domain/",
            "Support\\" : "app/Support/"
        }
    }
}
```

注意到我还加了一个 `\Support`根空间，用来放不属于任何地方的工具类。

然后，我们需要重新注册`\App`命名空间，因为 Laravel 内部会将其用于多种用途。

```php
namespace App;

use Illuminate\Foundation\Application as LaravelApplication;

class BaseApplication extends LaravelApplication
{
    protected $namespace = 'App\\';

    public function path($path = '')
    {
        return $this->basePath.DIRECTORY_SEPARATOR.'app/App'.($path ? DIRECTORY_SEPARATOR.$path : $path);
    }
}
```

最后，我们需要把我们改变过的基础应用注册到`bootstrap/app.php`:

```php
// bootstrap/app.php

$app = new App\BaseApplication(
    realpath(__DIR__.'/../')
);
```

不幸的是没有更简便的方法完成这事，因为框架从未打算改变默认文件夹结构。再说一遍，如果你对这些改变感觉不爽，那么使用Laravel 默认的根命名空间即可。

---

不论什么样的文件夹结构，最重要的是你开始思考怎么对业务逻辑概念进行归类，而不是对相同技术类型的代码进行归类。（thinking in groups of related business concepts, rather than in groups of code with the same technical properties.）

在每个分组，每个领域中，使用空间使代码结构化以便在不同的分组中方便的进行调用。本书的第一部分着重于如何在程序内使用领域，并研究哪些模式可以帮助代码在增长的过程中保持可维护性。然后我们将研究在应用层如何具体的使用领域，并且通过使用试图模型来改善现有的Laravel概念。

有很多基础需要学习，我希望你能够从中学到一些可以马上使用到东西。