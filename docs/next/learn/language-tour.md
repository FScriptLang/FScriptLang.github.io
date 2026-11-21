---
id: language-tour
title: Language Tour
slug: /learn/language-tour
---

You can already run and debug a script. Now learn the language itself: values, functions, data, types, and source organization. This tour gives you the whole picture, with chapters below it for a closer look at each feature.

Run each code block separately in a scratch `.fss` file. The examples compute final values and need no external providers or permissions. You can also try the single-file examples in the [playground](/sandbox); file imports require file execution.

## Values, expressions, and layout

```fsharp
let seats = 12
let price = 19
let message =
  let total = seats * price
  $"Total: {total}"
message
// "Total: 228"
```

A binding gives a value a name. The type checker infers types from how values are constructed and used. Strings, integers, floats, booleans, and unit (`()`) are primitive values. Integers and floats are distinct; there are no implicit numeric conversions.

Indentation groups a block; its last expression supplies its value. Bindings are immutable: create a new value to represent a change. Use `//` for comments and `$"...{expression}..."` for interpolation.

Read [Values and Bindings](../language/values-and-bindings.md) and [Indentation and Layout](../language/indentation-and-layout.md).

## Functions, partial application, and pipelines

```fsharp
let multiply x y = x * y
let double = multiply 2
let makeAdder amount = fun value -> value + amount
let addFive = makeAdder 5

[1; 2; 3] |> List.map double |> List.map addFive
// [7; 9; 11]
```

Arguments follow the function name without commas. Functions are values: you can pass them, return them, or capture surrounding bindings in a closure. Curried functions take one argument at a time, so `multiply 2` returns a new function. `value |> f` means `f value`.

Use `fun` for anonymous functions, `()` for a unit argument, `let rec` for recursion, and `and` for mutually recursive groups. The [Functions chapter](../language/functions.md) covers each form and explicit generic parameters.

## Branching and expected failures

```fsharp
let divide numerator denominator =
  if denominator = 0 then None
  else Some (numerator / denominator)

match divide 12 3 with
| Some value -> $"Answer: {value}"
| None -> "Cannot divide by zero"
// "Answer: 4"
```

`if` and `match` are expressions; their result branches must have compatible types. Options represent a value that may be absent. Pattern matching inspects the case and binds its contents; the checker requires complete coverage. Guards (`when`) refine cases.

Use `for ... in ... do` to perform effects over a list and `List.map` to build a new list. `raise "message"` stops evaluation; there is no script-level exception handler. Represent recoverable outcomes with options or your own unions. `&&` and `||` evaluate both operands; use `if` when an expression must be skipped.

Read [Control Flow](../language/control-flow.md) and [Pattern Matching](../language/pattern-matching.md).

## Collections and immutable data

```fsharp
let numbers = [1..4]
let doubled = numbers |> List.map (fun n -> n * 2)
let total = doubled |> List.fold (fun sum n -> sum + n) 0
let (name, count) = ("team", 12)
let prices = { ["team"] = 19; ["scale"] = 29 }
let maybePrice = prices["team"]
(total, name, count, maybePrice)
// (20, "team", 12, Some 19)
```

Lists hold ordered elements of one type. Tuples group a fixed set of values, potentially with different types. Maps provide keyed lookup. List indexing and map lookup return options; missing entries produce `None`.

Use `::` to prepend and `@` to concatenate lists. Maps can use string, integer, boolean, or payload-free union keys. Collections are immutable, so transformations produce new values. See [Collections](../language/collections.md) for literals, updates, and key types.

## Records and unions

```fsharp
type Customer = { Name: string; Seats: int }
type Quote =
  | Offered of int
  | Declined of string

let quote (customer: Customer) =
  if customer.Seats > 0 then Offered (customer.Seats * 19)
  else Declined "Choose at least one seat"

let original = { Name = "Ada"; Seats = 3 }
let updated = { original with Seats = 12 }

match quote updated with
| Offered total -> $"Total: {total}"
| Declined reason -> reason
// "Total: 228"
```

Records give fields names. Updates create a new record; `original` still has three seats. Unions name the alternatives a value can take, with an optional payload per case. Pattern matching turns those alternatives into explicit branches.

Generic records and unions reuse a shape with different element types. Recursive declarations use `type rec`. The [Type Declarations chapter](../language/type-declarations.md) shows both.

## Type inference, generics, and record shapes

```fsharp
type Box<'item> = { Items: 'item list }

let first (box: Box<'item>) : 'item option =
  List.tryHead box.Items

let label (value: {| Name: string |}) = value.Name
let person = {| Name = "Ada"; City = "Paris" |}
(first { Items = [42; 7] }, label person)
// (Some 42, "Ada")
```

Annotations go on function parameters and returns. Repeated type variables such as `'item` express relationships between types. Arithmetic can infer a shared `numeric` type that specializes to integers or floats per call, without mixing the two within a call.

A named record type documents a domain concept. `{| ... |}` describes a structural record directly; a helper can require only the fields it uses. A `{ ... }` annotation can select an existing declared record by its unambiguous shape. Learn these distinctions in [Type System](../language/type-system.md) and [Structural vs Named Annotations](../language/structural-vs-named-annotations.md).

## Split source into files

Save `prices.fss`:

```fsharp
let quote seats = seats * 19
```

Save `main.fss` in the same directory:

```fsharp
import "prices.fss" as Prices
Prices.quote 12
// 228
```

Run `fscript main.fss`. Imports use explicit aliases and paths relative to the importing file. Imported helpers do not need `export`. Separately, `export let` marks bindings an embedding application can call; the host integration comes later. See [Imports and Exports](../language/modules-imports-exports.md).

## The remaining language tools

Use the detailed chapters in this section to practice the full forms of each feature. The [Syntax and Operators reference](../reference/syntax-reference.md) collects precedence, literals, patterns, annotations, and less frequent forms such as `nameof` and `typeof`. The [Standard Library](../stdlib/overview.md) describes operations on these values.

Concurrency uses runtime APIs rather than extra async syntax. Task handles, coordination, and permission requirements are taught in [Advanced: Tasks and Concurrency](../language/tasks-and-concurrency.md), after the execution modes. Extending the language environment with host APIs is also covered in Advanced.

**Checkpoint:** you can read a script, follow its data transformations, model alternatives, and find the chapter for a feature you want to use.

**Next:** work through the chapters below, beginning with [Values and Bindings](../language/values-and-bindings.md). If you already know these concepts, go to [Interpreter](../interpreter/overview.md) to configure everyday execution, followed by Compiler and Embedded.
