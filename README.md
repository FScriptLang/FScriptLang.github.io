# FScript website

The FScript website includes tutorials, Stable and Next language manuals, and
an interactive browser playground.

## Local development

Use Node.js 24, as recorded in `.nvmrc`.

```sh
npm ci
npm start
```

Open [localhost:3000](http://localhost:3000/) to preview the website. Both manuals
are available locally, and documentation edits refresh the preview.

## Checks and production preview

```sh
npm test
npm run build
npm run typecheck
npm run serve
```

Starting or building the website requires network access to fetch the latest
published FScript interpreter and language release notes. The playground shows
its interpreter version; unreleased features documented in Next may not be
available there yet.

## Contributing documentation

- Edit `docs/stable/` for the current stable manual and tutorial corrections.
- Edit `docs/next/` for upcoming language behavior.
- Update `sidebars.stable.ts` or `sidebars.next.ts` when changing navigation.
- Language release notes come from
  [FScript's changelog](https://github.com/FScriptLang/FScript/blob/main/CHANGELOG.md).

Stable contains the released language documentation. Next describes upcoming
changes. Updating the playground interpreter does not promote Next documentation
to Stable.
