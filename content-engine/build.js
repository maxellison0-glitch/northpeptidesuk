'use strict';
/*
 * build.js — the content-engine orchestrator.
 *
 *   node content-engine/build.js          full build (gate + write files)
 *   node content-engine/build.js --check  run the compliance gate only, write nothing
 *
 * Pipeline per article:
 *   load articles/*.js  ->  validate  ->  render  ->  COMPLIANCE GATE  ->  write
 * The gate is fail-closed: if ANY article fails, nothing is written and the
 * process exits 1. Then blog/index.html and sitemap.xml (+ robots.txt) are
 * regenerated from the full catalogue and article set.
 */

const fs = require('fs');
const path = require('path');
const { lint, formatReport } = require('./compliance.js');
const { renderArticle, renderBlogIndex } = require('./template.js');
const { SITE, STATIC_PAGES, PRODUCTS, productPriority } = require('./site.js');

const ROOT = path.join(__dirname, '..');
const ARTICLES_DIR = path.join(__dirname, 'articles');
const BLOG_DIR = path.join(ROOT, 'blog');
const BUILD_DATE = (() => {
  try {
    const { execSync } = require('child_process');
    return execSync('git log -1 --format=%as HEAD', { encoding: 'utf8', cwd: ROOT }).trim();
  } catch { return new Date().toISOString().slice(0, 10); }
})();

const REQUIRED_FIELDS = ['slug', 'title', 'description', 'datePublished', 'intro', 'sections', 'relatedProducts'];

function loadArticles() {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs.readdirSync(ARTICLES_DIR)
    .filter(f => f.endsWith('.js') && !f.startsWith('_'))
    .map(f => {
      const article = require(path.join(ARTICLES_DIR, f));
      validate(article, f);
      return article;
    })
    .sort((a, b) => (a.datePublished < b.datePublished ? 1 : -1)); // newest first
}

function validate(a, file) {
  for (const field of REQUIRED_FIELDS) {
    if (a[field] === undefined || a[field] === null || (Array.isArray(a[field]) && !a[field].length)) {
      throw new Error(`Article "${file}" is missing required field: ${field}`);
    }
  }
  if (!/^[a-z0-9-]+$/.test(a.slug)) throw new Error(`Article "${file}" has invalid slug "${a.slug}"`);
}

function xml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function urlEntry(loc, lastmod, changefreq, priority) {
  return `  <url>\n    <loc>${xml(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

function buildSitemap(articles) {
  const entries = [];
  for (const p of STATIC_PAGES) {
    entries.push(urlEntry(SITE.base + p.path, BUILD_DATE, p.changefreq, p.priority));
  }
  for (const slug of Object.keys(PRODUCTS)) {
    entries.push(urlEntry(`${SITE.base}/product.html?product=${slug}`, BUILD_DATE, 'weekly', productPriority(slug)));
  }
  for (const a of articles) {
    entries.push(urlEntry(`${SITE.base}/blog/${a.slug}.html`, a.dateModified || a.datePublished, 'monthly', '0.6'));
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;
}

function buildProductFeed() {
  return {
    site: SITE.name,
    baseUrl: SITE.base,
    generatedAt: BUILD_DATE,
    disclaimer: 'Products are supplied for laboratory research use only and are not for human or animal consumption.',
    documentationStatus: 'Supplier documentation is available on request where held. Independent COA testing is being arranged for selected products.',
    products: Object.entries(PRODUCTS).map(([slug, product]) => ({
      slug,
      name: product.name,
      category: product.category,
      url: `${SITE.base}/product.html?product=${slug}`,
      image: `${SITE.base}/${product.image}`,
      summary: product.summary,
      researchUseOnly: true,
      supply: Boolean(product.supply),
      variants: product.variants.map(variant => ({
        label: variant.label,
        dose: variant.dose,
        price: variant.price,
        currency: 'GBP',
      })),
      specs: Array.isArray(product.specs)
        ? product.specs.map(([label, value]) => ({ label, value }))
        : [],
    })),
  };
}

function updateRobots() {
  const robotsPath = path.join(ROOT, 'robots.txt');
  let txt = fs.readFileSync(robotsPath, 'utf8');
  const want = `Sitemap: ${SITE.base}/sitemap.xml`;
  txt = /Sitemap:.*/i.test(txt) ? txt.replace(/Sitemap:.*/i, want) : txt.trimEnd() + `\n\n${want}\n`;
  fs.writeFileSync(robotsPath, txt);
}

function main() {
  const checkOnly = process.argv.includes('--check');
  const articles = loadArticles();
  if (!articles.length) { console.error('No articles found in content-engine/articles/'); process.exit(2); }

  // Render + gate every article BEFORE writing anything (fail closed).
  const rendered = [];
  let failed = 0;
  for (const a of articles) {
    const html = renderArticle(a);
    const result = lint(html, { allow: a.allow });
    console.log(formatReport(`blog/${a.slug}.html`, result));
    if (!result.ok) failed++;
    rendered.push({ a, html });
  }
  if (failed) {
    console.error(`\nCOMPLIANCE GATE FAILED — ${failed}/${articles.length} article(s) blocked. Nothing written.`);
    process.exit(1);
  }
  console.log(`\nCompliance gate: ${articles.length}/${articles.length} passed.`);

  if (checkOnly) { console.log('--check: no files written.'); return; }

  // All clear — write article pages, index, sitemap, robots.
  if (!fs.existsSync(BLOG_DIR)) fs.mkdirSync(BLOG_DIR, { recursive: true });
  for (const { a, html } of rendered) {
    fs.writeFileSync(path.join(BLOG_DIR, `${a.slug}.html`), html);
  }
  fs.writeFileSync(path.join(BLOG_DIR, 'index.html'), renderBlogIndex(articles));
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), buildSitemap(articles));
  fs.writeFileSync(path.join(ROOT, 'products.json'), JSON.stringify(buildProductFeed(), null, 2) + '\n');
  updateRobots();

  console.log(`\nBuilt ${articles.length} article(s):`);
  for (const a of articles) console.log(`  · blog/${a.slug}.html  — "${a.title}"`);
  console.log(`Regenerated: blog/index.html, sitemap.xml (${STATIC_PAGES.length} pages + ${Object.keys(PRODUCTS).length} products + ${articles.length} articles), products.json, robots.txt`);
}

if (require.main === module) main();
module.exports = { loadArticles, buildSitemap, buildProductFeed };
