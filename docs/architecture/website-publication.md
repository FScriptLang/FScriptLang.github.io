# Website publication

The website owns two editable documentation trees, `docs/stable` and
`docs/next`. Build scripts assemble them into Docusaurus's Stable and current
versions. Generated outputs are ignored. Stable promotion is an explicit
website content change, independent of a FScript release.

The initial copies preserve the shipped `0.94.3` manual and all unreleased
main documentation separately. `docs/stable.json` and `docs/origin.json`
record their initial provenance. There is no automated documentation import
after that copy.

The only upstream content fetched during builds is FScript's public
`main:CHANGELOG.md`. Stable displays history starting at its configured
documentation release, excluding newer preparations. Next displays only
Unreleased. Historical Git comparison URLs are preserved. Fetch failures or
missing release notes fail the build instead of publishing partial history.

The browser playground imports `@magnusopera/fscript` through its public npm
entry point. Preparation refreshes the package's `latest` channel without
rewriting committed dependency manifests. Both manuals share this interpreter,
whose exact version is displayed in the playground. The website does not build
FScript source or require .NET. The generated `website-sources.json` records
the runtime version, documentation editions, and upstream changelog hash.

GitHub Actions builds pull requests and deploys main using the built-in token.
Scheduled builds pick up npm packages and changelog edits while the FScript
repository stays untouched. Manual runs allow an immediate refresh. Content
pushes deploy without requiring a language release. Tests exercise the npm
runtime after preparation, before the deployment job can run.

The initial URL is `https://fscriptlang.github.io/website/`. Repository
variables select the URL and base path at build time for a later custom-domain
handover. GitHub Pages settings and Cloudflare DNS remain owner-managed.
