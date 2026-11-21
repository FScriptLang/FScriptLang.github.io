---
id: host-permissions
title: Host Permissions
slug: /embedding/host-permissions
---

Hosted interpreter execution starts with **no permissions**. The host selects a policy for each registration; scripts and extension providers cannot grant themselves permissions. Interpreted CLI execution also defaults to none, with grants selected through `--permissions` or `fscript.toml`. Compilation and generated code remain unrestricted.

| Permission | Allows |
| --- | --- |
| <span id="none" className="permission-definition"><code>None</code></span> | Pure built-ins and registered functions declaring no capabilities. |
| <span id="io" className="permission-definition"><code>IO</code></span> | Built-in filesystem operations, console output, and host entropy through `Guid.new`. |
| <span id="interactive" className="permission-definition"><code>Interactive</code></span> | Terminal input; `Console.readLine` additionally requires `IO`. |
| <span id="threading" className="permission-definition"><code>Threading</code></span> | Every `Task.*` and `Mailbox.*` operation, plus `FScript.exec`. |
| <span id="native" className="permission-definition"><code>Native</code></span> | External provider loading, calls to SDK/FFI functions, and launching child programs through the built-in `Process.exec` function. This grants trust in code with host OS access. |

`Native` is a trust boundary: arbitrary provider code and child programs can access the host directly, so they are not confined by the interpreter's filesystem, IO, or threading checks. SDK 3 `ExposeAsync` registers library I/O without worker scheduling; the host tracks it and joins pending operations at scope exit. Native code that starts detached work outside that API remains the provider/host's responsibility. Built-in implementation details such as `Math` calling the BCL do not require `Native`.

## Configure the runtime host

```fsharp
open FScript.Language
open FScript.Runtime

let context =
    { HostContext.create workspaceRoot with
        Permissions = HostPermissions.IO ||| HostPermissions.Threading
        DeniedPathGlobs = [ ".git" ] }
let registration = Registry.registration context
let loaded =
    ScriptHost.loadSourceWithRegistration registration
        "export let run () = Task.fromResult 42 |> Task.await"
let result = ScriptHost.invoke loaded "run" [VUnit]
```

`Registry.all context` filters standard externs using the context's grants. `Registry.registration context` also attaches those grants to the execution registration. Lexical `Path` and string-only `Glob` remain available without `IO`. Filesystem permission never removes `RootDirectory`, symlink checks, or `DeniedPathGlobs` restrictions.

## Register functions explicitly

Language-level `ExternalFunction` descriptors declare `RequiredPermissions`. `HostInterop.empty` and `HostInterop.ofExterns` grant `None`; use `HostInterop.ofExternsWithPermissions permissions functions` or `HostInterop.withPermissions permissions registration` to grant capabilities. Permission requirements are independent of compiler purity and thread-safety contracts. A trusted host may explicitly declare a pure handler as requiring `None`; the interpreter cannot inspect arbitrary handler code to infer effects.

SDK `ExternalFunction` record layouts are unchanged. `ExtensionBridge.toLanguageRegistration` grants no capabilities and classifies provider-owned functions as requiring `Native`. Forwarded default functions preserve their declared requirements. Use `ExtensionBridge.toLanguageRegistrationWithPermissions permissions registration` to supply the host's grants. Providers only receive the default functions the host supplied; their SDK `HostContext` has no authority to grant permissions.

`EnvironmentLoader.load` and `loadWithInfo` default to no capabilities. Their `loadWithPermissions` and `loadWithInfoAndPermissions` variants take explicit grants. Configured provider code cannot be loaded without `Native`; manifest selections are intersected with explicit host grants and cannot elevate that ceiling. CLI manifests can select Native.

## Enforcement and lifetimes

