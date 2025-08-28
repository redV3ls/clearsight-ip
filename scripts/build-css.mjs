import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const input = path.join(ROOT, 'src', 'styles', 'tailwind.css');
const outDir = path.join(ROOT, '.tmp');
const outFile = path.join(outDir, 'app.css');
const outTs = path.join(ROOT, 'src', 'constants', 'appCss.ts');

fs.mkdirSync(outDir, { recursive: true });

console.log('Building Tailwind CSS...');
execSync(`npx tailwindcss -c tailwind.config.js -i ${JSON.stringify(input)} -o ${JSON.stringify(outFile)} -m`, { stdio: 'inherit', shell: true });

const css = fs.readFileSync(outFile, 'utf8');
const sanitized = css.replace(/`/g, '\\`');
const ts = `export const APP_CSS = \`${sanitized}\`;\n`;
fs.writeFileSync(outTs, ts, 'utf8');
console.log('Embedded CSS into', outTs);

