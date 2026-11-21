---
id: configuration-and-permissions
title: Configuration and Permissions
slug: /interpreter/configuration-and-permissions
---

The CLI owns the interpreted script's environment. Use command-line options for one run, or keep repeatable settings in `fscript.toml` beside the entry script. Imported source uses that same environment.

## Select configuration

```sh
fscript scripts/report.fss
fscript --config ./tools/fscript.toml scripts/report.fss
fscript --no-config scripts/report.fss
```

Automatic discovery checks only the entry script's directory; stdin and REPL check the current directory. It does not search parents. `--config` selects a manifest explicitly; `--no-config` disables it. Combining them is an error.

Manifest paths resolve from the manifest directory. Explicit CLI paths resolve from the working directory. Settings apply in order: runtime defaults, manifest values, then explicit CLI options. Invalid configuration or failed provider initialization stops execution.

## Grant only the capabilities required

No permissions are granted by default. Select an exact set:

```sh
fscript --permissions IO,Threading report.fss
```

Or save it in the selected manifest:

```toml
[runtime]
root = "."
permissions = ["IO", "Threading"]
default-externs = true
```

| Grant | Use it for |
| --- | --- |
| `None` | Pure built-ins and functions requiring no capabilities; the default. |
| `IO` | Built-in filesystem operations, console output, and `Guid.new`. |
| `Interactive` | Terminal input; `Console.readLine` also needs `IO`. |
| `Threading` | `Task.*`, `Mailbox.*`, and `FScript.exec`. |
| `Native` | External provider loading and SDK/FFI calls, plus child programs through `Process.exec`. |
| `All` | Every permission; use only when you intend to trust all these operations. |

Names are case-insensitive. `All` and `None` must stand alone; TOML `[]` explicitly grants nothing. CLI `--permissions` **replaces** the manifest list. `--no-config` ignores manifest grants. The same selection applies to `analyze`; debugging uses selected manifest grants.

## Filesystem root and native trust

Without an explicit root, file execution uses the entry script's directory; stdin and REPL use the working directory. Set `runtime.root` or override it with `--root <path>` to select another root. Built-in filesystem operations retain root and symlink checks even with `IO`.

`Native` grants trust in arbitrary .NET/native code and child processes. Their operations are not confined by interpreter filesystem or threading checks. An automatically discovered manifest is trusted CLI configuration and can select `Native`; review it alongside an unfamiliar script. Permissions do not impose CPU, memory, or wall-clock limits.

## Add .NET libraries

Configure NuGet providers or local assemblies when scripts need typed external APIs:

```toml
[runtime]
root = "."
permissions = ["IO", "Native"]
extern-assemblies = ["./extensions/AppExterns.dll"]

# Alternatively add a NuGet provider:
# [[runtime.packages]]
# name = "Your.Provider.Package"
# version = "1.2.3"
```

Provider loading requires `Native`. CLI package restoration is automatic; pin an exact package version for repeatability. `--extern-assembly` adds a local provider for one run. `--no-default-externs` removes runtime default externs while retaining the core library; it does not create an OS sandbox.

The [Environment Configuration reference](../reference/environment-configuration.md) covers package resolution, all settings, and editor selection. VS Code has its own nearest-containing-manifest discovery and requires workspace trust before loading providers; it does not use the CLI's beside-entry-only discovery.

## Moving to another mode

`[compile]` settings do not affect interpretation. Compilation ignores valid `runtime.permissions`, rejects `--permissions`, and produces programs governed by OS permissions. Read [Compiler](../compiler/compilation.md) before treating an interpreted script's policy as a deployment guarantee.

For [Embedded](../embedding/overview.md), the application supplies explicit grants and owns source resolution. Optional manifest permissions can narrow that host ceiling, never raise it.
