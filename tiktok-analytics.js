(function (window, document) {
  'use strict';

  const CONSENT_KEY = 'npuk_analytics_consent';
  const GOOGLE_CONFIG = window.NPUK_GOOGLE_CONFIG || {};
  const GA4_ID = String(GOOGLE_CONFIG.ga4MeasurementId || window.NPUK_GA4_ID || '').trim();
  const GTM_ID = String(GOOGLE_CONFIG.gtmContainerId || window.NPUK_GTM_ID || '').trim();
  const GOOGLE_DENIED = {
    ad_storage: 'denied',
    analytics_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted'
  };
  const GOOGLE_GRANTED = {
    ad_storage: 'granted',
    analytics_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    functionality_storage: 'granted',
    security_storage: 'granted'
  };
  let pixelLoaded = false;
  let gtagLoaded = false;
  let gtmLoaded = false;
  let pageConsent;
  let consentWriteFailed = false;
  let settingsOpened = false;

  function validGa4Id(value) {
    return /^G-[A-Z0-9]+$/i.test(value);
  }

  function validGtmId(value) {
    return /^GTM-[A-Z0-9]+$/i.test(value);
  }

  function ensureDataLayer() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  }

  ensureDataLayer();
  window.gtag('consent', 'default', GOOGLE_DENIED);

  function getConsent() {
    // A failed write must not undo the choice just made on this page. Otherwise
    // read storage afresh so choices made in another tab are respected.
    if (consentWriteFailed) return pageConsent;
    try {
      const saved = window.localStorage.getItem(CONSENT_KEY);
      pageConsent = saved === 'accepted' || saved === 'rejected' ? saved : null;
      return pageConsent;
    } catch (_error) {
      return pageConsent === undefined ? null : pageConsent;
    }
  }

  function saveConsent(value) {
    pageConsent = value;
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
      consentWriteFailed = false;
    } catch (_error) {
      // Consent still applies to this page even if storage is unavailable.
      consentWriteFailed = true;
    }
  }

  function setBannerVisible(visible) {
    const banner = document.getElementById('npuk-cookie-banner');
    if (banner) banner.hidden = !visible;
    const utility = document.getElementById('npuk-cookie-utility');
    if (utility) utility.hidden = visible;
    const settings = document.getElementById('npuk-cookie-settings');
    if (settings) {
      settings.hidden = visible;
      settings.setAttribute('aria-expanded', String(visible));
      if (!visible && settingsOpened) {
        settings.focus({ preventScroll: true });
        settingsOpened = false;
      }
    }
  }

  function insertScript(src) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = src;
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) firstScript.parentNode.insertBefore(script, firstScript);
    else document.head.appendChild(script);
    return script;
  }

  function loadPixel() {
    if (pixelLoaded || getConsent() !== 'accepted') return false;
    pixelLoaded = true;

    !function (w, d, t) {
      w.TiktokAnalyticsObject = t;
      var ttq = w[t] = w[t] || [];
      ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie', 'holdConsent', 'revokeConsent', 'grantConsent'];
      ttq.setAndDefer = function (target, method) {
        target[method] = function () {
          target.push([method].concat(Array.prototype.slice.call(arguments, 0)));
        };
      };
      for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
      ttq.instance = function (pixelId) {
        for (var instance = ttq._i[pixelId] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(instance, ttq.methods[n]);
        return instance;
      };
      ttq.load = function (pixelId, options) {
        var source = 'https://analytics.tiktok.com/i18n/pixel/events.js';
        ttq._i = ttq._i || {};
        ttq._i[pixelId] = [];
        ttq._i[pixelId]._u = source;
        ttq._t = ttq._t || {};
        ttq._t[pixelId] = +new Date();
        ttq._o = ttq._o || {};
        ttq._o[pixelId] = options || {};
        insertScript(source + '?sdkid=' + pixelId + '&lib=' + t);
      };

      ttq.load('D8RU9FBC77UATVQ6JIUG');
      ttq.grantConsent();
      ttq.page();
    }(window, document, 'ttq');

    return true;
  }

  function loadGtag() {
    if (gtagLoaded || gtmLoaded || !validGa4Id(GA4_ID) || getConsent() !== 'accepted') return false;
    gtagLoaded = true;

    window.gtag('consent', 'update', GOOGLE_GRANTED);
    insertScript('https://www.googletagmanager.com/gtag/js?id=' + GA4_ID);
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID, { send_page_view: true });
    return true;
  }

  function loadGtm() {
    if (gtmLoaded || !validGtmId(GTM_ID) || getConsent() !== 'accepted') return false;
    gtmLoaded = true;

    window.gtag('consent', 'update', GOOGLE_GRANTED);
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    insertScript('https://www.googletagmanager.com/gtm.js?id=' + GTM_ID);
    return true;
  }

  function loadGoogle() {
    if (validGtmId(GTM_ID)) return loadGtm();
    return loadGtag();
  }

  function revokeGoogleConsent() {
    if (window.gtag) window.gtag('consent', 'update', GOOGLE_DENIED);
  }

  function googleEventName(eventName) {
    return {
      AddToCart: 'add_to_cart',
      InitiateCheckout: 'begin_checkout',
      CompletePayment: 'purchase'
    }[eventName] || String(eventName || '').replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
  }

  function googlePayload(payload) {
    const source = payload || {};
    const out = {};
    if (source.currency) out.currency = source.currency;
    if (Number.isFinite(Number(source.value))) out.value = Number(source.value);
    if (Array.isArray(source.contents)) {
      out.items = source.contents.map(item => ({
        item_id: item.content_id,
        item_name: item.content_name,
        quantity: Number(item.quantity || 1),
        price: Number(item.price || 0)
      }));
    }
    return out;
  }

  function applyConsent(value) {
    setBannerVisible(value === null);
    if (value === 'accepted') {
      if (pixelLoaded && window.ttq) window.ttq.grantConsent();
      if (gtagLoaded || gtmLoaded) window.gtag('consent', 'update', GOOGLE_GRANTED);
      loadPixel();
      loadGoogle();
    } else {
      if (pixelLoaded && window.ttq) window.ttq.revokeConsent();
      revokeGoogleConsent();
    }
  }

  function accept() {
    saveConsent('accepted');
    applyConsent('accepted');
  }

  function reject() {
    saveConsent('rejected');
    applyConsent('rejected');
  }

  window.addEventListener('storage', function (event) {
    if (event.key !== CONSENT_KEY && event.key !== null) return;
    try {
      if (event.storageArea && event.storageArea !== window.localStorage) return;
    } catch (_error) {
      // The consent event remains usable if access to storage has been blocked.
    }
    pageConsent = event.newValue === 'accepted' || event.newValue === 'rejected' ? event.newValue : null;
    consentWriteFailed = false;
    // Revoke loaded SDKs too, including their automatic events. Reading this
    // specific key avoids applying a stale event when several tabs change it.
    applyConsent(getConsent());
  });

  function openSettings() {
    settingsOpened = true;
    setBannerVisible(true);
    const banner = document.getElementById('npuk-cookie-banner');
    if (banner) banner.focus({ preventScroll: true });
  }

  function track(eventName, payload) {
    if (getConsent() !== 'accepted') return false;
    let sent = false;
    if (pixelLoaded && window.ttq) {
      window.ttq.track(eventName, payload || {});
      sent = true;
    }
    if (gtmLoaded) {
      window.dataLayer.push(Object.assign({ event: googleEventName(eventName) }, googlePayload(payload)));
      sent = true;
    } else if (gtagLoaded && window.gtag) {
      window.gtag('event', googleEventName(eventName), googlePayload(payload));
      sent = true;
    }
    return sent;
  }

  function createButton(label, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', onClick);
    return button;
  }

  function renderConsentUi() {
    if (document.getElementById('npuk-cookie-banner')) return;

    const style = document.createElement('style');
    style.textContent = '#npuk-cookie-banner{position:fixed;z-index:10000;right:16px;bottom:max(12px,env(safe-area-inset-bottom,0px));left:16px;display:grid;grid-template-columns:1fr auto;align-items:center;gap:16px;max-width:720px;margin:auto;padding:14px 16px;border:1px solid #CFE0F1;border-radius:4px;background:#fff;color:#132A46;box-shadow:0 4px 20px rgba(15,31,54,.12);font-family:"DM Sans",Arial,sans-serif}#npuk-cookie-banner[hidden],#npuk-cookie-settings[hidden],#npuk-cookie-utility[hidden]{display:none}#npuk-cookie-banner p{margin:0;font-size:.78rem;line-height:1.45}#npuk-cookie-banner a{color:#1F6FEB;text-underline-offset:3px}#npuk-cookie-actions{display:flex;gap:8px}#npuk-cookie-banner button{min-height:44px;min-width:82px;padding:10px 14px;border:1px solid #132A46;border-radius:3px;background:#fff;color:#132A46;font:600 .76rem "DM Sans",Arial,sans-serif;cursor:pointer}#npuk-cookie-banner button:hover{background:#EDF4FA}#npuk-cookie-banner button:focus-visible,#npuk-cookie-settings:focus-visible{outline:3px solid #A7D8F4;outline-offset:3px}#npuk-cookie-settings{position:static;display:inline-block;min-height:44px;margin:0;padding:8px 0;border:0;border-radius:0;background:transparent;box-shadow:none;color:inherit;font:inherit;font-size:.78rem;letter-spacing:normal;text-transform:none;text-decoration:underline;text-underline-offset:3px;cursor:pointer}#npuk-cookie-utility{position:static;display:flex;justify-content:center;padding:4px 20px calc(8px + env(safe-area-inset-bottom,0px));background:transparent;color:#4B5F75}@media(max-width:560px){#npuk-cookie-banner{grid-template-columns:1fr;gap:10px;right:10px;left:10px;padding:12px 14px}#npuk-cookie-banner button{flex:1}}';
    document.head.appendChild(style);

    const banner = document.createElement('section');
    banner.id = 'npuk-cookie-banner';
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.setAttribute('role', 'dialog');
    banner.tabIndex = -1;

    const message = document.createElement('p');
    message.append('Optional cookies help us measure visits and advertising. ');
    const policyLink = document.createElement('a');
    policyLink.href = '/cookies.html';
    policyLink.textContent = 'Learn more';
    message.appendChild(policyLink);

    const actions = document.createElement('div');
    actions.id = 'npuk-cookie-actions';
    actions.append(
      createButton('Reject', reject),
      createButton('Accept', accept)
    );
    banner.append(message, actions);
    document.body.appendChild(banner);

    // Keep the saved-choice control in the footer at every viewport width.
    // It must never float over products, basket buttons or checkout controls.
    const settings = createButton('Cookie settings', openSettings);
    settings.id = 'npuk-cookie-settings';
    settings.title = 'Cookie settings';
    settings.setAttribute('aria-controls', 'npuk-cookie-banner');
    const footer = document.querySelector('footer');
    const policy = footer && footer.querySelector('a[href$="cookies.html"]');
    const policyItem = policy && policy.closest('li');
    if (policyItem) {
      const item = document.createElement('li');
      item.appendChild(settings);
      policyItem.insertAdjacentElement('afterend', item);
    } else if (footer) {
      footer.appendChild(settings);
    } else {
      const utility = document.createElement('footer');
      utility.id = 'npuk-cookie-utility';
      utility.setAttribute('aria-label', 'Cookie preferences');
      utility.appendChild(settings);
      const main = document.querySelector('main');
      if (main) main.insertAdjacentElement('afterend', utility);
      else document.body.appendChild(utility);
    }

    setBannerVisible(getConsent() === null);
  }

  window.NPUKAnalytics = { accept, reject, openSettings, getConsent, track };

  function start() {
    renderConsentUi();
    if (getConsent() === 'accepted') {
      loadPixel();
      loadGoogle();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
}(window, document));
