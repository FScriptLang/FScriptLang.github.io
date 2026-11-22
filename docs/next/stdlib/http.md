---
id: stdlib-http
title: Http Module
slug: /stdlib/http
---

The .NET Runtime default externs provide `Http` to interpreted scripts and
both .NET compilation backends. `--no-default-externs` removes the module
and its types. JavaScript hosting and standalone LIR execution lack a built-in
HTTP provider.

| Function | Signature |
| --- | --- |
| `Http.defaults` | `HttpRequest` |
| `Http.send` | `string -> string -> HttpRequest -> HttpResult task` |
| `Http.get`, `Http.head`, `Http.post`, `Http.put`, `Http.patch`, `Http.delete` | `string -> HttpRequest -> HttpResult task` |

`Http.send` takes a method and a URL. The helpers supply the uppercase method.
All requests require an absolute HTTP or HTTPS URL without user information.
Each send requires [`Network`](../embedding/host-permissions#network) in the interpreter.
`Task.await` also requires [`Threading`](../embedding/host-permissions#threading). The request types and defaults require no grants. Generated .NET
programs use the host's OS permissions.

Use a record update on `Http.defaults` to set request fields.

| Field | Type | Default |
| --- | --- | --- |
| `headers` | `(string * string) list` | `[]` |
| `body` | `HttpBody option` | `None` |
| `timeoutMilliseconds` | `int` | `30000` |
| `maxResponseBytes` | `int` | `1048576` |

`HttpBody.Text` encodes a string as strict UTF-8. `HttpBody.Bytes` takes an
`int list` with values from 0 through 255. Set content headers explicitly.
Header names follow HTTP token syntax and values may not contain line breaks.
Repeated values can be supplied and returned separately, subject to .NET HTTP
header handling. Header casing and wire formatting are platform-dependent.

`HttpResult.Received` carries `statusCode : int`, `headers : (string * string) list`,
and `body : int list`. All received HTTP statuses use this case, including
redirects and error responses. Redirects are returned directly and the client
does not store cookies. The response body contains bytes after HTTP message
framing is removed, with no automatic content decompression or text decoding.

`HttpResult.Failed` carries `kind : string` and `message : string`. The kind is
`InvalidRequest`, `Timeout`, `Transport`, or `ResponseTooLarge`. Limits must be
positive 32-bit integers. The timeout covers connecting, sending, and reading
the response. The response-size limit applies during streaming, with no
partial body returned on failure. Host cancellation cancels the task.

Use [Json](./json) to serialize a request and deserialize its response. Run your script
with `fscript --permissions Network,Threading script.fss`.

```fsharp
type Payload = { value: int }

let sendJson url (payload: Payload) =
    match Json.serialize payload with
    | None -> None
    | Some json ->
        let request =
            { Http.defaults with headers = [("Content-Type", "application/json")]
                                 body = Some (HttpBody.Text json) }
        match Http.post url request |> Task.await with
        | HttpResult.Received response when response.statusCode = 200 ->
            response.body |> Encoding.utf8Decode |> Option.bind (fun text -> Json.deserialize<Payload> text)
        | _ -> None
```