Denied externs are removed before `ScriptHost` type inference. Calls are checked again at execution, including returned callables, callback application, SDK default forwarding, and canonical task operations. SDK 3 async I/O exposure requires no additional `Threading` grant. Script `Task.*` operations still require it, including awaiting. The SDK context has no spawning or awaiting methods; see [Create Async Libraries](./async-libraries).

`LoadedScript` retains its policy for every exported-function invocation. Direct Language hosts use `Eval.invokeValueWithPermissionsAndExitCode permissions typeDefs functionValue arguments`; the shorter `invokeValueWithExitCode` defaults to none. REPL state retains the policy across submissions. `DebugLaunch.create` also defaults to none; embedding launchers can use `createWithPermissions`, while CLI/editor debugging selects manifest grants and defaults to none. Tasks share the same immutable grants, are joined before the invocation returns, and contribute fatal failures to the final error report.

Permissions govern script operations. Host-controlled source loading and import resolvers are trusted host plumbing and may read source without granting script IO. Root/import checks remain in effect. CPU, memory, timeouts, and forced termination still require host governance.

## Migration

The Language/Runtime host API now requires permission declarations on native function descriptors, a policy on native registrations and runtime contexts, and `CheckPermissions` on custom native call contexts. Existing extern-list loading APIs remain default-deny. Use `ScriptHost.loadSourceWithPermissions` or `loadFileWithPermissions` for explicit grants, or switch to registration-based loading for includes and custom types. SDK 3 separately changes the invocation-context ABI: hosts and providers must rebuild for `Apply`, `ExposeAsync`, and `CheckRuntime`; [migration guidance](./async-libraries#migration-from-sdk-2) explains the removed APIs. Embedding manifests can only narrow explicit host grants; CLI manifests select permissions as trusted configuration. Providers cannot grant permissions.

`FScript.exec` loads child source and imports without IO inside the inherited/narrowed root. Child grants are selected from the active invocation, and requests for additional capabilities fail. Children rebuild standard functions for their sandbox and inherit no custom providers; see the [FScript module](../stdlib/fscript).

## Interpreter permission selection

Interpreted file execution, stdin, REPL, debugging, and static analysis default
to no permissions. Select an exact set on the command line:

```sh
fscript --permissions IO,Threading script.fss
fscript --permissions All script.fss
fscript analyze --permissions IO,Threading script.fss
```

Or declare the permissions in the selected manifest:

```toml
[runtime]
permissions = ["IO", "Threading"]
```

Explicit CLI permissions replace the manifest list; otherwise the manifest list
applies, falling back to `None`. `--no-config` ignores the manifest. Names are
case-insensitive: `Interactive`, `Threading`, `IO`, `Native`, `All`, and `None`.
`All` and `None` must stand alone. TOML `[]` explicitly grants nothing. Unknown
names, wrong value types, and empty comma-separated CLI entries are errors,
validated before package restoration or provider initialization.

An automatically discovered manifest is trusted CLI configuration. A manifest
containing `Native` can authorize arbitrary provider code and child programs;
review configuration alongside scripts before running an unfamiliar repository.
Provider loading requires Native even when selected with `--extern-assembly`.

For embedding hosts, `EnvironmentLoader.loadWithPermissions` and
`loadWithInfoAndPermissions` intersect manifest permissions with explicit host
grants. Omitted manifest permissions preserve those grants; default loader APIs
still grant nothing. A manifest cannot elevate a host's permission ceiling.
Direct registrations continue using their explicit host context.

Editor diagnostics use the selected script policy. Workspace trust is an
additional prerequisite for loading providers. Invalid or failed environments
do not restore an unrestricted catalog. Debugger launches use selected manifest
grants, defaulting to None; embedded launches retain their explicit host ceiling.

Compilation ignores valid `runtime.permissions`: its catalog, provider loading,
and generated code remain unrestricted. `--permissions` is an execution/analysis
option and is rejected by `compile`. Malformed configuration remains an error.
For migration, `--permissions All` retains previous CLI execution behavior;
prefer declaring the permissions a script actually needs.
