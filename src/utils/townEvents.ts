import { eventMatches,mountainDay } from '../data/townFeedModel.mjs';

/** Enhance dated static listings; no browser fetch, HTML insertion, or time-zone guess. */
export function installTownFeedPanels() {
  const form = document.querySelector<HTMLFormElement>('#town-event-filters');
  const from = document.querySelector<HTMLInputElement>('#town-event-from');
  const to = document.querySelector<HTMLInputElement>('#town-event-to');
  const query = document.querySelector<HTMLInputElement>('#town-event-query');
  const reset = document.querySelector<HTMLButtonElement>('#town-event-reset');
  const refresh = () => {
    document.querySelectorAll<HTMLElement>('[data-town-panel]').forEach(panel => {
      const expires = Date.parse(panel.dataset.townExpires || '');
      const retrieved = Date.parse(panel.dataset.townRetrieved || '');
      const results = panel.querySelector<HTMLElement>('[data-town-results]');
      if (!Number.isFinite(expires) || !Number.isFinite(retrieved) || retrieved > Date.now() || Date.now() > expires) {
        if (results) results.hidden = true;
        panel.querySelectorAll<HTMLElement>('[data-town-stale]').forEach(node => { node.hidden = false; });
        if (panel.contains(form) && form) form.hidden = true;
        return;
      }
      if (panel.dataset.townKind !== 'events' || !results || results.hidden) return;
      const invalid = Boolean(from?.value && to?.value && from.value > to.value);
      from?.setAttribute('aria-invalid',String(invalid));
      to?.setAttribute('aria-invalid',String(invalid));
      const count = panel.querySelector<HTMLElement>('[data-town-count]');
      if (invalid) { if (count) count.textContent = 'Choose an end date on or after the start date. The previous results are still shown.'; return; }
      let visible = 0;
      panel.querySelectorAll<HTMLElement>('[data-town-event]').forEach(card => {
        card.hidden = !eventMatches({startDate:card.dataset.start,endDate:card.dataset.end,title:card.dataset.townSearch||card.textContent||''},{from:from?.value||'',to:to?.value||'',query:query?.value||''});
        if (!card.hidden) visible++;
      });
      if (count) count.textContent = visible + (visible === 1 ? ' dated listing' : ' dated listings') + ' match. These filters do not confirm tickets or event operation.';
      const empty = panel.querySelector<HTMLElement>('[data-town-no-matches]');
      if (empty) empty.hidden = visible > 0;
    });
  };
  if (form && from && to && query && reset) {
    form.addEventListener('submit',event => event.preventDefault());
    [from,to,query].forEach(input => input.addEventListener('input',refresh));
    reset.addEventListener('click',() => { from.value = mountainDay(); to.value = ''; query.value = ''; refresh(); });
    form.hidden = false;
  }
  refresh();
  window.setInterval(refresh,60_000);
  document.addEventListener('visibilitychange',refresh);
  window.addEventListener('pageshow',refresh);
}
