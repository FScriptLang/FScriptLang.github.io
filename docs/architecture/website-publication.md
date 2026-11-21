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

The initial URL is `https://fscriptlang.github.io/`. Repository
variables select the URL and base path at build time for a later custom-domain
handover. GitHub Pages settings and Cloudflare DNS remain owner-managed.

## Next documentation navigation

Next follows a newcomer progression: Introduction, Quickstart, Language Tour,
Interpreter, Compiler, Embedded, Advanced, Samples, Standard Library, Reference.
Quickstart covers installation, a first pure script, and VS Code debugging using
the same example. The Language Tour introduces the language and groups its
feature chapters; runtime concurrency and extension authoring live in Advanced.

Each execution mode explains its purpose, configuration, and permission boundary.
Advanced groups provider authoring, host-managed types, custom resolvers,
threading, detailed permissions, and larger-program debugging. Basic permission
requirements remain visible at the point of use. Category overview documents
appear only through their category links so pagination never repeats an overview.
Existing document IDs and URLs remain stable even when their sidebar category
changes. New content is assembled and validated with the rest of Next.

The home page and mode shortcuts retain Interpreter, Compiler, Embedded order
and link to Next guides. The Docs entry and version selector retain access to the
Stable manual; this reorganization does not promote unreleased capabilities to
Stable. In particular, interpreted CLI permission selection is documented only
in Next. Neither the language repository nor its release process changes.
