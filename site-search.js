(function () {
  'use strict';

  const hosts = typeof document === 'undefined'
    ? []
    : Array.from(document.querySelectorAll('[data-site-search]'));

  const featuredOrder = [
    'retatrutide',
    'ghk-cu',
    'bpc-157',
    'tirzepatide',
    'tb-500',
    'klow-stack'
  ];

  const aliases = {
    'retatrutide': 'reta triple agonist',
    'retatrutide-pen': 'reta pen triple agonist',
    'tirzepatide': 'tirz',
    'tirzepatide-pen': 'tirz pen',
    'ghk-cu': 'ghkcu copper peptide',
    'ghk-cu-pen': 'ghkcu copper peptide pen',
    'bpc-157': 'bpc157 bpc',
    'bpc-157-pen': 'bpc157 bpc pen',
    'tb-500': 'tb500 tb',
    'tb-500-pen': 'tb500 tb pen',
    'cjc-1295': 'cjc1295 cjc no dac mod grf',
    'cjc-1295-pen': 'cjc1295 cjc no dac mod grf pen',
    'nad-plus': 'nad nad+',
    'nad-plus-pen': 'nad nad+ pen',
    'ss-31': 'ss31 elamipretide',
    'ss-31-pen': 'ss31 elamipretide pen',
    'bacteriostatic-water': 'bac water bacteriostatic water',
    'intranasal-research-kit': 'nasal spray intranasal kit',
    'pen-style-research-kit': 'research pen kit'
  };

  let cataloguePromise;

  function normalise(value) {
    return String(value || '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9+]+/g, '');
  }

  function tokenise(value) {
    return String(value || '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9+]+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  }

  function productSearchTokens(product) {
    const specs = Array.isArray(product.specs)
      ? product.specs.map(spec => `${spec.label || ''} ${spec.value || ''}`).join(' ')
      : '';
    return tokenise([
      product.name,
      product.slug,
      product.category,
      product.summary,
      specs,
      aliases[product.slug] || ''
    ].join(' '));
  }

  function catalogue() {
    if (!cataloguePromise) {
      cataloguePromise = fetch('/products.json', { credentials: 'same-origin' })
        .then(response => {
          if (!response.ok) throw new Error(`Catalogue request failed: ${response.status}`);
          return response.json();
        })
        .then(payload => (Array.isArray(payload.products) ? payload.products : []))
        .then(products => products.map(product => ({
          ...product,
          searchTokens: productSearchTokens(product)
        })));
    }
    return cataloguePromise;
  }

  function imagePath(value) {
    try {
      return new URL(value, window.location.origin).pathname;
    } catch (_) {
      return value || '';
    }
  }

  function fromPrice(product) {
    const prices = (product.variants || [])
      .map(variant => Number(variant.price))
      .filter(Number.isFinite);
    if (!prices.length) return '';
    const price = Math.min(...prices);
    const rendered = Number.isInteger(price) ? String(price) : price.toFixed(2);
    return `From £${rendered}`;
  }

  function rankedProducts(products, query) {
    const needle = normalise(query);
    const queryTokens = tokenise(query);
    if (!needle) {
      return featuredOrder
        .map(slug => products.find(product => product.slug === slug))
        .filter(Boolean);
    }

    return products
      .map(product => {
        const name = normalise(product.name);
        const slug = normalise(product.slug);
        const searchTokens = Array.isArray(product.searchTokens)
          ? product.searchTokens
          : productSearchTokens(product);
        let score = 0;
        if (name === needle || slug === needle) score = 120;
        else if (name.startsWith(needle) || slug.startsWith(needle)) score = 95;
        else if (name.includes(needle) || slug.includes(needle)) score = 80;
        else if (queryTokens.every(queryToken =>
          searchTokens.some(productToken => productToken.startsWith(queryToken)))) score = 65;
        if (product.slug.endsWith('-pen')) score -= 2;
        if (product.supply) score -= 4;
        return { product, score };
      })
      .filter(entry => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
      .slice(0, 8)
      .map(entry => entry.product);
  }

  function buildResult(product, id) {
    const link = document.createElement('a');
    link.className = 'site-search-result';
    link.id = id;
    link.href = `/products/${encodeURIComponent(product.slug)}/`;
    link.setAttribute('role', 'option');
    link.setAttribute('aria-selected', 'false');

    const image = document.createElement('img');
    image.className = 'site-search-result-image';
    image.src = imagePath(product.image);
    image.alt = '';
    image.loading = 'lazy';

    const copy = document.createElement('span');
    copy.className = 'site-search-result-copy';
    const name = document.createElement('span');
    name.className = 'site-search-result-name';
    name.textContent = product.name;
    const meta = document.createElement('span');
    meta.className = 'site-search-result-meta';
    meta.textContent = product.supply ? 'Research supply' : product.category;
    copy.append(name, meta);

    const price = document.createElement('span');
    price.className = 'site-search-result-price';
    price.textContent = fromPrice(product);

    link.append(image, copy, price);
    return link;
  }

  function initialise(host, hostIndex) {
    host.classList.add('site-search-host');
    const inputId = `site-search-input-${hostIndex}`;
    const resultsId = `site-search-results-${hostIndex}`;
    const statusId = `site-search-status-${hostIndex}`;
    host.innerHTML = `
      <div class="site-search">
        <form class="site-search-form" role="search" novalidate>
          <label class="site-search-status" for="${inputId}">Search the product catalogue</label>
          <svg class="site-search-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"></circle><path d="m16.5 16.5 4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>
          <input class="site-search-input" id="${inputId}" type="search" placeholder="Search products…" autocomplete="off" autocapitalize="none" spellcheck="false" aria-autocomplete="list" aria-controls="${resultsId}" aria-expanded="false" aria-describedby="${statusId}">
          <kbd class="site-search-shortcut" aria-hidden="true">/</kbd>
        </form>
        <div class="site-search-results" id="${resultsId}" role="listbox" hidden></div>
        <span class="site-search-status" id="${statusId}" role="status" aria-live="polite"></span>
      </div>`;

    const form = host.querySelector('.site-search-form');
    const input = host.querySelector('.site-search-input');
    const results = host.querySelector('.site-search-results');
    const status = host.querySelector('[role="status"]');
    let activeIndex = -1;
    let renderedLinks = [];

    function closeResults() {
      results.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
      activeIndex = -1;
    }

    function setActive(index) {
      if (!renderedLinks.length) return;
      activeIndex = (index + renderedLinks.length) % renderedLinks.length;
      renderedLinks.forEach((link, linkIndex) => {
        const selected = linkIndex === activeIndex;
        link.setAttribute('aria-selected', String(selected));
        if (selected) link.scrollIntoView({ block: 'nearest' });
      });
      input.setAttribute('aria-activedescendant', renderedLinks[activeIndex].id);
    }

    function render(products, query) {
      results.replaceChildren();
      activeIndex = -1;
      const matches = rankedProducts(products, query);
      const heading = document.createElement('div');
      heading.className = 'site-search-heading';
      heading.textContent = query.trim() ? 'Matching products' : 'Popular products';
      results.appendChild(heading);

      if (!matches.length) {
        const empty = document.createElement('div');
        empty.className = 'site-search-empty';
        empty.textContent = 'No matching products. Try a compound name such as Reta, GHK-Cu or BPC-157.';
        results.appendChild(empty);
      } else {
        matches.forEach((product, resultIndex) => {
          results.appendChild(buildResult(product, `${resultsId}-option-${resultIndex}`));
        });
      }

      renderedLinks = Array.from(results.querySelectorAll('.site-search-result'));
      results.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      status.textContent = matches.length
        ? `${matches.length} product${matches.length === 1 ? '' : 's'} shown.`
        : 'No matching products.';
    }

    function openResults() {
      status.textContent = 'Loading products.';
      catalogue()
        .then(products => render(products, input.value))
        .catch(() => {
          results.replaceChildren();
          const empty = document.createElement('div');
          empty.className = 'site-search-empty';
          empty.textContent = 'Product search is temporarily unavailable.';
          results.appendChild(empty);
          results.hidden = false;
          input.setAttribute('aria-expanded', 'true');
          status.textContent = 'Product search is temporarily unavailable.';
        });
    }

    input.addEventListener('focus', openResults);
    input.addEventListener('input', openResults);
    input.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActive(activeIndex + 1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActive(activeIndex - 1);
      } else if (event.key === 'Escape') {
        closeResults();
        input.blur();
      } else if (event.key === 'Enter' && activeIndex >= 0) {
        event.preventDefault();
        renderedLinks[activeIndex].click();
      }
    });

    form.addEventListener('submit', event => {
      event.preventDefault();
      if (renderedLinks.length) renderedLinks[Math.max(0, activeIndex)].click();
    });

    document.addEventListener('pointerdown', event => {
      if (!host.contains(event.target)) closeResults();
    });
  }

  if (typeof module === 'object' && module.exports) {
    module.exports = { normalise, tokenise, productSearchTokens, rankedProducts };
  }

  if (!hosts.length) return;

  hosts.forEach(initialise);

  document.addEventListener('keydown', event => {
    if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target;
    if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
    const firstInput = document.querySelector('.site-search-input');
    if (!firstInput) return;
    event.preventDefault();
    firstInput.focus();
  });
}());
