/* ============================================================
   ИРИНА СЫРОМЯТНИКОВА, гештальт-терапевт - скрипт страницы.
   Герой статичный. Плиты услуг - sticky-стек: на каждой .pw пишутся
   --enter / --exit / --open, ламели жалюзи раскрывают фото по --open.
   Меню, якоря, i18n RU/EN, WhatsApp с текстом по теме, форма в WhatsApp.
   Библиотек нет. Ссылки tel/wa не перезаписываются в момент клика,
   обработчик кликов - только делегирование в фазе захвата (совместимость с LeadBot).
   ============================================================ */
(function(){
"use strict";

/* ---------------- КОНТАКТЫ (единственное место) ---------------- */
var CONTACT = { wa: "380975280500" };

var RED = matchMedia("(prefers-reduced-motion: reduce)").matches;
var HAS_IO = typeof IntersectionObserver === "function";
var root = document.documentElement;

/* ---------------- КОНВЕРСИИ GOOGLE ADS ----------------
   Ярлыки задаёт index.html (window.CO_CONV) на этапе рекламы. Переход не блокируем. */
function conv(key){
  var id = (window.CO_CONV || {})[key];
  if (!id || typeof window.gtag !== "function") return;
  window.gtag("event", "conversion", {send_to: id, value: 1.0, currency: "USD", transport_type: "beacon"});
}
window.addEventListener("click", function(e){
  var a = e.target.closest ? e.target.closest("a[href]") : null;
  if (!a) return;
  var h = a.getAttribute("href") || "";
  if (h.indexOf("tel:") === 0) conv("phone");
  else if (h.indexOf("wa.me") > -1) conv("contact");
  else if (h.indexOf("t.me") > -1) conv("telegram");
}, true);

/* ---------------- ТЕКСТЫ WhatsApp ПО ТЕМАМ ---------------- */
var HI = { ru: "Здравствуйте, Ирина! Пишу с сайта.", en: "Hello Irina! I'm writing from your website." };
var WA_TXT = {
  ru: {
    hero:           " Хочу записаться на сессию. Коротко о запросе: ",
    kratkosrochnoe: " Интересует краткосрочное консультирование (до 10 встреч). Запрос: ",
    terapiya:       " Хочу начать длительную психотерапию. Коротко о том, что происходит: ",
    podrostki:      " Хочу записать подростка на терапию. Возраст и коротко о ситуации: ",
    pary:           " Хотим прийти вдвоём (парная сессия). Коротко о ситуации: ",
    superviziya:    " Хочу записаться на супервизию. Коротко о случае: ",
    uznayote:       " Одной фразой о том, что происходит: ",
    paket:          " Хочу взять пакет сессий (5 или 10). Формат: ",
    kontakty:       " Вопрос: ",
    trevoga:        " Тема: тревога, панические атаки. Коротко: ",
    depressiya:     " Тема: нет сил, ничего не радует. Коротко: ",
    travma:         " Тема: последствия травматического опыта. Коротко: ",
    krizisy:        " Тема: кризис, развод, расставание. Коротко: ",
    otnosheniya:    " Тема: отношения, близость, сексуальность. Коротко: ",
    lgbt:           " Тема: ориентация, принятие себя, отношения. Коротко: ",
    samoocenka:     " Тема: самооценка, границы, зависимость от чужого мнения. Коротко: ",
    scenarii:       " Тема: повторяющиеся сценарии в отношениях. Коротко: ",
    vina:           " Тема: вина, стыд, срывы на близких. Коротко: ",
    vygoranie:      " Тема: выгорание, прокрастинация. Коротко: ",
    roditeli:       " Тема: родительство, отношения с ребёнком. Коротко: "
  },
  en: {
    hero:           " I'd like to book a session. Briefly, my request: ",
    kratkosrochnoe: " I'm interested in short-term counselling (up to 10 sessions). My request: ",
    terapiya:       " I'd like to start long-term therapy. Briefly, what's going on: ",
    podrostki:      " I'd like to book therapy for a teenager. Age and a few words about the situation: ",
    pary:           " We'd like to come as a couple. Briefly, the situation: ",
    superviziya:    " I'd like to book supervision. Briefly, the case: ",
    uznayote:       " In one phrase, what's going on: ",
    paket:          " I'd like a package of sessions (5 or 10). Format: ",
    kontakty:       " Question: ",
    trevoga:        " Topic: anxiety, panic attacks. Briefly: ",
    depressiya:     " Topic: no energy, nothing brings joy. Briefly: ",
    travma:         " Topic: consequences of trauma. Briefly: ",
    krizisy:        " Topic: crisis, divorce, break-up. Briefly: ",
    otnosheniya:    " Topic: relationships, intimacy, sexuality. Briefly: ",
    lgbt:           " Topic: orientation, self-acceptance, relationships. Briefly: ",
    samoocenka:     " Topic: self-esteem, boundaries, dependence on others' opinions. Briefly: ",
    scenarii:       " Topic: repeating patterns in relationships. Briefly: ",
    vina:           " Topic: guilt, shame, snapping at loved ones. Briefly: ",
    vygoranie:      " Topic: burnout, procrastination. Briefly: ",
    roditeli:       " Topic: parenting, relationship with my child. Briefly: "
  }
};
function waUrl(t){ return "https://wa.me/" + CONTACT.wa + "?text=" + encodeURIComponent(t); }
function setWa(lang){
  var d = WA_TXT[lang] || WA_TXT.ru, hi = HI[lang] || HI.ru;
  document.querySelectorAll("[data-wa]").forEach(function(a){
    a.href = waUrl(hi + (d[a.dataset.wa] || d.hero));
    a.target = "_blank"; a.rel = "noopener";
  });
}

/* дисплейная строка героя в одну строку: ужимаем кегль, пока не влезет */
function fitText(){
  document.querySelectorAll(".h1 .big1").forEach(function(el){
    el.style.fontSize = "";
    var box = el.parentElement.parentElement;
    var bw = box.clientWidth; if (!bw) return;
    var size = parseFloat(getComputedStyle(el).fontSize), base = size;
    while (el.scrollWidth > bw + 1 && size > base * 0.5) { size *= 0.95; el.style.fontSize = size + "px"; }
  });
}

/* ---------------- ЯЗЫК RU / EN ----------------
   Русский берётся из разметки при старте, английский - словарь ниже. */
var RU = {};
var EN = {
  "t.title": "Gestalt therapist Iryna Syromiatnykova - psychotherapy online and in Kraków",
  "t.desc": "Gestalt therapist Iryna Syromiatnykova: individual therapy, short-term counselling, teenagers, couples, supervision. In person in central Kraków and online worldwide. 1500+ sessions since 2021. 50-minute session - $50. Russian and Ukrainian.",
  "t.ogt": "Gestalt therapist Iryna Syromiatnykova - online and in Kraków",
  "t.ogd": "Individual therapy, couples, teenagers, supervision. 1500+ sessions since 2021. 50-minute session - $50. In Kraków and online.",
  "a.home": "Iryna Syromiatnykova, Gestalt therapist - home", "a.nav": "Sections", "a.call": "Call +380 97 528 05 00", "a.lang": "Site language",
  "a.menu": "Menu", "a.hero": "Main screen", "a.bar": "Quick contact", "a.call2": "Call",
  "lg1": "Iryna Syromiatnykova", "lg2": "Gestalt therapist",
  "n1": "Services", "n2": "Requests", "n3": "Prices", "n4": "About", "n5": "FAQ", "n6": "Contacts",
  "m1": "Short-term counselling", "m2": "Long-term psychotherapy", "m3": "Therapy for teenagers", "m4": "Couples and family counselling",
  "m5": "Supervision", "m6": "What people come with", "m7": "Prices", "m8": "About me", "m9": "FAQ", "m10": "Contacts",
  "h.kick": "Kraków · online worldwide · in practice since 2021",
  "h.big": "Gestalt therapist", "h.name": "Iryna Syromiatnykova",
  "h.lead": "Individual therapy, couples, teenagers, supervision. 1500+ sessions. In person in central Kraków and online. 50-minute session - $50.",
  "h.b1": "Book via WhatsApp", "h.b2": "Services and prices", "h.ig": "Thoughts and practice on Instagram",
  "alt.hero": "Two armchairs by a window with blinds in soft daylight",
  "b.wa": "Book via WhatsApp", "b.tg": "Message on Telegram", "b.tg2": "Telegram", "b.write": "Write", "b.wa2": "Message on WhatsApp", "b.book": "Book a session", "b.pack": "Get a package",
  "s1.kick": "Short-term counselling", "s1.h": "Up to 10 meetings around one request",
  "s1.lead": "Anxiety, a crisis, a hard decision, relationships, boundaries. A clear goal and a clear timeframe.",
  "s1.fig": "meetings · $50 per 50 minutes",
  "s1.c1": "online or in Kraków", "s1.c2": "10-session package -10%", "s1.c3": "Russian and Ukrainian",
  "alt.s1": "An armchair by a window with a view of trees",
  "s2.kick": "Long-term psychotherapy", "s2.h": "Deeper than the symptom: therapy at your own pace",
  "s2.lead": "Repeating patterns, guilt and shame, consequences of trauma, emotional swings. Once a week, under a contract.",
  "s2.fig": "50-minute session",
  "s2.c1": "individual", "s2.c2": "Gestalt approach", "s2.c3": "online or in Kraków",
  "alt.s2": "Bookshelves in sunlight from a window",
  "s3.kick": "Therapy for teenagers", "s3.h": "A safe space of their own for a teenager",
  "s3.lead": "Anxiety, self-esteem, conflicts at home and at school, moving to another country. Parents - in a separate meeting, by agreement.",
  "s3.fig": "session · $50",
  "s3.c1": "from age 12", "s3.c2": "no judgement, no pressure", "s3.c3": "online or in Kraków",
  "alt.s3": "A bright room with an armchair and a bookcase",
  "s4.kick": "Couples and family counselling", "s4.h": "Two people in one conversation",
  "s4.lead": "Partners, spouses, mother and daughter - any two people who find it hard to hear each other.",
  "s4.fig": "session of 1 hour 20 minutes",
  "s4.c1": "couples and families", "s4.c2": "5-session package -5%", "s4.c3": "online or in Kraków",
  "alt.s4": "Two cups of hot tea on a table",
  "z.kick": "Requests", "z.h": "What people come to me with",
  "z.lead": "Anxiety out of nowhere, tiredness after a holiday, snapping at loved ones - this is not «just pull yourself together». It can be worked through.",
  "z1.h": "Anxiety and panic attacks", "z1.p": "Tension without a reason, overthinking before sleep, fear that something will happen.", "z1.q": "how to stop overthinking before sleep",
  "z2.h": "Depressive states", "z2.p": "Nothing brings joy, no energy, tiredness that stays even after rest.", "z2.q": "what to do when nothing brings joy",
  "z3.h": "Consequences of trauma", "z3.p": "A past that keeps running the present.", "z3.q": "how to stop being afraid",
  "z4.h": "Crises and divorce", "z4.p": "Break-up, relocation, loss - when the usual support is gone.", "z4.q": "how to go on after a divorce",
  "z5.h": "Relationships and sexuality", "z5.p": "Closeness, trust, desire, the same arguments again and again.", "z5.q": "how to fix my relationship with my partner",
  "z6.h": "LGBT and orientation", "z6.p": "Self-acceptance, coming out, relationships and family - without judgement.", "z6.q": "how to accept myself",
  "z7.h": "Self-esteem and boundaries", "z7.p": "Dependence on others' opinions, comparing yourself to others, not being able to say «no».", "z7.q": "how to stop depending on what others think",
  "z8.h": "Repeating patterns", "z8.p": "The same people, conflicts and dead ends - in different settings.", "z8.q": "why do I keep choosing the wrong people",
  "z9.h": "Guilt, shame, irritability", "z9.p": "I snap at loved ones, then blame myself. Round and round.", "z9.q": "how to stop snapping at loved ones",
  "z10.h": "Burnout and procrastination", "z10.p": "I put off even the things I want. I can't make myself start.", "z10.q": "how to tell laziness from burnout",
  "z11.h": "Support for parents", "z11.p": "Parent-child relationships, adolescence, your own exhaustion.", "z11.q": "how to stop shouting at my child",
  "z12.h": "Your own topic", "z12.p": "If you don't see yourself on the list - describe it in two words. We'll sort it out at the first meeting.",
  "u.kick": "If you recognise yourself", "u.h": "Phrases people come with",
  "u1": "«I overthink before sleep»", "u2": "«I feel anxious for no reason»", "u3": "«I put off even what I want»", "u4": "«I'm tired even after rest»",
  "u5": "«I snap at the people I love»", "u6": "«I compare myself to others»", "u7": "«I can't make myself start»",
  "u.p": "One conversation to understand what is going on is already work. You don't have to phrase it «correctly».", "u.b": "Message Iryna",
  "alt.ten": "Warm light through a curtain in the office",
  "p.kick": "For colleagues", "p.h": "Supervision for psychologists and psychotherapists",
  "p.lead": "Case review, «difficult» clients, therapeutic stance and boundaries - in the Gestalt approach. Individually, online or in Kraków.",
  "p.fig": "hours of supervisor training, Pogodin Gestalt Institute",
  "p.c1": "Gestalt approach", "p.c2": "Russian and Ukrainian", "p.c3": "terms on request",
  "p.b": "Book supervision", "alt.sup": "An armchair, a floor lamp and plants in a cosy room",
  "c.kick": "Prices", "c.h": "Clear terms",
  "c.lead": "One price for therapy and counselling, online and in person. We work under a contract: format and frequency are agreed at the first session.",
  "c1.k": "Individual session", "c1.d": "50 minutes. Therapy or counselling, online or in Kraków.",
  "c2.k": "Session packages", "c2.s": "-5% / -10%", "c2.d": "5 sessions - 5% off, 10 sessions - 10% off. For individual and couples work.",
  "c3.k": "Couples session", "c3.d": "1 hour 20 minutes. Partners, spouses, family - any two people.",
  "c.fee": "Supervision for colleagues - terms on request. I answer personally within an hour.",
  "ab.stub": "Portrait of Iryna", "ab.stub2": "photo coming soon", "alt.portrait": "Iryna Syromiatnykova, Gestalt therapist",
  "ab.kick": "About me", "ab.h": "Iryna Syromiatnykova",
  "ab.lead": "Gestalt therapist. In practice since 2021, trained with leading Ukrainian and European Gestalt therapists. I work in Russian and Ukrainian with adults, teenagers and couples.",
  "ab.st1": "sessions", "ab.st2": "practice began", "ab.st3": "years with my longest client",
  "ab.f1": "Gentle and non-judgemental: a safe space for what is hard", "ab.f2": "I don't give advice - I help you find your own solutions and footing",
  "ab.f3": "I work with difficult emotional states and crises",
  "ab.ig": "More about my practice on Instagram",
  "d.kick": "Education", "d.h": "Diplomas and certificates", "d.lb": "Document", "d.prev": "Previous document", "d.next": "Next document", "d.close": "Close",
  "dc1.t": "Master's in Psychology, with honours", "dc1.o": "Karazin Kharkiv National University · 2024",
  "dc2.t": "Bachelor's in Psychology", "dc2.o": "Karazin Kharkiv National University · 2023",
  "dc3.t": "Theory and Practice of Gestalt Therapy, 744 hours", "dc3.o": "Pogodin Gestalt Institute · 2021-2025",
  "dc4.t": "Supervisor training in the Gestalt approach, 432 hours", "dc4.o": "Pogodin Gestalt Institute · 2024-2026",
  "dc5.t": "Clinical Approach in Gestalt Therapy, 180 hours", "dc5.o": "National Association of Gestalt Therapists of Ukraine · 2023-2024",
  "dc6.t": "The Gestalt Approach to Couples Therapy, 180 hours", "dc6.o": "National Association of Gestalt Therapists of Ukraine · 2023-2024",
  "dc7.t": "Gestalt Approach in Sexuality, 180 hours", "dc7.o": "National Association of Gestalt Therapists of Ukraine · 2022-2023",
  "dc8.t": "The Dialogue Model of Gestalt Therapy, 180 hours", "dc8.o": "Pogodin Gestalt Institute · 2021-2022",
  "k.kick": "How it works", "k.h": "Four steps to the first meeting",
  "k1.h": "Request", "k1.p": "WhatsApp, Telegram or the form. I answer personally within an hour.",
  "k2.h": "First meeting", "k2.p": "50 minutes: your request and my questions. We decide whether we are a good fit.",
  "k3.h": "Contract", "k3.p": "Format, frequency, confidentiality - we fix the agreements.",
  "k4.h": "The work", "k4.p": "Once a week, online or in Kraków. Short-term or long-term format.",
  "f.kick": "FAQ", "f.h": "What people ask before the first meeting",
  "f1.q": "Does online work?", "f1.a": "Yes. A video call in a convenient messenger, 50 minutes, from anywhere in the world. You need a quiet place and headphones.",
  "f2.q": "Is it confidential?", "f2.a": "Yes. The content of sessions is not shared with third parties; I follow the ethical code of a Gestalt therapist. See the privacy policy for details.",
  "f3.q": "How many meetings do I need?", "f3.a": "The short-term format - up to 10 meetings around a specific request. Long-term therapy - at your pace, usually once a week.",
  "f4.q": "What language are sessions in?", "f4.a": "Russian or Ukrainian - whichever is more comfortable for you.",
  "f5.q": "Can we come as a couple?", "f5.a": "Yes. A couples session is 1 hour 20 minutes, $80. Partners, spouses, parent and child.",
  "f6.q": "What if I need help urgently?", "f6.a": "Psychotherapy is not an emergency service. If there is a threat to life, contact the emergency service of your country (in Poland - 112).",
  "y.kick": "Booking", "y.h": "Leave a request", "y.lead": "I answer personally within an hour on WhatsApp. No details needed - two words about your request are enough.",
  "y.f1": "First meeting - 50 minutes, $50", "y.f2": "Mon-Fri 9:00-20:00, weekends by agreement", "y.f3": "Prefer a messenger - WhatsApp or Telegram",
  "y.name": "Name", "y.namep": "How should I address you", "y.phone": "Phone (WhatsApp)", "y.fmt": "Format", "y.fmt1": "Online", "y.fmt2": "In person in Kraków",
  "y.svc": "Topic", "y.s1": "Individual session", "y.s2": "Short-term counselling", "y.s3": "Long-term psychotherapy", "y.s4": "Teenager", "y.s5": "Couple or family", "y.s6": "Supervision",
  "y.msg": "About the situation (optional)", "y.msgp": "A few words about what is going on", "y.b": "Send via WhatsApp",
  "y.ok": "Thank you! Opening WhatsApp with your request.", "y.err": "Please enter your name and phone number.",
  "y.note": "By clicking the button you agree to the <a href=\"privacy.html\">privacy policy</a>. The data is used only for booking.",
  "kt.kick": "Contacts", "kt.h": "Write or call",
  "kt.l1": "Kraków, city centre. Office address - after booking.", "kt.l2": "Online - worldwide. Russian and Ukrainian.", "kt.l3": "Mon-Fri 9:00-20:00, weekends - by agreement.",
  "alt.krakow": "Kraków: Wawel Castle and the roofs of the old town", "kt.cap": "Office in central Kraków",
  "ft.priv": "Privacy policy",
  "ft.disc": "Psychotherapy does not replace emergency help or medical treatment. The content of sessions is confidential.",
  "ft.copy": "Iryna Syromiatnykova. Gestalt therapist, Kraków and online."
};
(function capture(){
  document.querySelectorAll("[data-i]").forEach(function(el){ if (RU[el.dataset.i] === undefined) RU[el.dataset.i] = el.innerHTML; });
  document.querySelectorAll("[data-i-alt]").forEach(function(el){ if (RU[el.dataset.iAlt] === undefined) RU[el.dataset.iAlt] = el.alt; });
  document.querySelectorAll("[data-i-aria]").forEach(function(el){ if (RU[el.dataset.iAria] === undefined) RU[el.dataset.iAria] = el.getAttribute("aria-label"); });
  document.querySelectorAll("[data-i-c]").forEach(function(el){ if (RU[el.dataset.iC] === undefined) RU[el.dataset.iC] = el.getAttribute("content"); });
  document.querySelectorAll("[data-i-ph]").forEach(function(el){ if (RU[el.dataset.iPh] === undefined) RU[el.dataset.iPh] = el.getAttribute("placeholder"); });
  var t = document.querySelector("title[data-i-t]"); if (t) RU[t.dataset.iT] = t.textContent;
})();
function curLang(){ return root.lang === "en" ? "en" : "ru"; }
function pick(key, en){ var v = en ? EN[key] : RU[key]; return v === undefined ? RU[key] : v; }
function applyLang(lang){
  var en = lang === "en";
  root.setAttribute("lang", en ? "en" : "ru");
  document.querySelectorAll("[data-i]").forEach(function(el){ var v = pick(el.dataset.i, en); if (v !== undefined) el.innerHTML = v; });
  document.querySelectorAll("[data-i-alt]").forEach(function(el){ var v = pick(el.dataset.iAlt, en); if (v !== undefined) el.alt = v; });
  document.querySelectorAll("[data-i-aria]").forEach(function(el){ var v = pick(el.dataset.iAria, en); if (v !== undefined) el.setAttribute("aria-label", v); });
  document.querySelectorAll("[data-i-c]").forEach(function(el){ var v = pick(el.dataset.iC, en); if (v !== undefined) el.setAttribute("content", v); });
  document.querySelectorAll("[data-i-ph]").forEach(function(el){ var v = pick(el.dataset.iPh, en); if (v !== undefined) el.setAttribute("placeholder", v); });
  var t = document.querySelector("title[data-i-t]");
  if (t) { var tv = pick(t.dataset.iT, en); if (tv !== undefined) t.textContent = tv; }
  document.querySelectorAll(".lang button").forEach(function(b){
    var on = b.getAttribute("data-lang") === (en ? "en" : "ru");
    b.classList.toggle("is-active", on);
    b.setAttribute("aria-pressed", on ? "true" : "false");
  });
  try { localStorage.setItem("is-lang", en ? "en" : "ru"); } catch(e){}
  setWa(en ? "en" : "ru");
  fitText();
  update();
}

/* ---------------- МЕНЮ ---------------- */
var burger = document.getElementById("burger");
var mnav = document.getElementById("mnav");
var hdr = document.getElementById("hdr");
function closeMenu(){
  document.body.classList.remove("menu-open");
  if (hdr) hdr.classList.remove("menu");
  if (burger) burger.setAttribute("aria-expanded", "false");
}
if (burger) burger.addEventListener("click", function(){
  var open = document.body.classList.toggle("menu-open");
  if (hdr) hdr.classList.toggle("menu", open);
  burger.setAttribute("aria-expanded", open ? "true" : "false");
});
if (mnav) mnav.addEventListener("click", function(e){ if (e.target.closest("a")) closeMenu(); });
addEventListener("keydown", function(e){ if (e.key === "Escape") closeMenu(); });

/* ---------------- ЯКОРЯ ----------------
   Плиты sticky: их getBoundingClientRect врёт, когда они прилипли. Положение в потоке
   считаем суммой высот предыдущих детей <main>. */
var main = document.getElementById("main");
var HH = function(){ return parseFloat(getComputedStyle(root).getPropertyValue("--hh")) || 72; };
function flowTop(el){
  var top = main ? main.getBoundingClientRect().top + scrollY : 0;
  var kids = main ? main.children : [];
  for (var i = 0; i < kids.length; i++) {
    if (kids[i] === el) return top;
    top += kids[i].offsetHeight;
  }
  return el.getBoundingClientRect().top + scrollY;
}
function targetTop(t){
  if (t.classList.contains("pw") || t.classList.contains("hero")) return flowTop(t);
  var sec = t.closest(".sec, .ftr");
  if (sec && sec !== t) return sec && t.getBoundingClientRect().top + scrollY - HH() - 10;
  return t.getBoundingClientRect().top + scrollY - HH() - 10;
}
document.addEventListener("click", function(e){
  var a = e.target.closest('a[href^="#"]'); if (!a) return;
  var id = a.getAttribute("href").slice(1); if (!id) return;
  var t = document.getElementById(id); if (!t) return;
  e.preventDefault();
  closeMenu();
  scrollTo({ top: Math.max(0, targetTop(t)), behavior: RED ? "auto" : "smooth" });
  try { history.pushState(null, "", "#" + id); } catch(err){}
});

/* ---------------- ШАПКА И ПАНЕЛЬ ---------------- */
var hero = document.getElementById("top");
var bar = document.getElementById("bar");
var kont = document.getElementById("kontakty");
function hdrState(){
  if (!hdr) return;
  var H = innerHeight || root.clientHeight;
  var overHero = hero ? scrollY < hero.offsetHeight - HH() : false;
  hdr.classList.toggle("over", overHero);
  hdr.classList.toggle("solid", !overHero);
  var onKont = kont && kont.getBoundingClientRect().top < H * 0.6;
  if (bar) bar.classList.toggle("show", scrollY > H * 0.55 && !onKont && !document.body.classList.contains("menu-open"));
}

/* ---------------- ПЛИТЫ ----------------
   Один слушатель scroll через rAF. На .pw пишем --enter/--exit/--open. */
function clamp(v){ return v < 0 ? 0 : (v > 1 ? 1 : v); }
function easeOut(t){ return 1 - Math.pow(1 - t, 3); }
function smooth(t){ return t * t * (3 - 2 * t); }
var pws = [].slice.call(document.querySelectorAll(".pw"));
var last = {};
/* ?open=0.5 в URL - только для проверки промежуточных фаз (checks/) */
var dbgOpen = parseFloat(new URLSearchParams(location.search).get("open"));

function setVar(el, name, v){
  var s = v.toFixed(3);
  var key = el.id + name;
  if (last[key] === s) return;
  last[key] = s;
  el.style.setProperty(name, s);
}
function update(){
  var H = innerHeight || root.clientHeight;
  hdrState();
  if (root.classList.contains("no-plate")) return;
  pws.forEach(function(pw){
    var r = pw.getBoundingClientRect();
    var enter = clamp(1 - r.top / H);
    var next = pw.nextElementSibling;
    var exit = next ? clamp(1 - next.getBoundingClientRect().top / H) : 0;
    var open = !isNaN(dbgOpen) ? dbgOpen : smooth(clamp((enter - .12) / .78));
    setVar(pw, "--enter", enter);
    setVar(pw, "--exit", exit);
    setVar(pw, "--open", open);
    pw.classList.toggle("gone", exit >= 1);
    pw.classList.toggle("on", enter > 0.6);
    pw.classList.toggle("open", open >= .999);
  });
}
if (RED) {
  root.classList.add("no-plate");
  addEventListener("scroll", hdrState, {passive:true});
} else {
  var tick = false;
  addEventListener("scroll", function(){
    if (tick) return; tick = true;
    requestAnimationFrame(function(){ tick = false; update(); });
  }, {passive:true});
  addEventListener("load", update);
}
[400, 1200, 2500].forEach(function(ms){ setTimeout(update, ms); });
window.plateSync = update;

/* плита выше экрана (низкий телефон, крупный шрифт) - стек выключаем, плиты идут потоком */
function stackCheck(){
  if (RED) return;
  var H = innerHeight || root.clientHeight, over = false;
  root.classList.remove("no-stack");
  document.querySelectorAll(".plate").forEach(function(p){ if (p.scrollHeight > H + 2) over = true; });
  root.classList.toggle("no-stack", over);
}
var rsTimer;
addEventListener("resize", function(){
  stackCheck(); update();
  clearTimeout(rsTimer);
  rsTimer = setTimeout(function(){ fitText(); update(); }, 200);
});
if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ fitText(); stackCheck(); update(); });
[300, 1500].forEach(function(ms){ setTimeout(stackCheck, ms); });

