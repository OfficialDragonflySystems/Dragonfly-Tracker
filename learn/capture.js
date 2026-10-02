/* Dragonfly Lens - Learn-page email capture (2026-10-02). Self-injecting, zero dependencies.
   Drop <script src="capture.js"></script> before </body> on any /learn page.

   What it does, and deliberately does NOT do:
   - Every article stays fully readable and indexable. Nothing is hidden from crawlers:
     the content is in the DOM as always; only an overlay is added, only in browsers.
   - SOFT METER: inline signup boxes on every article from the first visit. After the
     reader's 3rd distinct article in this browser, a full-screen signup asks for an email
     before continuing (newspaper-style). Crawlers never reach it (no localStorage history).
   - HARD GATE: interactive tools (the slugs in HARD below) ask for the email up front.
   - If the signup endpoint is unreachable, the reader is NEVER locked out - a dead server
     must not wall the site. The overlay stands down for that session and we try again later.
   - Measurement: trigger + page are sent with every signup, and GA events fire if gtag exists.
   - Own-testing escape hatch: add ?nogate=1 to the URL. */
(function () {
  if (window.__dfCapture) return; window.__dfCapture = true;

  var ENDPOINT = 'https://tracker.officialdragonflysystems.com/api/learn-signup';
  var METER_LIMIT = 3;                                 // the Nth distinct article triggers the meter
  var HARD = ['dividend-planner', 'money-map'];        // interactive tools: email up front
  var SKIP = ['index', 'start-here', 'why-the-lens', 'how-we-prove-it', 'corrections', 'newsletters'];

  var ACCENT = '#4ade80', DARK = '#0d1f0f', PANEL = '#13261a', BORDER = '#1e3a22', INK = '#dff0df', MUTED = '#9ab8a0';
  var PROMISE = 'Free. No spam, never sold, one-click unsubscribe. You get each new deep dive the day it ' +
                'posts (about twice a week) plus the free weekly signal note.';

  var slug = (location.pathname.split('/').pop() || 'index').replace(/\.html$/, '') || 'index';
  if (SKIP.indexOf(slug) !== -1) return;
  if (/nogate=1/.test(location.search)) return;
  if (/bot|crawl|spider|slurp|lighthouse|headless|prerender/i.test(navigator.userAgent)) return;

  var store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
                set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  var sess  = { get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
                set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };

  if (store.get('df_sub') === '1') return;             // already subscribed in this browser: nothing to show

  // Distinct-article count for the meter (deduped by slug).
  var seen = [];
  try { seen = JSON.parse(store.get('df_views') || '[]'); } catch (e) { seen = []; }
  if (seen.indexOf(slug) === -1) { seen.push(slug); store.set('df_views', JSON.stringify(seen)); }
  var hard = HARD.indexOf(slug) !== -1;
  var metered = seen.length >= METER_LIMIT;

  function ga(name, extra) {
    try { if (typeof gtag === 'function') gtag('event', name, Object.assign({ page: slug }, extra || {})); } catch (e) {}
  }
  function el(tag, css, html) { var e = document.createElement(tag); if (css) e.style.cssText = css; if (html != null) e.innerHTML = html; return e; }

  function toast(msg) {
    var t = el('div', 'position:fixed;bottom:84px;left:50%;transform:translateX(-50%);background:' + DARK + ';color:' + ACCENT +
      ';border:1px solid ' + BORDER + ';padding:10px 16px;border-radius:8px;font:600 14px/1.3 system-ui,Arial,sans-serif;z-index:100003;box-shadow:0 6px 20px rgba(0,0,0,.5);opacity:0;transition:opacity .2s;', msg);
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.style.opacity = '1'; });
    setTimeout(function () { t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 250); }, 2600);
  }

  // One form builder for all three placements; `trigger` is what gets measured.
  function form(trigger, headline, sub) {
    var box = el('div', 'background:' + PANEL + ';border:1px solid ' + BORDER + ';border-radius:12px;padding:20px 22px;margin:28px 0;font-family:system-ui,Arial,sans-serif;color:' + INK + ';');
    box.innerHTML =
      '<div style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:' + ACCENT + ';margin-bottom:6px">Dragonfly Lens</div>' +
      '<div style="font-size:19px;font-weight:700;line-height:1.25;margin-bottom:6px">' + headline + '</div>' +
      '<div style="font-size:14px;color:' + MUTED + ';line-height:1.55;margin-bottom:14px">' + sub + '</div>' +
      '<form style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<input type="email" required placeholder="you@email.com" autocomplete="email" ' +
          'style="flex:1 1 220px;min-width:0;padding:11px 13px;background:' + DARK + ';border:1px solid ' + BORDER + ';border-radius:6px;color:#fff;font-size:15px;outline:none">' +
        '<button type="submit" style="padding:11px 18px;background:' + ACCENT + ';color:' + DARK + ';border:none;border-radius:6px;font-weight:700;font-size:15px;cursor:pointer;white-space:nowrap">Send me the next one</button>' +
      '</form>' +
      '<div style="font-size:12px;color:' + MUTED + ';line-height:1.5;margin-top:10px">' + PROMISE + '</div>' +
      '<div data-msg style="font-size:13px;margin-top:8px;min-height:1em"></div>';
    var f = box.querySelector('form'), input = box.querySelector('input'), btn = box.querySelector('button'), msg = box.querySelector('[data-msg]');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = (input.value || '').trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { msg.style.color = '#f6a96b'; msg.textContent = 'That email does not look right.'; return; }
      btn.disabled = true; btn.textContent = 'One sec...'; msg.textContent = '';
      submit(email, trigger).then(function (r) {
        if (r && r.ok) { unlock(r.already ? 'Already on the list - welcome back.' : 'You are in. Check your inbox.'); ga('learn_signup', { trigger: trigger }); }
        else { btn.disabled = false; btn.textContent = 'Send me the next one'; msg.style.color = '#f6a96b'; msg.textContent = (r && r.error) ? r.error : 'Something went wrong - try again.'; }
      }, function () {
        // Endpoint unreachable: never wall the reader. Stand down for this session.
        btn.disabled = false; btn.textContent = 'Send me the next one';
        msg.style.color = '#f6a96b'; msg.textContent = 'Could not reach the server - the page is unlocked for now, please try again later.';
        sess.set('df_standdown', '1'); removeOverlay();
      });
    });
    return box;
  }

  function submit(email, trigger) {
    return fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, trigger: trigger, page: slug, referrer: document.referrer || '' }) })
      .then(function (r) { return r.json(); });
  }

  var overlay = null;
  function removeOverlay() {
    if (overlay) { overlay.remove(); overlay = null; document.documentElement.style.overflow = ''; }
  }
  function unlock(message) {
    store.set('df_sub', '1');
    removeOverlay();
    var boxes = document.querySelectorAll('[data-df-capture]');
    for (var i = 0; i < boxes.length; i++) boxes[i].remove();
    toast(message);
  }

  function showOverlay(trigger) {
    if (sess.get('df_standdown') === '1') return;
    var head = trigger === 'hard' ? 'This tool is free - with an email.' : 'Third one is free too - with an email.';
    var sub  = trigger === 'hard'
      ? 'Enter your email once and the tool opens. That is the whole deal.'
      : 'You have read three deep dives. Enter your email once and keep reading - everything stays free.';
    overlay = el('div', 'position:fixed;inset:0;background:rgba(5,12,7,.86);backdrop-filter:blur(3px);z-index:100002;display:flex;align-items:center;justify-content:center;padding:18px;');
    var card = el('div', 'max-width:520px;width:100%;');
    var box = form(trigger, head, sub);
    box.style.margin = '0';
    box.style.boxShadow = '0 18px 60px rgba(0,0,0,.6)';
    card.appendChild(box);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    document.documentElement.style.overflow = 'hidden';
    setTimeout(function () { var i = box.querySelector('input'); if (i) i.focus(); }, 50);
    ga(trigger === 'hard' ? 'learn_hardgate_shown' : 'learn_meter_shown');
  }

  function placeInline() {
    // Mid-article: after the 4th paragraph of the main content; bottom: before the share widgets.
    var root = document.querySelector('main, article, .wrap, .container, .content') || document.body;
    var ps = root.querySelectorAll('p');
    var mid = form('inline-mid', 'Get the next one in your inbox.', 'Sourced deep dives on the physical AI build-out, energy, and what the numbers actually say.');
    mid.setAttribute('data-df-capture', '1');
    if (ps.length >= 6) ps[3].parentNode.insertBefore(mid, ps[3].nextSibling);
    var end = form('inline-end', 'Want the next deep dive the day it posts?', 'Twice a week, every number sourced, every correction made in the open.');
    end.setAttribute('data-df-capture', '1');
    var anchor = document.querySelector('script[src="share.js"], script[src="listen.js"]');
    if (anchor && anchor.parentNode === document.body) document.body.insertBefore(end, anchor); else document.body.appendChild(end);
  }

  function init() {
    placeInline();
    if (hard) showOverlay('hard');
    else if (metered) showOverlay('meter');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
