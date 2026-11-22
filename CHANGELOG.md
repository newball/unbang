# Changelog

All notable changes to this project will be documented in this file.  
This project adheres to [Semantic Versioning](https://semver.org/) and uses the format defined by [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.3.3] - 2026-11-22

### Added

- Added `!dmenu` for dmenu Web Search.
- Added `!msqa` for Microsoft Q&A.
- Added `!sqdomains` for Squarespace Domains.

### Changed

- Bumped the package version to 0.3.3.
- Regenerated `src/bangs.json` after removing and updating bang definitions.
- Updated the build and test toolchain to Vite 6.4.6, vite-plugin-pwa 2, and Vitest 5. Documented the supported Node.js versions and npm build workflow.
- Switched to variable Inter font files to reduce the number of font assets.

### Fixed

- Included the bang directory in production builds and precached both pages with their styles, fonts, and icons for offline use.
- Custom-search URLs (`/?q=...`) can use the cached search page when the Unbang host is unreachable.
- Fixed search suggestions throwing while typing, prioritized bang code matches, and made bang lookups work when browser storage is unavailable or the cached catalog is empty.
- Rendered bang metadata as text and limited cached redirect URLs to HTTP and HTTPS.

### Security

- Raised the minimum Vite version to include the fix for [GHSA-p4f5-76q4-ffq7](https://github.com/vitejs/vite/security/advisories/GHSA-p4f5-76q4-ffq7). Scoped the patched `glob` override to Workbox.

### Removed

- Removed bangs for retired or discontinued services, including Cliqz, Google Mobile-Friendly Test, LiveLeak, Fakespot, Ask.com, Amazon Prime Now, goo, Microsoft Mixer, Flattr, Microsoft Academic, Skype Community, Exalead, Wunderlist, Google Domains, Google Play Music, Funimation, Periscope, Pocket, Yahoo Answers, and Google+.
- Consolidated and removed redundant Google+ and Yahoo Answers bang aliases.
- Removed the pnpm lockfile.

## [0.3.2] - 2025-07-15

### Fixed

- A background fix for mobile... (don't ask how I've missed this).

## [0.3.1] - 2025-07-15

### Fixed

- A fun small deployment bug. Nothing to see here... move along.

## [0.3.0] - 2025-07-15

### Added

- Testing suite for core functionality.
- ARIA label support for improved accessibility.
- Input debouncing to reduce redundant queries.
- Bangs directory and search suggestions page.
- Branding!

### Changed

- Updated the bang-handling logic and set up some peliminary standards.
- Migrated from Google Fonts to a local font dependency.
- General CSS, UI, and UX updates and optimizations, including copy updates.
- Bumped version, dependencies, and updated test script.
- Show custom search URL in placeholder text.

### Fixed

- Removed extra function call causing unintended behavior.
- Fixed button copy bug and formatting.
- General code formatting fixes.

### Removed

- Stockflare bangs (service discontinued).
- Renamed Twitter-specific bangs to X.
- Removed redundant/unnecessary bangs.
- Removed old developer reference.

## [0.2.3] - 2025-06-03

### Changed

- Fix HTML syntax errir
- Fix bugs preventing searches when bangs were followed by a space
- Fix CSS background

## [0.2.2] - 2025-05-31

### Added

- Analytics addition using umani

### Changed

- Name on MIT License
- File movement
- CSS Optimization
- Vite Upgrade
- Dependecies Upgrade
- Bug fixes

## (0.2.1) - 2025-05-29

### Added

- Kagi Search Engine.

## [0.2.0] - 2025-05-15

### Added

- Initial `CHANGELOG.md`.
- Client-side bang redirects powered by individual `.json` files using [DuckDuckGo styled bangs](src/bangs/readme.md).
- LocalStorage caching in [`cacheBangs`](src/bang.js) and retrieval via [`getCachedBangs`](src/bang.js).
- Initial documentation and example usage in [README.md](README.md).
- Converted project typescript to vanilla JS.
- Initial fork from [unduck](https://github.com/t3dotgg/unduck)
