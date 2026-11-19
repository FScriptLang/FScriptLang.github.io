---
id: stdlib-ref
title: Ref Module
slug: /stdlib/ref
---

`Ref<'t>` holds a value that can be replaced. Bindings remain immutable: several bindings can refer to the same reference, and all of them observe its current contents.

The CLI enables Ref by default for script execution and compilation to .NET and C#. Embedding hosts register it through `FScript.Runtime.Registry.registration`. All three functions require [no host permissions](../embedding/host-permissions). Ref is not available in the browser playground or the core JavaScript runtime.

## `Ref.create`

```text
Ref.create : 't -> Ref<'t>
```

Creates a fresh reference containing the supplied value. Separate calls create independent storage, even when the initial values are equal.

## `Ref.get`

```text
Ref.get : Ref<'t> -> 't
```

Returns the current value. The storage is opaque: a reference has no readable or writable `Value` field in FScript.

## `Ref.set`

```text
Ref.set : 't -> Ref<'t> -> unit
```

Replaces the contents and returns `()`. The value comes first, so `reference |> Ref.set value` is equivalent to `Ref.set value reference`.

## Shared storage

```fsharp
let count = Ref.create 0
let alias = count
let before = Ref.get count
alias |> Ref.set (before + 1)
(before, Ref.get count) // (0, 1)
```

Passing a reference through a function, record, collection, or closure preserves its storage. Equality compares reference identity: a reference equals its aliases, while separately created references are unequal. Display and serialization do not expose the contents, and JSON decoding cannot create a reference. See [Host-managed types](../embedding/host-managed-types).

## Element types

A reference keeps one element type across every read and write. An initially empty list or `None` does not allow that type to change later:

```fsharp
let values = Ref.create []
Ref.set [1; 2] values
Ref.get values // [1; 2]
// Ref.set ["three"] values would be a type error.
```

A factory can create independent references of different types:

```fsharp
let make value = Ref.create value
let number = make 42
let word = make "hello"
(Ref.get number, Ref.get word) // (42, "hello")
```

## Concurrency

Ref access is not synchronized. A read followed by a write is not an atomic update. Use [Mailbox](./mailbox) to manage state shared by concurrent producers. Refs have no thread-safe guarantee in [task-sharing analysis](../learn/task-sharing-analysis).
