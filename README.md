# FScript website

Landing page, tutorials, Stable and Next manuals, and browser playground for
FScript, published under the Magnus Opera umbrella. This repository owns its
documentation and can publish without releasing FScript.

## Develop

Use Node.js 24, as recorded in `.nvmrc`.

```sh
npm ci
npm start
```

After `npm ci`, `make website` is equivalent to `npm start`.

The development site is at `http://localhost:3000/website/`. Both manuals are
available locally. Documentation and sidebar edits refresh the generated
manuals. Restart the server to refresh the upstream changelog or npm interpreter.

```sh
npm test
npm run build
npm run typecheck
npm run serve
```

`npm start` and `npm run build` install `@magnusopera/fscript@latest` without
changing the committed dependency lock, then fetch the public FScript changelog.
They require network access. The playground bundles that package locally and
shows its exact version. Stable and Next share this published interpreter;
unreleased language features may not run in the playground yet. No .NET SDK,
FScript checkout, npm token, or GitHub PAT is needed.

To use a local changelog fixture, set `FSCRIPT_CHANGELOG_FILE` to an absolute
Markdown path. `npm ci`, `npm run prepare:docs`, and `npm run typecheck` can use
the locked runtime without refreshing npm. Production builds always refresh it.

## Documentation ownership

- Edit `docs/stable/` for the current stable manual and tutorial corrections.
- Edit `docs/next/` for upcoming language behavior.
- Maintain each edition's navigation in `sidebars.stable.ts` or
  `sidebars.next.ts`.
- `docs/stable.json` records the stable documentation tag as `vX.Y.Z`.
- `whats-new.md` is generated from
  [FScript's CHANGELOG](https://github.com/MagnusOpera/FScript/blob/main/CHANGELOG.md).
  Edit the upstream changelog for language release notes, rather than editing
  the copied placeholders.

Stable shows full changelog history through the release in `docs/stable.json`.
Next shows only Unreleased. Historical comparison URLs retain their actual Git
refs; displayed release headings use the `v` prefix.

When promoting Next, copy the intended Next pages to `docs/stable/`, update
`sidebars.stable.ts` and the stable tag, and review the result in this repository.
There are no per-release website snapshots or automatically copied upstream
documentation. Package updates alone do not promote Next documentation.

The initial Stable copy comes from FScript's historical `0.94.3` tag. Next comes
from main at the commit recorded in `docs/origin.json`, including the unreleased
Process.exec and FScript.exec documentation. Initial source provenance is kept
for reference; neither edition is synchronized back into FScript. Its existing
website and workflows remain untouched during setup.

## GitHub Pages setup

The workflow tests and builds pull requests. It deploys main on pushes, manual
runs, and every six hours to pick up npm and changelog updates. Failed builds
leave the previous deployment available. New FScript releases do not trigger
this repository immediately while upstream workflows remain unchanged.

In GitHub, enable Pages with **GitHub Actions** as the publishing source. Allow
the `github-pages` environment to deploy main. Deployment uses the built-in
token with `pages: write` and `id-token: write`; there are no custom secrets.

The initial deployment uses `https://fscriptlang.github.io/website/`. It does
not claim the production custom domain. For the eventual domain handover:

1. Configure these repository Actions variables:
   - `WEBSITE_URL`: `https://fscript.magnusopera.io`
   - `WEBSITE_BASE_URL`: `/`
2. Coordinate custom-domain ownership and verification in GitHub Pages. Move
   the domain from the old repository to this one when ready to switch.
3. Change Cloudflare's CNAME target to `fscriptlang.github.io`.
4. Redeploy and check HTTPS and the Stable, Next, and playground routes.

GitHub settings and DNS are managed separately by the repository owner. No
Cloudflare token is used by the workflow. Removing documentation or changing
release workflows in FScript is a later migration step.
