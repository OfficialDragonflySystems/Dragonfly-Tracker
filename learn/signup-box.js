/* Free email signup box for the home page and Learn index. Same endpoint the article boxes use.
   Put <div data-df-signup="home"></div> where it should appear. No popups; it just sits on the page. */
(function () {
  var ENDPOINT = 'https://tracker.officialdragonflysystems.com/api/learn-signup';
  var slots = document.querySelectorAll('[data-df-signup]');
  for (var i = 0; i < slots.length; i++) build(slots[i]);
  function build(slot) {
    var dark = !!(slot.closest && slot.closest('.hero'));
    var trigger = 'static-' + (slot.getAttribute('data-df-signup') || 'page');
    slot.innerHTML =
      '<form style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;max-width:520px;margin:18px auto 0">' +
      '<input type="email" required placeholder="you@email.com" autocomplete="email" aria-label="Email address" style="flex:1 1 220px;min-width:0;padding:11px 13px;border:1px solid ' + (dark ? '#2f4a36' : '#c9d3cb') + ';background:' + (dark ? '#0d1f0f' : '#fff') + ';color:' + (dark ? '#fff' : '#111') + ';border-radius:6px;font-size:15px">' +
      '<button type="submit" style="padding:11px 18px;background:' + (dark ? '#4ade80' : '#2d6a4f') + ';color:' + (dark ? '#0d1f0f' : '#fff') + ';border:0;border-radius:6px;font-weight:700;font-size:15px;cursor:pointer">Get the free research by email</button></form>' +
      '<div style="font-size:12.5px;color:' + (dark ? '#9ab8a0' : '#6b7280') + ';margin-top:8px;text-align:center">Free. No spam, never sold, one-click unsubscribe. The deep dives as they post, about twice a week.</div>' +
      '<div data-msg style="font-size:13px;margin-top:6px;min-height:1em;text-align:center"></div>';
    var f = slot.querySelector('form'), inp = slot.querySelector('input'), btn = slot.querySelector('button'), msg = slot.querySelector('[data-msg]');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = (inp.value || '').trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { msg.style.color = '#b45309'; msg.textContent = 'That email does not look right.'; return; }
      btn.disabled = true; msg.textContent = '';
      fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, trigger: trigger, page: location.pathname, referrer: document.referrer || '' }) })
        .then(function (r) { return r.json(); })
        .then(function (r) {
          if (r && r.ok) { try { localStorage.setItem('df_sub', '1'); } catch (x) {} msg.style.color = '#166534'; msg.textContent = r.already ? 'Already on the list - welcome back.' : 'You are in. Check your inbox.'; f.style.display = 'none'; }
          else { btn.disabled = false; msg.style.color = '#b45309'; msg.textContent = (r && r.error) || 'Something went wrong - try again.'; }
        }, function () { btn.disabled = false; msg.style.color = '#b45309'; msg.textContent = 'Could not reach the server - please try again later.'; });
    });
  }
})();
