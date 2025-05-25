// eager‐load every .json in /src/bangs
const modules = import.meta.glob('./bangs/*.json', { eager: true })

export const bangs = Object.values(modules)
  .map(mod => mod.default)  // pull out the JSON content
  .flat();                   // flatten into one array