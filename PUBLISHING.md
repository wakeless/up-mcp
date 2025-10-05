# Publishing Guide

This document outlines the steps to publish a new release of the Up Banking MCP Server.

## Pre-Release Checklist

- [ ] All tests passing (`npm test`)
- [ ] Code linted and formatted (`npm run lint && npm run format:check`)
- [ ] Build succeeds (`npm run build`)
- [ ] Version number updated in `package.json`
- [ ] `CHANGELOG.md` updated with release notes
- [ ] Documentation up to date
- [ ] License headers correct

## Version Numbering

This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality additions
- **PATCH** version for backwards-compatible bug fixes

Current version: **0.1.0**

## Publishing to npm

### 1. Verify Package Contents

Preview what will be published:

```bash
npm pack --dry-run
```

Expected contents:
- `dist/` - Compiled JavaScript and TypeScript definitions
- `README.md` - Project documentation
- `LICENSE` - MIT license
- `openapi.json` - Up API OpenAPI specification
- `package.json` - Package metadata

### 2. Test Local Installation

Test the package locally before publishing:

```bash
npm pack
npm install -g ./up-mcp-0.1.0.tgz
```

Verify it works:

```bash
up-mcp
```

### 3. Publish to npm

**First time setup:**

```bash
npm login
```

**Publish:**

```bash
# Dry run first
npm publish --dry-run

# Actual publish
npm publish
```

For beta/alpha releases:

```bash
npm publish --tag beta
```

### 4. Create GitHub Release

1. Commit all changes
2. Create a git tag:
   ```bash
   git tag -a v0.1.0 -m "Release v0.1.0"
   git push origin v0.1.0
   ```
3. Create release on GitHub with changelog notes

## Post-Release

- [ ] Verify package on npm: https://www.npmjs.com/package/up-mcp
- [ ] Test installation: `npm install -g up-mcp`
- [ ] Update version to next development version (e.g., 0.2.0-dev)
- [ ] Announce release (if applicable)

## Unpublishing (Emergency Only)

If you need to unpublish within 72 hours of publishing:

```bash
npm unpublish up-mcp@0.1.0
```

**Note:** Unpublishing is discouraged. Consider publishing a patch version instead.

## Package Information

**Package name:** `up-mcp`
**Registry:** npm (https://registry.npmjs.org/)
**License:** MIT
**Author:** Michael Gall

## Links

- npm package: https://www.npmjs.com/package/up-mcp
- GitHub repo: https://github.com/wakeless/up-mcp
- Up Banking API: https://developer.up.com.au/
