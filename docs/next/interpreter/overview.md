---
id: overview
title: Interpreter
slug: /interpreter/overview
---

You have learned the core language; now use the interpreter for everyday execution. If you are starting here, complete [Quickstart](../learn/quickstart.md) first. The interpreter is the easiest way to get used to FScript. Write a source file, run it, and change it without a separate build step. It suits automation, small tools, experiments, and scripts whose source you want to keep editable at execution time.

The CLI parses and type-checks source before evaluating it. You get the same language types used by the compiler, with an immediate edit-and-run workflow.

## Run your first calculation

Save `pricing.fss`:

```fsharp
let quote seats = 29 * seats
quote 12
```

```sh
fscript pricing.fss
```

The CLI prints `348`, the final expression value. This calculation needs no permissions. `fscript <file>` is file execution; there is no `exec` CLI subcommand. Follow [Quickstart](../learn/quickstart.md) for installation and a longer example.

## Choose how to work

| Input | Command | Use it for |
| --- | --- | --- |
| Source file | `fscript pricing.fss` | Repeatable scripts, including multi-file programs with imports. |
| Interactive session | `fscript` | Exploring expressions and keeping bindings across submissions. |
| Piped source | `cat pricing.fss \| fscript` | Feeding source from another tool. |

Stdin and REPL submissions do not resolve file imports. The [running guide](./running-scripts.md) explains arguments, output, shell status, and debugging.

## Make effects explicit

Interpreted execution defaults to **no permissions**, including the REPL and debugger. Pure functions are available immediately. Grant `IO` for console output and built-in filesystem operations, `IO,Interactive` for terminal input, `Threading` for task operations, `Native` for external providers or child programs, and `Network` for [HTTP requests](../stdlib/http).

For example, a script that calls `Console.writeLine` needs:

```sh
fscript --permissions IO report.fss
```

Use [Configuration and Permissions](./configuration-and-permissions.md) to select the script root, grant capabilities, and configure providers. A permission grant does not remove built-in filesystem root restrictions; `Native` trusts arbitrary provider code with OS access.

## When another mode fits better

Choose [Compiler](../compiler/compilation.md) when optimized execution or a distributable binary matters. Compilation is explicit; interpreting a script never silently compiles it.

Choose [Embedded](../embedding/overview.md) when your application should load scripts, provide domain APIs, and invoke exports under a policy it owns. Embedding uses the interpreter through a host API rather than launching the CLI for each call.
