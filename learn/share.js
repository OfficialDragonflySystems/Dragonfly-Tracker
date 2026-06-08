/* Dragonfly Lens - lightweight share widget. Self-injecting, zero dependencies.
   Native Web Share API on mobile; X / LinkedIn / Email / Copy fallback on desktop.
   Drop <script src="share.js"></script> before </body> on any page to enable. */
(function () {
  if (window.__dfShare) return; window.__dfShare = true;
  var ACCENT = '#4ade80', DARK = '#0d1f0f', BORDER = '#1e3a22', INK = '#dff0df';
  function el(tag, css, html) { var e = document.createElement(tag); if (css) e.style.cssText = css; if (html != null) e.innerHTML = html; return e; }
  function url() { return location.href; }
  function title() { return (document.title || 'Dragonfly Lens').replace(/\s*[—\-|]\s*Dragonfly Lens.*$/, '').trim() || 'Dragonfly Lens'; }

  function toast(msg) {
    var t = el('div', 'position:fixed;bottom:84px;right:20px;background:' + DARK + ';color:' + ACCENT + ';border:1px solid ' + BORDER + ';padding:9px 14px;border-radius:8px;font:600 13px/1 system-ui,Arial,sans-serif;z-index:100001;box-shadow:0 6px 20px rgba(0,0,0,.5);opacity:0;transition:opacity .2s;', msg);
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.style.opacity = '1'; });
    setTimeout(function () { t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 250); }, 1600);
  }
  function copy() {
    var p = (navigator.clipboard && navigator.clipboard.writeText) ? navigator.clipboard.writeText(url()) : Promise.reject();
    p.then(function () { toast('Link copied'); }, function () { window.prompt('Copy this link:', url()); });
  }

  var menu = null, btn;
  function buildMenu() {
    menu = el('div', 'position:fixed;bottom:84px;right:20px;background:' + DARK + ';border:1px solid ' + BORDER + ';border-radius:12px;padding:8px;z-index:100000;box-shadow:0 8px 28px rgba(0,0,0,.55);display:none;min-width:186px;');
    var items = [
      ['Share on X', function () { window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(title()) + '&url=' + encodeURIComponent(url()), '_blank', 'noopener'); }],
      ['Share on LinkedIn', function () { window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url()), '_blank', 'noopener'); }],
      ['Email', function () { window.location.href = 'mailto:?subject=' + encodeURIComponent(title()) + '&body=' + encodeURIComponent(url()); }],
      ['Copy link', copy]
    ];
    items.forEach(function (it) {
      var b = el('button', 'display:block;width:100%;text-align:left;background:transparent;border:none;color:' + INK + ';font:600 13px system-ui,Arial,sans-serif;padding:9px 12px;border-radius:8px;cursor:pointer;', it[0]);
      b.onmouseover = function () { b.style.background = 'rgba(74,222,128,.12)'; };
      b.onmouseout = function () { b.style.background = 'transparent'; };
      b.onclick = function (e) { e.stopPropagation(); it[1](); hide(); };
      menu.appendChild(b);
    });
    document.body.appendChild(menu);
  }
  function show() { if (!menu) buildMenu(); menu.style.display = 'block'; setTimeout(function () { document.addEventListener('click', outside); }, 0); }
  function hide() { if (menu) menu.style.display = 'none'; document.removeEventListener('click', outside); }
  function outside(e) { if (menu && !menu.contains(e.target) && e.target !== btn) hide(); }

  btn = el('button', 'position:fixed;bottom:20px;right:20px;width:52px;height:52px;border-radius:50%;background:' + ACCENT + ';color:' + DARK + ';border:none;cursor:pointer;z-index:100000;box-shadow:0 6px 20px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;',
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/></svg>');
  btn.title = 'Share this page';
  btn.setAttribute('aria-label', 'Share this page');
  btn.onclick = function (e) {
    e.stopPropagation();
    if (navigator.share) { navigator.share({ title: title(), url: url() }).catch(function () {}); }
    else { if (menu && menu.style.display === 'block') hide(); else show(); }
  };
  document.body.appendChild(btn);
})();
