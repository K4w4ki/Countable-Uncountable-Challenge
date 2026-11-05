/* =========================================================
   COUNTABLE & UNCOUNTABLE — Business English Challenge
   APP: navigation, intro sequence, i18n, challenge, classroom
   ========================================================= */

/* ---------- INTRO SEQUENCE (3 steps, like the original) ---------- */
function runIntro(){
  const steps=[...document.querySelectorAll('.intro-step')];
  let i=0;
  function show(n){
    steps.forEach((s,idx)=>{s.classList.remove('show','hide'); s.classList.add(idx===n?'show':'hide');});
  }
  show(0);
  const timer=setInterval(()=>{
    i++;
    if(i>=steps.length){clearInterval(timer); finishIntro(); return;}
    show(i);
  },2500);
  document.getElementById('skipIntro').onclick=()=>{clearInterval(timer); finishIntro();};
}
function finishIntro(){
  const intro=document.getElementById('intro');
  intro.style.transition='opacity .6s ease';
  intro.style.opacity='0';
  setTimeout(()=>{intro.style.display='none'; goTo('welcome');},600);
}

/* ---------- NAVIGATION ---------- */
function goTo(id){
  stopSpeech();
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0,0);
  // page height just changed (new screen) — let the decorative scrollbar's
  // thumb recompute its size/position for the new content
  requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')));
}

/* ---------- EXIT CHALLENGE ---------- */
function exitChallenge(){
  clearInterval(timerInt);
  goTo('welcome');
}

/* =========================================================
   LANGUAGE — single source of truth for EN/PT across the site.
   Every screen (welcome, learn, challenge, classroom) reads
   from window.appLang, so a language change anywhere keeps the
   whole app — including an in-progress question — in sync.
   ========================================================= */
/* =========================================================
   ANIMATED TEXT SWAP
   Troca o texto de um elemento palavra por palavra:
   as palavras antigas sobem e desaparecem (blur + fade) e as novas
   entram de baixo com um leve brilho laranja. Palavras iguais no
   começo da frase não se mexem, e a altura do bloco é animada para
   o layout não "pular" quando o texto muda de tamanho.
   ========================================================= */
function swapText(el,newText,opts){
  opts=opts||{};
  const delay=opts.delay||0;

  // se uma troca anterior ainda está rodando, cancela e fixa o texto final dela
  const prev=el._swap;
  if(prev){
    prev.timers.forEach(clearTimeout);
    el.style.height=''; el.style.transition='';
    prev.host.textContent=prev.target;
    el._swap=null;
  }

  const oldText=el.textContent;
  if(oldText===newText) return;

  // sem animação: chamada inicial, elemento oculto (outra tela) ou sr-only (as animações rodam sempre, mesmo com "reduzir movimento" ligado no sistema)
  const canAnimate = opts.instant!==true &&
                     el.getClientRects().length>0 && !el.classList.contains('sr-only');
  if(!canAnimate){ el.textContent=newText; return; }

  // palavras em comum no início ficam paradas; só o resto anima
  const oldW=oldText.split(/\s+/).filter(Boolean);
  const newW=newText.split(/\s+/).filter(Boolean);
  let k=0;
  while(k<oldW.length && k<newW.length && oldW[k]===newW[k]) k++;
  const keep=oldW.slice(0,k).join(' ');
  const outW=oldW.slice(k), inW=newW.slice(k);
  if(!outW.length && !inW.length){ el.textContent=newText; return; }

  // em containers flex/grid cada <span> viraria um item solto — usa um wrapper interno
  const cs=getComputedStyle(el);
  let host=el;
  if(/flex|grid/.test(cs.display)){
    const only=el.children.length===1 ? el.firstElementChild : null;
    if(only && only.classList.contains('sw-root')) host=only;
    else{
      host=document.createElement('span'); host.className='sw-root';
      host.textContent=oldText; el.textContent=''; el.appendChild(host);
    }
  }

  // trava a altura atual (só em blocos) para animá-la depois
  const isBlock=cs.display==='block';
  const h0=el.offsetHeight;
  if(isBlock) el.style.height=h0+'px';

  const OUT=200, IN=520;
  const outStep=Math.min(10,150/Math.max(outW.length,1));
  const inStep =Math.min(22,300/Math.max(inW.length,1));

  const state=el._swap={host:host,target:newText,timers:[]};
  const later=(fn,ms)=>state.timers.push(setTimeout(fn,ms));

  function build(words,cls,step,base){
    host.textContent='';
    if(keep) host.appendChild(document.createTextNode(keep+(words.length?' ':'')));
    words.forEach((w,i)=>{
      if(i) host.appendChild(document.createTextNode(' '));
      const s=document.createElement('span');
      s.className='sw '+cls; s.textContent=w;
      s.style.animationDelay=(base+i*step)+'ms';
      host.appendChild(s);
    });
  }

  // fase 1 — palavras antigas saem
  let tIn=delay;
  if(outW.length){
    build(outW,'sw-out',outStep,delay);
    tIn=delay+OUT+(outW.length-1)*outStep;
  }

  // fase 2 — palavras novas entram (e a altura do bloco acompanha)
  later(()=>{
    build(inW,'sw-in',inStep,0);
    if(isBlock){
      el.style.height='auto';
      const h1=el.offsetHeight;
      if(h1!==h0){
        el.style.height=h0+'px';
        void el.offsetHeight; // reflow
        el.style.transition='height .45s cubic-bezier(.22,1,.36,1)';
        el.style.height=h1+'px';
      }
    }
  },tIn);

  // fim — limpa os spans e deixa só o texto puro
  later(()=>{
    el.style.height=''; el.style.transition='';
    host.textContent=newText;
    el._swap=null;
  },tIn+IN+Math.max(inW.length-1,0)*inStep+40);
}

