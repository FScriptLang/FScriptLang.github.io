---
id: testing
title: Testing FScript projects
slug: /interpreter/testing
---

Run `fscript test` from your project directory. The runner discovers `*_test.fss` files recursively and skips symbolic links. Keep each test file beside the module it exercises so it can use an ordinary relative import. The runner visits files in path order and runs cases sequentially in registration order.

## Write a test

Put this function in `math.fss`:

```fsharp
export let double value = 2 * value
```

Then put the tests beside it in `math_test.fss`:

```fsharp
import "math.fss" as Math

Test.case "double zero" (fun () ->
    Assert.equal 0 (Math.double 0))

let examples =
    [ ("positive", (3, 6))
      ("negative", (0 - 3, 0 - 6)) ]

Test.each "doubling" examples (fun row ->
    match row with
    | (input, expected) -> Assert.equal expected (Math.double input))
```

`Test.case : string -> (unit -> unit) -> unit` registers a named function. `Test.each : string -> (string * 'a) list -> ('a -> unit) -> unit` passes each named input in the list to a shared function. Each row gets a separate result with the name `group / row`. Names must be nonempty and full names must be unique within a file. Register cases at the top level or from code called during file initialization.

## Assertions

| Assertion | Behavior |
| --- | --- |
| `Assert.equal expected actual` | Compares values using FScript equality. |
| `Assert.near tolerance expected actual` | Checks a float's absolute error against a tolerance. |
| `Assert.relative tolerance expected actual` | Checks the absolute error divided by the absolute expected value. A zero reference requires exactly zero. |
| `Assert.some value` | Returns the payload of `Some` and fails on `None`. |
| `Assert.none value` | Passes on `None` and shows the payload on failure. |

Float tolerances must be finite and nonnegative, and both float comparisons reject nonfinite operands. The runner reports the source file, line, and column of a failed assertion, including assertions in imported helpers. A failed data row also shows its input. An assertion ends the current case and the next case still runs. The command exits with status 1 if a case fails, file initialization fails, or no cases match.

## Filter and profile

```sh
fscript test
fscript test --filter "doubling / positive"
fscript test --profile
```

Filtering uses a case-sensitive substring of the full case name. Each discovered file still initializes before the runner selects its cases. The opt-in profile reports wall-clock setup times for all files and the ten slowest selected cases, including failures. Setup includes loading imports, parsing, type checking, and registering cases. Each row in `Test.each` is timed separately.

The test runner reads `fscript.toml` from the working directory by default and uses the same permission policy as interpreted execution. The test APIs are supplied by `fscript test` and work with default externs disabled. For flags and configuration, see the [CLI reference](../reference/cli-reference.md#test-projects).


## Run tests in VS Code

Open a workspace folder containing your `*_test.fss` files and select **Testing** in the Activity Bar. FScript lists test files, literal `Test.case` names, and named `Test.each` rows. Use **Run** or **Debug** on a file, case, or row. Set breakpoints in the test or in imported code before debugging. In **Test Results**, select an assertion failure to jump to its source.

Automatic discovery parses files without running their setup. For cases registered by code at runtime, use **FScript: Discover Generated Tests** from the Command Palette. That command initializes the test files in a trusted workspace without running their cases. Runs and debug sessions require workspace trust and use the owning workspace folder's `fscript.toml` by default.

### View console output and timings

Open **Test Results** after a run to see the test's stdout, including `Console.writeLine`. Debug sessions use the integrated terminal for console output.

For timings, choose **Run with Profiling** from the run profile picker. The report appears below console output in **Test Results**, including on a failed run. It shows file setup time and the slowest selected cases. Each file or individually selected case gets its own report. The ordinary **Run** profile remains the default.

Test Explorer requires a compatible FScript extension and CLI. Set `fscript.cli.path` if your CLI is outside PATH. See [VS Code settings and commands](../reference/editor-reference.md#test-explorer).
