# Unbang

Forked from Theo’s idea, [unduck](https://github.com/t3dotgg/unduck), Unbang is a client-side "bang" redirect engine that aims to be faster than DuckDuckGo’s server-side implementation.

## Why is it faster (and how does it differ from unduck)?

- DuckDuckGo processes bangs _server_-side, introducing DNS latency on each query.
- unduck moved the logic _client_-side; Unbang builds on that by:
  - Using browser `localStorage` for caching redirect patterns.
  - Stripping out TypeScript in favor of a lightweight, vanilla JS core.
  - Building a static site with a search page and a browsable bang directory.

## How to Use Unbang

Add the following as a **Custom Search Engine** in your browser:
   - Name: Unbang
   - Search URL:  
     ```
     https://unbang.link/?q=%s
     ```

## To Self-Host Your Own 

1. Clone this repo:
   ```bash
   git clone https://github.com/newball/unbang.git
   cd unbang
   ```
2. Use Node.js 22.12+ in the 22.x line, Node.js 24.x, or Node.js 26+. Install the locked dependencies and build the site:
   ```bash
   npm ci
   npm run build
   ```
3. Publish the contents of `dist/` at the root of a static HTTPS host. Use `npm run preview` to check the build locally.
4. Add the following as a **Custom Search Engine** in your browser:
   - Name: Unbang
   - Search URL:  
     ```
     https://your-domain-here.com/?q=%s
     ```

## Usage

- In your address bar, type:  
  ```
  unbang !gh copilot
  ```  
  This will redirect you to GitHub search for “copilot”.
- All bang definitions are stored in `localStorage` and refreshed periodically.

## Contributing

1. File an issue or send a PR.
2. Run tests:
   ```bash
   npm ci
   npm test -- --run
   ```
3. Follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

## License

MIT :tm: Leo Newball
