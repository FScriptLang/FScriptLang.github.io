---
id: stdlib-json
title: Json Module
slug: /stdlib/json
---

**Hosted interpreter permissions:** Every function and value on this page requires no host permissions. Higher-order functions still enforce the requirements of their callbacks. These checks do not apply to CLI execution or compilation. See [Host permissions](../embedding/host-permissions).

Use `Json` to convert between FScript values and JSON text.

## `Json.deserialize<'a> : string -> 'a option`

<a className="permission-tag permission-tag--none" href="../embedding/host-permissions#none" title="None permission definition">None</a>

Pass the target type in angle brackets. The result is an option of that type. FScript can also infer the target when an expected result type is available.

```fsharp
type Settings = { Port: int; Label: string option }
let settings = Json.deserialize<Settings> "{\"Port\":8080}"
match settings with
| Some value -> Console.writeLine $"port={value.Port}, label={value.Label}"
| None -> Console.writeLine "invalid settings"
```

Generic wrappers can forward their type argument.

```fsharp
let decode<'a> json : 'a option = Json.deserialize<'a> json
let ports = decode<int list> "[8080,8081]"
```

Malformed JSON, incompatible values, or unsupported target types return `None`.

| Target field/value | JSON decoding |
| --- | --- |
| `string`, `int`, `float`, `bool` | Corresponding JSON scalar; integers must fit signed 64 bits |
| `unit` | Produces `()` |
| `'a list` | JSON array; every element must decode |
| Tuple | JSON array with exactly the tuple's arity |
| `'a option` | `null` becomes `None`; other values decode as `Some` |
| Ordinary record, including generic and recursive records | JSON object; field names are case-sensitive; extra properties are ignored |
| Map | JSON object; property names decode as string, int, or bool keys |

Missing record fields are allowed only for option fields, which become `None`. A failed nested conversion fails the entire result. Union types, union map keys, functions, tasks, and host-managed types are unsupported decoding targets. Decoding cannot manufacture opaque host state, including inside a record or container.

## `Json.serialize : 'a -> string option`

<a className="permission-tag permission-tag--none" href="../embedding/host-permissions#none" title="None permission definition">None</a>

Returns JSON text when the entire value is serializable.

```fsharp
let text = Json.serialize { Port = 8080; Label = Some "api" }
// Some "{\"Label\":\"api\",\"Port\":8080}"
```

| Value | JSON encoding |
| --- | --- |
| Strings, finite numbers, booleans | JSON scalars |
| `()` and `None` | `null` |
| `Some value` | Encoding of `value` |
| Lists and tuples | JSON arrays |
| Records | JSON objects |
| Maps with string, int, or bool keys | JSON objects; integer and boolean keys become property names |
| Host-managed values | Visible fields only, as a JSON object |

A union value, union-keyed map, function, task, or type token anywhere in the value makes serialization return `None`. Opaque payloads and host-type metadata are never serialized. Non-finite floating-point values are not suitable for portable JSON round trips.

Options and tuples lose their FScript type information in JSON; use the intended target type when decoding. This API does not promise arbitrary value round trips.
