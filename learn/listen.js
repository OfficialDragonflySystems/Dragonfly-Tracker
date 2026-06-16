/* Dragonfly Lens - "Listen to this article" player.
   Pure client-side Web Speech API (speechSynthesis). No backend, no API cost.
   Injects a floating Listen button on any article page that includes this script.
   Reads the .wrap article body, skipping nav/footer/CTA/sources/tooltips. */
(function () {
  if (!('speechSynthesis' in window)) return;            // unsupported browser -> no button
  var wrap = document.querySelector('.wrap');
  if (!wrap) return;

  // ---- styles ----
  var css = document.createElement('style');
  css.textContent =
    '#dl-listen{display:inline-flex;align-items:center;gap:8px;margin:2px 0 22px;' +
    'background:#0e1620;border:1px solid #2d5a35;border-radius:30px;padding:7px 9px 7px 13px;' +
    'box-shadow:0 4px 14px rgba(0,0,0,.35);font:600 13.5px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;}' +
    '#dl-listen button{cursor:pointer;border:none;background:none;color:#dff0df;font:inherit;display:flex;align-items:center;gap:7px;padding:0;}' +
    '#dl-listen .dl-main{color:#4ade80;}' +
    '#dl-listen .dl-ic{width:24px;height:24px;border-radius:50%;background:rgba(74,222,128,.16);border:1px solid #4ade80;' +
    'color:#4ade80;display:flex;align-items:center;justify-content:center;font-size:12px;line-height:1;}' +
    '#dl-listen .dl-x{color:#93a3b8;border-left:1px solid #22303f;padding-left:9px;margin-left:1px;font-size:12px;display:none;}' +
    '#dl-listen .dl-prog{color:#93a3b8;font-weight:500;font-size:11.5px;min-width:34px;text-align:right;display:none;}' +
    '#dl-listen.playing .dl-x,#dl-listen.playing .dl-prog,#dl-listen.paused .dl-x,#dl-listen.paused .dl-prog{display:flex;}' +
    '@media print{#dl-listen{display:none;}}';
  document.head.appendChild(css);

  // ---- UI ----
  var bar = document.createElement('div');
  bar.id = 'dl-listen';
  bar.innerHTML =
    '<button class="dl-toggle"><span class="dl-ic">&#9658;</span><span class="dl-main">Listen</span></button>' +
    '<span class="dl-prog">0%</span>' +
    '<button class="dl-x" title="Stop">&#10005;</button>';
  // place it right under the byline (fall back to the headline, then top of article)
  var anchor = wrap.querySelector('.byline') || wrap.querySelector('h1');
  if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(bar, anchor.nextSibling);
  else wrap.insertBefore(bar, wrap.firstChild);

  var toggle = bar.querySelector('.dl-toggle');
  var ic = bar.querySelector('.dl-ic');
  var label = bar.querySelector('.dl-main');
  var prog = bar.querySelector('.dl-prog');
  var stopBtn = bar.querySelector('.dl-x');

  // ---- gather readable text in document order ----
  function buildChunks() {
    var clone = wrap.cloneNode(true);
    // drop things we don't want spoken
    clone.querySelectorAll('script, #dtip, .disc, .byline, .kick').forEach(function (n) { n.remove(); });
    // drop the "Join the Lens" call-to-action box (the one holding a pricing link)
    clone.querySelectorAll('.box').forEach(function (b) {
      if (b.querySelector('a[href*="pricing"]')) b.remove();
    });
    var sel = 'h1, h2, h3, p, li, .step, th, td';
    var out = [];
    clone.querySelectorAll(sel).forEach(function (el) {
      var t = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (!t) return;
      // split long blocks into sentence-sized pieces (Chrome chokes on very long utterances)
      if (t.length > 240) {
        (t.match(/[^.!?]+[.!?]*\s*/g) || [t]).forEach(function (s) { if (s.trim()) out.push(s.trim()); });
      } else {
        out.push(t);
      }
    });
    return out;
  }

  var chunks = [];
  var idx = 0;
  var voice = null;

  function pickVoice() {
    var vs = window.speechSynthesis.getVoices() || [];
    if (!vs.length) return null;
    var en = vs.filter(function (v) { return /^en(-|_|$)/i.test(v.lang); });
    var pool = en.length ? en : vs;
    // prefer higher-quality natural voices when the device has them
    var pref = /natural|neural|premium|enhanced|google|siri|samantha|aria|jenny|libby|sonia/i;
    var nice = pool.filter(function (v) { return pref.test(v.name); });
    return (nice[0] || pool[0]);
  }
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = function () { if (!voice) voice = pickVoice(); };
  }

  function setProg() {
    var pct = chunks.length ? Math.min(100, Math.round((idx / chunks.length) * 100)) : 0;
    prog.textContent = pct + '%';
  }

  function speakFrom(i) {
    window.speechSynthesis.cancel();
    if (i >= chunks.length) { stop(); return; }
    idx = i;
    queueNext();
  }

  function queueNext() {
    if (idx >= chunks.length) { stop(); return; }
    var u = new SpeechSynthesisUtterance(chunks[idx]);
    if (voice) u.voice = voice;
    u.rate = 0.97; u.pitch = 1.0;
    u.onend = function () {
      idx++;
      setProg();
      if (idx < chunks.length && bar.classList.contains('playing')) queueNext();
      else if (idx >= chunks.length) stop();
    };
    u.onerror = function () { /* swallow; user can restart */ };
    window.speechSynthesis.speak(u);
  }

  // Chrome stops speaking after ~15s unless nudged; keep it alive while playing.
  var keepAlive = setInterval(function () {
    if (bar.classList.contains('playing')) {
      try { window.speechSynthesis.resume(); } catch (e) {}
    }
  }, 9000);

  function play() {
    if (!chunks.length) chunks = buildChunks();
    if (!voice) voice = pickVoice();
    bar.classList.remove('paused'); bar.classList.add('playing');
    ic.innerHTML = '&#10074;&#10074;'; label.textContent = 'Pause';
    setProg();
    speakFrom(idx >= chunks.length ? 0 : idx);
  }
  function pause() {
    bar.classList.remove('playing'); bar.classList.add('paused');
    ic.innerHTML = '&#9658;'; label.textContent = 'Resume';
    try { window.speechSynthesis.pause(); } catch (e) {}
  }
  function resume() {
    bar.classList.remove('paused'); bar.classList.add('playing');
    ic.innerHTML = '&#10074;&#10074;'; label.textContent = 'Pause';
    try { window.speechSynthesis.resume(); } catch (e) {}
  }
  function stop() {
    bar.classList.remove('playing', 'paused');
    ic.innerHTML = '&#9658;'; label.textContent = 'Listen';
    idx = 0; setProg();
    try { window.speechSynthesis.cancel(); } catch (e) {}
  }

  toggle.addEventListener('click', function () {
    if (bar.classList.contains('playing')) pause();
    else if (bar.classList.contains('paused')) resume();
    else play();
  });
  stopBtn.addEventListener('click', stop);
  window.addEventListener('beforeunload', function () { try { window.speechSynthesis.cancel(); } catch (e) {} clearInterval(keepAlive); });
})();
