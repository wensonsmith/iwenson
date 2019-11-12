---
title: Laravel 使用 CURD 之外-动作（Actions）
permalink: laravel-beyond-curd-actions
date: 2019-11-12 09:40:35
category: 学习
tags: [PHP,Laravel]
---

> 原文请查看：[https://stitcher.io/blog/laravel-beyond-crud-03-actions](https://stitcher.io/blog/laravel-beyond-crud-03-actions)

现在我们已经可以使用安全且透明的数据了，我们需要用它做点什么。

就像我们不喜欢装有各种数据的随机数组一样，我们也不想项目中最重要的部分-业务函数，随机分布在各种方法和类中。

举个栗子 🌰 : 项目中的一个用户用例可能是『一个管理员创建发票』，这表示在数据库中保存发票，但是还有一些事情：

- 首先， 计算每个要开票项目的金额和总和
- 然后把发票保存到数据库中
- 使用支付服务创建一笔付款
- 创建一个包含所有相关信息的 PDF
- 把 PDF 发给顾客

Laravel 里常用的方法是把这些功能都放在『Models』里（译者注：充血模型），在这一节，我们将尝试另一种方法用代码实现这些功能。

与其把这些功能混合在 『Models』和 『Controllers』里面，我们把这些用户用例看作为项目的第一公民（first class citizens）,我试图称之为『Actions』。

## 0x01 术语  Terminology

在我们使用之前，我们先来讨论一下动作是怎么构成的。对于初学者来讲，动作在领域（domain）下面。

第二，动作是没有任何抽象或者接口的简单类。一个动作类是获得输入，做一些操作，然后返回输出。这是为什么动作类通常只有一个公共方法，有时只有一个构造函数。

作为项目的约定，我们决定在所有类上加后缀。当然 `CreateInvoice`听起来不错，不过当你需要处理成千上万个类的时候，你需要确保不会发生命名冲突。你看，`CreateInvoice` 可以作为一个可调用的 contoller 名称，或者一个命令名称（command），或者一个job名称以及一个请求名称（request）。我们希望尽可能的消除迷惑，因此，`CreateInvoiceAction`来作为名称。

很明显这样名称很长，现实是在大型项目中，你不得不起一个很长的名程来尽量确保不会有冲突。这里有一个我开发项目中的极端案例：`CreateOrUpdateHabitantContractUnitPackageAction`,  我没有玩笑！

我们当然讨厌这个名称，我们拼命的想起一个更短的，最后不得不承认，能够清晰地描述类是做什么的最为重要。IDE 的自动补全能够弥补名称太长带来的不便。

当我们解决了类的名称，下一个要解决的问题是给公共方法起名。一个选项是让类可调用（make class invokable）, 例如：

```php
class CreateInvoiceAction
{
    public function __invoke(InvoiceData $invoiceData): Invoice
    {
        //...
    }
}
```

这种方法实际上会有问题。后面我们会讲到由多个动作组成的动作，还有这是多么强大的设计模式。他们看起来是这个样子：

```php
class CreateInvoiceAction
{
    private $createInvoiceLineAction;

    public function __construct(
        CreateInvoiceLineAction $createInvoiceLineAction
    ) { /* … */ }

    public function __invoke(InvoiceData $invoiceData): Invoice
    {
        foreach ($invoiceData->lines as $lineData) {
            $invoice->addLine(
                ($this->createInvoiceLineAction)($lineData)
            );
        }
    }
}
```

你发现问题了么？ PHP 不支持直接调用可调用的类属性，因为PHP会寻找类方法。这就是为什么需要用括号包裹起来然后再调用的原因。

虽然这只是一个小小的不便，但是在PHPStorm中会有额外的问题：当这样调用动作类时无法对参数进行自动补全。个人认为，这种用法是日常开发的一部分，不应该被忽略。 因为这个原因，我们团队决定不把动作类作为可调用。

另外一个选项是`handle`，是Laravel里在这类情况中经常用到的。然而这依然有问题，尤其是Laravel用了它。

随人Laravel允许你使用`handle`，在 jobs 和 commands中，它还可以在依赖容器中进行方法注入。在我们的动作类中，我们想只有构造函数拥有依赖注射的能力。后面我们会解释原因。

所以 `handle`出局了。当我们开始使用动作类时，我们确实在这个起名上花了很多心思。最后我们决定使用 `execute`。 请记住，你可以随心的选择自己的命名约定：重点是使用动作类的设计模式而不是起名。

## 0x02 付诸实践

抛开所有术语，我们来谈论一下为什么动作是有用的和怎么使用它。

首先我们说一下可复用性。使用动作的一个小技巧是把它分为很多小块以便其他地方重复使用，同时还要在不超范围的情况下使它足够大。用我们的发票栗子说明：通过发票生成 PDF 是一件可能发生在程序中很多情况下的事情。当然发票生成的时候回创建 PDF，不过管理员有可能想在发送之前，预览或者编辑它。

这里有两个用例： 『创建一个发票』和『预览一个发票』很显然需要两个入口，两个 controller。另一面来说，在两种情况下都需要根据发票创建 PDF 。

当你开始花时间思考程序实际做什么的时候，你会注意到很多动作可以复用。当然，你也需要注意不要对代码进行过度抽象。通常来讲复制粘贴一些代码会比过早的进行抽象更好。

一条好的经验是：根据业务功能进行抽象，而不是根据技术属性（think about the functionality when making abstractions, instead of the technical properties of code）。即使在不同的场景中两个动作做了同样的事情，你也要注意不要太早的对他们进行抽象。

另一方面，有一些情况下抽象会有帮助。再拿我们发票 PDF 的栗子来说，当不仅发票需要生成 PDF 时 - 我们项目中就是如此，有理由使用一个通用的 `GeneratePdfAction` 作为接口，然后 `Invoice`来实现。

但是，实话来说，更多的情况下动作是针对用例，而不是复用。你可能会想在这种情况下，动作是没必要开销。但是，可复用性不是使用动作的唯一原因。实际上，最重要的原因和技术优势没有关系：动作让开发者按照更贴近真实世界的方式去思考，而不是代码方式去思考。

假如你更改发票的创建方式。在典型的Laravel应用中，发票创建逻辑可能会分布在 controller 和 model 中，也许是一个创建 PDF 的 job， 然后一个事件监听器来发送邮件。你需要了解很多地方。我们的代码按照技术特性而不是其意义分布在各个地方。

动作减少了这种系统带来的认知负担。如果你需要知道发票时怎么创建的，可以直接从 action 类中开始。

不要误解： 动作可以可异步任务和事件监听很好的合作。尽管 jobs 和 event listener 仅提供操作动作的基础设施，而不是业务逻辑本身。这是一个很好的例子为什么我们把 Domain 和 application 层分开： 他们有不同的目的。

所以我们获得了可复用性并减少了认知负担，还有更多的好处！

因为actions 是几乎可以独立运行的小块代码，因此对它们进行单元测试非常容易。 在测试中不需要担心发送假的 http 请求，设置假的代理等。你可以简单的创建一个新动作，也许提供一些模拟依赖，传入必须的输入数据然后对输出进行断言。

举个栗子:chestnut:, `CreateInvoiceLineAction`将获取有关一段时间内要开具发票的商品金额数据，然后计算总价、价格和增值税价格，你可以为这些编写健壮而简单的单元测试。

如果你的 actions 有良好的单元测试，就会对应用中的大部分功能正常运行非常有信心。现在只需要对影响用户使用到地方加上单元测试即可。

## 0x03 组合动作

我前面简单提到action的一个重要的特征时他们如何使用依赖注入。因为我们使用构造函数从容器中传递数据，然后`execute`方法传入具体的上下文相关数据，我们可以自由的一层层嵌套 actions。

你明白了。首先澄清一点，尽管多重依赖是我们要避免的（它使代码复杂并且高度依赖彼此），在有些场景依赖注入是非常有用的。

再次用`CreateInvoiceLineAction`举例说明它需要计算增值税价格。根据上下文，一个开票行（invoice line）应该有一个含税和不含税价格。 计算带税价格不太重要，所以我们不想 `CreateInvoiceLineAction`关心这些。

所以想象一下我们有一个简单的 `VatCalculator`类，它也许在 `\Support`命名空间下，他可以这样被注入：

```php
class CreateInvoiceLineAction
{
    private $vatCalculator;

    public function __construct(VatCalculator $vatCalculator)
    { 
        $this->vatCalculator = $vatCalculator;
    }
    
    public function execute(
        InvoiceLineData $invoiceLineData
    ): InvoiceLine {
        // …
    }
}
```

然后你可能会这么使用：

```php
public function execute( InvoiceLineData $invoiceLineData ): InvoiceLine 
{
    $item = $invoiceLineData->item;

    if ($item->vatIncluded()) {
        [$priceIncVat, $priceExclVat] = 
            $this->vatCalculator->vatIncluded( $item->getPrice(), $item->getVatPercentage());
    } else {
        [$priceIncVat, $priceExclVat] = 
            $this->vatCalculator->vatExcluded( $item->getPrice(), $item->getVatPercentage());
    }

    $amount = $invoiceLineData->item_amount;
    
    $invoiceLine = new InvoiceLine([
        'item_price' => $item->getPrice(),
        'total_price' => $amount * $priceIncVat,
        'total_price_excluding_vat' => $amount * $priceExclVat,
    ]);
}
```

`CreateInvoiceLineAction` 按序被注入到 `CreateInvoiceAction`中。当然它还有其他依赖，比如 `CreatePdfAction`和 `SendMailAction`。

你会发现组合可以保持较小 action 的情况下，又能以一种清晰可维护的方式完成复杂的业务逻辑。

## 0x04 动作替代品

这里有两种设计模式可以不用考虑动作。

第一种广为人知的是 DDD： commands 和 handlers。 actions 就像是简化版的他们。 Commands 和 handlers 区别了需要发生什么以及如何发生。actions 像是把两种结合在一起。command bus 拥有更多灵活性的同时你也需要书写更多的代码。

在我们的项目领域，把actions 分割为 commands 和handlers 有点做的太多了。 我们可能不需要那点灵活性，在这上面会需要更多的编程时间。

第二种模式是事件驱动系统（event driven systems）. 如果你用过事件驱动，你可能会认为 actions 被直接调用增加了耦合性。再次说明一点： 事件驱动系统有更多的灵活性，但是对于我们的项目有点大材小用。另外事件驱动添加了一层间接层，增加了阅读代码的复杂度。虽然这种间接性确实带来了好处，但带来更多的维护成本。

---

我希望明确一点，我们并没有找到一个完美的可用于各种Laravel项目的方案。我们并没有。当你通读这个系列的时候，你需要留心你项目具体所需。你可能会用到这里讲到的一些概念，但你需要其他的方案来解决具体的问题。

对于我们，actions 是一个正确的选择，因为它提供了正确量的灵活性、可复用性， 并明显的降低了认知负担。他们封装了应用的核心本质。实际上，它们可以与DTO和 models 一起被认为是项目的真正核心。