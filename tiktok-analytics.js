(function (window, document) {
  'use strict';

  const CONSENT_KEY = 'npuk_analytics_consent';
  // GA4 stays dormant until a measurement ID is provided via window.NPUK_GA4_ID.
  // It rides the exact same consent gate as the TikTok pixel below.
  const GA4_ID = (window.NPUK_GA4_ID || '').trim();
  let pixelLoaded = false;
  let gtagLoaded = false;

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
        var script = d.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = source + '?sdkid=' + pixelId + '&lib=' + t;
        var firstScript = d.getElementsByTagName('script')[0];
        if (firstScript && firstScript.parentNode) firstScript.parentNode.insertBefore(script, firstScript);
        else d.head.appendChild(script);
      };

      ttq.load('D8RU9FBC77UATVQ6JIUG');
      ttq.grantConsent();
      ttq.page();
    }(window, document, 'ttq');

    return true;
  }

  function loadGtag() {
    if (gtagLoaded || !GA4_ID || getConsent() !== 'accepted') return false;
    gtagLoaded = true;

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID, { anonymize_ip: true });
    return true;
  }

  function accept() {
    saveConsent('accepted');
    setBannerVisible(false);
    loadPixel();
    loadGtag();
  }

  function reject() {
    saveConsent('rejected');
    setBannerVisible(false);
    if (pixelLoaded && window.ttq) window.ttq.revokeConsent();
  }

  function openSettings() {
    setBannerVisible(true);
  }

  function track(eventName, payload) {
    if (getConsent() !== 'accepted') return false;
    var sent = false;
    if (pixelLoaded && window.ttq) { window.ttq.track(eventName, payload || {}); sent = true; }
    if (gtagLoaded && window.gtag) { window.gtag('event', eventName, payload || {}); sent = true; }
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
    style.textContent = '#npuk-cookie-banner{position:fixed;z-index:10000;right:18px;bottom:18px;left:18px;display:flex;align-items:center;gap:18px;max-width:1080px;margin:auto;padding:18px 20px;border:1px solid #cfe0d7;border-radius:10px;background:#fff;color:#16241e;box-shadow:0 12px 40px rgba(22,36,30,.16);font-family:"DM Sans",Arial,sans-serif}#npuk-cookie-banner[hidden]{display:none}#npuk-cookie-banner p{flex:1;margin:0;font-size:.86rem;line-height:1.55}#npuk-cookie-banner a{color:#00795f}#npuk-cookie-banner button,#npuk-cookie-settings{min-height:42px;padding:10px 17px;border:1px solid #00795f;border-radius:6px;background:#fff;color:#00795f;font:600 .76rem "DM Sans",Arial,sans-serif;cursor:pointer}#npuk-cookie-banner button:last-child{background:#00795f;color:#fff}#npuk-cookie-banner button:focus-visible,#npuk-cookie-settings:focus-visible{outline:3px solid #9ad8c5;outline-offset:2px}#npuk-cookie-settings{position:fixed;z-index:9999;right:14px;bottom:14px;min-height:34px;padding:7px 10px;border-color:#cfe0d7;background:#fff;color:#526157;font-size:.68rem}#npuk-cookie-settings[hidden]{display:none}@media(max-width:640px){#npuk-cookie-banner{align-items:stretch;flex-wrap:wrap;gap:10px;right:10px;bottom:10px;left:10px;padding:16px}#npuk-cookie-banner p{flex-basis:100%}#npuk-cookie-banner button{flex:1}}';
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
    if (getConsent() === 'accepted') { loadPixel(); loadGtag(); }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
}(window, document));
