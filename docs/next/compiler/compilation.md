---
id: compilation
title: Compiler
slug: /compiler/overview
---

FScript can run inside a host application or compile into a program that runs on its own. Compilation checks the same language types, resolves imported scripts, and produces ordinary .NET code. Generated programs do not load FScript source or start an interpreter.

## Why choose the compiler?

Use the [interpreter](../interpreter/overview.md) while learning and iterating. Choose the compiler when you want optimized execution or a program to distribute without source. Compilation is an explicit build step, not a faster setting for the REPL or `ScriptHost`. Measure your workload; the .NET backend's specialization, tail-call lowering, and eligible pipeline fusion are described in [Compiler Optimizations](./compiler-optimizations.md).

If an application must load changing rules and invoke their exports under its own policy, use [Embedded](../embedding/overview.md). A standalone compiled program has its own entry point and process lifecycle.

## Choose an output

| Output | Command options | Use it when |
| --- | --- | --- |
| .NET assembly | `--target dotnet` | You want compiled execution with FScript's assembly optimizations. Run the DLL with .NET 11. |
| Self-contained executable | `--target dotnet --single-file [--runtime <rid>]` | You want one distributable executable that includes the .NET runtime. |
| Native AOT executable | `--target dotnet --aot [--runtime <rid>]` | You want dependencies trimmed and compiled into a native executable. |
| C# project | `--target csharp` | You want to inspect, edit, or integrate generated source in a .NET build. |

The [optimization guide](./compiler-optimizations.md) explains the shared passes and the additional work performed by the assembly target.

Compile settings can live in `[compile]` in the script's `fscript.toml`, so `fscript compile main.fss` needs no backend or output flags. With no settings it emits a managed .NET assembly under `bin/main/dotnet/` beside the script. Explicit CLI options override manifest values. See [Compile defaults](../reference/environment-configuration.md#compile-defaults).

## Compile a first program

Save this as `hello.fss`:

```fsharp
let name =
    match Env.Arguments with
    | first :: _ -> first
    | [] -> "world"

Console.writeLine $"Hello {name}!"
```

Compile and run it:

```sh
fscript compile hello.fss --target dotnet --output out/hello
dotnet out/hello/hello.dll Ada
```

The program writes `Hello Ada!`, followed by `()`, its final FScript result. Arguments after the assembly or executable name become `Env.Arguments`. `Env.ScriptName` contains the running assembly or executable filename.

From a checkout, replace `fscript` with `dotnet run --project src/FScript --` in these commands.

## Configuration and permissions

Use `[runtime]` in `fscript.toml` to select .NET providers and `[compile]` to set build defaults. Explicit compiler flags override those defaults; `--config` selects a manifest and `--no-config` skips it. Settings and path precedence are documented in [Environment Configuration](../reference/environment-configuration.md).

Compilation loads executable providers as trusted code and ignores valid `runtime.permissions`. The execution-only `--permissions` option is rejected by `compile`. Neither interpreter permission checks nor filesystem root restrictions are embedded in generated programs: control access with OS accounts, deployment configuration, or process/container isolation as appropriate.

A managed assembly needs a compatible .NET runtime. Self-contained publishing includes the runtime; Native AOT needs the .NET SDK, platform build tools, and AOT-compatible dependencies. These are deployment choices, not replacements for an application host's capability policy.

## Language and runtime behavior

Records, unions, tuples, lists, options, maps, closures, patterns, and recursive functions retain their FScript semantics. Equality remains structural, collections remain immutable, Boolean operators short-circuit, and top-level effects execute once in source order. An exported binding uses `export let`.

Script imports are resolved at compile time, so imported `.fss` source files do not need to be deployed. Files executed through `FScript.exec` are loaded and interpreted at runtime: deploy those child scripts and their imports within the configured root, alongside the application's managed dependencies and other input files.

Standalone applications use the process working directory and operating-system permissions. Interpreter sandbox restrictions and execution budgets are not carried into compiled binaries.

## Host integration

Both targets automatically load `fscript.toml` beside the entry script to select local .NET FFI assemblies and NuGet providers. `fscript analyze` loads the same manifest, so providers do not need to be repeated with assembly flags for either command. Manifest assembly paths resolve from its directory; `--config <path>` selects another manifest relative to the working directory, and `--no-config` disables manifest loading. Discovery checks only the entry script's directory. Existing SDK providers can run through generated adapters. Typed CLR mappings enable direct calls and make provider code suitable for trimming and Native AOT when its dependencies support them.

See [Compile to .NET](./compile-to-dotnet.md) for FFI configuration, typed bindings, publishing, and runtime identifiers, or [Compile to C#](./compile-to-csharp.md) for project layout and reference handling.

## Compiling and embedding

Compilation is an explicit CLI or compiler API operation. Running `fscript program.fss` or using ordinary `ScriptHost` embedding continues to use the AST interpreter. JavaScript embedding also remains interpreted.

The separate [IR workflow](./interpret-ir.md) produces a versioned `.fsir` artifact and executes it with the LIR interpreter. It is useful for compiler tooling and conformance work; it is not required to run compiled .NET programs.

## Check FFI task sharing before compiling

Run `fscript analyze program.fss` separately to check potential sharing of host
instances and function state across tasks. Compilation does not run this check.
The [task-sharing guide](../learn/task-sharing-analysis.md) explains the warning
codes and why a clean check is not a proof of thread safety.
