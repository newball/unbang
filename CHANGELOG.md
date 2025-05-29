# Changelog

All notable changes to this project will be documented in this file.  
This project adheres to [Semantic Versioning](https://semver.org/) and uses the format defined by [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.2.0] - 2023-08-15

### Added
- Initial `CHANGELOG.md`.
- Client-side bang redirects powered by individual `.json` files using [DuckDuckGo styled bangs](src/bangs/readme.md).  
- LocalStorage caching in [`cacheBangs`](src/bang.js) and retrieval via [`getCachedBangs`](src/bang.js).  
- Initial documentation and example usage in [README.md](README.md).
- Converted project typescript to vanilla JS.
- Initial fork from [unduck](https://github.com/t3dotgg/unduck)