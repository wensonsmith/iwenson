---
title: Laravel 使用 CURD 之外 - 使用数据（Working with data）
permalink: laravel-beyond-curd-working-with-data
date: 2019-11-08 10:24:22
category: 学习
tags: [PHP,Larael]
---

> 原文请查看： [https://stitcher.io/blog/laravel-beyond-crud-02-working-with-data](https://stitcher.io/blog/laravel-beyond-crud-02-working-with-data)

在每个项目的核心中，你都可以找到数据。几乎所有应用都可以简单概括为：根据业务需求使用各种方法来提供、解释和操控数据。

你可能已经意识到这个事情：在项目开始时，你不会先去考虑 controllers 和 jobs， 你会从构建 Laravel 里称之为 Models 的东西开始。制作ERD和其他类图来概念化程序如何处理数据会对大型项目有所帮助。只有这些明确了，你才可以构建用于数据的入口点（entry points）和钩子（hooks）。

本节我们会仔细研究如何结构化的使用数据，这样以来团队其他开发者能够安全并可预测的使用数据。

你可能已经在思考 models 了，不过首先我们需要先做一些准备。

## 0x01 类型理论

为了理解数据传输对象（data transfer object）- 注意：这是本章关注的重点 - 的使用, 你需要一些类型系统（type system）的背景知识。

不是所有人对类型系统的术语理解都一样，所以这里先澄清这些术语，以便我们进行使用。

举个栗子：定义一个字符串变量 `$a = 'hello';`, 在弱类型语言中允许你改变变量的类型，比如改为整数（integer）：`$a = 20;`。

PHP 是一种弱类型语言，我觉得有一个更真实的例子：

```php
$id = '1'; // Eg. an id retrieved from the URL

function find(int $id): Model
{
    // The input '1' will automatically be cast to an int
}

find($id);
```

要清楚的是PHP采用弱类型是有道理的，作为主要用于HTTP请求的语言，基本所有东西都是字符串。

你也许会想现在的PHP开发，可以通过严格类型（strict types ） 特性来避免类型的隐性转变。不过这并不完全正确，严格类型模式可以阻止错误类型的变量传递到函数中，但是你仍然可以在函数内部改变变量类型。

```php
declare(strict_types=1);

function find(int $id): Model
{
    $id = '' . $id;

    /*
     * This is perfectly allowed in PHP
     * `$id` is a string now.
     */

    // …
}

find('1'); // This would trigger a TypeError.

find(1); // This would be fine.
```

即使有严格类型和输入提示，PHP的类型系统依然战五渣。输入提示只能确认当前正输入的变量类型，不能保证未来变量可能拥有的值类型。

我刚才说到，PHP使用弱类型是有道理的，因为他要处理掉输入大都是以字符串为开头。然而强类型有一个有趣的属性：它自带一些保证。如果一个变量带有不可变多类型，那么各种异常就不会发生。

强类型编译后，在数学上可以证明不会有存在于弱类型的一系列错误。换句话说，强类型更好的保证了程序按照开发者所设想的运行。

作为旁注，这并不意味着强类型语言就不会有错误！你完全有可能写出问题的实现。不过当强类型语言成功编译后，你可以确认有些错误和异常不会发生了。

> 强类型语言在开发时就可以为开发者提供更多的审查，而不是等运行的时候。

这里还有一个概念我们需要关注：静态和动态类型 - 这里就变得有趣起来了。

你可能已经知道，PHP 是一种解释型语言。这表示PHP在运行的时候才翻译成机器码。当你向PHP服务器发起请求，它会找到这些`.php`文件，然后解析成机器可以运行的东西。

这是PHP的强项之一：让写代码非常简单，只要刷新一下页面，就能看到效果。这和需要编译才能运行的语言有很大的区别。

当然这里会有缓存机制来优化这点，上面的描述是过于简单的。不过这对于我们理解下面的知识点已经足够了。

再说一次，这里会有一些缺点：因为PHP只在运行时才检查类型，所以运行时类型检查可能出错。这意味着你有明确的错误去调试代码，但是你的程序也崩了。

运行时的类型检查让PHP成为一个动态类型语言，反过来讲静态类型语言在程序运行之前就已经做好类型检查。

在PHP 7.0版本中，类型检查有了很大的进步。很多类似 [PHPStan](https://github.com/phpstan/phpstan)，[phan](https://github.com/phan/phan) 和[psalm](https://github.com/vimeo/psalm) 的工具开始流行起来。这些工具会对动态语言（即PHP）代码进行大量的静态分析。

这些可选库不需要运行或者单元测试，也可以提供许多对代码的审查，IDE例如PHPStorm也提供一些内置的静态检查。

了解了这么多背景知识以后，是时候回到我们应用的核心：数据（data）

## 0x02 结构化凌乱的数据

你有没有遇到过一个『员工数组（array of stuff）』然后发现它并不只是一个列表？你有用过数组的键值作为字段么？有没有感受到不确定数组里具体是什么的痛苦？不确定其中的数据是不是你想要的，或者这个字段是不是存在？

让我们具体化我所说的：正在开发一个Laravel的请求，试想一下示例代码是更新已经存在客户的一个基础CURD操作。

```php
function store(CustomerRequest $request, Customer $customer) 
{
    $validated = $request->validated();
    
    $customer->name = $validated['name'];
    $customer->email = $validated['email'];
    
    // …
}
```

你可能已经意识到问题所在： 我们不能明确知道`$validated`数组里有什么数据。虽然PHP里的数组是灵活并且强大的数据结构，但是当他们代表的不是『一些东西列表』的时候，这里有更好的办法来解决这个问题。

在寻找解决方案之前，这是你可以用来处理这种情况的方法：

- 读源码
- 读文档
- Dump 这个 `$validate`变量，然后进行检查
- 或者使用 Debug 工具检查变量

现在想象一下你与多位程序员组成的团队正在这个项目上工作，这段代码是你同事5个月前写的，我可以保证如果你不用上面的方法，你绝对搞不清你在使用什么数据。

这表明强类型系统结合静态类型检查可以帮助我们了解正在处理的数据。比如 Rust 语言，彻底解决此问题：

```rust
struct CustomerData {
    name: String,
    email: String,
    birth_date: Date,
}
```

结构体（Struct） 就是我们要的东西！可惜PHP里并不支持结构体，它有数组和对象，就是这样。

然而... 对象和类貌似已经足够：

```php
class CustomerData
{
    public string $name;
    public string $email;
    public Carbon $birth_date;
}
```

现在我知道：带类型的属性只有PHP 7.4 支持，在你读这本书的时候，可能你还没用上。下面我有一个解决方法，所以继续读下去。

那些已经使用了 PHP 7.4 或更高版本的人，你可以这么做：

```php
function store(CustomerRequest $request, Customer $customer) 
{
    $validated = CustomerData::fromRequest($request);
    
    $customer->name = $validated->name;
    $customer->email = $validated->email;
    $customer->birth_date = $validated->birth_date;
    
    // …
}
```

IDE 提供的静态分析会告诉我们正在处理的是什么数据。这种把凌乱的数据包装成类型以便我们更可靠的处理数据的设计模式，我们称之为『数据传输对象（data transfer object）』（译者注：下文简称 DTO）。这是我要告诉你应用在大中型Laravel项目中第一个具体的设计模式。

当你和同事、朋友或者Laravel社区讨论这本书的时候，你可能会偶然发现对强类型持有不同看法的人。事实上有许多人更喜欢PHP的动态和弱势方面，对于这点肯定有话要说。

在我的经验中，与多个人合作花大量时间开发项目的时候，强类型有着更多的优势。你必须尽量减少认知负担（cognitive load）,你不想开发人员每次都需要调试才知道变量具体内容。有关信息必须触手可得，这样开发人员才能集中精力搭建应用。

当然，使用DTO也会有代价：不仅有定义这些类的开销，你还需要进行映射。 举个栗子，请求数据转变为 DTO。

使用DTO带来的收益绝对大于你付出的成本，无论在写DTO上花了多少时间，长久看来都是可以补上的。

尽管从“外部”数据构造DTO的问题仍然需要回答。

## 0x03 DTO 工厂

我们如何构建 DTO ？我将展示两种方法，并且说明我更倾向于哪一个。

第一个也是最正确的一个方法：使用专门的工厂 （using a dedicated factory）

```php
class CustomerDataFactory
{
    public function fromRequest(
       CustomerRequest $request
    ): CustomerData {
        return new CustomerData([
            'name' => $request->get('name'),
            'email' => $request->get('email'),
            'birth_date' => Carbon::make(
                $request->get('birth_date')
            ),
        ]);
    }
}
```

拥有独立的工厂可以使代码在整个项目中保持整洁。对于工厂而言，放在应用层是最合适的（ It makes most sense for this factory to live in the application layer.）

虽然这是一个正确方法，但是你可能注意到在上面的例子中用到了另外一个方法，就是 `CustomerData::fromRequest `,在 DTO 类中构建。代码如下：

```php
use Spatie\DataTransferObject\DataTransferObject;

class CustomerData extends DataTransferObject
{
    // …
    
    public static function fromRequest(
        CustomerRequest $request
    ): self {
        return new self([
            'name' => $request->get('name'),
            'email' => $request->get('email'),
            'birth_date' => Carbon::make(
                $request->get('birth_date')
            ),
        ]);
    }
}
```

这种方法有什么问题呢？最大的问题： 它在 『领域（Domain ）』层使用了 『应用（Application）』层中的代码。领域中的 `CustomerData` 用到了应用层的 `CustomerRequest` 。

很显然把应用层代码和领域层代码混在一起不是什么好主意，但是这依然是我倾向的方法，原因有两个：

首先，我们已经明确了DTO是数据进入代码的入口，一旦我们从处理外部数据，我们要将其转换为DTO。我们需要一个地方进行映射，所以我们打算在使用到的DTO中进行映射。

其次，还有一个非常重要的原因： PHP不支持命名参数（译者注：命名参数可以标注参数名称，达到不用按顺序进行传参的效果），不然 DTO 类的构造函数需要传入每个属性对应的参数：这很不科学。因为有些属性值是 `null` 或者有默认值的情况下会比较难办。这是我为什么倾向于传数组给 DTO，然后根据数据内部构建自己这种方法的原因。补充说明：我们用库[spatie/data-transfer-object](https://github.com/spatie/data-transfer-object)来做这个事情。

因为命名参数不受支持，并且没有能用的静态分析，所以当你创建 DTO 时，对需要什么数据一无所知。我倾向于将这种『一无所知』限制在 DTO 中，这样外部无需太多考虑就可以调用。

如果PHP支持了命名参数，那么第一个工厂方法将会变得更好：

```php
public function fromRequest( CustomerRequest $request ): CustomerData {
    return new CustomerData(                   //注意这里已经不再是数组
        'name' => $request->get('name'),
        'email' => $request->get('email'),
        'birth_date' => Carbon::make(
            $request->get('birth_date')
        ),
    );
}
```

在PHP支持命名参数之前，我会更务实的使用第二种方法，而不是理论上正确的第一种。当然，这由你的喜好而定。

## 0x04 类型属性的实现

我前面讲过，这里有一种方法可以实现DTO类型属性，注释块（docBlocks）。前面提到的 `data-transfer-object`库支持此方法。

```php
use Spatie\DataTransferObject\DataTransferObject;

class CustomerData extends DataTransferObject
{
    /** @var string */
    public $name;
    
    /** @var string */
    public $email;
    
    /** @var \Carbon\Carbon */
    public $birth_date;
}
```

但是默认情况下，docblocks不能保证数据是备注的类型。幸运的是，PHP具有反射API（reflection API），因为有了它，才有更多的可能。

该库提供的解决方案可以认为是PHP类型系统的扩展。尽管在用户领域和运行时只能做这么多，但它仍然有价值。如果你没有使用PHP 7.4，并且想要docblocks 更加严谨，请使用此库。

---

由于数据是项目的核心，所以它是最重要的一块。DTO 提供了一种结构化数据、明确类型、可预测使用数据的方法。

通读全书，你会发现DTO用的如此频繁，所以这就是为什么在已开始我们要深入研究的原因。另外一个关键点的模块，需要我们深入了解研究的就是 ： Actions。 下次分享会说明它。