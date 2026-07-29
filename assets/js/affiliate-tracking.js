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
    if (language === 'pt-br') return 'pt-br';
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

  function baseParameters(place) {
    var parameters = {
      affiliate_name: 'lootbar',
      payment_provider: 'lootbar-heartopia',
      game: 'heartopia',
      page_language: pageLanguage(),
      page_type: pageType(window.location.pathname),
      placement: place,
      transport_type: 'beacon'
    };
    var currentEvent = eventName(window.location.pathname);
    if (currentEvent) parameters.heartopia_event = currentEvent;
    return parameters;
  }

  function send(name, parameters) {
    if (typeof window.gtag === 'function') window.gtag('event', name, parameters);
  }

  function affiliateParameters(link, url) {
    var parameters = baseParameters(placement(link, pageType(window.location.pathname)));
    parameters.link_domain = url.hostname;
    parameters.link_url = url.href;
    return parameters;
  }

  function trackClick(event) {
    if (event.type === 'auxclick' && event.button !== 1) return;
    var link = event.target.closest && event.target.closest('a[href]');
    if (!link) return;
    var url = lootbarUrl(link);
    if (!url) {
      if (link.dataset.provider) {
        send('outbound_payment_click', {
          payment_provider: link.dataset.provider,
          game: 'heartopia',
          page_language: pageLanguage(),
          page_type: pageType(window.location.pathname),
          placement: placement(link, pageType(window.location.pathname)),
          link_url: link.href,
          transport_type: 'beacon'
        });
      }
      return;
    }
    if (link.dataset.affiliateTracked === 'false') return;
    send('affiliate_click', affiliateParameters(link, url));
  }

  function trackAffiliateImpressions() {
    if (!('IntersectionObserver' in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var link = entry.target;
        var url = lootbarUrl(link);
        if (url) send('affiliate_impression', affiliateParameters(link, url));
        observer.unobserve(link);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('a[data-affiliate="lootbar"]').forEach(function (link) {
      observer.observe(link);
    });
  }

  function trackAffiliateWidget() {
    var widget = document.getElementById('lootbar-heartopia-widget');
    var section = document.querySelector('[data-affiliate-widget="lootbar-heartopia"]');
    var parameters = function () { return baseParameters('product-widget'); };

    if (widget) {
      widget.addEventListener('load', function () {
        var loading = document.getElementById('lootbar-widget-loading');
        if (loading) loading.hidden = true;
        send('affiliate_widget_load', parameters());
      }, { once: true });
    }

    if (section && 'IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        if (!entries.some(function (entry) { return entry.isIntersecting; })) return;
        send('affiliate_widget_view', parameters());
        observer.disconnect();
      }, { threshold: 0.25 });
      observer.observe(section);
    }
  }

  document.addEventListener('click', trackClick);
  document.addEventListener('auxclick', trackClick);
  trackAffiliateImpressions();
  trackAffiliateWidget();
})();