/* =========================================================
   LANGUAGE — single source of truth for EN/PT across the site.
   Every screen (welcome, learn, challenge, classroom) reads
   from window.appLang, so a language change anywhere keeps the
   whole app — including an in-progress question — in sync.
   Cada mudança de idioma anima as palavras (swapText); a chamada
   inicial passa animate=false para a página já abrir no idioma certo.
   ========================================================= */
window.appLang='en';

function setAppLang(lang,animate){
  if(animate===undefined) animate=true;
  if(lang!==window.appLang) stopSpeech();   // a fala em andamento estaria no idioma antigo
  window.appLang=lang;
  document.documentElement.lang = lang==='pt' ? 'pt-BR' : 'en';

  // sync every EN/PT switch on the page, regardless of which screen it lives in
  document.querySelectorAll('.lang-switch').forEach(sw=>{
    sw.setAttribute('data-lang',lang);
    sw.querySelectorAll('.lang-opt').forEach((b,i)=>b.classList.toggle('active',(lang==='en'&&i===0)||(lang==='pt'&&i===1)));
  });

  // static i18n strings everywhere on the page (not just the visible screen),
  // so content already matches when the user navigates to another screen.
  // Os visíveis entram em cascata, de cima para baixo.
  let order=0;
  document.querySelectorAll('.i18n').forEach(el=>{
    const text = lang==='en' ? el.dataset.en : el.dataset.pt;
    swapText(el,text,{instant:!animate,delay:Math.min(order*40,320)});
    if(el.getClientRects().length) order++;
  });

  // Learn section vocabulary cards
  if(animate) updateVocabLang(); else renderVocab();

  // Solo Challenge: keep an in-progress question (and its hint/feedback) in sync
  if(currentItem && document.getElementById('challenge').classList.contains('active')){
    state.qLang=lang;
    document.getElementById('qLangBtn').classList.toggle('active',lang==='pt');
    swapText(document.getElementById('qText'), lang==='en'?currentItem.q[0]:currentItem.q[1], {instant:!animate});
    if(state.hintOpen){
      swapText(document.getElementById('hintBox'), '💡 '+(lang==='en'?currentItem.h[0]:currentItem.h[1]), {instant:!animate,delay:80});
    }
    const fb=document.getElementById('feedback');
    if(fb.classList.contains('show') && fb.dataset.wasCorrect!==undefined){
      const wasCorrect=fb.dataset.wasCorrect==='1', wasTimeout=fb.dataset.wasTimeout==='1';
      swapText(fb, (wasCorrect?'✅ Correct! ':wasTimeout?'⏱ Time up! ':'❌ Not quite. ')+(lang==='en'?currentItem.e[0]:currentItem.e[1]), {instant:!animate,delay:120});
    }
  }

  // Classroom Mode: troca só o texto (animado) — não recria a pergunta,
  // assim a resposta já revelada e a opção selecionada continuam como estavam
  if(document.getElementById('classroom').classList.contains('active')){
    cs.lang=lang;
    const item=QUIZ[cs.order[cs.i]];
    swapText(document.getElementById('cqText'), lang==='en'?item.q[0]:item.q[1], {instant:!animate});
    if(cs.revealed){
      swapText(document.getElementById('cFeedback'), lang==='en'?item.e[0]:item.e[1], {instant:!animate,delay:80});
    }
  }
}

