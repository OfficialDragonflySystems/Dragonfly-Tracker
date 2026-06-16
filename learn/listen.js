/* Dragonfly Lens - "Listen to this article" player.
   Two modes, auto-selected on first click:
     1) MP3 mode  - if a pre-rendered narration exists at audio/<slug>.mp3
                    (made by Tracker/render_audio.py), play that studio voice.
     2) TTS mode  - otherwise fall back to the browser's built-in Web Speech voice.
   Pure client-side. No backend. Zero cost in TTS mode; MP3 mode just serves a static file.
   The button sits under the byline and looks identical in both modes. */
(function () {
  var wrap = document.querySelector('.wrap') || document.querySelector('.page');
  if (!wrap) return;
  var hasTTS = ('speechSynthesis' in window);

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

  // ---- UI (under the byline; fall back to headline, then top of article) ----
  var bar = document.createElement('div');
  bar.id = 'dl-listen';
  bar.innerHTML =
    '<button class="dl-toggle"><span class="dl-ic">&#9658;</span><span class="dl-main">Listen</span></button>' +
    '<span class="dl-prog">0%</span>' +
    '<button class="dl-x" title="Stop">&#10005;</button>';
  var anchor = wrap.querySelector('.byline') || wrap.querySelector('h1');
  if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(bar, anchor.nextSibling);
  else wrap.insertBefore(bar, wrap.firstChild);

  var ic = bar.querySelector('.dl-ic');
  var label = bar.querySelector('.dl-main');
  var prog = bar.querySelector('.dl-prog');
  var stopBtn = bar.querySelector('.dl-x');

  function playingUI() { bar.classList.remove('paused'); bar.classList.add('playing'); ic.innerHTML = '&#10074;&#10074;'; label.textContent = 'Pause'; }
  function pausedUI() { bar.classList.remove('playing'); bar.classList.add('paused'); ic.innerHTML = '&#9658;'; label.textContent = 'Resume'; }
  function idleUI() { bar.classList.remove('playing', 'paused'); ic.innerHTML = '&#9658;'; label.textContent = 'Listen'; prog.textContent = '0%'; }
  function setProgPct(p) { prog.textContent = Math.max(0, Math.min(100, Math.round(p))) + '%'; }

  // ---- mode detection ----
  var mode = null;            // 'mp3' | 'tts'
  var audioEl = null;

  function slug() { var p = (location.pathname.split('/').pop() || ''); return p.replace(/\.html?$/i, '') || 'index'; }

  function ensureMode(cb) {
    if (mode) { cb(); return; }
    var url = 'audio/' + slug() + '.mp3';
    var done = function (ok) {
      if (ok) { mode = 'mp3'; setupAudio(url); }
      else { mode = hasTTS ? 'tts' : 'none'; }
      cb();
    };
    if (!window.fetch) { done(false); return; }
    fetch(url, { method: 'HEAD' }).then(function (r) { done(r && r.ok); }).catch(function () { done(false); });
  }

  // ---- MP3 mode ----
  function setupAudio(url) {
    audioEl = new Audio(url);
    audioEl.preload = 'none';
    audioEl.addEventListener('timeupdate', function () {
      if (audioEl.duration) setProgPct((audioEl.currentTime / audioEl.duration) * 100);
    });
    audioEl.addEventListener('ended', function () { idleUI(); audioEl.currentTime = 0; });
  }

  // ---- TTS mode (Web Speech) ----
  var chunks = [], idx = 0, voice = null, keepAlive = null;

  function buildChunks() {
    var clone = wrap.cloneNode(true);
    clone.querySelectorAll('script, #dtip, .disc, .byline, .kick, .eyebrow, #dl-listen').forEach(function (n) { n.remove(); });
    clone.querySelectorAll('.box').forEach(function (b) { if (b.querySelector('a[href*="pricing"]')) b.remove(); });
    var out = [];
    clone.querySelectorAll('h1, h2, h3, p, li, .step, th, td').forEach(function (el) {
      var t = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (!t) return;
      if (t.length > 240) { (t.match(/[^.!?]+[.!?]*\s*/g) || [t]).forEach(function (s) { if (s.trim()) out.push(s.trim()); }); }
      else out.push(t);
    });
    return out;
  }
  function pickVoice() {
    var vs = (hasTTS && window.speechSynthesis.getVoices()) || [];
    if (!vs.length) return null;
    var en = vs.filter(function (v) { return /^en(-|_|$)/i.test(v.lang); });
    var pool = en.length ? en : vs;
    var pref = /natural|neural|premium|enhanced|google|siri|samantha|aria|jenny|libby|sonia/i;
    var nice = pool.filter(function (v) { return pref.test(v.name); });
    return (nice[0] || pool[0]);
  }
  if (hasTTS && window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = function () { if (!voice) voice = pickVoice(); };
  }
  function ttsProg() { setProgPct(chunks.length ? (idx / chunks.length) * 100 : 0); }
  function queueNext() {
    if (idx >= chunks.length) { ttsStop(); return; }
    var u = new SpeechSynthesisUtterance(chunks[idx]);
    if (voice) u.voice = voice;
    u.rate = 0.97; u.pitch = 1.0;
    u.onend = function () { idx++; ttsProg(); if (idx < chunks.length && bar.classList.contains('playing')) queueNext(); else if (idx >= chunks.length) ttsStop(); };
    u.onerror = function () {};
    window.speechSynthesis.speak(u);
  }
  function ttsPlay() {
    if (!chunks.length) chunks = buildChunks();
    if (!voice) voice = pickVoice();
    playingUI(); ttsProg();
    window.speechSynthesis.cancel();
    if (idx >= chunks.length) idx = 0;
    queueNext();
    if (!keepAlive) keepAlive = setInterval(function () { if (bar.classList.contains('playing')) { try { window.speechSynthesis.resume(); } catch (e) {} } }, 9000);
  }
  function ttsPause() { pausedUI(); try { window.speechSynthesis.pause(); } catch (e) {} }
  function ttsResume() { playingUI(); try { window.speechSynthesis.resume(); } catch (e) {} }
  function ttsStop() { idleUI(); idx = 0; try { window.speechSynthesis.cancel(); } catch (e) {} }

  // ---- unified controls ----
  function play() { if (mode === 'mp3') { playingUI(); audioEl.play(); } else if (mode === 'tts') ttsPlay(); }
  function pause() { if (mode === 'mp3') { pausedUI(); audioEl.pause(); } else if (mode === 'tts') ttsPause(); }
  function resume() { if (mode === 'mp3') { playingUI(); audioEl.play(); } else if (mode === 'tts') ttsResume(); }
  function stop() { if (mode === 'mp3') { idleUI(); audioEl.pause(); audioEl.currentTime = 0; } else if (mode === 'tts') ttsStop(); }

  bar.querySelector('.dl-toggle').addEventListener('click', function () {
    ensureMode(function () {
      if (mode === 'none') { label.textContent = 'Not supported'; return; }
      if (bar.classList.contains('playing')) pause();
      else if (bar.classList.contains('paused')) resume();
      else play();
    });
  });
  stopBtn.addEventListener('click', stop);
  window.addEventListener('beforeunload', function () {
    try { if (hasTTS) window.speechSynthesis.cancel(); } catch (e) {}
    if (audioEl) { try { audioEl.pause(); } catch (e) {} }
    if (keepAlive) clearInterval(keepAlive);
  });
})();
