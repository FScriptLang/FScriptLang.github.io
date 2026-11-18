# Contributor instructions

This repository contains the FScript website, published under Magnus Opera.

- Run `npm test`, `npm run build`, and `npm run typecheck` before submitting changes.
- Cover changes to documentation assembly, package loading, and deployment with
  meaningful regression tests.
- Keep Stable and Next content in `docs/stable/` and `docs/next/`. Preserve
  unreleased features in Next until deliberately promoting them.
- Do not commit generated manuals, build output, or node_modules.
- Fetch language release notes from MagnusOpera/FScript. Do not maintain a
  second language changelog here.
- The playground uses the latest public `@magnusopera/fscript` npm package.
  Do not reintroduce a source checkout or a .NET/Fable build.
- Website changes must not require a FScript release.
- During migration, do not modify the FScript repository, its workflows,
  GitHub Pages settings, or DNS. GitHub and Cloudflare configuration belongs
  to the repository owner.
