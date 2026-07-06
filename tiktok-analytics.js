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
    try {
      return window.localStorage.getItem(CONSENT_KEY);
    } catch (_error) {
      return null;
    }
  }

  function saveConsent(value) {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch (_error) {
      // Consent still applies to this page even if storage is unavailable.
    }
  }

  function setBannerVisible(visible) {
    const banner = document.getElementById('npuk-cookie-banner');
    if (banner) banner.hidden = !visible;
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

  function accept() {
    saveConsent('accepted');
    setBannerVisible(false);
    loadPixel();
    loadGoogle();
  }

  function reject() {
    saveConsent('rejected');
    setBannerVisible(false);
    if (pixelLoaded && window.ttq) window.ttq.revokeConsent();
    revokeGoogleConsent();
  }

  function openSettings() {
    setBannerVisible(true);
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
    style.textContent = '#npuk-cookie-banner{position:fixed;z-index:10000;right:18px;bottom:18px;left:18px;display:flex;align-items:center;gap:18px;max-width:1080px;margin:auto;padding:18px 20px;border:1px solid #CFE0F1;border-radius:10px;background:#fff;color:#132A46;box-shadow:0 12px 40px rgba(15,31,54,.16);font-family:"DM Sans",Arial,sans-serif}#npuk-cookie-banner[hidden]{display:none}#npuk-cookie-banner p{flex:1;margin:0;font-size:.86rem;line-height:1.55}#npuk-cookie-banner a{color:#1F6FEB}#npuk-cookie-banner button,#npuk-cookie-settings{min-height:42px;padding:10px 17px;border:1px solid #1F6FEB;border-radius:6px;background:#fff;color:#1F6FEB;font:600 .76rem "DM Sans",Arial,sans-serif;cursor:pointer}#npuk-cookie-banner button:last-child{background:#1F6FEB;color:#fff}#npuk-cookie-banner button:focus-visible,#npuk-cookie-settings:focus-visible{outline:3px solid #A7D8F4;outline-offset:2px}#npuk-cookie-settings{position:fixed;z-index:9999;left:14px;bottom:24px;min-height:34px;padding:7px 10px;border-color:#CFE0F1;background:#fff;color:#4B5F75;font-size:.68rem}#npuk-cookie-settings[hidden]{display:none}@media(max-width:640px){#npuk-cookie-banner{align-items:stretch;flex-wrap:wrap;gap:10px;right:10px;bottom:10px;left:10px;padding:16px}#npuk-cookie-banner p{flex-basis:100%}#npuk-cookie-banner button{flex:1}}';
    document.head.appendChild(style);

    const banner = document.createElement('section');
    banner.id = 'npuk-cookie-banner';
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.setAttribute('role', 'dialog');

    const message = document.createElement('p');
    message.append('We use analytics cookies to understand site traffic and improve advertising. ');
    const policyLink = document.createElement('a');
    policyLink.href = '/compliance.html';
    policyLink.textContent = 'Learn more';
    message.appendChild(policyLink);

    banner.append(
      message,
      createButton('Reject', reject),
      createButton('Accept', accept)
    );
    document.body.appendChild(banner);

    const settings = createButton('Cookie settings', openSettings);
    settings.id = 'npuk-cookie-settings';
    document.body.appendChild(settings);

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
