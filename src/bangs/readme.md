# Bangs

Each bang is defined in its own file, named after the bang identifier.

## Configuration

Each file in this directory represents a single bang, formatted as a standalone .json file using the following structure:

```json
{
  "bang": "the bang identifier",
  "domain": "the domain it uses",
  "url": "the search URL pattern (must include %s)",
  "description": "a title or short description of the bang",
  "category": "the general category",
  "subcategory": "the specific subcategory"
}
```

### Field Requirements

The url field must include a %s placeholder, which will be replaced with the user’s query.
Each field has a maximum recommended length:

*	bang: 30 characters
*	domain: 100 characters
*	url: 300 characters
*	description: 300 characters
*	category: 50 characters
*	subcategory: 50 characters

## Examples

```json
{
  "bang": "wikipedia",
  "domain": "https://en.wikipedia.org",
  "url": "http://en.wikipedia.org/wiki/Special:Search?search=%s&go=Go",
  "description": "Wikipedia",
  "category": "Research",
  "subcategory": "Academic"
}
```

```json
{
  "bang": "duckduckgo",
  "domain": "https://duckduckgo.com",
  "url": "https://duckduckgo.com/?q=%s",
  "description": "DuckDuckGo",
  "category": "Multimedia",
  "subcategory": "Images"
}
```

## Credits

These bangs were (mostly) ripped from https://duckduckgo.com/bang.js by [Theo](https://github.com/t3dotgg). His additions have also been included.
