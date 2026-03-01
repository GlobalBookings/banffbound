// BanffBound GA4 Event Tracking
// All events fire via gtag() which is loaded in BaseLayout

(function () {
  if (typeof gtag !== 'function') return;

  // ─── 1. Affiliate Click-Outs ───
  // Track every outbound affiliate click with partner, destination URL, and source page
  function trackAffiliateClicks() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link) return;
      var href = link.href || '';

      var affiliate = null;
      if (href.indexOf('getyourguide.com') !== -1) affiliate = 'getyourguide';
      else if (href.indexOf('expedia.ca') !== -1 || href.indexOf('expedia.com') !== -1) affiliate = 'expedia';
      else if (href.indexOf('amazon.ca') !== -1 && href.indexOf('banffbound-20') !== -1) affiliate = 'amazon';

      if (affiliate) {
        e.preventDefault();
        gtag('event', 'affiliate_click', {
          affiliate_partner: affiliate,
          link_url: href.substring(0, 500),
          link_text: (link.textContent || '').trim().substring(0, 100),
          page_path: window.location.pathname,
          page_title: document.title,
        });
        if (typeof gtag_report_conversion === 'function') {
          gtag_report_conversion(href);
        } else {
          window.open(href, '_blank');
        }
      }
    });
  }

  // ─── 2. CTA Button Clicks ───
  // Track prominent call-to-action buttons (hero buttons, section CTAs)
  function trackCTAClicks() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.btn, .book-btn, .hotel-link');
      if (!btn) return;
      var href = btn.href || btn.closest('a[href]')?.href || '';
      var text = (btn.textContent || '').trim().substring(0, 100);

      gtag('event', 'cta_click', {
        cta_text: text,
        cta_url: href.substring(0, 500),
        cta_location: getSectionName(btn),
        page_path: window.location.pathname,
      });
    });
  }

  // ─── 3. Trip Builder Engagement ───
  function trackTripBuilder() {
    if (window.location.pathname.indexOf('trip-builder') === -1) return;

    document.addEventListener('click', function (e) {
      var templateCard = e.target.closest('.template-card');
      if (templateCard) {
        var name = (templateCard.querySelector('h3') || {}).textContent || '';
        gtag('event', 'trip_template_select', {
          template_name: name.trim(),
          page_path: window.location.pathname,
        });
      }

      var bookBtn = e.target.closest('.book-btn');
      if (bookBtn) {
        var activityName = '';
        var card = bookBtn.closest('.activity-card');
        if (card) {
          var strong = card.querySelector('strong');
          activityName = strong ? strong.textContent.trim() : '';
        }
        gtag('event', 'trip_activity_book', {
          activity_name: activityName,
          link_url: (bookBtn.href || '').substring(0, 500),
        });
      }

      var hotelLink = e.target.closest('.hotel-link');
      if (hotelLink) {
        gtag('event', 'trip_hotel_click', {
          hotel_tier: (hotelLink.textContent || '').trim(),
          link_url: (hotelLink.href || '').substring(0, 500),
        });
      }
    });
  }

  // ─── 4. Scroll Depth ───
  function trackScrollDepth() {
    var milestones = [25, 50, 75, 100];
    var fired = {};

    function getScrollPercent() {
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return 100;
      return Math.round((window.scrollY / docHeight) * 100);
    }

    var scrollTimer;
    window.addEventListener('scroll', function () {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () {
        var pct = getScrollPercent();
        for (var i = 0; i < milestones.length; i++) {
          var m = milestones[i];
          if (pct >= m && !fired[m]) {
            fired[m] = true;
            gtag('event', 'scroll_depth', {
              depth_threshold: m,
              page_path: window.location.pathname,
              page_title: document.title,
            });
          }
        }
      }, 150);
    });
  }

  // ─── 5. Blog Category Filter ───
  function trackBlogFilters() {
    if (window.location.pathname.indexOf('/blog') === -1) return;
    document.addEventListener('click', function (e) {
      var filterBtn = e.target.closest('[data-category]');
      if (!filterBtn) return;
      gtag('event', 'blog_filter', {
        category: filterBtn.dataset.category || (filterBtn.textContent || '').trim(),
        page_path: window.location.pathname,
      });
    });
  }

  // ─── 6. External Link Clicks (non-affiliate) ───
  function trackExternalLinks() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link) return;
      var href = link.href || '';

      if (href.indexOf('getyourguide.com') !== -1) return;
      if (href.indexOf('expedia.ca') !== -1 || href.indexOf('expedia.com') !== -1) return;
      if (href.indexOf('amazon.ca') !== -1 && href.indexOf('banffbound-20') !== -1) return;

      if (href.indexOf('http') === 0 && href.indexOf(window.location.hostname) === -1) {
        gtag('event', 'external_link_click', {
          link_url: href.substring(0, 500),
          link_text: (link.textContent || '').trim().substring(0, 100),
          link_domain: new URL(href).hostname,
          page_path: window.location.pathname,
        });
      }
    });
  }

  // ─── 7. Engaged Time Milestones ───
  function trackTimeOnPage() {
    var intervals = [30, 60, 120, 300];
    var startTime = Date.now();
    var firedTime = {};

    setInterval(function () {
      if (document.hidden) return;
      var elapsed = Math.floor((Date.now() - startTime) / 1000);
      for (var i = 0; i < intervals.length; i++) {
        var t = intervals[i];
        if (elapsed >= t && !firedTime[t]) {
          firedTime[t] = true;
          gtag('event', 'time_on_page', {
            seconds: t,
            page_path: window.location.pathname,
            page_title: document.title,
          });
        }
      }
    }, 5000);
  }

  // ─── Helper: identify which section a click came from ───
  function getSectionName(el) {
    var section = el.closest('section');
    if (!section) return 'unknown';
    var id = section.id || '';
    if (id) return id;
    var heading = section.querySelector('h2');
    if (heading) return heading.textContent.trim().substring(0, 50);
    var cls = section.className || '';
    if (cls.indexOf('hero') !== -1) return 'hero';
    if (cls.indexOf('cta') !== -1) return 'cta';
    return 'section';
  }

  // ─── Initialize All Tracking ───
  trackAffiliateClicks();
  trackCTAClicks();
  trackTripBuilder();
  trackScrollDepth();
  trackBlogFilters();
  trackExternalLinks();
  trackTimeOnPage();
})();
