---
id: overview
title: Advanced
slug: /advanced/overview
---

You can now write FScript and choose how it runs. Use this section when your program needs capabilities beyond a simple script: application-specific APIs, concurrent work, or a deliberate security policy.

Choose a topic for the problem you have; these are not prerequisites for ordinary scripting.

| Goal | Start here | What you should know first |
| --- | --- | --- |
| Call .NET libraries or expose domain APIs | [Extend FScript](./extending-fscript.md) | Functions, records, and your chosen execution mode. |
| Coordinate work and wait for results | [Tasks and Concurrency](../language/tasks-and-concurrency.md) | Functions, closures, and interpreter configuration. |
| Set an access policy | [Permissions and Safety](./permissions-and-safety.md) | Whether code runs through the CLI, a compiled program, or an application host. |
| Make configured APIs visible in VS Code | [Extension Environments](./extension-environments.md) | A working provider and its manifest. |
| Debug callbacks, imports, or multiple tasks | [Debugging Larger Programs](./debugging.md) | The basic VS Code debugger walkthrough. |

The detailed guides below cover typed extern registration, asynchronous libraries, host-managed values, import resolvers, task-sharing analysis, and sandbox boundaries. JavaScript hosts use their own extern registration surface; follow the [JavaScript host guide](../embedding/fable-javascript.md) for that environment.

After adding a capability, use [Samples](../examples/overview.md) to see it in a complete program.
