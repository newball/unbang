# Bangs

Each file is it's own bang in a json format that follows the following template:

```
{
  "bang": "the bang",
  "domain": "the domain is uses",
  "url": "the search paramter",
  "description": "The description / title of the bang",
  "category": "The Category",
  "sub-category": "The Subcategory"
}
```
Some examples are:

```
{
  "bang": "wikipedia",
  "domain": "https://en.wikipedia.org",
  "url": "http://en.wikipedia.org/wiki/Special:Search?search=%s&go=Go",
  "description": "Wikipedia",
  "category": "Research",
  "sub-category": "Academic"
}
```

```
{
  "bang": "duckduckgo",
  "domain": "https://duckduckgo.com",
  "url": "https://duckduckgo.com/?q=%s",
  "description": "DuckDuckGo",
  "category": "Multimedia",
  "sub-category": "Images"
}
```

# Credits

These bangs were (mostly) ripped from https://duckduckgo.com/bang.js by [Theo](https://github.com/t3dotgg). His additions have also been included.
