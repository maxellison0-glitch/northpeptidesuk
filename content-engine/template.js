'use strict';
/*
 * template.js - renders article pages and the blog index from structured data.
 * All compliance boilerplate is wrapped in <!--compliance:ignore-start/end-->
 * fences so the gate trusts it and scans only author prose.
 */

const fs = require('fs');
const path = require('path');
const { SITE, STATIC_PAGES, PRODUCTS, escapeHtml, resolveProducts, priceFrom, formatGBP, productPath } = require('./site.js');
const { renderFooter, FOOTER_CSS } = require('./footer.js');

const ROOT = path.join(__dirname, '..');

// Default sidebar "popular products" if an article doesn't specify its own.
const DEFAULT_POPULAR = ['retatrutide', 'tirzepatide', 'bpc-157', 'klow-stack'];

// Blog index path follows site.js STATIC_PAGES so canonical, nav and sitemap
// can never disagree (currently /blog/index.html).
const BLOG_INDEX_PATH = (STATIC_PAGES.find(p => /^\/blog\//.test(p.path)) || { path: '/blog/index.html' }).path;

// Site-wide share image for guides (1200x630 progressive JPEG in the repo root).
const DEFAULT_OG = { url: `${SITE.base}/og-guides.jpg`, width: 1200, height: 630, alt: 'North Peptides UK research guides' };

const DISCLAIMER_TEXT =
  'All content on North Peptides UK is provided for informational and educational purposes ' +
  'relating to laboratory and scientific research only. Nothing on this website constitutes ' +
  'medical advice. All products supplied by North Peptides UK are research compounds, strictly ' +
  'for research use only, and are not medicines and not intended for human or animal consumption. ' +
  'Always comply with applicable laws and regulations in your jurisdiction.';

const RUO_CALLOUT_TEXT =
  'Everything on this page describes the handling and properties of a research compound in a ' +
  'laboratory context only. It is not guidance for human or animal use. Products supplied by ' +
  'North Peptides UK are for research use only and are not for human or animal consumption.';

// Product photos whose optimised 600px WebP does not share the original's basename.
const THUMB_OVERRIDES = {
  'hf_20260523_171709_476460c3-db51-4ebf-b0ce-dce6b2f29382.jpeg': 'retatrutide-vial-600.webp',
  'hf_20260523_170534_235f0034-3e32-4b11-98c3-5b357b41672b.png': 'retatrutide-20mg-vial-600.webp',
  'hf_20260523_171735_79bb55e1-312b-40bf-93f2-59afdd43de09.jpeg': 'tirzepatide-vial-600.webp',
  'hf_20260523_171828_c517069f-2388-4215-bec5-f0516a7554b1.jpeg': 'bpc-157-vial-600.webp',
  'hf_20260523_171838_139029e0-0fb2-4778-9db6-5f0470e836ae.jpeg': 'tb-500-vial-600.webp',
  'hf_20260523_171852_e8a239be-4a76-4958-930e-b68b87cbc701.png': 'kpv-vial-600.webp',
  'hf_20260523_171904_baaf1708-79ff-4396-8a78-76018f3acdc4.jpeg': 'ipamorelin-vial-600.webp',
  'hf_20260523_171921_abfd9afd-aa38-48a9-bba3-538df7508dd2.jpeg': 'cjc-1295-vial-600.webp',
};

// 600px WebP thumbnail for a product slug (never the multi-MB original).
function thumbFor(slug) {
  const image = (PRODUCTS[slug] && PRODUCTS[slug].image) || 'logo.png';
  const candidate = THUMB_OVERRIDES[image] || image.replace(/\.(png|jpe?g|webp)$/i, '') + '-600.webp';
  return fs.existsSync(path.join(ROOT, candidate)) ? `/${candidate}` : '/logo-600.webp';
}

function wordsIn(html) {
  return (html.replace(/<[^>]+>/g, ' ').match(/\b\w+\b/g) || []).length;
}

function readingTime(article) {
  if (article.readingTime) return article.readingTime;
  const words = wordsIn(article.intro || '') + article.sections.reduce((n, s) => n + wordsIn(s.html), 0);
  return `${Math.max(3, Math.round(words / 200))} min read`;
}

function canonicalUrl(slug) {
  return `${SITE.base}/blog/${slug}.html`;
}

// Optional article.ogImage: a string URL/path or { url, width, height, alt }.
function ogImageFor(article) {
  const raw = article.ogImage;
  if (!raw) return DEFAULT_OG;
  const o = typeof raw === 'string' ? { url: raw } : { ...raw };
  if (!/^https?:\/\//.test(o.url)) o.url = `${SITE.base}/${String(o.url).replace(/^\/+/, '')}`;
  return { url: o.url, width: o.width || 1200, height: o.height || 1200, alt: o.alt || article.title };
}

function rewriteProductLinks(html) {
  return String(html).replace(
    /(href=["'])(?:https:\/\/www\.northpeptidesuk\.com)?\/product\.html\?product=([a-z0-9-]+)(["'])/g,
    (match, prefix, slug, suffix) => (PRODUCTS[slug] ? `${prefix}${productPath(slug)}${suffix}` : match)
  );
}

// ---- JSON-LD ---------------------------------------------------------------
function jsonLd(article) {
  const url = canonicalUrl(article.slug);
  const og = ogImageFor(article);
  const graph = [
    {
      '@type': 'Article',
      headline: article.title,
      description: article.description,
      image: { '@type': 'ImageObject', url: og.url, width: og.width, height: og.height },
      author: { '@type': 'Organization', name: SITE.name, url: SITE.base },
      publisher: {
        '@type': 'Organization',
        name: SITE.name,
        url: SITE.base,
        logo: { '@type': 'ImageObject', url: `${SITE.base}/logo.png`, width: 600, height: 600 },
      },
      datePublished: article.datePublished,
      dateModified: article.dateModified || article.datePublished,
      mainEntityOfPage: url,
      url,
      inLanguage: 'en-GB',
      isAccessibleForFree: true,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.base}/` },
        { '@type': 'ListItem', position: 2, name: 'Research Guides', item: `${SITE.base}${BLOG_INDEX_PATH}` },
        { '@type': 'ListItem', position: 3, name: article.title, item: url },
      ],
    },
  ];
  if (article.faqs && article.faqs.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: article.faqs.map(f => ({
        '@type': 'Question', name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);
}

// ---- Shared chrome ---------------------------------------------------------
function headCommon() {
  return `  <link rel="icon" href="/logo.png" type="image/png">
  <link rel="apple-touch-icon" href="/logo.png">
  <script src="/site-config.js" defer></script>
  <script src="/tiktok-analytics.js" defer></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=DM+Mono:wght@400;500&family=Syne:wght@800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/np.css">`;
}

function nav(active) {
  const link = (href, label, key) => `      <a href="${href}"${active === key ? ' class="active" aria-current="page"' : ''}>${label}</a>`;
  return `  <nav class="nav" aria-label="Primary navigation">
    <a href="/" class="logo">NORTH<span>PEPTIDES</span>UK</a>
    <div data-site-search></div>
    <div class="nav-links">
${link('/#products', 'Products', 'products')}
${link('/lab-reports.html', 'Lab Reports', 'lab')}
${link('/why-us.html', 'Why Us', 'why')}
${link(BLOG_INDEX_PATH, 'Guides', 'guides')}
      <a href="/checkout.html" class="nav-basket">Basket</a>
    </div>
  </nav>`;
}

// ---- Sidebar pieces --------------------------------------------------------
function productCard(title, slugs) {
  const rows = resolveProducts(slugs).map(p => `
          <a href="${p.url}" class="sidebar-product">
            <div class="sidebar-product-dot"></div>
            <div>
              <span class="sidebar-product-name">${escapeHtml(p.name)}</span>
              <span class="sidebar-product-price">${escapeHtml(p.priceLabel)}</span>
            </div>
          </a>`).join('');
  return `
      <div class="sidebar-card">
        <div class="sidebar-card-header"><div class="sidebar-card-header-title">${escapeHtml(title)}</div></div>
        <div class="sidebar-card-body">${rows}
          <a href="/#products" class="sidebar-cta">Shop research compounds &rarr;</a>
        </div>
      </div>`;
}

function tocCard(article) {
  const items = article.sections.map(s => `<li><a href="#${s.id}">${escapeHtml(s.heading)}</a></li>`).join('\n            ');
  const faqItem = (article.faqs && article.faqs.length) ? `\n            <li><a href="#faq">FAQ</a></li>` : '';
  return `
      <div class="sidebar-card">
        <div class="sidebar-card-header"><div class="sidebar-card-header-title">In this guide</div></div>
        <div class="sidebar-card-body">
          <ul class="sidebar-toc">
            ${items}${faqItem}
          </ul>
        </div>
      </div>`;
}

// ---- Body pieces -----------------------------------------------------------
function ruoCallout() {
  return `
      <!--compliance:ignore-start-->
      <div class="callout callout-amber">
        <div class="callout-title">Research Use Only</div>
        <p>${RUO_CALLOUT_TEXT}</p>
      </div>
      <!--compliance:ignore-end-->`;
}

function renderSections(article) {
  return article.sections.map((s, i) => {
    const block = `      <h2 id="${s.id}">${escapeHtml(s.heading)}</h2>\n${rewriteProductLinks(s.html)}`;
    // Drop the mandatory RUO callout in right after the first section.
    return i === 0 ? block + '\n' + ruoCallout() : block;
  }).join('\n\n');
}

function renderFaq(article) {
  if (!article.faqs || !article.faqs.length) return '';
  const items = article.faqs.map(f => `
      <div class="faq-item">
        <h3>${escapeHtml(f.q)}</h3>
        <p>${escapeHtml(f.a)}</p>
      </div>`).join('');
  return `\n\n      <h2 id="faq">Frequently Asked Questions</h2>${items}`;
}

// ---- Article page ----------------------------------------------------------
function renderArticle(article) {
  const url = canonicalUrl(article.slug);
  const metaTitle = article.metaTitle || `${article.title} | ${SITE.name}`;
  const heroTitle = article.htmlTitle || escapeHtml(article.title);
  const popular = article.popularProducts || DEFAULT_POPULAR;
  const og = ogImageFor(article);

  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(metaTitle)}</title>
  <meta name="description" content="${escapeHtml(article.description)}">
  <link rel="canonical" href="${url}">
  <meta name="robots" content="index, follow">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="${SITE.name}">
  <meta property="og:locale" content="en_GB">
  <meta property="og:title" content="${escapeHtml(article.title)}">
  <meta property="og:description" content="${escapeHtml(article.description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${escapeHtml(og.url)}">
  <meta property="og:image:width" content="${og.width}">
  <meta property="og:image:height" content="${og.height}">
  <meta property="og:image:alt" content="${escapeHtml(og.alt)}">
  <meta property="article:published_time" content="${escapeHtml(article.datePublished)}">
  <meta property="article:modified_time" content="${escapeHtml(article.dateModified || article.datePublished)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(article.title)}">
  <meta name="twitter:description" content="${escapeHtml(article.description)}">
  <meta name="twitter:image" content="${escapeHtml(og.url)}">
  <script type="application/ld+json">
${jsonLd(article)}
  </script>
${headCommon()}
  <style>${NAV_CSS}${ARTICLE_CSS}${FOOTER_CSS}</style>
  <link rel="stylesheet" href="/site-search.css">
  <script src="/site-search.js" defer></script>
</head>
<body>

${nav('guides')}

  <div class="article-hero">
    <div class="article-hero-inner">
      <span class="article-tag">${escapeHtml(article.category || 'Research Guide')}</span>
      <h1 class="article-title">${heroTitle}</h1>
      <div class="article-meta">${SITE.name} · ${readingTime(article)} · Research Use Only</div>
      <p class="article-intro">${escapeHtml(article.intro)}</p>
    </div>
  </div>

  <div class="article-layout">
    <article class="article-content">
${renderSections(article)}${renderFaq(article)}
    </article>

    <aside class="article-sidebar">
${productCard("You'll want these", article.relatedProducts)}
${tocCard(article)}
${productCard('Popular compounds', popular)}
    </aside>
  </div>

  <!--compliance:ignore-start-->
  <div class="article-disclaimer">
    <p>Disclaimer: ${DISCLAIMER_TEXT}</p>
  </div>
  <!--compliance:ignore-end-->

${renderFooter()}

</body>
</html>
`;
}

// ---- Blog index ------------------------------------------------------------
function renderBlogIndex(articles) {
  const indexUrl = `${SITE.base}${BLOG_INDEX_PATH}`;
  const cards = articles.map(a => {
    const hero = resolveProducts(a.relatedProducts)[0];
    const thumb = thumbFor(hero.slug);
    return `
      <article class="post-card">
        <a class="post-thumb" href="${hero.url}" aria-label="${escapeHtml(hero.name)} research compound">
          <img src="${thumb}" width="600" height="600" loading="lazy" decoding="async" alt="${escapeHtml(hero.name)} research compound">
        </a>
        <div class="post-body">
          <span class="cat">${escapeHtml(a.category || 'Research Guide')}</span>
          <h2><a href="${a.slug}.html">${escapeHtml(a.title)}</a></h2>
          <p>${escapeHtml(a.cardSummary || a.description)}</p>
          <span class="read">Read guide &rarr;</span>
        </div>
      </article>`;
  }).join('\n');

  const description = 'Research-use guides from North Peptides UK on handling, reconstitution, storage and comparison of research peptides for UK laboratories.';

  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Research Guides | ${SITE.name}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${indexUrl}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${SITE.name}">
  <meta property="og:locale" content="en_GB">
  <meta property="og:title" content="Research Guides | ${SITE.name}">
  <meta property="og:description" content="Practical, research-use guides on handling, reconstitution, storage and comparison of research peptides for UK laboratories.">
  <meta property="og:url" content="${indexUrl}">
  <meta property="og:image" content="${DEFAULT_OG.url}">
  <meta property="og:image:width" content="${DEFAULT_OG.width}">
  <meta property="og:image:height" content="${DEFAULT_OG.height}">
  <meta property="og:image:alt" content="${DEFAULT_OG.alt}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Research Guides | ${SITE.name}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${DEFAULT_OG.url}">
  <script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "North Peptides UK Research Guides",
  "url": "${indexUrl}",
  "inLanguage": "en-GB",
  "publisher": { "@type": "Organization", "name": "${SITE.name}", "url": "${SITE.base}", "logo": { "@type": "ImageObject", "url": "${SITE.base}/logo.png", "width": 600, "height": 600 } }
}
  </script>
${headCommon()}
  <style>${NAV_CSS}${INDEX_CSS}${FOOTER_CSS}</style>
  <link rel="stylesheet" href="/site-search.css">
  <script src="/site-search.js" defer></script>
</head>
<body>
${nav('guides')}

  <header class="hero">
    <div class="tag">Research Guides</div>
    <h1>Research peptide guides</h1>
    <p>Practical, research-use information on handling, reconstitution, storage and comparison of lyophilised research peptides - written for UK laboratory researchers. For research use only; nothing here is guidance for human or animal use.</p>
  </header>

  <main class="wrap">
    <div class="post-grid">${cards}
    </div>
  </main>

  <!--compliance:ignore-start-->
  <div class="disclaimer">
    <p>All guides are provided for laboratory research context only. Products supplied by North Peptides UK are research compounds - not medicines, and not for human or animal consumption.</p>
  </div>
  <!--compliance:ignore-end-->

${renderFooter()}
</body>
</html>
`;
}

// ---- Styles ----------------------------------------------------------------
// Sub-page nav — np.css supplies the sticky white shell, .logo, .nav-links and
// .nav-basket. These rules only keep the basket visible on phones and tighten
// spacing on narrow screens.
const NAV_CSS = `
    .nav-links a.active { color: var(--ink); }
    @media (max-width: 768px) {
      .nav-links { display: flex; }
      .nav-links a:not(.nav-basket) { display: none; }
    }
    @media (max-width: 480px) {
      .nav { padding: 0 12px; gap: 10px; }
      .logo { font-size: 0.84rem; letter-spacing: 0.05em; }
      .nav-links { gap: 8px; }
      .nav-basket { padding: 8px 10px; font-size: 0.6rem; }
    }`;

const ARTICLE_CSS = `
    /* ==================================================================
       RESEARCH GUIDE — North Clinical. Builds on /css/np.css tokens.
       Ink hero band, ~720px editorial reading column, quiet sidebar.
       ================================================================== */
    html, body { max-width: 100%; overflow-x: hidden; }
    body { background: var(--frost); }

    /* hero — instrument ink band */
    .article-hero { position: relative; background: var(--ink); padding: 64px 40px 58px; overflow: hidden; }
    .article-hero::before { content: ''; position: absolute; inset: 0; pointer-events: none; background: radial-gradient(46% 62% at 84% 0%, rgba(31,111,235,0.22), transparent 70%); }
    .article-hero-inner { position: relative; max-width: 1100px; margin: 0 auto; }
    .article-tag { display: inline-block; font-family: var(--font-mono); font-size: 0.7rem; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; color: var(--sky); border: 1px solid rgba(56,189,248,0.3); background: rgba(56,189,248,0.08); padding: 6px 13px; border-radius: var(--r-pill); margin-bottom: 20px; }
    .article-title { font-family: var(--font-display); font-size: clamp(1.9rem, 4vw, 2.8rem); font-weight: 600; color: #fff; line-height: 1.1; margin-bottom: 16px; letter-spacing: -0.02em; max-width: 820px; }
    .article-title em { font-style: normal; color: var(--sky); }
    .article-meta { font-family: var(--font-mono); font-size: 0.72rem; color: #8FB4D6; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 20px; }
    .article-intro { font-size: 1.05rem; color: #A9BDD4; line-height: 1.75; max-width: 660px; }

    /* layout */
    .article-layout { max-width: 1100px; margin: 0 auto; padding: 56px 40px 72px; display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 48px; align-items: start; }
    .article-content { max-width: 720px; min-width: 0; }
    .article-content h2 { font-family: var(--font-display); font-size: 1.5rem; font-weight: 600; color: var(--ink); margin: 44px 0 16px; letter-spacing: -0.015em; scroll-margin-top: 110px; }
    .article-content h2:first-child { margin-top: 0; }
    .article-content h3 { font-family: var(--font-display); font-size: 1.1rem; font-weight: 600; color: var(--ink); margin: 26px 0 10px; }
    .article-content p { font-size: 1.05rem; color: var(--body); line-height: 1.75; margin-bottom: 18px; }
    .article-content ul, .article-content ol { margin: 14px 0 20px; padding-left: 22px; }
    .article-content li { font-size: 1rem; color: var(--body); line-height: 1.75; margin-bottom: 8px; }
    .article-content li::marker { color: var(--action); }
    .article-content strong { color: var(--ink); }
    .article-content a { color: var(--action); border-bottom: 1px solid rgba(31,111,235,0.3); transition: color 0.15s, border-color 0.15s; }
    .article-content a:hover { color: var(--action-deep); border-color: var(--action-deep); }

    /* callouts — blue informs, amber cautions, ink asserts */
    .callout { border: 1px solid var(--line); border-radius: var(--r-ctl); padding: 18px 20px; margin: 26px 0; }
    .callout-green { background: var(--action-tint); border-color: rgba(31,111,235,0.3); }
    .callout-amber { background: var(--amber-tint); border-color: rgba(180,83,9,0.3); }
    .callout-dark { background: var(--ink); border-color: var(--ink); }
    .callout-title { font-family: var(--font-mono); font-size: 0.7rem; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 8px; }
    .callout-green .callout-title { color: var(--action); }
    .callout-amber .callout-title { color: var(--amber); }
    .callout-dark .callout-title { color: var(--sky); }
    .callout p { font-size: 0.95rem !important; line-height: 1.7; margin-bottom: 0 !important; }
    .callout-green p { color: var(--body); }
    .callout-amber p { color: var(--body); }
    .callout-dark p { color: #B9C7DA !important; }

    /* comparison tables — np-table voice inside a hairline card */
    .compare-table { width: 100%; border-collapse: separate; border-spacing: 0; margin: 22px 0; font-size: 0.9rem; background: var(--paper); border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }
    .compare-table th { background: var(--frost-2); color: var(--muted); font-family: var(--font-mono); font-size: 0.7rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; padding: 11px 14px; text-align: left; border-bottom: 1px solid var(--line); }
    .compare-table td { padding: 11px 14px; border-bottom: 1px solid var(--line-soft); color: var(--body); vertical-align: top; }
    .compare-table tr:last-child td { border-bottom: none; }
    .compare-table td:first-child { font-weight: 600; color: var(--ink); }
    .faq-item { border-top: 1px solid var(--line-soft); padding: 20px 0; }
    .faq-item h3 { margin: 0 0 8px; }
    .faq-item p { margin: 0; font-size: 0.95rem; }

    /* sidebar — quiet white cards */
    .article-sidebar { position: sticky; top: calc(var(--npbar-h, 0px) + 80px); min-width: 0; }
    .sidebar-card { background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-card); box-shadow: var(--shadow-1); overflow: hidden; margin-bottom: 18px; }
    .sidebar-card-header { padding: 16px 18px 0; }
    .sidebar-card-header-title { font-family: var(--font-mono); font-size: 0.7rem; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: var(--action); }
    .sidebar-card-body { padding: 8px 18px 18px; }
    .sidebar-product { display: flex; align-items: center; gap: 10px; padding: 11px 0; border-bottom: 1px solid var(--line-soft); }
    .sidebar-product:last-of-type { border-bottom: none; }
    .sidebar-product-name { font-family: var(--font-display); font-size: 0.88rem; font-weight: 600; color: var(--ink); display: block; transition: color 0.15s; }
    .sidebar-product:hover .sidebar-product-name { color: var(--action); }
    .sidebar-product-price { font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.04em; color: var(--muted); }
    .sidebar-product-dot { width: 7px; height: 7px; background: var(--action); border-radius: 50%; flex-shrink: 0; }
    .sidebar-cta { display: block; width: 100%; padding: 12px; background: var(--ink); color: #fff; font-family: var(--font-mono); font-size: 0.7rem; font-weight: 500; letter-spacing: 0.09em; text-transform: uppercase; text-align: center; border-radius: var(--r-ctl); transition: background 0.18s var(--ease); margin-top: 14px; }
    .sidebar-cta:hover { background: var(--action); color: #fff; }
    .sidebar-toc { list-style: none; margin: 0; padding: 0; }
    .sidebar-toc li { border-bottom: 1px solid var(--line-soft); }
    .sidebar-toc li:last-child { border-bottom: none; }
    .sidebar-toc a { display: block; padding: 10px 0; font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.04em; color: var(--muted); transition: color 0.15s; }
    .sidebar-toc a:hover { color: var(--action); }

    .article-disclaimer { max-width: 1100px; margin: 0 auto; padding: 0 40px 44px; }
    .article-disclaimer p { font-family: var(--font-mono); font-size: 0.8rem; color: var(--muted); line-height: 1.7; letter-spacing: 0.02em; border-top: 1px solid var(--line); padding-top: 18px; }

    @media (max-width: 900px) {
      .article-hero { padding: 44px 20px 40px; }
      .article-layout { grid-template-columns: 1fr; gap: 40px; padding: 40px 20px 56px; }
      .article-sidebar { position: static; }
      .compare-table { display: block; overflow-x: auto; }
      .article-disclaimer { padding: 0 20px 36px; }
    }`;

const INDEX_CSS = `
    /* ==================================================================
       RESEARCH GUIDES INDEX — North Clinical. Builds on /css/np.css tokens.
       ================================================================== */
    html, body { max-width: 100%; overflow-x: hidden; }
    body { background: var(--frost); color: var(--body); }
    a { color: inherit; text-decoration: none; }
    .hero { max-width: var(--wrap); margin: 0 auto; padding: 56px 40px 24px; }
    .hero .tag { font-family: var(--font-mono); font-size: 0.7rem; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; color: var(--action); margin-bottom: 12px; }
    .hero h1 { font-family: var(--font-display); font-size: clamp(2rem, 5vw, 3rem); line-height: 1.05; color: var(--ink); margin-bottom: 14px; letter-spacing: -0.02em; }
    .hero p { color: var(--muted); max-width: 620px; line-height: 1.7; font-size: 1rem; }
    .wrap { max-width: var(--wrap); margin: 0 auto; padding: 18px 40px 70px; }
    .post-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .post-card { position: relative; display: flex; flex-direction: column; background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-card); overflow: hidden; box-shadow: var(--shadow-1); transition: transform 0.2s var(--ease), box-shadow 0.2s var(--ease), border-color 0.2s; }
    .post-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-2); border-color: #C3D4E4; }
    .post-thumb { position: relative; z-index: 1; display: block; aspect-ratio: 16 / 9; background: var(--frost-2); border-bottom: 1px solid var(--line-soft); overflow: hidden; }
    .post-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .post-body { padding: 20px 22px 22px; display: flex; flex-direction: column; flex: 1; }
    .post-card .cat { font-family: var(--font-mono); font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--action); }
    .post-card h2 { font-family: var(--font-display); font-size: 1.2rem; font-weight: 600; color: var(--ink); margin: 10px 0 8px; line-height: 1.25; letter-spacing: -0.01em; }
    .post-card h2 a::after { content: ''; position: absolute; inset: 0; }
    .post-card:hover h2 a { color: var(--action); }
    .post-card p { color: var(--muted); font-size: 0.9rem; line-height: 1.65; flex: 1; }
    .post-card .read { display: inline-block; margin-top: 14px; font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--action); }
    .disclaimer { max-width: var(--wrap); margin: 0 auto; padding: 0 40px 40px; }
    .disclaimer p { font-family: var(--font-mono); font-size: 0.8rem; color: var(--muted); line-height: 1.7; border-top: 1px solid var(--line); padding-top: 16px; }
    @media (max-width: 760px) {
      .hero, .wrap, .disclaimer { padding-left: 18px; padding-right: 18px; }
    }`;

module.exports = { renderArticle, renderBlogIndex, canonicalUrl, DISCLAIMER_TEXT, thumbFor, ogImageFor };
