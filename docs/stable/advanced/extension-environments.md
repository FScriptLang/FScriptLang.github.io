---
id: extension-environments
title: Extension Environments in VS Code
slug: /advanced/extension-environments
---

Use this guide after [extending FScript](./extending-fscript.md) when the editor must understand functions and types provided by your .NET libraries. Ordinary scripts need only the [basic editor setup](../learn/editor-setup.md).

## Configure providers

For functions supplied by a .NET assembly, add a workspace environment manifest:

```toml
[runtime]
permissions = ["Native"]
extern-assemblies = ["./extensions/AppExterns.dll"]
```

The assembly must contain an [extern provider](../embedding/register-externs#assembly-providers-for-cli-and-editor). Its registered schemes and host-type descriptors drive diagnostics, completion, hover, signature help, and inlay hints. Host-managed values expose only their declared visible fields.

Automatic selection uses the `fscript.toml` beside each script, or the nearest parent manifest inside its workspace folder. Different sample directories can use their own environments without manual switching. Use **FScript: Select Configuration** to override this for the whole folder. The picker includes **No configuration** and **Automatic selection**; each workspace folder has an independent persisted choice. A nonempty folder setting `fscript.config` overrides the picker, and the configuration status item shows the effective choice. Explicit selections apply to all files in the folder. Automatic environments use separate processes and never merge manifests.

Workspace trust is required to execute provider registration. Restricted Mode keeps default analysis available. Saved manifest changes and provider DLL changes restart only the affected environment server and reanalyze open buffers. Failed initialization reports manifest diagnostics and removes stale configured signatures.

Run the same manifest in a terminal with `fscript --config ./fscript.toml hello.fss`. VS Code REPL commands do not automatically adopt the selection. See [Environment Configuration](../reference/environment-configuration) for precedence, root defaults, multi-root workspaces, and DLL replacement on Windows.

Provider loading requires `Native`. Add `IO` or `Threading` only if the script also uses operations requiring them. An embedding host retains its explicit permission ceiling; a CLI manifest selects interpreted CLI grants.

Extension development and packaging belong to the [VS Code extension repository](https://github.com/FScriptLang/vscode-extension). Use its contributor instructions when changing the extension itself.
