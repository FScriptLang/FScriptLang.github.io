---
id: async-libraries
title: Create Async Libraries
slug: /embedding/async-libraries
---

A library exposes an asynchronous operation; the script decides when to await
its result or combine it with other operations. Most library functions can stay
synchronous. SDK 3 adds one capability for functions that need asynchronous I/O:

```fsharp
ExposeAsync : (CancellationToken -> Task<ScriptValue>) -> ScriptValue
```

:::info FScript 0.95 uses SDK 3

This guide uses `MagnusOpera.FScript.Extensibility` 3.0.0. SDK 3 removes the
provider spawning/awaiting APIs and old context constructors. Rebuild SDK 2
providers and hosts against SDK 3; see [Migration from SDK 2](#migration-from-sdk-2).

:::

## Divide responsibilities

| Library | Script | Host |
| --- | --- | --- |
| Describe the function's argument and result types. | Call the function to begin I/O. | Invoke the I/O factory directly and return an opaque script task. |
| Return a platform `Task<ScriptValue>` from the I/O factory. | Compose results with `Task.continueWith`, `Task.whenAll`, or other task functions. | Track completion, errors, cancellation, and scope cleanup. |
| Pass the cancellation token into I/O and release operation resources. | Choose explicit awaiting with `Task.await` or `Task.awaitAll`, and use `Task.spawn` for script work when wanted. | Own permissions and authenticate script task handles. |

`ExposeAsync` calls the factory inline: it does not queue a worker, spawn a
thread, or wait for completion. The factory must return promptly. Use the
platform's asynchronous I/O APIs rather than `.Result`, `.Wait()`,
`GetAwaiter().GetResult()`, or `Task.Run` around a blocking operation.

A .NET `task { ... }` expression describes the operation and its continuations;
it does not ask FScript to spawn script work. Synchronous CPU-bound functions
can remain synchronous: scripts can put their calls inside `Task.spawn` when
parallel script execution is appropriate.

## Declare an async provider

Create a .NET library that references the extension SDK. Library projects need
no reference to FScript.Language, FScript.Runtime, or the compiler:

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>netstandard2.1</TargetFramework>
  </PropertyGroup>
  <ItemGroup>
    <Compile Include="Provider.fs" />
    <PackageReference Include="MagnusOpera.FScript.Extensibility" Version="3.0.0" />
  </ItemGroup>
</Project>
```

Use a manual descriptor for async functions. `HostFunctions.create` derives
signatures for synchronous typed handlers; it does not automatically marshal
.NET tasks.

This complete `Provider.fs` exposes `AsyncText.read : string -> string task`:

```fsharp
namespace Example.AsyncText

open System.IO
open FScript.Extensibility

module private Functions =
    let read : ExternalFunction =
        { Name = "AsyncText.read"
          Scheme = Forall([], TFun(TString, TTask TString))
          Arity = 1
          Impl = fun context arguments ->
              match arguments with
              | [VString path] ->
                  context.ExposeAsync(fun cancellation -> task {
                      let! text = File.ReadAllTextAsync(path, cancellation)
                      return VString text
                  })
              | _ ->
                  raise (ExtensionException("AsyncText.read expects a file path.")) }

type AsyncTextProvider =
    [<FScriptExternProvider>]
    static member Provide() : ExtensionRegistration =
        { HostInterop.empty with Functions = [Functions.read] }
```

The `Impl` handler immediately returns the script task supplied by the host.
The factory returns a .NET task whose eventual result is `VString text`.
`TTask TString` describes that eventual script result. Do not construct a
`VTask` with your own handle or wrap the operation in a provider worker.

Provider registration only declares the function. Reading starts when the
script calls `AsyncText.read`, not while the host loads provider metadata.

:::note File access and trust

This example uses host OS file access and requires the host to trust the
provider with `Native`. The interpreter's filesystem root and deny rules do
not sandbox this file read. Relative paths here resolve against the process
working directory. `HostContext.RootDirectory` is not an automatic
containment policy for library I/O. The built-in sandboxed `Fs` functions remain
in Runtime for hosts that do not grant native-provider privileges.

:::

## Load the provider and await in the script

Build the assembly and select it explicitly, for example in `fscript.toml`:

```toml
[runtime]
extern-assemblies = ["./extensions/AsyncText.dll"]
```

The DLL name follows your project's assembly name. Copy its dependencies beside
it, or distribute the provider as a [NuGet extension package](./register-externs#distribute-through-nuget).
The same manifest supplies execution and editor signatures; VS Code requires
workspace trust before executing the provider. See [Environment Configuration](../reference/environment-configuration).

The script can continue between starting I/O and explicitly awaiting it:

```fscript
let pending = AsyncText.read "message.txt"
let answer = 40 + 2
let text = Task.await pending
(String.length text, answer)
```

Multiple calls can expose several pending operations without `Task.spawn`:

```fscript
let pending = ["first.txt"; "second.txt"] |> List.map AsyncText.read
let texts = Task.awaitAll pending
texts |> List.map String.length
```

The script task API owns awaiting and composition. A library may accept and pass
opaque task values through a registration, but SDK 3 has no operation for the
library to await a script task. See [Task](../stdlib/task) for script-side behavior.

## Cancellation, faults, and lifetime

Pass the supplied `CancellationToken` into the asynchronous I/O API. Do not
replace it with `CancellationToken.None`, swallow cancellation as a successful
result, or detach work that the host cannot track.

Invocation contexts expire when `Impl` returns. The I/O factory receives its
cancellation token during that invocation; its later continuations should use
that token and captured operation data, rather than retain `context` or call
`context.Apply` after returning. Opaque handles remain host-owned and
session-bound.

An I/O fault remains a task failure. Return an option or union for expected
absence or recoverable failure only when that outcome is part of your declared
API. Async I/O is observable: do not mark it as a pure function for the compiler.

The host joins tracked pending I/O before an invocation ends, including after
foreground failure or cooperative cancellation. Omitting `Task.await` does not
detach the operation. Propagate cancellation and bound external operations where
appropriate; unbounded I/O can otherwise keep scope cleanup waiting.

## Permissions

| Action | Hosted interpreter grant |
| --- | --- |
| Load an external provider or call its SDK functions | `Native` |
| Expose library async I/O with `ExposeAsync` | No additional `Threading` grant |
| Call script `Task.*` functions, including awaiting and composition | `Threading` |
| Use built-in filesystem or console output | `IO`, independently of provider trust |

A host may grant `Native` without `Threading`: library I/O can start and remain
tracked, while script task operations stay unavailable. This does not grant a
native provider a sandbox: `Native` still trusts executable host code. Permission
grants come only from the host, never a provider, manifest, or purity declaration.
See [Host Permissions](./host-permissions).

Automatically supplied `HostContext.DefaultFunctions` omit functions requiring
`Threading`, including Task, Mailbox, and child-script execution. Runtime services
keep their internal scheduling private; library authors use `ExposeAsync` for I/O.

## Migration from SDK 2

SDK 3 uses assembly identity `3.0.0.0` and one `ExternalCallContext` constructor
with `apply`, `exposeAsync`, and `checkRuntime` callbacks. Embedding hosts provide
those callbacks; ordinary libraries consume the host-supplied context.

| Previous SDK API | SDK 3 approach |
| --- | --- |
| `SpawnTask` or `SpawnWorker` in a provider | Keep ordinary handlers synchronous, or expose actual async I/O with `ExposeAsync`; scripts request task spawning. |
| `AwaitTask` in a provider | Return or pass the script task value; scripts await it. |
| Four- and five-argument context constructors | Rebuild host adapters for the three-argument SDK 3 constructor. |

SDK 2 binaries cannot bind to an SDK 3 host. Update the package reference and
rebuild providers and embedding adapters. Synchronous `HostFunctions.create`
handlers and the descriptor/value model remain available.

Runtime's built-in [Process module](../stdlib/process) uses the same SDK 3 async
bridge for process I/O. It requires Native for execution and leaves script
spawning and awaiting under the script's separate Threading permission.