/* Generic EN/PT pill used on Welcome, Learn, Challenge Intro and Classroom Setup */
function toggleLang(sw){
  const cur=sw.getAttribute('data-lang');
  setAppLang(cur==='en' ? 'pt' : 'en');
}
/* In-question translate pill (Solo Challenge) */
function toggleQuestionLang(){
  if(!currentItem) return;
  setAppLang(state.qLang==='en' ? 'pt' : 'en');
}
/* In-question translate pill (Classroom) */
function toggleClassroomLang(){
  setAppLang(cs.lang==='en' ? 'pt' : 'en');
}

/* ---------- LEARN SECTION ---------- */
/* 'all' | 'C' | 'U' — which type chip is currently selected */
window.vocabFilter='all';

function setVocabFilter(type){
  window.vocabFilter=type;
  document.querySelectorAll('.filter-chip').forEach(chip=>{
    chip.classList.toggle('active',chip.dataset.filter===type);
  });
  renderVocab();
}

function renderVocab(){
  const lang=window.appLang;
  const grid=document.getElementById('vocabGrid');
  if(!grid) return; // Learn screen not in the DOM yet

  // keep the type counters accurate regardless of the current search/filter
  const countAllEl=document.getElementById('countAll');
  if(countAllEl){
    countAllEl.textContent=VOCAB.length;
    document.getElementById('countC').textContent=VOCAB.filter(v=>v.type==='C').length;
    document.getElementById('countU').textContent=VOCAB.filter(v=>v.type==='U').length;
  }

  const searchInput=document.getElementById('vocabSearch');
  const query=searchInput ? searchInput.value.trim().toLowerCase() : '';
  const filter=window.vocabFilter||'all';

  const filtered=VOCAB.filter(v=>{
    if(filter!=='all' && v.type!==filter) return false;
    if(!query) return true;
    return v.en.toLowerCase().includes(query) || v.pt.toLowerCase().includes(query);
  });

  grid.innerHTML='';
  if(filtered.length===0){
    const empty=document.createElement('div');
    empty.className='vocab-empty';
    empty.textContent = lang==='en' ? 'No words match your search.' : 'Nenhuma palavra encontrada.';
    grid.appendChild(empty);
    return;
  }

  filtered.forEach(v=>{
    const index=VOCAB.indexOf(v)+1;
    const div=document.createElement('div');
    div.className='vocab-card '+(v.type==='C'?'type-c':'type-u');
    div.dataset.i=VOCAB.indexOf(v);
    div.innerHTML=`
      <div class="vocab-card-top">
        <span class="vocab-index">${String(index).padStart(2,'0')}</span>
        <span class="tag ${v.type==='C'?'tag-c':'tag-u'}">${v.type==='C'?'COUNTABLE':'UNCOUNTABLE'}</span>
      </div>
      <div class="vocab-word-row">
        <h4>${lang==='en'?v.en:v.pt}</h4>
        ${speakBtnHTML('word',lang)}
      </div>
      <div class="pt-sub">${lang==='en'?v.pt:v.en}</div>
      <div class="ex-wrap">
        <div class="ex">${lang==='en'?v.exEn:v.exPt}</div>
        ${speakBtnHTML('ex',lang)}
      </div>`;
    grid.appendChild(div);
  });
}

/* Troca de idioma com animação: atualiza o texto dos cards que já estão na tela
   (em cascata) em vez de recriar o grid. */
