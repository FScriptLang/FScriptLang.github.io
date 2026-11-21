---
title: Debug in VS Code
---

Use the saved `pricing.fss` from [Your First Script](./first-script.md). Keep the final call as `quote 12` and the discount threshold as `10`. You will stop inside the function and inspect how it computes `228`.

## Set a breakpoint

Click the gutter beside `pricePerSeat * seats` to add a breakpoint. This is the multiplication inside `quote`, after the price has been selected.

Press **F5** and choose **FScript** if VS Code asks for a debugger. You can also run **FScript: Debug Current Script** from the Command Palette. The debugger launches the saved script through the installed CLI.

## Inspect the calculation

When execution stops at the breakpoint:

1. Open **Variables → Locals**. Find `seats` (`12`) and `pricePerSeat` (`19`).
2. Add `seats` and `pricePerSeat` to **Watch**, or enter these names individually in the Debug Console.
3. Choose **Step Over** to evaluate the multiplication. Stepping follows expressions, so more than one stop can occur on a source line.
4. Use **Step Out** to return to the caller if you are still inside `quote`, then **Continue** to finish. The terminal prints `228`.

Watch expressions inspect values; they do not run function calls. If you want to test another input, edit the source and launch again.

## Try a second run

Change the call to `quote 3`, save, and press **F5** again. At the same breakpoint you should see `seats = 3` and `pricePerSeat = 29`. Continue and check that the result is `87`.

You have now connected source, local values, and the final result. **Stop** ends a running session; restart debugging after source changes.

## If the session does not start

| Symptom | Check |
| --- | --- |
| FScript is not offered as a debugger | Install the FScript extension and save the file with a `.fss` extension. |
| The CLI cannot be found | Run `fscript version` in VS Code's terminal; restart VS Code after changing `PATH`. The `fscript.cli.path` setting can select the executable explicitly. |
| VS Code blocks the launch | Open the folder you created and enable workspace trust for it. |
| The breakpoint stays unverified | Use the executable multiplication expression from the example rather than a blank line or type declaration. |

This pure example needs no permission grants or launch configuration. Custom launch arguments, external providers, concurrent tasks, and inspection limits are covered later in [Debugging Larger Programs](../advanced/debugging.md). Local debugging uses .NET execution; it is unavailable in the JavaScript/browser playground.

**Checkpoint:** you can stop a script, inspect its inputs, and explain its result.

**Next:** [Language Tour](./language-tour.md). Learn the building blocks that let you write larger scripts.
