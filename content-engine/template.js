'use strict';
/*
 * template.js - renders article pages and the blog index from structured data.
 * All compliance boilerplate is wrapped in <!--compliance:ignore-start/end-->
 * fences so the gate trusts it and scans only author prose.
 */

const { SITE, STATIC_PAGES, PRODUCTS, escapeHtml, resolveProducts, priceFrom, formatGBP, productPath } = require('./site.js');

// Default sidebar "popular products" if an article doesn't specify its own.
const DEFAULT_POPULAR = ['retatrutide', 'tirzepatide', 'bpc-157', 'klow-stack'];

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

function rewriteProductLinks(html) {
  return String(html).replace(
    /(href=["'])(?:https:\/\/www\.northpeptidesuk\.com)?\/product\.html\?product=([a-z0-9-]+)(["'])/g,
    (match, prefix, slug, suffix) => (PRODUCTS[slug] ? `${prefix}${productPath(slug)}${suffix}` : match)
  );
}

// ---- JSON-LD ---------------------------------------------------------------
function jsonLd(article) {
  const url = canonicalUrl(article.slug);
  const graph = [
    {
      '@type': 'Article',
      headline: article.title,
      description: article.description,
      author: { '@type': 'Organization', name: SITE.name, url: SITE.base },
      publisher: { '@type': 'Organization', name: SITE.name, url: SITE.base },
      datePublished: article.datePublished,
      dateModified: article.dateModified || article.datePublished,
      mainEntityOfPage: url,
      url,
      isAccessibleForFree: true,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.base}/` },
        { '@type': 'ListItem', position: 2, name: 'Research Guides', item: `${SITE.base}/blog/index.html` },
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
        <div class="sidebar-card-header"><div class="sidebar-card-header-title">// ${escapeHtml(title)}</div></div>
        <div class="sidebar-card-body">${rows}
          <a href="/#products" class="sidebar-cta">Shop Research Compounds -></a>
        </div>
      </div>`;
}

function tocCard(article) {
  const items = article.sections.map(s => `<li><a href="#${s.id}">${escapeHtml(s.heading)}</a></li>`).join('\n            ');
  const faqItem = (article.faqs && article.faqs.length) ? `\n            <li><a href="#faq">FAQ</a></li>` : '';
  return `
      <div class="sidebar-card">
        <div class="sidebar-card-header"><div class="sidebar-card-header-title">// In This Guide</div></div>
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(metaTitle)}</title>
  <meta name="description" content="${escapeHtml(article.description)}">
  <link rel="canonical" href="${url}">
  <link rel="icon" href="/favicon.jpg" type="image/jpeg">
  <meta name="robots" content="index, follow">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="${SITE.name}">
  <meta property="og:title" content="${escapeHtml(article.title)}">
  <meta property="og:description" content="${escapeHtml(article.description)}">
  <meta property="og:url" content="${url}">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">
${jsonLd(article)}
  </script>
  <script src="/site-config.js" defer></script>
  <script src="/tiktok-analytics.js" defer></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet">
  <style>${ARTICLE_CSS}</style>
  <link rel="stylesheet" href="/site-search.css">
  <script src="/site-search.js" defer></script>
</head>
<body>

  <nav class="nav">
    <a href="/" class="nav-logo">NORTH<span>PEPTIDES</span>UK</a>
    <div data-site-search></div>
    <div class="nav-right">
      <a href="/#products" class="nav-link">Products</a>
      <a href="/blog/index.html" class="nav-link">Guides</a>
      <a href="/#products" class="nav-cta">Shop Now -></a>
    </div>
  </nav>

  <div class="article-hero">
    <div class="article-hero-inner">
      <span class="article-tag">// ${escapeHtml(article.category || 'Research Guide')}</span>
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
${productCard("You'll Want These", article.relatedProducts)}
${tocCard(article)}
${productCard('Popular Compounds', popular)}
    </aside>
  </div>

  <!--compliance:ignore-start-->
  <div class="article-disclaimer">
    <p>Disclaimer: ${DISCLAIMER_TEXT}</p>
  </div>
  <!--compliance:ignore-end-->

  <footer class="footer">
    <a href="/" class="footer-logo">NORTH<span>PEPTIDES</span>UK</a>
    <p>© 2026 ${SITE.name} · Research Use Only · <a href="${SITE.telegramUrl}" class="footer-tg">${SITE.telegram}</a></p>
  </footer>

</body>
</html>
`;
}

// ---- Blog index ------------------------------------------------------------
function renderBlogIndex(articles) {
  const cards = articles.map(a => `
      <a class="post-card" href="${a.slug}.html">
        <span class="cat">${escapeHtml(a.category || 'Research Guide')}</span>
        <h2>${escapeHtml(a.title)}</h2>
        <p>${escapeHtml(a.cardSummary || a.description)}</p>
        <span class="read">Read guide -></span>
      </a>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Research Guides | ${SITE.name}</title>
  <meta name="description" content="Research-use guides from North Peptides UK on handling, reconstitution, storage and comparison of research peptides for UK laboratories.">
  <link rel="canonical" href="${SITE.base}/blog/index.html">
  <link rel="icon" href="/favicon.jpg" type="image/jpeg">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${SITE.name}">
  <meta property="og:title" content="Research Guides | ${SITE.name}">
  <meta property="og:description" content="Practical, research-use guides on handling, reconstitution, storage and comparison of research peptides for UK laboratories.">
  <meta property="og:url" content="${SITE.base}/blog/index.html">
  <meta name="twitter:card" content="summary">
  <script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "North Peptides UK Research Guides",
  "url": "${SITE.base}/blog/index.html",
  "publisher": { "@type": "Organization", "name": "${SITE.name}", "url": "${SITE.base}" }
}
  </script>
  <script src="/site-config.js" defer></script>
  <script src="/tiktok-analytics.js" defer></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet">
  <style>${INDEX_CSS}</style>
  <link rel="stylesheet" href="/site-search.css">
  <script src="/site-search.js" defer></script>
</head>
<body>
  <nav class="nav">
    <a href="../index.html" class="logo">NORTH<span>PEPTIDES</span>UK</a>
    <div data-site-search></div>
    <div class="nav-links">
      <a href="../index.html#products">Products</a>
      <a href="../lab-reports.html">Lab Reports</a>
      <a href="../why-us.html">Why Us</a>
      <a href="../index.html#products" class="nav-basket">Shop</a>
    </div>
  </nav>

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

  <footer class="footer">
    <div class="links">
      <a href="../index.html#products">Products</a>
      <a href="../why-us.html">Why Us</a>
      <a href="../lab-reports.html">Lab Reports</a>
      <a href="../compliance.html">Research Use Policy</a>
      <a href="mailto:${SITE.email}">Support</a>
    </div>
    <p class="disc">© 2026 ${SITE.name} · Research use only. Not for human or animal consumption.</p>
  </footer>
</body>
</html>
`;
}

// ---- Styles ----------------------------------------------------------------
const ARTICLE_CSS = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { font-family: 'DM Sans', sans-serif; background: #F8F9FA; color: #111827; line-height: 1.7; }
    a { text-decoration: none; }
    .nav { background: #10233F; padding: 0 40px; height: 56px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; }
    .nav-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 0.95rem; letter-spacing: 0.08em; color: #fff; }
    .nav-logo span { color: #0EA5E9; }
    .nav-right { display: flex; align-items: center; gap: 20px; }
    .nav-link { font-family: 'DM Mono', monospace; font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.6); transition: color 0.2s; }
    .nav-link:hover { color: #0EA5E9; }
    .nav-cta { padding: 7px 16px; background: #0EA5E9; color: #fff; font-family: 'DM Mono', monospace; font-size: 0.65rem; letter-spacing: 0.08em; text-transform: uppercase; border-radius: 4px; transition: opacity 0.2s; }
    .nav-cta:hover { opacity: 0.88; }
    .article-hero { background: #10233F; padding: 56px 40px 48px; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .article-hero-inner { max-width: 760px; margin: 0 auto; }
    .article-tag { display: inline-block; font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase; color: #0EA5E9; border: 1px solid rgba(14,165,233,0.3); padding: 5px 12px; border-radius: 20px; margin-bottom: 18px; background: rgba(14,165,233,0.08); }
    .article-title { font-family: 'Syne', sans-serif; font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 800; color: #fff; line-height: 1.1; margin-bottom: 16px; letter-spacing: -0.01em; }
    .article-title em { font-style: normal; color: #0EA5E9; }
    .article-meta { font-family: 'DM Mono', monospace; font-size: 0.62rem; color: rgba(255,255,255,0.4); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 20px; }
    .article-intro { font-size: 1.05rem; color: rgba(255,255,255,0.7); line-height: 1.75; max-width: 620px; }
    .article-layout { max-width: 1100px; margin: 0 auto; padding: 48px 40px; display: grid; grid-template-columns: 1fr 300px; gap: 56px; align-items: start; }
    .article-content h2 { font-family: 'Syne', sans-serif; font-size: 1.4rem; font-weight: 800; color: #10233F; margin: 36px 0 14px; letter-spacing: -0.01em; }
    .article-content h2:first-child { margin-top: 0; }
    .article-content h3 { font-family: 'Syne', sans-serif; font-size: 1.05rem; font-weight: 700; color: #10233F; margin: 24px 0 10px; }
    .article-content p { font-size: 0.96rem; color: #374151; line-height: 1.85; margin-bottom: 16px; }
    .article-content ul, .article-content ol { margin: 12px 0 18px 20px; }
    .article-content li { font-size: 0.96rem; color: #374151; line-height: 1.75; margin-bottom: 6px; }
    .article-content strong { color: #10233F; }
    .article-content a { color: #1F6FEB; border-bottom: 1px solid rgba(31,111,235,0.3); }
    .article-content a:hover { color: #0EA5E9; }
    .callout { border-radius: 8px; padding: 18px 20px; margin: 24px 0; }
    .callout-green { background: #EEF7FD; border-left: 3px solid #0EA5E9; }
    .callout-amber { background: #fffbeb; border-left: 3px solid #D97706; }
    .callout-dark { background: #10233F; border-left: 3px solid #0EA5E9; }
    .callout-title { font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 8px; }
    .callout-green .callout-title { color: #0EA5E9; }
    .callout-amber .callout-title { color: #D97706; }
    .callout-dark .callout-title { color: #0EA5E9; }
    .callout p { font-size: 0.9rem !important; margin-bottom: 0 !important; }
    .callout-green p { color: #065f46; }
    .callout-amber p { color: #92400e; }
    .callout-dark p { color: rgba(255,255,255,0.78) !important; }
    .compare-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 0.88rem; }
    .compare-table th { background: #10233F; color: #fff; font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.12em; text-transform: uppercase; padding: 10px 14px; text-align: left; }
    .compare-table td { padding: 10px 14px; border-bottom: 1px solid #E2E8F0; color: #374151; vertical-align: top; }
    .compare-table tr:nth-child(even) td { background: #F8F9FA; }
    .compare-table tr:last-child td { border-bottom: none; }
    .compare-table td:first-child { font-weight: 600; color: #10233F; }
    .faq-item { border-top: 1px solid #E2E8F0; padding: 18px 0; }
    .faq-item h3 { margin: 0 0 6px; }
    .faq-item p { margin: 0; }
    .article-sidebar { position: sticky; top: 80px; }
    .sidebar-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 10px; overflow: hidden; margin-bottom: 16px; }
    .sidebar-card-header { background: #10233F; padding: 12px 16px; }
    .sidebar-card-header-title { font-family: 'DM Mono', monospace; font-size: 0.58rem; letter-spacing: 0.18em; text-transform: uppercase; color: #0EA5E9; }
    .sidebar-card-body { padding: 16px; }
    .sidebar-product { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #F3F7FB; }
    .sidebar-product:last-of-type { border-bottom: none; }
    .sidebar-product-name { font-family: 'Syne', sans-serif; font-size: 0.82rem; font-weight: 700; color: #10233F; display: block; }
    .sidebar-product-price { font-family: 'DM Mono', monospace; font-size: 0.65rem; color: #0EA5E9; }
    .sidebar-product-dot { width: 8px; height: 8px; background: #0EA5E9; border-radius: 50%; flex-shrink: 0; }
    .sidebar-cta { display: block; width: 100%; padding: 12px; background: #10233F; color: #fff; font-family: 'DM Mono', monospace; font-size: 0.66rem; letter-spacing: 0.08em; text-transform: uppercase; text-align: center; border-radius: 6px; transition: background 0.2s; margin-top: 12px; }
    .sidebar-cta:hover { background: #0EA5E9; }
    .sidebar-toc { list-style: none; }
    .sidebar-toc li { border-bottom: 1px solid #F3F7FB; }
    .sidebar-toc li:last-child { border-bottom: none; }
    .sidebar-toc a { display: block; padding: 9px 0; font-family: 'DM Mono', monospace; font-size: 0.64rem; letter-spacing: 0.04em; color: #607086; transition: color 0.2s; }
    .sidebar-toc a:hover { color: #0EA5E9; }
    .article-disclaimer { background: #EDF4FA; border-top: 1px solid #E2E8F0; padding: 24px 40px; max-width: 1100px; margin: 0 auto; }
    .article-disclaimer p { font-family: 'DM Mono', monospace; font-size: 0.62rem; color: #7C8FA6; line-height: 1.7; letter-spacing: 0.03em; }
    .footer { background: #10233F; padding: 32px 40px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
    .footer-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 0.85rem; letter-spacing: 0.08em; color: #fff; }
    .footer-logo span { color: #0EA5E9; }
    .footer p { font-family: 'DM Mono', monospace; font-size: 0.58rem; color: #7C8FA6; letter-spacing: 0.06em; }
    .footer-tg { color: #0EA5E9; }
    @media (max-width: 768px) {
      .nav { padding: 0 16px; }
      .article-hero { padding: 36px 16px 32px; }
      .article-layout { grid-template-columns: 1fr; gap: 32px; padding: 24px 16px; }
      .article-sidebar { position: static; }
      .article-disclaimer { padding: 20px 16px; }
      .footer { padding: 24px 16px; flex-direction: column; align-items: flex-start; }
    }`;

const INDEX_CSS = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: "DM Sans", sans-serif; background: #F5F9FC; color: #172033; line-height: 1.6; }
    a { color: inherit; text-decoration: none; }
    .nav { height: 62px; padding: 0 40px; background: #fff; border-bottom: 1px solid #D8E5F2; display: flex; align-items: center; justify-content: space-between; gap: 18px; }
    .logo { font-family: Syne, sans-serif; font-weight: 800; font-size: 1rem; letter-spacing: 0.08em; }
    .logo span { color: #1F6FEB; }
    .nav-links { display: flex; align-items: center; gap: 18px; font-family: "DM Mono", monospace; font-size: 0.65rem; letter-spacing: 0.08em; text-transform: uppercase; }
    .nav-links a { color: #4B5F75; }
    .nav-links a:hover { color: #1F6FEB; }
    .nav-basket { display: inline-flex; align-items: center; gap: 7px; padding: 8px 12px; border-radius: 999px; background: #1F6FEB; color: #fff; }
    .hero { max-width: 980px; margin: 0 auto; padding: 56px 40px 24px; }
    .hero .tag { font-family: "DM Mono", monospace; font-size: 0.62rem; letter-spacing: 0.18em; text-transform: uppercase; color: #1F6FEB; margin-bottom: 12px; }
    .hero h1 { font-family: Syne, sans-serif; font-size: clamp(2rem, 5vw, 3rem); line-height: 1.05; color: #10233F; margin-bottom: 14px; }
    .hero p { color: #4B5F75; max-width: 620px; line-height: 1.7; }
    .wrap { max-width: 980px; margin: 0 auto; padding: 18px 40px 70px; }
    .post-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .post-card { display: block; background: #fff; border: 1px solid #D8E5F2; border-radius: 12px; padding: 24px; box-shadow: 0 10px 30px rgba(15,31,54,0.05); transition: transform 0.2s, box-shadow 0.2s; }
    .post-card:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(15,31,54,0.1); }
    .post-card .cat { font-family: "DM Mono", monospace; font-size: 0.58rem; letter-spacing: 0.14em; text-transform: uppercase; color: #1F6FEB; }
    .post-card h2 { font-family: Syne, sans-serif; font-size: 1.2rem; color: #10233F; margin: 10px 0 8px; line-height: 1.25; }
    .post-card p { color: #4B5F75; font-size: 0.86rem; line-height: 1.65; }
    .post-card .read { display: inline-block; margin-top: 14px; font-family: "DM Mono", monospace; font-size: 0.64rem; letter-spacing: 0.08em; text-transform: uppercase; color: #1F6FEB; }
    .disclaimer { max-width: 980px; margin: 0 auto; padding: 0 40px 40px; }
    .disclaimer p { font-family: "DM Mono", monospace; font-size: 0.62rem; color: #7C8FA6; line-height: 1.7; border-top: 1px solid #D7E3EF; padding-top: 16px; }
    .footer { background: #EDF4FA; color: #394D63; padding: 40px; border-top: 1px solid #D8E5F2; text-align: center; }
    .footer a { color: #566B80; }
    .footer a:hover { color: #1F6FEB; }
    .footer .links { display: flex; gap: 18px; justify-content: center; flex-wrap: wrap; font-family: "DM Mono", monospace; font-size: 0.62rem; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 14px; }
    .footer .disc { font-family: "DM Mono", monospace; font-size: 0.55rem; color: #7C8FA6; }
    @media (max-width: 760px) {
      .nav { padding: 0 18px; }
      .nav-links a:not(.nav-basket) { display: none; }
      .hero, .wrap, .disclaimer { padding-left: 18px; padding-right: 18px; }
    }
    @media (max-width: 480px) {
      .nav { padding: 0 12px; gap: 10px; }
      .logo { font-size: 0.84rem; letter-spacing: 0.05em; }
      .nav-links { gap: 8px; }
      .nav-basket { padding: 8px 10px; font-size: 0.6rem; }
    }`;

module.exports = { renderArticle, renderBlogIndex, canonicalUrl, DISCLAIMER_TEXT };
