---
id: running-scripts
title: Running Scripts
slug: /interpreter/running-scripts
---

## Files and arguments

Run the entry file, passing application arguments after `--`:

```sh
fscript pricing.fss -- acme scale
```

`Env.Arguments` is a `string list`. `Env.ScriptName` is the filename in file mode and `None` in stdin/REPL mode. Imports are resolved from source in file mode and share the entry script's environment. See [Modules, Imports, and Exports](../language/modules-imports-exports.md).

## Interactive exploration

Start `fscript` with terminal stdin to enter the REPL. Successful bindings and type declarations persist between submissions. Expressions print their values; functions show their inferred signatures.

The `>` prompt starts a submission and `.` indicates pending multiline input. Two blank lines force a pending submission. A type or evaluation error clears pending input. EOF exits after attempting pending input; Ctrl+C exits immediately. Use a source file when you need imports.

## Piped source

```sh
printf 'let answer = 6 * 7\nanswer\n' | fscript
```

Redirected stdin runs as source instead of opening the REPL. It does not resolve file imports. Configuration is discovered in the current working directory.

## Output and shell status

The interpreter prints the final value after explicit console output. Use `--no-result` when only your script's explicit output should appear:

```sh
fscript --permissions IO --no-result report.fss
```

This suppresses the result display, not execution or diagnostics. The final value does not become the process exit status: successful execution returns `0` unless the script selects another status with `Env.setExitCode`. Unhandled errors still return nonzero.

```fsharp
Env.setExitCode 7
42
```

The CLI prints `42` and returns status `7`. With `--no-result`, it returns the same status without printing `42`.

## Check and debug

Use the [VS Code setup](../learn/editor-setup.md) for diagnostics, navigation, and completion, then the [debugging guide](../learn/debugging.md) for breakpoints and stepping. Debugger launches use the selected manifest's permissions, defaulting to none.

`fscript analyze program.fss` checks potential FFI task sharing without executing the script. It is a separate, optional analysis; ordinary execution and compilation do not run it. See [Checking FFI Task Sharing](../learn/task-sharing-analysis.md).

Continue with [Configuration and Permissions](./configuration-and-permissions.md) or consult the complete [CLI Reference](../reference/cli-reference.md).
