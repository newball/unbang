# Unbang

Forked from Theo's idea, [unduck](https://github.com/t3dotgg/unduck), this aims to create a search engine with bang redirects that are served on the client side.

This enables the bangs that DuckDuckGo uses to work, but be much faster.

Simply add the following URL as a custom search engine to your browser.

```
https://unbang.link?q=%s
```

## How is it that much faster (and different thank unduck)?

DuckDuckGo does their redirects server side which requires going through their DNS which can be really slow at times.

This was originally solved by [Theo](https://github.com/t3dotgg) by doing all of the work client side.

I took the idea, decided to use the browsers local storage to help increase performance (among other things).

I also removed all of the TypeScript and replaced it with vanilla JS. Because...