function updateVocabLang(){
  const lang=window.appLang;
  const grid=document.getElementById('vocabGrid');
  if(!grid) return;
  const cards=grid.querySelectorAll('.vocab-card');
  if(!cards.length){
    const empty=grid.querySelector('.vocab-empty');
    if(empty) swapText(empty, lang==='en' ? 'No words match your search.' : 'Nenhuma palavra encontrada.');
    else renderVocab();
    return;
  }
  cards.forEach((card,n)=>{
    const v=VOCAB[+card.dataset.i];
    const base=Math.min(150+n*35,550);
    swapText(card.querySelector('h4'),      lang==='en'?v.en:v.pt,     {delay:base});
    swapText(card.querySelector('.pt-sub'), lang==='en'?v.pt:v.en,     {delay:base+40});
    swapText(card.querySelector('.ex'),     lang==='en'?v.exEn:v.exPt, {delay:base+90});
    card.querySelectorAll('.speak-btn').forEach(b=>setSpeakLabel(b,lang));
  });
}

/* ---------- PRONÚNCIA (🔊) ----------
   Usa a voz do próprio navegador (speechSynthesis) — sem internet, sem arquivos
   de áudio. Fala no idioma que está na tela: inglês quando o site está em EN e
   português (pt-BR) quando está em PT. Clicar de novo no botão que está falando para o áudio. */
const TTS_OK = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
const SPEAK_ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"/><path class="w1" d="M15.5 8.5a5 5 0 0 1 0 7"/><path class="w2" d="M19 5a10 10 0 0 1 0 14"/></svg>';
let ttsVoices={en:null,pt:null}, ttsBtn=null, ttsToken=0;

const TTS_LANG={en:'en-US',pt:'pt-BR'};
function pickVoices(){
  const vs=speechSynthesis.getVoices();
  // prefere a voz local (funciona offline) e a variante certa: en-US / pt-BR
  const best=(code,region)=>
       vs.find(v=>new RegExp('^'+code+'[-_]'+region,'i').test(v.lang) && v.localService)
    || vs.find(v=>new RegExp('^'+code+'[-_]'+region,'i').test(v.lang))
    || vs.find(v=>new RegExp('^'+code,'i').test(v.lang) && v.localService)
    || vs.find(v=>new RegExp('^'+code,'i').test(v.lang))
    || null;
  ttsVoices={en:best('en','US'),pt:best('pt','BR')};
}
if(TTS_OK){
  pickVoices();
  speechSynthesis.addEventListener('voiceschanged',pickVoices); // as vozes carregam de forma assíncrona
}

function speakLabel(kind,lang){
  if(kind==='word') return lang==='en' ? 'Listen to the word' : 'Ouvir a palavra';
  return lang==='en' ? 'Listen to the example' : 'Ouvir o exemplo';
}
function setSpeakLabel(btn,lang){
  const t=speakLabel(btn.dataset.say,lang);
  btn.setAttribute('aria-label',t); btn.title=t;
}
function speakBtnHTML(kind,lang){
  if(!TTS_OK) return ''; // navegador sem suporte: simplesmente não mostra o botão
  const t=speakLabel(kind,lang);
  return `<button type="button" class="speak-btn${kind==='ex'?' sm':''}" data-say="${kind}" aria-label="${t}" title="${t}" aria-pressed="false">${SPEAK_ICON}</button>`;
}

function stopSpeech(){
  ttsToken++;
  if(TTS_OK) speechSynthesis.cancel();
  if(ttsBtn){ ttsBtn.classList.remove('speaking'); ttsBtn.setAttribute('aria-pressed','false'); ttsBtn=null; }
}
function speak(text,lang,btn,rate){
  if(!TTS_OK) return;
  if(btn===ttsBtn){ stopSpeech(); return; }   // segundo clique = parar
  stopSpeech();
  const mine=++ttsToken;
  const u=new SpeechSynthesisUtterance(text);
  u.lang=TTS_LANG[lang]; u.rate=rate;
  if(ttsVoices[lang]) u.voice=ttsVoices[lang];
  const done=()=>{                             // ignora fim de falas antigas (canceladas)
    if(mine!==ttsToken) return;
    btn.classList.remove('speaking'); btn.setAttribute('aria-pressed','false');
    if(ttsBtn===btn) ttsBtn=null;
  };
  u.onend=done; u.onerror=done;
  ttsBtn=btn; btn.classList.add('speaking'); btn.setAttribute('aria-pressed','true');
  speechSynthesis.speak(u);
}
function initSpeechButtons(){
  const grid=document.getElementById('vocabGrid');
  if(!grid || !TTS_OK) return;
  // um único listener no grid — vale para os cards recriados pelo filtro/busca
  grid.addEventListener('click',e=>{
    const btn=e.target.closest('.speak-btn'); if(!btn) return;
    const v=VOCAB[+btn.closest('.vocab-card').dataset.i];
    const lang=window.appLang;                          // fala o que está na tela
    if(btn.dataset.say==='word') speak(lang==='en'?v.en:v.pt,lang,btn,.85);   // palavra: um pouco mais devagar
    else speak(lang==='en'?v.exEn:v.exPt,lang,btn,.95);
  });
  window.addEventListener('pagehide',stopSpeech);
}

