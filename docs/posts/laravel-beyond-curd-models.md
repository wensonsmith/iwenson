---
title: Laravel 使用 CURD 之外-模型（Models）
permalink: laravel-beyond-curd-models
date: 2019-11-12 09:40:35
category: 学习
tags: [PHP,Laravel]
---

> 原文请查看：[https://stitcher.io/blog/laravel-beyond-crud-04-models](https://stitcher.io/blog/laravel-beyond-crud-04-models)

在前面的两章中，我们讲到了每个应用三个核心模块的两个：DTO 和 Actions - 数据和功能。这章我们将会学习核心的最后一块：访问存储的数据。 换句话说： 模型 （Models）。

现在来说，Model 是比较难得一部分。 Laravel 通过 Eloquent 提供了许多功能，意味着模型不仅反应存储的数据，还可以进行查询，获取和保存数据。同时还有内建的事件系统和更多特性。

在这一章中，我不会让你抛弃所有 Laravel 提供的模型功能，因为他们确实很有用。 然而，我会列举一些你需要注意到坑，以及针对它们的解决方案。这样，即使在大型项目中，模型也不会成为难维护的原因。

我的观点是，我们虽然要保持大型项目的可维护性，也应该尽可能的拥抱框架，而不是对抗框架。

## 0x01 模型 != 业务逻辑

第一个陷阱是很多程序员会入坑的，那就是他们认为模型是涉及业务逻辑的地方。我已经列出了一些由 Laravel 内建的模型职责，并且我认为不需要增加任何内容。

一开始听起来非常动人，可以像这样做一些事情： `$invoiceLine->price_including_vat` 或者 `$invoice->total_price`。它确实可以做到。事实上我觉得发票和发票详情应该有这些方法。有一个很重要的区别是：这些方法不应该计算任何事情。让我们来看一下哪些不可以做。

这是发票模型中 `total_price` 的访问器，循环访问所有发票详情然后统计一个总价：

```php
class Invoice extends Model
{
    public function getTotalPriceAttribute(): int
    {
        return $this->invoiceLines
            ->reduce(function (int $totalPrice, InvoiceLine $invoiceLine) {
                return $totalPrice + $invoiceLine->total_price;
            }, 0);
    }
}
```

然后这里是发票详情小计的计算方法：

```php
class InvoiceLine extends Model
{
    public function getTotalPriceAttribute(): int
    {
        $vatCalculator = app(VatCalculator::class);
    
        $price = $this->item_amount * $this->item_price;

        if ($this->price_excluding_vat) {
            $price = $vatCalculator->totalPrice(
                $price, 
                $this->vat_percentage
            );
        }
    
        return $price;
    }
}
```

因为你读过之前文章里讲到的 Actions， 你也许会猜想我推荐的做法：计算发票总金额是应该在Action里进行处理的用例。

`Invoice`和`InvoiceLine`模型可以有简单的 `total_price`和 `price_including_at`属性，不过它们是首先经过 Action 的计算，然后保存在数据库中的。当使用`$invoice->total_price`时，你只是简单的从数据库中独处之前已经计算好的值。

这种方法有几点好处。首先是最明显的： 性能优势，你只需要计算一次，不是每次查询都计算一次。其次你可以直接查询计算好的数据。第三你不需要考虑附加影响。

现在，我们可以开始辩论单一责任（single responsibility）可以让 class 更小、更容易维护和更好测试。还有`依赖注入(dependency inject)`为什么比`服务定位(service location)`更好。但是我更想直接声明观点，而不是长期的辩论，因为我知道这里会有两点不一致。

所以，很明显：虽然你可能喜欢`$invoice->send()` 或者 `$invoice->toPdf()`, 这样会导致model 越来越臃肿。一开始看不出来， 但是会随着时间流逝而发生。

`$invoice->toPdf()`可能只有一行或者两行代码，但是经验表明，这些一两行的函数会增长。一行或两行不是问题，如果有几百个一行或两行就是了。事实是model会随时间增长，可以变得非常巨大。

即使你对单一职责和依赖注入带来的好处有意见，关于下面这点应该没有意见：一个成千上万行的model不可维护。

上面所有都为了说明这么一点，把 model 理解为它们的作用就是为你提供数据，让其他的部分来确保数据计算正确。

## 0x02 缩减模型

如果我们的目标是保持 model 类合理的小， 小到打开它就能理解它，我们需要再移动一些东西。理想情况下，我们只保留 getters 和 setters， 简单的 accessors , mutators, casts 还有 relations。

其他的职责应该被移动到其他的类。query scope 就是一个例子： 我们可以轻松的把它们移动到专门的构造类。

信不信由你：query builder 类实际上是使用 Eloquent 最常用的方法。 scopes 是构建在上面的语法糖。query builder 类如下所示：

```php
namespace Domain\Invoices\QueryBuilders;

use Domain\Invoices\States\Paid;
use Illuminate\Database\Eloquent\Builder;

class InvoiceQueryBuilder extends Builder
{
    public function wherePaid(): self
    {
        return $this->whereState('status', Paid::class);
    }
}
```

接下来，我们在model 中覆写 `newEloquentBuilder`方法，返回我们自定义的类。 Laravel 就会使用它。

```php
namespace Domain\Invoices\Models;

use Domain\Invoices\QueryBuilders\InvoiceQueryBuilder;

class Invoice extends Model 
{
    public function newEloquentBuilder($query): InvoiceQueryBuilder
    {
        return new InvoiceQueryBuilder($query);
    }
}
```

这就是我所说的拥抱框架：你不需要引入新的设计模式例如repository，你可以在Laravel 本身提供的功能上搭建。 多思考一下，我们在使用框架所提供功能和避免代码在某些方面变得庞大之间取得了完美的平衡。

使用这种思维方式，我们可以为 relations 提供自定义的 collection 类。Laravel 拥有很棒的Collection支持，然而你会经常在 model 或者 controller 层使用一长串的 collection 函数。这明显不理想，幸运的是 Laravel 提供了钩子函数，可以让我们把 collection 的逻辑绑定到专门的类中。

```php
namespace Domain\Invoices\Collections;

use Domain\Invoices\Models\InvoiceLines;
use Illuminate\Database\Eloquent\Collection;

class InvoiceLineCollection extends Collection
{
    public function creditLines(): self
    {
        return $this->filter(function (InvoiceLine $invoiceLine) {
            return $invoiceLine->isCreditLine();
        });
    }
}
```

下面是怎样把 `InvoiceLineCollection` 链接到 `InvoiceLine` model 中：

```php
namespace Domain\Invoices\Models;

use Domain\Invoices\Collection\InvoiceLineCollection;

class InvoiceLine extends Model 
{
    public function newCollection(array $models = []): InvoiceLineCollection
    {
        return new InvoiceLineCollection($models);
    }

    public function isCreditLine(): bool
    {
        return $this->price < 0.0;
    }
}
```

每个 `Invoice`模型中有一对多 `InvoiceLine`， 现在使用我们自定义的 collection 类：

```php
$invoice
    ->invoiceLines
    ->creditLines()
    ->map(function (InvoiceLine $invoiceLine) {
        // …
    });
```

尝试保持 models 干净和面向数据，而不是让它们提供业务逻辑。有更好的地方来处理它。

## 0x03 贫血模型争论

我很高兴 Taylor Otwell 也正在看这个博客系列。上周他问道怎么避免 model 变成数据空袋（empty bags of data）,这是 Martin Fowler 写的[一种反设计模式](https://martinfowler.com/bliki/AnemicDomainModel.html)。

因为Taylor 在Twitter 上问的我，我在这个文章里进行解答。

我的答案是双重的。首先我不认为models就是只是填充 data。 使用 accessors, mutators, casts ,这些东西使 model 在纯数据容器中提供了一个多功能层。在这个文章里，我把多个职责移到了别的类中，但是我相信即使做过删减，models 还是提供了远多于数据空袋的功能。多谢Laravel提供的各种功能。

其次我认为需要提一下 Alan Kay (OOP 提出者)， 在这个[演讲中](https://www.youtube.com/watch?time_continue=2265&v=oKg1hTOQXoY)他提到后悔把这种模式称之为 『object oriented』而没有称之为 『process oriented』. Alan 表明他实际上是将流程和数据分开的支持者。

同不同意这种观点取决你自己。我承认我受到了 Alan 的影响。同时也像我说的，这个博客系列不能作为软件设计的圣杯。我的目标是改变你现在写代码的方式，让你在解决问题时有更多的选择。

（译者注： 这一段主要是讲到贫血模型中，models 层过于简单的问题。作者认为首先来讲 Laravel 里的model 并不会出现贫血模型中过于简单的情况，其次是他倾向于把数据处理和数据分开到不同的类中）