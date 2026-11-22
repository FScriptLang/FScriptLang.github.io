---
id: editor-reference
title: VS Code Settings and Commands
slug: /reference/editor
---

For installation and a first session, see [Editor Setup](../learn/editor-setup). For configuration discovery, precedence, trust, and reload rules, see [Environment Configuration](./environment-configuration).

## Settings

Defaults below are shipped by the extension. Resource settings resolve in the owning workspace folder; a nested workspace folder owns its documents independently.

| Setting | Default | Meaning |
| --- | --- | --- |
| `fscript.lsp.enabled` | `true` | Enable the FScript language server features (completion, navigation, diagnostics, inlay hints). |
| `fscript.inlayHints.enabled` | `true` | Enable inlay hints provided by the FScript language server. |
| `fscript.hoverHints.enabled` | `true` | Enable hover hints provided by the FScript language server. |
| `fscript.cli.path` | `""` | CLI executable or `fscript.dll` for Run Current Script, debugging, and Test Explorer. Empty uses `fscript` on PATH. Relative file paths use the owning workspace folder, or script directory for standalone files. DLLs run through `dotnet` on PATH. |
| `fscript.server.path` | `""` | Optional path to a custom FScript.LanguageServer.dll; empty downloads a supported released server. Relative paths are resolved from the workspace folder, or extension directory for standalone files. |
| `fscript.server.version` | `""` | User-level exact supported server version pin. Empty uses the newest cached supported server and offers upgrades. |
| `fscript.server.logLevel` | `"info"` | Requested language server log level sent through initialization options. |
| `fscript.repl.command` | `"auto"` | Shell command used to launch the FScript REPL terminal. Use 'auto' to prefer local workspace CLI via dotnet run, then fallback to 'fscript'. |
| `fscript.config` | `""` | Environment configuration path, relative to this workspace folder. Overrides the saved configuration selection. |

`fscript.server.logLevel` accepts `error`, `warn`, `info`, or `debug`. `fscript.config` is a manifest path, not an executable. A nonempty setting overrides persisted UI selection; clear it to use the selection command again.

Workspace trust is required for REPL execution and configured providers. Workspace-defined CLI/server/REPL settings are restricted in untrusted workspaces. Default static analysis remains available. The REPL commands do not forward the selected manifest; execute the CLI with `--config` to use that environment.

## Commands

All commands appear in the Command Palette under **FScript**.

| Command | Identifier | Purpose |
| --- | --- | --- |
| Check for Language Server Updates | `fscript.checkLanguageServerUpdates` | Check for server upgrades or a required extension update. |
| Show Language Server Output | `fscript.showLanguageServerOutput` | Open server logs and startup failures. |
| View AST | `fscript.viewAst` | Display the parsed syntax tree for the active document. |
| View Inferred AST | `fscript.viewInferredAst` | Display the inferred syntax tree using the owning document environment. |
| Open REPL | `fscript.openRepl` | Start an FScript terminal session. |
| Send Selection to REPL | `fscript.sendSelectionToRepl` | Send the selected source to the REPL. |
| Execute Current Script in REPL | `fscript.executeCurrentScriptInRepl` | Send the current script to the REPL. |
| Run Current Script | `fscript.runScript` | Run the active saved script using the selected CLI and environment. |
| Debug Current Script | `fscript.debugScript` | Debug the active saved script using the same launch provider as F5. |
| Discover Generated Tests | `fscript.discoverGeneratedTests` | Initialize test files to list cases registered at runtime. Requires workspace trust. |
| Select Configuration | `fscript.selectConfiguration` | Select automatic discovery, a manifest, or no configuration for a workspace folder. |

The configuration status item shows the effective selection and its source or failure. Server health/output access is separate. A saved manifest or provider DLL change restarts only the affected environment server and resynchronizes open buffers. A custom server path must point to a compatible language-server assembly.

## Language-server installation and updates

The extension downloads a supported server from FScript GitHub Releases on first use and acquires the required .NET runtime. Later activations start the cached server and check for updates in the background. Accept **Update Language Server** to install a newer compatible release, then reload when convenient. If the latest server requires a newer extension, choose **Update Extension**. Existing server installations are not upgraded silently.

Previous server versions remain cached. Set `fscript.server.version` in user settings to an exact supported version to pin or roll back; clear it to receive upgrade offers again. Cached installations work offline. A custom `fscript.server.path` bypasses managed server installation and startup update checks for that server. Run **FScript: Check for Language Server Updates** for an explicit check, or inspect **FScript: Show Language Server Output** when a background check fails.

Server installation happens on the extension host, including remote development hosts. Updating the language server never installs or changes the CLI used for running, testing, REPL, or debugging.

## Run a script with its selected environment

**FScript: Run Current Script** saves the active file and starts a fresh CLI process using that document's workspace-folder configuration selection (including explicit none, setting overrides, and missing selected paths). It requires workspace trust and a saved file. The command uses `fscript.cli.path` when configured, otherwise `fscript` from PATH. Arguments are passed directly without shell interpolation. Imports resolve through normal CLI file loading; CLI root defaults apply. With no selected editor environment, the command passes `--no-config` so CLI discovery cannot override the editor’s default or explicit-none choice. REPL execution commands remain separate and do not forward configuration. Automatic REPL launch passes `--no-config` to preserve its default environment; custom REPL commands execute exactly as configured.

## Debugger

**FScript: Debug Current Script** launches the active saved FScript file through
the same debug configuration provider as F5. It is available in the Command
Palette and the FScript editor context menu.

F5 launches the CLI selected by `fscript.cli.path` (default: `fscript` on PATH)
with the owning folder's selected environment.
Debugging supports source/inline breakpoints, expression stepping, logical task
control, read-only variables, and safe watches. It requires workspace trust and
saved source. See [Debugging](../learn/debugging.md) for launch configuration,
native callback behavior, and limitations.


## Test Explorer

The Testing view provides **Run**, **Debug**, and **Run with Profiling** for FScript tests. Ordinary run output and the opt-in timing report appear in **Test Results**. Debug output goes to the integrated terminal. Test runs read the owning workspace folder's manifest by default. The editor's selected per-script environment applies to Run Current Script and ordinary F5 launches. See [Run tests in VS Code](../interpreter/testing.md#run-tests-in-vs-code).