/* ---------- SHARED HELPERS ---------- */
/* Fisher–Yates: a real, uniformly-random shuffle (unlike Array.sort(()=>Math.random()-.5)) */
function shuffled(arr){
  const a=arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
/* Builds the option buttons for a question grid; onPick(idx) runs on click */
function renderOptionButtons(grid,options,onPick){
  grid.innerHTML='';
  options.forEach((opt,idx)=>{
    const b=document.createElement('button');
    b.type='button'; b.className='option-btn'; b.textContent=opt;
    b.onclick=()=>onPick(idx,b,grid);
    grid.appendChild(b);
  });
}
/* Confetti burst used by both the Solo Challenge results and the Classroom winner screen */
function spawnConfetti(elId){
  const conf=document.getElementById(elId); conf.innerHTML='';
  const emojis=['🎉','✨','🏆','⭐','🎊'];
  for(let k=0;k<18;k++){
    const s=document.createElement('span');
    s.textContent=emojis[k%emojis.length];
    s.style.left=(Math.random()*100)+'%';
    s.style.animationDelay=(Math.random()*.6)+'s';
    s.style.fontSize=(14+Math.random()*14)+'px';
    conf.appendChild(s);
  }
}

/* ---------- SOLO CHALLENGE ---------- */
let state={i:0,xp:0,combo:0,best:0,correctCount:0,order:[],qLang:'en',hintOpen:false};
let currentItem=null;

function startChallenge(){
  state={i:0,xp:0,combo:0,best:0,correctCount:0,order:shuffled([...Array(QUIZ.length).keys()]),qLang:window.appLang,hintOpen:false};
  goTo('challenge'); renderQuestion();
}
function buildStepper(){
  const st=document.getElementById('stepper'); st.innerHTML='';
  state.order.forEach((_,idx)=>{const d=document.createElement('div'); d.className='step-dot'; d.id='dot'+idx; st.appendChild(d);});
}
function markStep(idx,status){const d=document.getElementById('dot'+idx); if(d) d.className='step-dot '+status;}
function updatePhase(){
  // Both halves use the same question format — this badge is pacing/flavor only,
  // it never claims a different question type for round 2.
  const half=Math.ceil(state.order.length/2);
  document.getElementById('phaseBadge').textContent = state.i<half ? '📍 ROUND 1 · WARM-UP' : '📍 ROUND 2 · FINAL STRETCH';
}
let timerInt=null;
function startTimer(){
  clearInterval(timerInt); let t=20;
  const fill=document.getElementById('timerFill'); fill.style.transition='none'; fill.style.width='100%'; fill.classList.remove('low');
  requestAnimationFrame(()=>{fill.style.transition='width 1s linear';});
  timerInt=setInterval(()=>{
    t--; fill.style.width=(t/20*100)+'%';
    if(t<=6) fill.classList.add('low');
    if(t<=0){ clearInterval(timerInt); timeoutAnswer(); }
  },1000);
}
function timeoutAnswer(){
  const grid=document.getElementById('optGrid');
  if([...grid.children].some(b=>b.disabled)) return;
  answer(-1,currentItem,grid);
}
function renderQuestion(){
  document.getElementById('nextBtn').style.display='none';
  document.getElementById('feedback').className='feedback-box';
  state.hintOpen=false;
  document.getElementById('qLangBtn').classList.toggle('active',state.qLang==='pt');
  document.getElementById('hintBtn').classList.remove('active');
  document.getElementById('hintBox').className='hint-box';
  if(state.i===0) buildStepper();
  markStep(state.i,'current');
  updatePhase();
  const qi=state.order[state.i]; currentItem=QUIZ[qi];
  document.getElementById('qNum').textContent=state.i+1;
  document.getElementById('qText').textContent=state.qLang==='en'?currentItem.q[0]:currentItem.q[1];
  const grid=document.getElementById('optGrid');
  renderOptionButtons(grid,currentItem.o,(idx)=>answer(idx,currentItem,grid));
  updateStats();
  startTimer();
}
function showComboToast(n){
  const t=document.getElementById('comboToast');
  t.textContent='🔥 Combo x'+n+'!'; t.classList.add('show');
  clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove('show'),1100);
}
function toggleHint(){
  if(!currentItem) return;
  state.hintOpen=!state.hintOpen;
  const box=document.getElementById('hintBox');
  document.getElementById('hintBtn').classList.toggle('active',state.hintOpen);
  if(state.hintOpen){
    box.textContent='💡 '+(state.qLang==='en'?currentItem.h[0]:currentItem.h[1]);
    box.classList.add('show');
  }else{
    box.classList.remove('show');
  }
}
function answer(idx,item,grid){
  clearInterval(timerInt);
  [...grid.children].forEach(b=>b.disabled=true);
  const chosen=idx>=0?grid.children[idx]:null; const correctBtn=grid.children[item.c];
  if(idx===item.c){
    chosen.classList.add('correct');
    state.combo++; state.best=Math.max(state.best,state.combo);
    state.correctCount++; state.xp+=10+Math.min(state.combo*2,20);
    markStep(state.i,'correct');
    if(state.combo>=2) showComboToast(state.combo);
  }else{
    if(chosen){chosen.classList.add('wrong','shake');}
    correctBtn.classList.add('correct'); state.combo=0;
    markStep(state.i,'wrong');
  }
  const fb=document.getElementById('feedback'); fb.classList.add('show');
  fb.dataset.wasCorrect=idx===item.c?'1':'0'; fb.dataset.wasTimeout=idx===-1?'1':'0';
  const lead=idx===item.c?'✅ Correct! ':idx===-1?'⏱ Time up! ':'❌ Not quite. ';
  fb.textContent=lead+(state.qLang==='en'?item.e[0]:item.e[1]);
  document.getElementById('nextBtn').style.display='inline-flex';
  updateStats();
}
function updateStats(){
  const lvl=1+Math.floor(state.xp/60);
  document.getElementById('lvl').textContent=lvl;
  document.getElementById('xpVal').textContent=state.xp;
  document.getElementById('comboVal').textContent=state.combo;
  document.getElementById('xpFill').style.width=Math.min((state.xp%60)/60*100,100)+'%';
}
function nextQuestion(){
  state.i++;
  if(state.i>=state.order.length){finishChallenge();}else{renderQuestion();}
}
function finishChallenge(){
  clearInterval(timerInt);
  const pct=Math.round(state.correctCount/state.order.length*100);
  const rank=RANKS.find(r=>pct>=r.min);
  document.getElementById('rankTitle').textContent=rank.title;
  document.getElementById('rankDesc').textContent=rank.desc;
  document.getElementById('accFill').style.width=pct+'%';
  document.getElementById('accLabel').textContent=pct+'% ACCURACY';
  document.getElementById('finalXp').textContent=state.xp;
  document.getElementById('finalCombo').textContent='x'+state.best;
  document.getElementById('finalCorrect').textContent=state.correctCount+'/'+state.order.length;
  const badges=[];
  if(state.correctCount>0)badges.push('🥇 First Correct Answer');
  if(state.best>=3)badges.push('🔥 Combo x3');
  if(pct===100)badges.push('💎 Perfect Accuracy');
  badges.push('🏆 Challenge Survivor');
  document.getElementById('badgeRow').innerHTML=badges.map(b=>`<span class="badge-pill">${b}</span>`).join('');
  spawnConfetti('confetti');
  goTo('results');
}

