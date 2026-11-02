// Uso: node scripts/baixar-mapas.mjs [--discover]
// Requer: npm i -D playwright && npx playwright install chromium
// Você faz login manualmente (a senha nunca passa pelo script).
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const BASE = process.env.BASE_URL || 'https://ingles-visual.vercel.app/';
const OUT = process.env.OUT_DIR || 'mapas-mentais';
const MAX_PAGES = Number(process.env.MAX_PAGES || 200);
// Ajuste conforme a estrutura do site (rode com --discover para ver os links)
const LINK_FILTER = new RegExp(process.env.LINK_FILTER || '.', 'i');
const MAP_SELECTOR = process.env.MAP_SELECTOR || 'img, svg, canvas, a[href$=".pdf"], a[href$=".png"], a[href$=".jpg"]';
const MIN_SIZE = Number(process.env.MIN_SIZE || 300); // ignora ícones pequenos
const DISCOVER = process.argv.includes('--discover');

const slug = (s) =>
  (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').toLowerCase().slice(0, 60) || 'sem-categoria';

const ask = (q) => new Promise((r) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question(q, (a) => { rl.close(); r(a); });
});

const ctx = await chromium.launchPersistentContext('.auth-mapas', { headless: false, acceptDownloads: true });
const page = ctx.pages()[0] || await ctx.newPage();
await page.goto(BASE);
await ask('Faça login no navegador e pressione ENTER aqui... ');

const origin = new URL(BASE).origin;
const seen = new Set();
const queue = [page.url()];
let total = 0;

while (queue.length && seen.size < MAX_PAGES) {
  const url = queue.shift();
  if (seen.has(url)) continue;
  seen.add(url);
  try { await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }); } catch { continue; }

  const links = await page.$$eval('a[href]', (as) => as.map((a) => ({ href: a.href, text: a.innerText.trim() })));
  for (const l of links) {
    const u = l.href.split('#')[0];
    if (u.startsWith(origin) && !seen.has(u) && LINK_FILTER.test(u + ' ' + l.text) && !/\.(pdf|png|jpe?g|svg)$/i.test(u)) queue.push(u);
  }

  if (DISCOVER) {
    console.log(`\n# ${url}`);
    links.forEach((l) => console.log(`  ${l.text.slice(0, 50)} -> ${l.href}`));
    continue;
  }

  // Categoria: breadcrumb > primeiro h1/h2 > segmento da URL
  const category = await page.evaluate(() =>
    document.querySelector('[aria-label*="breadcrumb" i] li:last-child, .breadcrumb li:last-child')?.innerText ||
    document.querySelector('h1')?.innerText || document.querySelector('h2')?.innerText || '');
  const dir = path.join(OUT, slug(category || new URL(url).pathname.split('/').filter(Boolean)[0]));

  let n = 0;
  for (const el of await page.$$(MAP_SELECTOR)) {
    const tag = await el.evaluate((e) => e.tagName.toLowerCase());
    try {
      if (tag === 'a') {
        const href = await el.evaluate((e) => e.href);
        const res = await ctx.request.get(href);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, path.basename(new URL(href).pathname)), await res.body());
      } else {
        const box = await el.boundingBox();
        if (!box || box.width < MIN_SIZE || box.height < MIN_SIZE) continue;
        const alt = await el.evaluate((e) => e.getAttribute('alt') || e.getAttribute('aria-label') || '');
        fs.mkdirSync(dir, { recursive: true });
        await el.screenshot({ path: path.join(dir, `${slug(alt || new URL(url).pathname.split('/').pop())}-${++n}.png`) });
      }
      total++;
    } catch (e) { console.warn('Falhou em', url, e.message); }
  }
  console.log(`${url} -> ${dir} (${n} imagens)`);
}

if (!DISCOVER) console.log(`\nConcluído: ${total} arquivos em ./${OUT}`);
await ctx.close();
