import { landingContext } from './landingAttribution.js';
import { applyPaidBookingAttribution } from './paidBookingAttribution.js';
import { hasConsent, sendAnalyticsEvent, reportAffiliateConversion, safeTrackingUrl, subscribeConsent } from './consent.js';

let initialized = false;
const belongsTo = (hostname, domain) => hostname === domain || hostname.endsWith('.' + domain);
export function affiliatePartner(href) {
  try {
    const url = new URL(href);
    if (!['https:', 'http:'].includes(url.protocol)) return null;
    if (/^\/(?:legal|privacy|terms|c\/privacy-policy)(?:\/|$)/i.test(url.pathname)) return null;
    if (belongsTo(url.hostname, 'getyourguide.com') && url.searchParams.get('partner_id') === 'QW960HO') return 'getyourguide';
    if (belongsTo(url.hostname, 'vrbo.com') && (url.pathname.startsWith('/affiliate') || url.searchParams.has('camref'))) return 'vrbo';
    if ((belongsTo(url.hostname, 'expedia.ca') || belongsTo(url.hostname, 'expedia.com')) && (['1101l3MtWX', 'KB6G4xt'].includes(url.searchParams.get('camref')) || /^\/affiliates?(?:\/|$)/.test(url.pathname))) return 'expedia';
    if (belongsTo(url.hostname, 'amazon.ca') && url.searchParams.get('tag') === 'banffbound-20') return 'amazon';
    return null;
  } catch { return null; }
}
function sectionName(element) {
  const section = element.closest('section');
  return section?.id || section?.querySelector('h2')?.textContent?.trim().slice(0, 50) || 'section';
}
export function initTracking() {
  if (typeof window === 'undefined') return;
  applyPaidBookingAttribution();
  if (initialized) return;
  initialized = true;
  document.addEventListener('astro:page-load', () => applyPaidBookingAttribution());
  const path = () => window.location.pathname;
  const send = (name, parameters) => sendAnalyticsEvent(name, parameters);
  const nearest = (event, selector) => event.target?.closest?.(selector) || event.target?.parentElement?.closest?.(selector);
  document.addEventListener('click', event => {
    const link = nearest(event, 'a[href]');
    const partner = link ? affiliatePartner(link.href) : null;
    if (partner) {
      send('affiliate_click', { affiliate_partner: partner, link_url: safeTrackingUrl(link.href), link_text: (link.textContent || '').trim().slice(0, 100), page_path: path(), page_title: document.title, ...landingContext(link) });
      reportAffiliateConversion(landingContext(link));
    } else if (link) {
      try {
        const url = new URL(link.href);
        if (['https:', 'http:'].includes(url.protocol) && url.hostname !== window.location.hostname) send('external_link_click', { link_url: safeTrackingUrl(link.href), link_text: (link.textContent || '').trim().slice(0, 100), link_domain: url.hostname, page_path: path() });
      } catch { /* An unusual link is still handled by the browser. */ }
    }
    const button = nearest(event, '.btn, .book-btn, .hotel-link');
    if (button) send('cta_click', { cta_text: (button.textContent || '').trim().slice(0, 100), cta_url: safeTrackingUrl(button.href || button.closest('a[href]')?.href || ''), cta_location: sectionName(button), page_path: path(), ...landingContext(button) });
    if (path().includes('trip-builder')) {
      const template = nearest(event, '.template-card');
      if (template) send('trip_template_select', { template_name: (template.querySelector('h3')?.textContent || '').trim(), page_path: path() });
      const book = nearest(event, '.book-btn');
      if (book) send('trip_activity_book', { activity_name: (book.closest('.activity-card')?.querySelector('strong')?.textContent || '').trim(), link_url: safeTrackingUrl(book.href || '') });
      const hotel = nearest(event, '.hotel-link');
      if (hotel) send('trip_hotel_click', { hotel_tier: (hotel.textContent || '').trim(), link_url: safeTrackingUrl(hotel.href || '') });
    }
    if (path().includes('/blog')) {
      const filter = nearest(event, '[data-category]');
      if (filter) send('blog_filter', { category: filter.dataset.category || (filter.textContent || '').trim(), page_path: path() });
    }
    // No preventDefault, callback navigation or popup: native referral links always work.
  });

  const thresholds = [25, 50, 75, 100], times = [30, 60, 120, 300];
  let scrollTimer = null, scrollFired = new Set(), timeFired = new Set();
  let active = hasConsent('analytics'), visible = !document.hidden, elapsed = 0, lastTick = Date.now();
  function scrollPercent() {
    const available = document.documentElement.scrollHeight - window.innerHeight;
    return available <= 0 ? 100 : Math.max(0, Math.min(100, Math.round(window.scrollY / available * 100)));
  }
  function resetMeasurement(next) {
    active = next.analytics; elapsed = 0; lastTick = Date.now(); visible = !document.hidden;
    scrollFired = new Set(thresholds.filter(value => value <= scrollPercent())); timeFired = new Set();
    if (scrollTimer !== null) window.clearTimeout(scrollTimer);
  }
  resetMeasurement({ analytics: active });
  subscribeConsent(resetMeasurement);
  window.addEventListener('scroll', () => {
    if (!hasConsent('analytics')) return;
    if (scrollTimer !== null) window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(() => {
      if (!hasConsent('analytics')) return;
      const percent = scrollPercent();
      for (const threshold of thresholds) if (percent >= threshold && !scrollFired.has(threshold)) {
        scrollFired.add(threshold);
        send('scroll_depth', { depth_threshold: threshold, page_path: path(), page_title: document.title });
      }
    }, 150);
  });
  function updateTime() {
    const now = Date.now();
    if (!hasConsent('analytics')) { active = false; elapsed = 0; lastTick = now; return; }
    if (!active) { active = true; elapsed = 0; lastTick = now; }
    if (visible) elapsed += Math.max(0, now - lastTick);
    lastTick = now; visible = !document.hidden;
    for (const seconds of times) if (elapsed >= seconds * 1000 && !timeFired.has(seconds)) {
      timeFired.add(seconds); send('time_on_page', { seconds, page_path: path(), page_title: document.title });
    }
  }
  document.addEventListener('visibilitychange', updateTime);
  window.setInterval(updateTime, 5000);
}
