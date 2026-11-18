# Website changelog

## [Unreleased]

- Document and verify that pull-request builds have read-only permissions and no publishing credentials.
- Fetch FScript release notes and link documentation to the transferred FScriptLang repository.
- Publish the website at the organization root and point documentation edit links to the renamed repository.
- Copy Stable and Next documentation into an independently deployable website while preserving unreleased language documentation.
- Run the playground with the latest public FScript npm package and display its version.
- Generate release history and Unreleased notes from the upstream FScript changelog without requiring a PAT.
- Build and deploy GitHub Pages independently, with production domain configuration deferred to the repository owner.
