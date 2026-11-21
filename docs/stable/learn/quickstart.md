---
id: quickstart
title: Quickstart
slug: /learn/quickstart
---

Start with one small script and one familiar workflow: edit, run, inspect, change. By the end of this section, you will have FScript working in VS Code and will have stepped through a function in the debugger.

| Step | What you will do | Success looks like |
| --- | --- | --- |
| [Install FScript and VS Code](./editor-setup.md) | Install the CLI and editor extension, then open a working folder. | `fscript version` works and VS Code recognizes `.fss` files. |
| [Run Your First Script](./first-script.md) | Write a pricing calculation, run it, and change its inputs. | The terminal prints `228`; a deliberate type mistake produces a diagnostic. |
| [Debug in VS Code](./debugging.md) | Set a breakpoint, inspect arguments, and step back to the caller. | You can explain where the result came from. |

You do not need a project file, manifest, external library, or application host for these steps. The sample uses pure calculations, so it needs no permission grants.

> **Try the language before installing:** the [browser playground](/sandbox) lets you evaluate small examples immediately. Local VS Code debugging uses the installed CLI; it is the final step of this quickstart.

**Start:** [Install FScript and VS Code](./editor-setup.md). After debugging your first script, continue with the [Language Tour](./language-tour.md).
