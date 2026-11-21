---
id: first-script
title: Run Your First Script
slug: /learn/first-script
---

Use the `fscript-start` folder from [installation](./editor-setup.md). You will write a small pricing calculation, run it, and let the type checker catch a mistake.

## Write a function

Save this in `pricing.fss`:

```fsharp
let quote seats =
  let pricePerSeat = if seats >= 10 then 19 else 29
  pricePerSeat * seats

let total = quote 12
total
```

`let` gives a value or function a name. Indentation puts `pricePerSeat` and the multiplication inside `quote`. The `if` expression chooses a value; the function returns its last expression. The final `total` makes the script's result visible.

## Run it

In VS Code's terminal, from the folder containing the file:

```sh
fscript pricing.fss
```

Expected result:

```text
228
```

The interpreter checks the source's types before running it and prints the final value. There is no build or project file to set up. This example performs no I/O itself and needs no permissions.

## Change an input

Change `quote 12` to `quote 3`, save, and run the same command. The result is `87`: three seats use the price of `29` each. Change it back to `quote 12` for the debugger walkthrough.

Try changing the discount threshold from `10` to `20`. Predict the result before running it, then restore the threshold to `10`.

## Let the editor catch a mistake

Temporarily replace `quote 12` with `quote "twelve"`. The argument is a string, while the function requires a number. VS Code reports a type error; running the script also fails before evaluation. Restore `quote 12` and save.

Hover over `quote` to see its inferred function type. You did not have to declare types to get useful checking. The [Language Tour](./language-tour.md) will explain how inference, functions, and data types fit together.

## When you want explicit output

The final value is enough for this first script. Later, a script that calls `Console.writeLine` needs `IO` in Next, for example `fscript --permissions IO report.fss`. That is a per-script execution setting; the [Interpreter guide](../interpreter/configuration-and-permissions.md) explains it when you need it.

**Checkpoint:** you can edit a source file, run it, and recognize a type error.

**Next:** [Debug in VS Code](./debugging.md), using this same file.
