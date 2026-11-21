---
id: intro
title: Introduction
slug: /
---

FScript is a typed, functional scripting language for automation, standalone programs, and application rules. It combines the concise syntax of the F#/ML family with static type inference: you can write small scripts without type boilerplate, while the language checks how values and functions fit together before execution.

## A small language for useful programs

FScript programs are built from expressions, immutable values, and functions. Records describe data, unions model alternatives, and pattern matching makes each case explicit. Lists, maps, and options help you transform collections and handle missing values.

```fsharp
let quote seats =
  let pricePerSeat = if seats >= 10 then 19 else 29
  pricePerSeat * seats

quote 12
```

This script evaluates to `228`. The function's type is inferred, indentation groups its body, and the final expression supplies its result. There is no class or entry-point declaration to write.

You can use FScript to automate work, express configurable business rules, or build a standalone tool. Typed APIs let an application extend what scripts can do when the built-in language and library are not enough.

## One language, three ways to use it

| Mode | What it gives you |
| --- | --- |
| [Interpreter](./interpreter/overview.md) | An immediate edit-and-run loop and a REPL for learning, experiments, and automation. |
| [Compiler](./compiler/compilation.md) | Optimized .NET execution and standalone deployment, including native AOT. |
| [Embedded](./embedding/overview.md) | A host API for loading scripts and invoking rules inside a .NET or JavaScript application. |

Start with the interpreter. Later, choose compilation when performance or distribution matters, or embedding when your application should own the script's APIs and lifecycle. These are options for different jobs; you do not have to use all three.

## Your path through the manual

| Stage | What you will be able to do |
| --- | --- |
| [Quickstart](./learn/quickstart.md) | Install FScript and VS Code, run a script, set a breakpoint, and inspect values. |
| [Language Tour](./learn/language-tour.md) | Write functions, model data, transform collections, and organize source files. |
| [Interpreter](./interpreter/overview.md), [Compiler](./compiler/compilation.md), [Embedded](./embedding/overview.md) | Choose an execution mode and configure it for your project. |
| [Advanced](./advanced/overview.md) | Extend FScript with typed APIs, coordinate concurrent work, and control permissions. |
| [Samples](./examples/overview.md) | Practice with complete programs and progressively richer integrations. |

The Standard Library and Reference sections are lookup material whenever you need an exact function signature, option, or syntax rule.

**Next:** [Quickstart](./learn/quickstart.md). Get one script running before choosing a deployment or integration model.