/* ---------------- ПОЯВЛЕНИЕ В КАТАЛОЖНЫХ СЕКЦИЯХ ----------------
   .rv - проявление; .rv-ph - те же ламели, после раскрытия маска снимается (.done). */
function reveal(el){
  el.classList.add("in");
  if (el.classList.contains("rv-ph")) setTimeout(function(){ el.classList.add("done"); }, RED ? 0 : 1500);
}
if (HAS_IO && !RED) {
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if (!e.isIntersecting) return;
      reveal(e.target);
      io.unobserve(e.target);
    });
  }, {threshold:.08, rootMargin:"0px 0px -6% 0px"});
  document.querySelectorAll(".rv").forEach(function(el){ io.observe(el); });
  setTimeout(function(){ document.querySelectorAll(".rv:not(.in)").forEach(function(el){
    if (el.getBoundingClientRect().top < innerHeight) { reveal(el); io.unobserve(el); }
  }); }, 1500);
} else {
  document.querySelectorAll(".rv").forEach(function(el){ el.classList.add("in", "done"); });
}

/* ---------------- ФОРМА → WhatsApp ---------------- */
var form = document.getElementById("form");
if (form) form.addEventListener("submit", function(e){
  e.preventDefault();
  var ok = document.getElementById("fmok"), err = document.getElementById("fmerr");
  if (form.website && form.website.value) return;          /* honeypot */
  var name = form.name.value.trim(), phone = form.phone.value.trim();
  var svc = form.svc.value, fmt = form.fmt.value, msg = (form.msg.value || "").trim();
  if (!name || phone.replace(/\D/g, "").length < 9) { err.hidden = false; ok.hidden = true; return; }
  err.hidden = true;
  var en = curLang() === "en";
  var t = (en ? HI.en : HI.ru) + (en
    ? " Request.\nName: " + name + "\nPhone: " + phone + "\nTopic: " + svc + "\nFormat: " + fmt + (msg ? "\nAbout the situation: " + msg : "")
    : " Заявка.\nИмя: " + name + "\nТелефон: " + phone + "\nТема: " + svc + "\nФормат: " + fmt + (msg ? "\nО ситуации: " + msg : ""));
  ok.hidden = false;
  conv("lead");
  window.open(waUrl(t), "_blank", "noopener");
});

