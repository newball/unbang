# Unbang

Forked from Theo’s idea, [unduck](https://github.com/t3dotgg/unduck), Unbang is a client-side "bang" redirect engine that aims to be faster than DuckDuckGo’s server-side implementation.

## Why is it faster (and how does it differ from unduck)?

- DuckDuckGo processes bangs _server_-side, introducing DNS latency on each query.
- unduck moved the logic _client_-side; Unbang builds on that by:
  - Using browser `localStorage` for caching redirect patterns.
  - Stripping out TypeScript in favor of a lightweight, vanilla JS core.
  - Providing a single-file bundle you can drop into any static host.

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
2. Serve the folder (e.g. via `http-server`, `serve`, or any static host):
   ```bash
   npx http-server .
   ```
3. Add the following as a **Custom Search Engine** in your browser:
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
   npm install
   npm test
   ```
3. Follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

## License

MIT :tm: Leo Newball