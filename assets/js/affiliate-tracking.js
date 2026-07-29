(function () {
  'use strict';

  if (window.__heartopiaAffiliateTracking) return;
  window.__heartopiaAffiliateTracking = true;

  function lootbarUrl(link) {
    try {
      var url = new URL(link.href, window.location.href);
      return /(^|\.)lootbar\.(com|gg)$/i.test(url.hostname) ? url : null;
    } catch (_) {
      return null;
    }
  }

  function pageLanguage() {
    var language = (document.documentElement.lang || 'en').toLowerCase();
    if (language === 'zh-hant' || language === 'zh-hk' || language === 'zh-tw') return 'zh-tw';
    return language.split('-')[0] || 'en';
  }

  function pageType(pathname) {
    if (/\/guides\/top-up\/?$/i.test(pathname)) return 'top-up';
    if (/\/guides\/gacha\/?$/i.test(pathname)) return 'gacha';
    if (/\/codes\/?$/i.test(pathname)) return 'codes';
    if (/\/events\//i.test(pathname)) return 'event';
    return 'other';
  }

  function eventName(pathname) {
    var match = pathname.match(/\/events\/([^/]+)/i);
    return match ? decodeURIComponent(match[1]) : undefined;
  }

  function placement(link, type) {
    var container = link.closest('[data-affiliate-placement]');
    if (link.dataset.affiliatePlacement) return link.dataset.affiliatePlacement;
    if (container && container.dataset.affiliatePlacement) return container.dataset.affiliatePlacement;
    if (link.closest('#lootbar-live-products')) return 'product-widget-fallback';
    if (type === 'gacha') return link.querySelector('img') ? 'gacha-banner' : 'gacha-inline';
    if (link.closest('figure')) return 'hero-banner';
    if (link.closest('article')) return 'provider-card';
    return 'inline-link';
  }

  function track(event) {
    if (event.type === 'auxclick' && event.button !== 1) return;
    var link = event.target.closest && event.target.closest('a[href]');
    if (!link) return;
    var url = lootbarUrl(link);
    if (!url) {
      if (link.dataset.provider && typeof window.gtag === 'function') {
        window.gtag('event', 'outbound_payment_click', {
          payment_provider: link.dataset.provider,
          page_language: pageLanguage(),
          page_type: pageType(window.location.pathname),
          link_url: link.href,
          transport_type: 'beacon'
        });
      }
      return;
    }
    if (link.dataset.affiliateTracked === 'false') return;

    var type = pageType(window.location.pathname);
    var parameters = {
      affiliate_name: 'lootbar',
      payment_provider: 'lootbar-heartopia',
      game: 'heartopia',
      page_language: pageLanguage(),
      page_type: type,
      placement: placement(link, type),
      link_domain: url.hostname,
      link_url: url.href,
      transport_type: 'beacon'
    };
    var currentEvent = eventName(window.location.pathname);
    if (currentEvent) parameters.event_name = currentEvent;

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'affiliate_click', parameters);
    }
  }

  document.addEventListener('click', track);
  document.addEventListener('auxclick', track);
})();
