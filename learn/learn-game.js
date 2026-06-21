/* Dragonfly Lens - learn-game.js
   Lightweight gamified learning: XP, levels, badges, streaks, shared quizzes.
   100% localStorage (key df_learn) - no login, per-device, zero friction.
   Include on any /learn page: <script src="learn-game.js"></script>
   - Reading a page  -> +5 XP (once per page per day)
   - Completing a quiz -> +10 XP per correct answer (once per quiz); perfect = a badge
   - Finishing a track (body[data-track][data-track-total]) -> a track badge
   Quiz markup the page provides:
     <div class="quiz" data-quiz="UNIQUE-ID"> ... <div class="q" data-a="INDEX"><button onclick="pick(this)">..</button>..</div> ..
        <button class="go" onclick="gradeQuiz(this)">See my score</button>
        <div class="quiz-result"></div></div>
*/
(function(){
  var KEY = 'df_learn';
  var RANKS = ['Rookie','Learner','Sharp','Pro','Master','Legend'];
  function load(){ try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch(e){ return {}; } }
  function save(s){ try { localStorage.setItem(KEY, JSON.stringify(s)); } catch(e){} }
  function dstr(d){ d = d || new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
  function levelFor(xp){ return Math.floor((xp||0)/100) + 1; }
  function rankFor(lvl){ return RANKS[Math.min(lvl-1, RANKS.length-1)]; }

  var state = load();
  state.xp = state.xp || 0; state.badges = state.badges || {}; state.seen = state.seen || {};
  state.quizzes = state.quizzes || {}; state.tracks = state.tracks || {};

  // streak (consecutive days visiting)
  (function(){
    var t = dstr();
    if (state.lastDay !== t){
      var y = new Date(); y.setDate(y.getDate()-1);
      state.streak = (state.lastDay === dstr(y)) ? (state.streak||0)+1 : 1;
      state.lastDay = t; save(state);
    }
  })();

  function award(pts, reason){ state.xp = (state.xp||0) + pts; save(state); render(); toast('+'+pts+' XP' + (reason ? ' - '+reason : '')); }
  function badge(key, label){ if (state.badges[key]) return; state.badges[key] = {label:label, at:Date.now()}; save(state); render(); toast('Badge unlocked: '+label+' \u{1F3C5}'); }

  function pageVisit(){
    var path = location.pathname, t = dstr();
    state.seen[path] = state.seen[path] || {};
    if (!state.seen[path][t]){ state.seen[path][t] = 1; save(state); award(5, 'read'); }
    var track = document.body.getAttribute('data-track');
    if (track){
      state.tracks[track] = state.tracks[track] || {};
      if (!state.tracks[track][path]){ state.tracks[track][path] = 1; save(state); }
      var total = +document.body.getAttribute('data-track-total') || 0;
      var done = Object.keys(state.tracks[track]).length;
      if (total && done >= total) badge('track_'+track, capitalize(track)+' complete');
    }
  }
  function capitalize(s){ return (s||'').charAt(0).toUpperCase() + (s||'').slice(1); }

  // ── Shared quiz handlers (global so page markup can call them) ──
  window.pick = function(btn){
    var q = btn.closest('.q'); var bs = q.querySelectorAll('button');
    for (var i=0;i<bs.length;i++) bs[i].classList.remove('sel');
    btn.classList.add('sel');
  };
  window.gradeQuiz = function(btn){
    var quiz = btn.closest('.quiz'); var qs = quiz.querySelectorAll('.q'); var score = 0;
    for (var j=0;j<qs.length;j++){
      var q = qs[j]; var bs = q.querySelectorAll('button'); var correct = +q.getAttribute('data-a'); var sel = q.querySelector('button.sel');
      for (var i=0;i<bs.length;i++){ bs[i].classList.remove('right','wrong'); if (i===correct) bs[i].classList.add('right'); else if (bs[i]===sel) bs[i].classList.add('wrong'); }
      if (sel){ var idx=-1; for (var k=0;k<bs.length;k++) if (bs[k]===sel) idx=k; if (idx===correct) score++; }
    }
    var ranks = ['Rookie','Getting It','Solid','Sharp','Brain'];
    var rk = ranks[Math.min(score, ranks.length-1)];
    var res = quiz.querySelector('.quiz-result');
    if (res) res.innerHTML = 'You scored <b>'+score+' / '+qs.length+'</b> - <b style="color:#4ade80;">'+rk+'</b>' + (score===qs.length ? ' \u{1F3C6}' : '') + '. Correct answers are green above.';
    var qid = quiz.getAttribute('data-quiz') || location.pathname;
    if (!(qid in state.quizzes)){
      state.quizzes[qid] = score; save(state);
      award(score*10, 'quiz');
      if (score === qs.length) badge('perfect_'+qid, 'Perfect score');
    }
  };

  // ── Progress chip + panel + toast ──
  function chipHtml(){
    var lvl = levelFor(state.xp), into = state.xp % 100;
    return '<div id="dlg-chip" title="Your learning progress" style="position:fixed;left:14px;bottom:14px;z-index:999;background:#0d1320;border:1px solid #2d3b66;border-radius:22px;padding:7px 13px;cursor:pointer;font:600 12px -apple-system,Segoe UI,Arial,sans-serif;color:#cfd8ea;box-shadow:0 4px 14px rgba(0,0,0,.4);display:flex;align-items:center;gap:8px;">'
      + '<span style="color:#a78bfa;font-weight:800;">Lv ' + lvl + '</span>'
      + '<span style="width:58px;height:6px;background:#1a2440;border-radius:4px;overflow:hidden;display:inline-block;"><span style="display:block;height:100%;width:' + into + '%;background:#a78bfa;"></span></span>'
      + '<span style="color:#93a3b8;">' + state.xp + ' XP</span>'
      + (state.streak > 1 ? '<span style="color:#fbbf24;">\u{1F525}' + state.streak + '</span>' : '')
      + '</div>';
  }
  function render(){
    var c = document.getElementById('dlg-chip');
    if (c) c.outerHTML = chipHtml(); else { var d = document.createElement('div'); d.innerHTML = chipHtml(); document.body.appendChild(d.firstChild); }
    var chip = document.getElementById('dlg-chip'); if (chip) chip.onclick = panel;
  }
  function panel(){
    var ex = document.getElementById('dlg-panel'); if (ex){ ex.remove(); return; }
    var lvl = levelFor(state.xp);
    var keys = Object.keys(state.badges);
    var badges = keys.length ? keys.map(function(k){ return '<span style="display:inline-block;background:rgba(167,139,250,.15);border:1px solid #2d3b66;border-radius:8px;padding:3px 9px;margin:3px 3px 0 0;font-size:11px;color:#cbb6ff;">\u{1F3C5} ' + state.badges[k].label + '</span>'; }).join('') : '<span style="color:#93a3b8;font-size:12px;">No badges yet - finish a track to earn one.</span>';
    var p = document.createElement('div'); p.id = 'dlg-panel';
    p.style.cssText = 'position:fixed;left:14px;bottom:54px;z-index:1000;background:#0e1620;border:1px solid #2d3b66;border-radius:12px;padding:16px;width:280px;max-width:90vw;color:#e9eef6;font:14px -apple-system,Segoe UI,Arial,sans-serif;box-shadow:0 8px 26px rgba(0,0,0,.6);';
    p.innerHTML = '<div style="font-weight:800;font-size:15px;">Your progress</div>'
      + '<div style="font-size:12px;color:#93a3b8;margin:4px 0 10px;">Level ' + lvl + ' ' + rankFor(lvl) + ' - ' + state.xp + ' XP' + (state.streak > 1 ? ' - \u{1F525} ' + state.streak + '-day streak' : '') + '</div>'
      + '<div style="font-size:11px;font-weight:700;color:#a78bfa;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;">Badges</div>' + badges
      + '<div style="font-size:11px;color:#93a3b8;margin-top:12px;line-height:1.5;">Earn XP by reading explainers and acing quizzes. Saved on this device - your eyes only.</div>';
    document.body.appendChild(p);
  }
  function toast(msg){
    var t = document.createElement('div'); t.textContent = msg;
    t.style.cssText = 'position:fixed;left:50%;bottom:60px;transform:translateX(-50%);z-index:1001;background:#1a3a1f;color:#4ade80;border:1px solid #2d6a4f;border-radius:20px;padding:8px 16px;font:700 13px -apple-system,Segoe UI,Arial,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.5);opacity:0;transition:opacity .25s;';
    document.body.appendChild(t); setTimeout(function(){ t.style.opacity='1'; }, 20);
    setTimeout(function(){ t.style.opacity='0'; setTimeout(function(){ t.remove(); }, 300); }, 2200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ render(); pageVisit(); });
  else { render(); pageVisit(); }
  window.DLGame = { award: award, badge: badge };
})();
