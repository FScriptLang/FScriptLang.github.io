---
id: stdlib-process
title: Process Module
slug: /stdlib/process
---

`Process.exec` launches a program directly and exposes a `ProcessResult task`.
Runtime supplies this module through its default externs, with no package or
assembly import. `Process.exec` requires **Native**. Exposing process I/O does
not request **Threading**; script task operations such as `Task.await` separately
require it. `Process.defaults` and the data types need no permissions.

CLI execution and both compiled targets support Process. Disabling default
externs removes the module. JavaScript/Fable and standalone LIR do not supply it.
Child programs have host OS privileges; filesystem root and deny rules do not
sandbox them. See [Create Async Libraries](../embedding/async-libraries) for the
SDK 3 asynchronous I/O model used by this implementation.

## Use from a script

In a hosted interpreter, this example additionally uses `Threading` for
`Task.await` and `IO` for `Console.writeLine`.

```fscript
let pending = Process.exec "dotnet" ["--version"] Process.defaults
match Task.await pending with
| ProcessResult.Exited result -> Console.writeLine result.stdout
| ProcessResult.Failed error -> Console.writeLine error.message
```

## API

```fscript
type ProcessOptions = {
  workingDirectory: string option
  environment: string map
  stdin: string option
  timeoutMilliseconds: int option
  maxOutputBytes: int
}
type ProcessResult =
  | Exited of { exitCode: int; stdout: string; stderr: string }
  | Failed of { message: string; stdout: string; stderr: string }
```

| Name | Signature | Host permissions |
| --- | --- | --- |
| `Process.defaults` | `ProcessOptions` | None |
| `Process.exec` | `string -> string list -> ProcessOptions -> ProcessResult task` | Native |

Runtime supplies the functions and both data types. The types and immutable defaults require no grants. Defaults are no directory override, an empty environment map, no stdin text, no timeout, and **1,048,576 bytes per output stream**.

```fscript
let options = {
  Process.defaults with
    stdin = Some "hello\n"
    timeoutMilliseconds = Some 5000
    maxOutputBytes = 65536
}
```

Executable arguments are passed individually, without shell expansion or shell quoting. Launch a shell explicitly if shell syntax is needed. Bare executable names use platform lookup. Explicit relative executable paths resolve against the effective working directory. The default directory is the interpreter host's `RootDirectory`, or the current directory in compiled programs. Directory overrides may be anywhere; relative overrides resolve against that default directory.

The child inherits the host environment with supplied entries overridden, without changing the parent's environment. Environment names must be nonempty and contain neither `=` nor NUL. Executables, arguments, directory paths, and environment values cannot contain NUL.

Standard input is UTF-8 without a BOM and closes after writing; `None` closes it immediately. A child that closes its input early is allowed. Standard output and error drain concurrently and decode as UTF-8 with replacement for invalid sequences. Line endings are preserved. Each stream retains at most `maxOutputBytes` raw bytes, including on failure; truncation may end with a replacement character.

`Exited` includes nonzero exit codes. `Failed` contains partial stdout/stderr and a message beginning with `InvalidOptions:`, `StartFailed:`, `TimedOut:`, `OutputLimitExceeded:`, or `IOFailed:`. Timeout and output limits must be positive integers no greater than 2,147,483,647. Timeout begins after successful launch and covers process exit and collection of output, including pipes inherited by descendants.

Timeout, output overflow, and evaluator cancellation terminate the child and close local pipes. Process-tree termination is attempted on supporting runtimes, with direct-child termination as fallback; descendant containment is not guaranteed. Permission denial and evaluator cancellation remain runtime errors. Other operational failures are union values and do not fail the task scope.

Runtime uses SDK 3 async I/O directly, with no polling worker. Operations start when called and participate in the existing task scope: even unawaited calls are joined before the host returns, including after foreground failure. No timeout means a nonterminating child can keep the host call running indefinitely. There is no terminal, streaming, process-handle, or explicit cancellation API.
