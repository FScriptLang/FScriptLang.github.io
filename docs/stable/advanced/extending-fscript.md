---
id: extending-fscript
title: Extend FScript with Host APIs
slug: /advanced/extending-fscript
---

Extend FScript when a script needs an operation the language and standard library do not provide: a database query, a numerical library, an application service, or a graphics resource. The script calls a typed function; trusted host code implements it. This boundary is often called FFI (foreign-function interface).

You do not need a provider to write functions, records, unions, or multi-file FScript programs. Those are language features. An extension adds operations and types to an execution environment.

## Choose the integration boundary

| Environment | How to extend it |
| --- | --- |
| Interpreted CLI scripts | Configure a .NET assembly provider or NuGet provider in `fscript.toml`; grant `Native` for loading and calls. |
| Compiled .NET programs | Select .NET providers during compilation; typed CLR mappings support direct calls and compatible AOT publishing. |
| Embedded .NET application | Register typed functions and host-managed values directly, or inspect and load configured providers under the host's explicit grants. |
| JavaScript application | Supply typed JavaScript externs through the npm host API; the .NET provider catalog is not included. |

## Add functions before resources

Start with a small operation over ordinary script values: records, strings, numbers, or lists. Its declared type gives FScript enough information to check calls and gives the editor completion and hover information.

1. Follow [Register Extern Functions](../embedding/register-externs.md) for .NET function contracts, assembly providers, and typed CLR bindings.
2. Use [Create Async Libraries](../embedding/async-libraries.md) when a library exposes asynchronous I/O. Script-side task coordination is a separate concern.
3. Use [Host-Provided Types](../embedding/host-managed-types.md) for values that carry opaque resources or private application state. The host owns their lifetime and synchronization.
4. Set up [Extension Environments in VS Code](./extension-environments.md) so editor diagnostics use the same configured APIs.

For JavaScript externs, follow [Fable and JavaScript Hosts](../embedding/fable-javascript.md). For compiler-specific integration, follow [Compile to .NET](../compiler/compile-to-dotnet.md#existing-ffi-providers).

## Treat providers as trusted code

`Native` is trust in executable code with host/OS access. Interpreter filesystem checks do not confine arbitrary provider code. Declare a narrow script-facing API, inspect configuration before loading providers, and use [Permissions and Safety](./permissions-and-safety.md) to understand each mode's boundary.

Host-controlled source loading is a separate extension point. Use [Resolver and Includes](../embedding/resolver-and-includes.md) when source comes from memory, a database, or another application-owned location.

**Try it:** the [FFI graphics walkthrough](../examples/ffi-graphics.md) combines ordinary script records, opaque resources, and typed .NET calls in a complete application.
