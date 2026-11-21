# Contributor instructions

This repository contains the FScript website, published under Magnus Opera.

- Run `npm test`, `npm run build`, and `npm run typecheck` before submitting changes.
- Cover changes to documentation assembly, package loading, and deployment with
  meaningful regression tests.
- Keep Stable and Next content in `docs/stable/` and `docs/next/`. Preserve
  unreleased features in Next until deliberately promoting them.
- Do not commit generated manuals, build output, or node_modules.
- Fetch language release notes from FScriptLang/FScript. Do not maintain a
  second language changelog here.
- The playground uses the latest public `@magnusopera/fscript` npm package.
  Do not reintroduce a source checkout or a .NET/Fable build.
- GitHub Pages settings and DNS belong to the repository owner.
- Pull-request builds must use read-only permissions, no stored credentials, no
  inherited secrets, and checkout with `persist-credentials: false`. Keep Pages
  deployment restricted to main through the `github-pages` environment.

## Release coordination

- This repo owns the site, its manuals, and the browser playground. Language,
  runtime, compiler, CLI/DAP, and language server behavior belong in
  FScriptLang/FScript. VS Code client and TextMate grammar behavior belong in
  FScriptLang/vscode-extension. Fix problems in the repository that ships them.
- Website fixes can deploy independently. For a coordinated release, record the
  agreed version in the private package manifest and lockfile, promote the
  relevant Next content to Stable, and set `docs/stable.json` to the matching
  FScript tag. Leave unrelated Next content in Next.
- The website goes last in a coordinated release. Verify the requested FScript
  version is public on npm's `latest` tag and its release notes are on FScript
  `main`. Then run `npm run build`, `npm test`, and `npm run typecheck` against
  the actual public sources. Confirm `build/website-sources.json` records the
  intended Stable tag and playground version before pushing.
- Push the website tag and its `main` commit together, then watch Pages deploy.
  Verify the same source manifest at the public site. If npm publication fails,
  keep the coordinated website release staged while the language team retries
  the existing artifact.
- Fetch and check the intended commits before publishing. Open a PR only when
  asked. Keep public release tags immutable.
