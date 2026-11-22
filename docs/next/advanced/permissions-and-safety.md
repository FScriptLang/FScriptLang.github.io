---
id: permissions-and-safety
title: Permissions and Safety
slug: /advanced/permissions-and-safety
---

Choose the policy for the environment that actually runs your code. The language is shared, but a CLI invocation, a compiled executable, and an embedded rule have different owners and trust boundaries.

| Mode | Who selects access? | Boundary |
| --- | --- | --- |
| Interpreter CLI | CLI options and the selected `fscript.toml`; default is no permissions. | Script capability checks and built-in filesystem root checks. `Native` trusts code outside those checks. |
| Compiler | The build loads providers as trusted code; generated programs use OS permissions. | Interpreter grants and root restrictions do not become a compiled sandbox. |
| Embedded .NET | The application grants capabilities on registrations and owns resource policy. | A manifest may narrow the explicit host ceiling, never raise it. |
| Embedded JavaScript | The application exposes externs in its browser or Node environment. | The .NET runtime extern catalog and filesystem policy are not provided by the npm host. |

## Start with the operations you need

Pure calculations require no permission grants. Console output and built-in filesystem operations need `IO`; terminal input also needs `Interactive`. Task operations need `Threading`. External provider loading, SDK/FFI calls, and child programs need `Native`. Outbound [HTTP requests](../stdlib/http) need `Network`.

The [Interpreter configuration guide](../interpreter/configuration-and-permissions.md) explains command-line and manifest selection. [Host Permissions](../embedding/host-permissions.md) gives the precise checks and registration APIs for .NET embedders. Compilation rejects the execution-only `--permissions` flag and ignores valid `runtime.permissions`.

## Capabilities and resource governance are different

A root and denied-path policy constrain supported built-in filesystem operations. They do not confine arbitrary native providers. Trusted source loading and import resolution are host plumbing, separate from granting a script filesystem I/O.

Permissions do not impose CPU, memory, or wall-clock limits. The host must manage resources and use process isolation when termination must be guaranteed. Opaque host-managed values hide private payloads but do not automatically dispose or isolate resources.

Use [Sandbox and Safety](../embedding/sandbox-and-safety.md) for the practical hosting model. When resources are shared across tasks, also read [Checking FFI Task Sharing](../learn/task-sharing-analysis.md); a clean analysis is not a proof of thread safety.
