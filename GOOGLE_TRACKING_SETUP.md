# Google Tracking Setup

## Minimal setup

You need either:

- a GA4 Measurement ID, such as `G-XXXXXXXXXX`, or
- a Google Tag Manager container ID, such as `GTM-XXXXXXX`.

Use GA4 direct unless you specifically want to manage tags inside GTM.

## Add the ID

Open `site-config.js` and paste one ID:

```js
window.NPUK_GOOGLE_CONFIG = {
  ga4MeasurementId: 'G-XXXXXXXXXX',
  gtmContainerId: '',
};
```

If you use GTM instead, leave `ga4MeasurementId` blank and set `gtmContainerId`.
If both are set, GTM takes priority to avoid loading duplicate Google tracking.

The site only loads Google tags after a visitor accepts analytics cookies.

## Search Console verification

The simplest route is a URL-prefix property:

1. Open Google Search Console.
2. Add property: `https://www.northpeptidesuk.com/`.
3. Choose the HTML tag verification method.
4. Copy only the `content` token from the meta tag Google gives you.
5. Paste that token into the blank `google-site-verification` meta tag in `index.html`.
6. Commit, push, wait for Vercel to deploy, then click Verify in Search Console.

Domain-property verification is also fine, but that uses DNS instead of site code.