/* ---------- CLASSROOM MODE ---------- */
let cs={order:[],i:0,scoreA:0,scoreB:0,revealed:false,lang:'en',selected:null,history:[],nameA:'TEAM A',nameB:'TEAM B'};
function startClassroom(){
  const nA=document.getElementById('setupNameA').value.trim()||'TEAM A';
  const nB=document.getElementById('setupNameB').value.trim()||'TEAM B';
  cs={order:shuffled([...Array(QUIZ.length).keys()]).slice(0,10),i:0,scoreA:0,scoreB:0,revealed:false,lang:window.appLang,selected:null,history:[],nameA:nA,nameB:nB};
  goTo('classroom');
  buildRoundDots();
  document.getElementById('nameA').value=nA;
  document.getElementById('nameB').value=nB;
  renderClassroom();
}
/* Botão "Random team names": sorteia dois nomes com um efeito de dado rolando */
const TEAM_NAMES=['Deal Makers','The Closers','Rainmakers','Bottom Line','Think Tank','Go-Getters','Big Shots','Top Brass','Quarter Kings','Power Suits','Net Profit','Head Honchos'];
let nameRollTimer=null;
function shuffleTeamNames(btn){
  const a=document.getElementById('setupNameA'), b=document.getElementById('setupNameB');
  clearInterval(nameRollTimer);
  btn.classList.remove('rolling'); void btn.offsetWidth; btn.classList.add('rolling');
  [a,b].forEach(i=>{i.classList.remove('pop'); i.classList.add('rolling');});
  let n=0;
  nameRollTimer=setInterval(()=>{
    const pair=shuffled(TEAM_NAMES);   // dois nomes sempre diferentes
    a.value=pair[0]; b.value=pair[1];
    if(++n>=8){
      clearInterval(nameRollTimer);
      [a,b].forEach(i=>{i.classList.remove('rolling'); void i.offsetWidth; i.classList.add('pop');});
    }
  },70);
}
function buildRoundDots(){
  const dd=document.getElementById('roundDots'); dd.innerHTML='';
  cs.order.forEach((_,idx)=>{const d=document.createElement('div'); d.className='round-dot'; d.id='rdot'+idx; dd.appendChild(d);});
}
function updateScoreboardGlow(){
  document.getElementById('teamCardA').classList.toggle('leading',cs.scoreA>cs.scoreB);
  document.getElementById('teamCardB').classList.toggle('leading',cs.scoreB>cs.scoreA);
  document.getElementById('roundFill').style.width=((cs.i)/cs.order.length*100)+'%';
}
function renderClassroom(){
  cs.revealed=false; cs.selected=null;
  cs.nameA=document.getElementById('nameA').value.trim()||'TEAM A';
  cs.nameB=document.getElementById('nameB').value.trim()||'TEAM B';
  document.getElementById('scoreA').textContent=cs.scoreA;
  document.getElementById('scoreB').textContent=cs.scoreB;
  document.getElementById('cqNum').textContent=cs.i+1;
  updateScoreboardGlow();
  const item=QUIZ[cs.order[cs.i]];
  document.getElementById('cqText').textContent=cs.lang==='en'?item.q[0]:item.q[1];
  const grid=document.getElementById('cOptGrid');
  renderOptionButtons(grid,item.o,(idx)=>selectClassroomOption(idx,grid));
  document.getElementById('cFeedback').className='feedback-box';
  document.getElementById('revealBtn').disabled=false;
}
function selectClassroomOption(idx,grid){
  if(cs.revealed) return;
  cs.selected=idx;
  [...grid.children].forEach((b,i)=>b.classList.toggle('selected',i===idx));
}
function revealClassroom(){
  if(cs.revealed) return; cs.revealed=true;
  const item=QUIZ[cs.order[cs.i]];
  const grid=document.getElementById('cOptGrid');
  [...grid.children].forEach((b,idx)=>{
    b.disabled=true;
    if(idx===item.c) b.classList.add('correct');
    else if(idx===cs.selected) b.classList.add('wrong');
    else b.classList.add('dim');
  });
  const fb=document.getElementById('cFeedback'); fb.classList.add('show');
  fb.textContent=cs.lang==='en'?item.e[0]:item.e[1];
  document.getElementById('revealBtn').disabled=true;
}
function award(team){
  cs.history.push({a:cs.scoreA,b:cs.scoreB,i:cs.i,team:team});
  if(team==='A')cs.scoreA++; if(team==='B')cs.scoreB++;
  const dot=document.getElementById('rdot'+cs.i);
  if(dot && team) dot.className='round-dot '+team.toLowerCase();
  const sa=document.getElementById('scoreA'), sb=document.getElementById('scoreB');
  sa.textContent=cs.scoreA; sb.textContent=cs.scoreB;
  const el=team==='A'?sa:team==='B'?sb:null;
  if(el){el.classList.remove('score-pop'); void el.offsetWidth; el.classList.add('score-pop');}
  updateScoreboardGlow();
}
function undoAward(){
  const last=cs.history.pop(); if(!last) return;
  cs.scoreA=last.a; cs.scoreB=last.b;
  document.getElementById('scoreA').textContent=cs.scoreA;
  document.getElementById('scoreB').textContent=cs.scoreB;
  const dot=document.getElementById('rdot'+last.i);
  if(dot) dot.className='round-dot';
  updateScoreboardGlow();
}
function nextClassroom(){
  cs.i++;
  if(cs.i>=cs.order.length){ showWinner(); } else { renderClassroom(); }
}
function showWinner(){
  document.getElementById('roundFill').style.width='100%';
  let title,emoji;
  if(cs.scoreA>cs.scoreB){title=`🏆 ${cs.nameA} wins!`; emoji='🏆';}
  else if(cs.scoreB>cs.scoreA){title=`🏆 ${cs.nameB} wins!`; emoji='🏆';}
  else {title=`🤝 It's a tie!`; emoji='🤝';}
  document.getElementById('winnerEmoji').textContent=emoji;
  document.getElementById('winnerTitle').textContent=title;
  document.getElementById('winnerScore').textContent=`${cs.nameA} ${cs.scoreA} — ${cs.scoreB} ${cs.nameB}`;
  spawnConfetti('winnerConfetti');
  goTo('classroomWinner');
}

