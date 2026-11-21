---
id: embedding-overview
title: Embedded
slug: /embedding/overview
---

Embed FScript when scripting is part of your application: pricing rules, customer workflows, configurable policies, or user-authored logic. Your .NET or JavaScript host loads source, inspects exported function types, and invokes exports through an API. Scripts can change without rebuilding the application; the host decides when to validate and activate an update.

This is interpreted, in-process execution. The [Interpreter CLI](../interpreter/overview.md) is useful for learning and standalone automation; [Compiler](../compiler/compilation.md) produces optimized standalone programs. Embedding is the choice when the application needs to control the script's environment and lifecycle.

## What the host controls

| Concern | Host responsibility |
| --- | --- |
| Script contract | Supply inputs, inspect exported types, invoke `export let` functions, and handle results and errors. |
| Available operations | Register typed domain APIs and host-managed values; choose which runtime functions to expose. |
| Source and imports | Choose trusted source locations and an import resolver; decide how updates are loaded. |
| Permissions and filesystem | Explicitly grant .NET host capabilities, select a root, and apply denied-path policy. |
| Configuration | Construct registrations directly, or inspect an optional manifest before loading executable providers. |
| Lifetime and resources | Manage loaded scripts, opaque resources, logging, scheduling, and resource limits. |

## Choose your host

- **.NET:** use Language and Runtime packages for `ScriptHost`, runtime externs, filesystem policy, and explicit permission registrations. Follow [Real-World Embedding](./real-world-embedding.md).
- **JavaScript / browsers / Node:** use `@magnusopera/fscript` to load source and invoke exports, supplying JavaScript externs. The package exposes the core language without the .NET runtime extern catalog. Follow [Fable and JavaScript Hosts](./fable-javascript.md).

## Permissions and configuration

.NET hosted execution starts with **no permissions**. Set explicit grants on the registration or host context. A selected manifest can narrow those grants but cannot elevate the host ceiling. Source loading and import resolution are trusted host operations; granting script `IO` is separate from the host reading a script.

A manifest is optional: an application can build its environment entirely through APIs. If you share `fscript.toml` with CLI/editor tools, inspect settings before provider loading. CLI manifests select their own interpreted grants; an embedded host retains its explicit ceiling. See [Host Permissions](./host-permissions.md) and [Embedding the same environment](../reference/environment-configuration.md#embedding-the-same-environment).

Custom handlers are trusted application code. `Native` allows providers with direct host/OS access, beyond interpreter filesystem checks. In JavaScript, the host-supplied externs and browser/Node environment determine access; do not assume the .NET runtime catalog or filesystem policy exists there.

Embedding does not itself guarantee CPU, memory, or time limits. The host owns resource governance; use process isolation where forced termination is required. Read [Sandbox and Safety](./sandbox-and-safety.md) before accepting untrusted code.

## Embedding workflow

1. Reference the Language/Runtime packages for .NET, or install the npm package for a JavaScript host.
2. Load a script with a small `export let` contract. A pure rule needs no additional APIs or permissions.
3. Inspect the exported function's type, supply inputs, and invoke it.
4. Handle results and failures, and decide how the application validates and activates script updates.

Start with the [.NET host walkthrough](./real-world-embedding.md) or [JavaScript host guide](./fable-javascript.md). When the script needs to call back into your application, continue with [Advanced: Extend FScript](../advanced/extending-fscript.md). Typed externs, asynchronous libraries, host-managed resources, and custom resolvers are extension points to add when needed.

## NuGet packages

- [`MagnusOpera.FScript.Language`](https://www.nuget.org/packages/MagnusOpera.FScript.Language)
- [`MagnusOpera.FScript.Runtime`](https://www.nuget.org/packages/MagnusOpera.FScript.Runtime)
- [`MagnusOpera.FScript.Extensibility`](https://www.nuget.org/packages/MagnusOpera.FScript.Extensibility) — independently versioned provider contracts and CLR helpers.

## Recommended reading order

1. [Real-World Embedding (Load, Resolve Type, Execute)](./real-world-embedding)
2. [Fable and JavaScript Hosts](./fable-javascript)
3. [Register Extern Functions](./register-externs) and [Create Async Libraries](./async-libraries)
4. [Host-Provided Types](./host-managed-types)
5. [Environment Configuration](../reference/environment-configuration)
6. [Resolver and Includes](./resolver-and-includes)
7. [Sandbox and Safety](./sandbox-and-safety)

## Executable graphics sample

The [FFI graphics walkthrough](../examples/ffi-graphics.md) puts geometry, camera, lighting, and animation in FScript. A typed .NET provider uploads the generated Utah teapot and renders it with OpenGL. It demonstrates script-constructible scene records, opaque window/mesh resources, typed function adapters, and editor discovery through `fscript.toml`. Run it with `fscript samples/ffi/main.fss`; use `-- --headless` to exercise the scripts without a display.

## Optional task-sharing checks

To report potential FFI sharing before interpreting, call
`ScriptHost.loadSourceWithTaskSharingAnalysis registration purity options report source`.
Use `PurityContracts.empty` and `TaskSharingAnalysis.defaults` for conservative
defaults. The `report` callback receives diagnostics before script evaluation;
hosts decide whether to log warnings or reject execution.

`loadFileWithTaskSharingAnalysis` and `loadProgramWithTaskSharingAnalysis` support
file and parsed-program loading. They reuse the resolved inference result for
interpretation. Existing loading and invocation APIs skip analysis entirely, and
there is no runtime tracking or synchronization overhead.

See [Checking FFI Task Sharing](../learn/task-sharing-analysis.md) for examples,
provider contracts, and how to interpret the warnings.