/* ---------------- СТАРТ ----------------
   ?lang= в URL сильнее localStorage: русское объявление не должно открыть английскую версию. */
(function initLang(){
  var url = new URLSearchParams(location.search).get("lang");
  var saved = null;
  try { saved = localStorage.getItem("is-lang"); } catch(e){}
  var lang = (url === "en" || url === "ru") ? url : (saved === "en" ? "en" : "ru");
  if (lang === "en") applyLang("en"); else setWa("ru");
})();
document.querySelectorAll(".lang button").forEach(function(b){
  b.addEventListener("click", function(){ applyLang(b.getAttribute("data-lang")); });
});
/* прямой переход по хэшу: браузер ставит цель под шапку, а плита sticky - доводим сами */
function gotoHash(){
  if (!location.hash) return;
  var ht = document.getElementById(location.hash.slice(1));
  if (!ht) return;
  root.classList.add("no-smooth");
  scrollTo(0, Math.max(0, targetTop(ht)));
  root.classList.remove("no-smooth");
  update();
}
if (location.hash) setTimeout(gotoHash, 60);
addEventListener("hashchange", function(){ setTimeout(gotoHash, 0); });
fitText();
stackCheck();
update();
})();

/* ---------------- ДОКУМЕНТЫ: просмотр крупно ---------------- */
(function(){
  var lb = document.getElementById("lb"), docs = [].slice.call(document.querySelectorAll(".doc"));
  if (!lb || !docs.length || typeof lb.showModal !== "function") return;
  var img = document.getElementById("lb-img"), t = document.getElementById("lb-t"), o = document.getElementById("lb-o"), cur = 0;
  function show(i){
    cur = (i + docs.length) % docs.length;
    var d = docs[cur];
    img.src = d.getAttribute("href");
    img.alt = d.querySelector("img").alt;
    t.textContent = d.querySelector("b").textContent;
    o.textContent = d.querySelector(".doc-o").textContent;
  }
  docs.forEach(function(d, i){
    d.addEventListener("click", function(e){ e.preventDefault(); show(i); lb.showModal(); });
  });
  lb.querySelector(".lb-prev").addEventListener("click", function(){ show(cur - 1); });
  lb.querySelector(".lb-next").addEventListener("click", function(){ show(cur + 1); });
  lb.querySelector(".lb-x").addEventListener("click", function(){ lb.close(); });
  lb.addEventListener("click", function(e){ if (e.target === lb) lb.close(); });
  lb.addEventListener("keydown", function(e){
    if (e.key === "ArrowLeft") show(cur - 1);
    if (e.key === "ArrowRight") show(cur + 1);
  });
})();
