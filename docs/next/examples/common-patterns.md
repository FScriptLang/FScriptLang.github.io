---
id: common-patterns
title: Common Script Patterns
slug: /examples/common-patterns
---

These language-only patterns use pure functions and need no permission grants. Pair them with the [guided examples](./guided-examples.md) when you want a complete program.

## Normalize an optional value

```fsharp
let normalize maybeText =
  match maybeText with
  | Some text -> text |> String.toLower
  | None -> ""
```

## Map lookup with fallback

```fsharp
let getOrDefault key values fallback =
  values
  |> Map.tryGet key
  |> Option.defaultValue fallback
```

## Branch on rich outcomes

```fsharp
type Outcome =
  | Accepted of string
  | Rejected of string
```

Model meaningful states with unions and match over them.
