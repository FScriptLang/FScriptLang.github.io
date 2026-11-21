---
id: editor-setup
title: Install FScript and VS Code
slug: /learn/editor-setup
---

You will install the command-line interpreter and prepare VS Code to edit and debug `.fss` files. If you already use VS Code, keep your existing installation.

## Install FScript

Choose one installation route.

### Homebrew on macOS

```sh
brew install magnusopera/tap/fscript
```

### .NET tool on supported platforms

Install the [.NET 11 SDK](https://dotnet.microsoft.com/download) first, then install the global tool:

```sh
dotnet tool install --global MagnusOpera.FScript
```

Check the installation in a new terminal:

```sh
fscript version
```

You should see the installed version. If the command is not found, reopen the terminal and check that the installation's executable directory is on `PATH`. For the global .NET tool, this is normally `$HOME/.dotnet/tools` on macOS/Linux or `%USERPROFILE%\.dotnet\tools` on Windows.

> **Next and your installed version:** this manual describes Next. Package managers normally install the published release; unreleased features may not be available yet. The pure first script below is a starting point shared with Stable. Use the version selector for your installed release's contracts.

## Install VS Code and the FScript extension

1. [Download and install VS Code](https://code.visualstudio.com/docs/getstarted/overview) for your operating system.
2. Open **Extensions** in VS Code and search for **FScript**. Install the [MagnusOpera FScript extension](https://marketplace.visualstudio.com/items?itemName=MagnusOpera.fscript). It is also available on [Open VSX](https://open-vsx.org/extension/MagnusOpera/fscript).
3. Allow the extension's .NET runtime acquisition to finish if requested. It can also use `dotnet` from `PATH`. The CLI installed above is needed separately for local execution and debugging.
4. Create a folder named `fscript-start`, then use **File → Open Folder** to open it. Trust this folder you created so local debugging is enabled.
5. Use **Terminal → New Terminal** and confirm that `fscript version` works there too.

The extension provides syntax highlighting, inferred-type hovers, completion, diagnostics, and debugging. You do not need a `fscript.toml` file for this quickstart.

## Check the editor

Create and save an empty `pricing.fss` file. Confirm that VS Code's language mode is **FScript**. In the next step you will fill it with a function and use hover and diagnostics to check your work.

If language features do not start, run **FScript: Show Language Server Output** from the Command Palette to inspect the error. The [Editor Reference](../reference/editor-reference.md) lists settings and commands. Configuring external providers belongs to [Advanced: Extension Environments](../advanced/extension-environments.md).

**Next:** [Run Your First Script](./first-script.md).
