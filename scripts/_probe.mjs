import fs from 'node:fs';

for (const file of fs.readdirSync('src/components').sort()) {
  const source = fs.readFileSync(`src/components/${file}`, 'utf8');
  const match = source.match(/interface Props \{[\s\S]*?\n\}/);
  const usage = [...source.matchAll(/(?:messages|lang)\.?(?=[,.])/g)].length;
  console.log(`== ${file}`);
  console.log(match ? match[0].replace(/\n/g, ' ') : '(no Props)');
  void usage;
}
