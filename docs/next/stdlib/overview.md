---
id: stdlib-overview
title: Stdlib Overview
slug: /stdlib/overview
---

Hosted interpreters grant no permissions by default. Each module page and the [complete signature index](../reference/stdlib) identify the capabilities required by every function. Functions that require permissions need explicit host grants. See [Host permissions](../embedding/host-permissions).

The CLI makes the standard library available without imports.

## Availability

| Group | Modules or names | Availability |
| --- | --- | --- |
| Core functions and values | `List`, `Option`, `Map`, `String`, `Int`, `Float`, `Bool`, `Path`, `Glob`, `SemVer`, `ignore` | Always, including JavaScript hosts |
| Additional CLI modules | `Console`, `Task`, `Mailbox`, `Ref`, `Fs`, `Json`, `Regex`, `Xml`, `Hash`, `Encoding`, `Guid`, `Process` | Enabled by default in the CLI. Availability in embedded scripts depends on the host. |
| Exit status | `Env.setExitCode : int -> unit` | Effectful core operation; never terminates the host |
| Execution metadata | `Env : Environment` | Injected by the CLI/REPL or supplied by an embedding host |

Use `--no-default-externs` or set `runtime.default-externs = false` to disable the additional CLI modules. See [JavaScript embedding](../embedding/fable-javascript) for package availability and host setup.

`ignore` is a core function with type `'a -> unit`: `42 |> ignore` returns `()`. `Env` is a host-supplied value, not a function. See [Built-ins and Execution Metadata](./builtins).

## Choose a module

| Task | Module |
| --- | --- |
| Transform, filter, or fold a sequence | [List](./list) |
| Handle optional values and defaults | [Option](./option) |
| Look up and transform keyed values | [Map](./map) |
| Split, join, replace, or search text | [String](./string) |
| Parse and format scalar values | [Int, Float, Bool](./scalars) |
| Read or write console text | [Console](./console) |
| Run concurrent work and await results | [Task](./task) |
| Launch a program and expose its async result | [Process](./process) |
| Process messages from concurrent producers | [Mailbox](./mailbox) |
| Store and replace a value | [Ref](./ref) |
| Read, write, and discover files | [Fs](./fs) |
| Decode and encode JSON | [Json](./json) |
| Extract regular-expression capture groups | [Regex](./regex) |
| Query XML element text and attributes | [Xml](./xml) |
| Compute a SHA-256 or MD5 digest of supplied content | [Hash](./hash) |
| Manipulate path strings without IO | [Path](./path) |
| Match supplied paths against patterns | [Glob](./glob) |
| Parse and compare semantic versions | [SemVer](./semver) |
| Transform UTF-8, Base64, hex, or URI components | [Encoding](./encoding) |
| Create a GUID string | [Guid](./guid) |

## Reading the signatures

Functions are curried: `Map.add key value map` takes three arguments. Pipelines supply the final argument: `map |> Map.add key value`. Repeated type variables must agree; for example, `'a -> 'a option -> 'a` uses one type throughout a call.

An `option` result distinguishes success (`Some value`) from absence or a supported recoverable failure (`None`). It does not promise that all failures are caught: for example, `List.tail []` fails, and denied filesystem reads raise an error. Each module describes its boundary behavior.

Use the [complete signature index](../reference/stdlib) for lookup, [Native Types](../reference/native-types-reference.md) for literals and indexers, and [Stdlib Recipes](./recipes) for small compositions.