/* ---------- KEYBOARD SHORTCUTS (classroom) ---------- */
document.addEventListener('keydown',(e)=>{
  if(!document.getElementById('classroom').classList.contains('active')) return;
  const k=e.key.toLowerCase();
  if(k===' '||k==='r'){e.preventDefault(); revealClassroom();}
  else if(k==='1') award('A');
  else if(k==='2') award('B');
  else if(k==='0') award(null);
  else if(k==='u') undoAward();
  else if(k==='n'||k==='arrowright') nextClassroom();
  else if(k==='t') toggleClassroomLang();
});

/* ---------- DECORATIVE SCROLLBAR ----------
   - Fades toward transparent after a few seconds of inactivity.
   - Its thumb mirrors the page's real scroll position and viewport
     ratio, so it reads as an actual scrollbar (it just isn't draggable —
     real scrolling still happens via wheel/keyboard/touch as normal). */
function initFakeScrollbar(){
  const bar=document.getElementById('fakeScrollbar');
  const thumb=document.getElementById('fakeScrollbarThumb');
  if(!bar || !thumb) return;

  const IDLE_DELAY=3200; // ms of inactivity before fading
  let idleTimer=null;
  function wake(){
    bar.classList.remove('idle');
    clearTimeout(idleTimer);
    idleTimer=setTimeout(()=>bar.classList.add('idle'),IDLE_DELAY);
  }
  ['mousemove','mousedown','keydown','touchstart','wheel','scroll'].forEach(evt=>{
    document.addEventListener(evt,wake,{passive:true});
  });
  wake();

  function updateThumb(){
    const doc=document.documentElement;
    const trackHeight=bar.clientHeight;
    const scrollable=doc.scrollHeight-doc.clientHeight;
    const viewportRatio=Math.min(doc.clientHeight/doc.scrollHeight,1);
    const thumbHeight=Math.max(trackHeight*viewportRatio,48);
    const scrollRatio=scrollable>0?window.scrollY/scrollable:0;
    thumb.style.height=thumbHeight+'px';
    thumb.style.top=(scrollRatio*(trackHeight-thumbHeight))+'px';
    // nothing to scroll (short page) → no point showing a full-height thumb
    thumb.style.opacity = scrollable>4 ? '1' : '0';
  }
  window.addEventListener('scroll',updateThumb,{passive:true});
  window.addEventListener('resize',updateThumb);
  updateThumb();
}

/* ---------- INIT ---------- */
window.addEventListener('DOMContentLoaded',()=>{
  // Populates every .i18n element (and renders the vocab grid) from its
  // data-en/data-pt attributes right away — without this, any element
  // whose static fallback text isn't already written in English would
  // show empty/placeholder content until the user touched a language switch.
  setAppLang(window.appLang,false);
  initFakeScrollbar();
  initSpeechButtons();
  runIntro();
});
