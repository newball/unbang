import { readdir, readFile, writeFile } from 'fs/promises';
import { join, extname } from 'path';

async function build() {
  const dir = join(process.cwd(), 'src/bangs');
  const files = await readdir(dir);
  const bangs = [];

  for (const f of files) {
    if (extname(f) !== '.json') continue;
    const src = await readFile(join(dir, f), 'utf8');
    bangs.push(JSON.parse(src));
  }

  const outPath = join(process.cwd(), 'src/bangs.json');
  await writeFile(outPath, JSON.stringify(bangs, null, 2) + '\n', 'utf8');
  console.log(`✓ wrote ${bangs.length} bangs to src/bangs.json`);
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});