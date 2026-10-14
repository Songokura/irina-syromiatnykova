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
  window.gtag("event", "conversion", {send_to: id, value: 1.0, currency: "EUR", transport_type: "beacon"});
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
var HI = { ru: "Здравствуйте, Ирина! Пишу с сайта.", uk: "Вітаю, Ірино! Пишу з сайту.", en: "Hello Irina! I'm writing from your website." };
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
    trudnosti:      " Тема: трудности в отношениях. Коротко: ",
    otnosheniya:    " Тема: отношения, близость, сексуальность. Коротко: ",
    lgbt:           " Тема: ориентация, принятие себя, семья, границы. Коротко: ",
    samoocenka:     " Тема: самооценка, границы, зависимость от чужого мнения. Коротко: ",
    scenarii:       " Тема: повторяющиеся сценарии в отношениях. Коротко: ",
    vina:           " Тема: вина, стыд, срывы на близких. Коротко: ",
    vygoranie:      " Тема: выгорание, прокрастинация. Коротко: ",
    roditeli:       " Тема: родительство, отношения с ребёнком, особенные дети. Коротко: "
  },
  uk: {
    hero:           " Хочу записатися на сесію. Коротко про запит: ",
    kratkosrochnoe: " Цікавить короткострокове консультування (до 10 зустрічей). Запит: ",
    terapiya:       " Хочу почати тривалу психотерапію. Коротко про те, що відбувається: ",
    podrostki:      " Хочу записати підлітка на терапію. Вік і коротко про ситуацію: ",
    pary:           " Хочемо прийти вдвох (парна сесія). Коротко про ситуацію: ",
    superviziya:    " Хочу записатися на супервізію. Коротко про випадок: ",
    uznayote:       " Однією фразою про те, що відбувається: ",
    paket:          " Хочу взяти пакет сесій (5 або 10). Формат: ",
    kontakty:       " Питання: ",
    trevoga:        " Тема: тривога, панічні атаки. Коротко: ",
    depressiya:     " Тема: немає сил, ніщо не тішить. Коротко: ",
    travma:         " Тема: наслідки травматичного досвіду. Коротко: ",
    krizisy:        " Тема: криза, розлучення, розставання. Коротко: ",
    trudnosti:      " Тема: труднощі у стосунках. Коротко: ",
    otnosheniya:    " Тема: стосунки, близькість, сексуальність. Коротко: ",
    lgbt:           " Тема: орієнтація, прийняття себе, сім'я, кордони. Коротко: ",
    samoocenka:     " Тема: самооцінка, кордони, залежність від чужої думки. Коротко: ",
    scenarii:       " Тема: повторювані сценарії у стосунках. Коротко: ",
    vina:           " Тема: провина, сором, зриви на близьких. Коротко: ",
    vygoranie:      " Тема: вигорання, прокрастинація. Коротко: ",
    roditeli:       " Тема: батьківство, стосунки з дитиною, особливі діти. Коротко: "
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
    trudnosti:      " Topic: relationship difficulties. Briefly: ",
    otnosheniya:    " Topic: relationships, intimacy, sexuality. Briefly: ",
    lgbt:           " Topic: orientation, self-acceptance, relationships. Briefly: ",
    samoocenka:     " Topic: self-esteem, boundaries, dependence on others' opinions. Briefly: ",
    scenarii:       " Topic: repeating patterns in relationships. Briefly: ",
    vina:           " Topic: guilt, shame, snapping at loved ones. Briefly: ",
    vygoranie:      " Topic: burnout, procrastination. Briefly: ",
    roditeli:       " Topic: parenting, relationship with my child. Briefly: "
  }
};
var FORM_TXT = {
  ru: ["Заявка.", "Имя", "Телефон", "Тема", "Формат", "О ситуации"],
  en: ["Request.", "Name", "Phone", "Topic", "Format", "About the situation"],
  uk: ["Заявка.", "Ім'я", "Телефон", "Тема", "Формат", "Про ситуацію"]
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

/* ---------------- ЯЗЫК RU / UK / EN ----------------
   Русский берётся из разметки при старте, английский - словарь ниже. */
var RU = {};
/* украинский словарь - ключи те же, что у EN */
var UK = {
  "t.title": "Гештальт-терапевт Ірина Сиром'ятникова - психотерапія онлайн і в Кракові",
  "t.desc": "Гештальт-терапевт Ірина Сиром'ятникова: індивідуальна терапія, короткострокове консультування, підлітки, пари, супервізія. Очно в центрі Кракова та онлайн по всьому світу. 2000+ консультацій. Сесія 50 хвилин - 50 €. Російська та українська.",
  "t.ogt": "Гештальт-терапевт Ірина Сиром'ятникова - онлайн і в Кракові",
  "t.ogd": "Індивідуальна терапія, пари, підлітки, супервізія. 2000+ консультацій. Сесія 50 хвилин - 50 €. Очно в Кракові та онлайн.",
  "a.home": "Ірина Сиром'ятникова, гештальт-терапевт - на головну",
  "a.nav": "Розділи",
  "a.call": "Зателефонувати +380 97 528 05 00",
  "a.lang": "Мова сайту",
  "a.menu": "Меню",
  "a.hero": "Головний екран",
  "a.bar": "Швидкий зв'язок",
  "a.call2": "Зателефонувати",
  "lg1": "Ірина Сиром'ятникова",
  "lg2": "гештальт-терапевт",
  "n1": "Послуги",
  "n2": "Запити",
  "n3": "Ціни",
  "n4": "Про мене",
  "n5": "Питання",
  "n6": "Контакти",
  "m1": "Короткострокове консультування",
  "m2": "Тривала психотерапія",
  "m3": "Психотерапія підлітків",
  "m4": "Парне та сімейне консультування",
  "m5": "Супервізія",
  "m6": "З чим приходять",
  "m7": "Ціни",
  "m8": "Про мене",
  "m9": "Питання",
  "m10": "Контакти",
  "h.kick": "Краків · онлайн по всьому світу",
  "h.big": "Гештальт-терапевт",
  "h.name": "Ірина Сиром'ятникова",
  "h.lead": "Індивідуальна терапія, пари, підлітки, супервізія. 2000+ консультацій. Очно в центрі Кракова та онлайн. Сесія 50 хвилин - 50 €.",
  "h.b1": "Записатися у WhatsApp",
  "h.b2": "Послуги та ціни",
  "h.ig": "Думки та практика в Instagram",
  "alt.hero": "Тихе озеро на світанку, туман над дзеркальною водою",
  "b.wa": "Записатися у WhatsApp",
  "b.tg": "Написати в Telegram",
  "b.tg2": "Telegram",
  "b.write": "Написати",
  "b.wa2": "Написати у WhatsApp",
  "b.book": "Записатися",
  "b.pack": "Обрати пакет",
  "s1.kick": "Короткострокове консультування",
  "s1.h": "До 10 зустрічей з одним запитом",
  "s1.lead": "Тривога, криза, складне рішення, стосунки, кордони. Чітка мета і зрозумілий термін.",
  "s1.fig": "зустрічей · 50 € за 50 хвилин",
  "s1.c1": "онлайн або в Кракові",
  "s1.c2": "пакет 10 сесій -10 %",
  "s1.c3": "російська та українська",
  "alt.s1": "Ірина Сиром'ятникова в білій футболці за столиком кафе у Кракові",
  "s2.kick": "Тривала психотерапія",
  "s2.h": "Глибше, ніж симптом: терапія у власному ритмі",
  "s2.lead": "Повторювані сценарії, провина й сором, наслідки травми, емоційні гойдалки. Раз на тиждень, за контрактом.",
  "s2.fig": "сесія 50 хвилин",
  "s2.c1": "індивідуально",
  "s2.c2": "гештальт-підхід",
  "s2.c3": "онлайн або в Кракові",
  "alt.s2": "Книжкові полиці в сонячному світлі з вікна",
  "s3.kick": "Психотерапія підлітків",
  "s3.h": "Підлітку - власний безпечний простір",
  "s3.lead": "Тривога, самооцінка, конфлікти вдома і в школі, переїзд до іншої країни. Зустріч із батьками - за домовленістю.",
  "s3.fig": "сесія · 50 €",
  "s3.c1": "з 12 років",
  "s3.c2": "без оцінок і тиску",
  "s3.c3": "онлайн або в Кракові",
  "alt.s3": "Ірина Сиром'ятникова в джинсовому костюмі сидить на підлозі біля пледа",
  "s4.kick": "Парне та сімейне консультування",
  "s4.h": "Двоє в одній розмові",
  "s4.lead": "Партнери, подружжя, мати й донька - будь-які двоє, кому важко почути одне одного.",
  "s4.fig": "сесія 1 година 20 хвилин",
  "s4.c1": "пари та сім'ї",
  "s4.c2": "пакет 10 сесій -10 %",
  "s4.c3": "онлайн або в Кракові",
  "alt.s4": "Два човни поруч біля дерев'яного причалу",
  "z.kick": "Запити",
  "z.h": "З чим до мене приходять",
  "z.lead": "Тривога на рівному місці, втома після відпочинку, зриви на близьких - це не «треба взяти себе в руки». З цим можна розібратися.",
  "z1.h": "Тривога та панічні атаки",
  "z1.p": "Напруга без причини, накручування перед сном, страх, що щось станеться.",
  "z1.q": "як перестати накручувати себе перед сном",
  "z2.h": "Депресивні стани",
  "z2.p": "Ніщо не тішить, немає сил, самотність, утома не минає навіть після відпочинку.",
  "z2.q": "що робити, якщо ніщо не тішить",
  "z3.h": "Наслідки травми",
  "z3.p": "Минуле, яке й далі керує теперішнім. Складний дитячий досвід.",
  "z3.q": "як перестати боятися",
  "z4.h": "Кризи та розлучення",
  "z4.p": "Розставання, переїзд, втрата - коли звична опора зникла.",
  "z4.q": "як жити далі після розлучення",
  "z13.q": "чому ми весь час сваримося",
  "z13.h": "Труднощі у стосунках",
  "z13.p": "Часті сварки, нерозуміння, ревнощі, втрата близькості, складнощі з довірою, образи, різні погляди на життя, труднощі з вираженням почуттів і бажань, кризи у стосунках і розставання.",
  "z5.h": "Стосунки та сексуальність",
  "z5.p": "Близькість, довіра, бажання, одні й ті самі сварки. Ізоляція та неможливість поговорити.",
  "z5.q": "як налагодити стосунки з партнером",
  "z6.h": "ЛГБТ та орієнтація",
  "z6.p": "Прийняття себе, камінг-аут, сімейні конфлікти, особисті кордони.",
  "z6.q": "як прийняти себе",
  "z7.h": "Самооцінка та кордони",
  "z7.p": "Залежність від чужої думки, порівняння з іншими, невміння сказати «ні».",
  "z7.q": "як перестати залежати від чужої думки",
  "z8.h": "Повторювані сценарії",
  "z8.p": "Ті самі люди, конфлікти й глухі кути - в різних декораціях.",
  "z8.q": "чому я знову обираю не тих",
  "z9.h": "Провина, сором, дратівливість",
  "z9.p": "Зриваюся на близьких, потім звинувачую себе. І так по колу.",
  "z9.q": "як не зриватися на близьких",
  "z10.h": "Вигорання та прокрастинація",
  "z10.p": "Відкладаю навіть те, чого хочу. Не можу змусити себе почати.",
  "z10.q": "як відрізнити лінощі від вигорання",
  "z11.h": "Підтримка батьків",
  "z11.p": "Дитячо-батьківські стосунки, підлітковий вік, батьківство особливих дітей, власна втома.",
  "z11.q": "як не реагувати на дитину криком",
  "z12.h": "Своя тема",
  "z12.p": "Якщо не знайшли себе в списку - опишіть двома словами. Розберемося на першій зустрічі.",
  "u.kick": "Якщо ви впізнаєте себе",
  "u.h": "Фрази, з якими приходять",
  "u1": "«Накручую себе перед сном»",
  "u2": "«Тривожно на рівному місці»",
  "u3": "«Відкладаю навіть те, чого хочу»",
  "u4": "«Втомлююся навіть після відпочинку»",
  "u5": "«Зриваюся на близьких»",
  "u6": "«Порівнюю себе з іншими»",
  "u7": "«Не можу змусити себе почати»",
  "u.p": "Одна розмова, щоб зрозуміти, що відбувається, - це вже робота. Не потрібно формулювати «правильно».",
  "u.b": "Написати Ірині",
  "alt.ten": "Дерев'яний причал на ранковому озері",
  "p.kick": "Для колег",
  "p.h": "Супервізія для психологів і психотерапевтів",
  "p.lead": "Розбір клієнтських випадків, професійних труднощів і процесів, що виникають у роботі терапевта. Простір для дослідження контакту з клієнтом, пошуку нових перспектив і розвитку професійної опори.",
  "p.fig": "години підготовки супервізора, Інститут гештальту Погодіна",
  "p.c1": "гештальт-підхід",
  "p.c2": "російська та українська",
  "p.c3": "умови під час запису",
  "p.b": "Записатися на супервізію",
  "alt.sup": "Ірина Сиром'ятникова з кавою на вулиці Кракова",
  "c.kick": "Ціни",
  "c.h": "Зрозумілі умови",
  "c.lead": "Одна ціна для терапії та консультування, онлайн і очно. Робота за контрактом: формат і частоту зустрічей узгоджуємо на першій сесії.",
  "c1.k": "Індивідуальна сесія",
  "c1.d": "50 хвилин. Терапія або консультування, онлайн або в Кракові.",
  "c2.k": "Пакети сесій",
  "c2.s": "-5 % / -10 %",
  "c2.d": "Індивідуально: 5 сесій - знижка 5 %, 10 сесій - знижка 10 %. Пари: 10 сесій - знижка 10 %.",
  "c3.k": "Парна сесія",
  "c3.d": "1 година 20 хвилин. Партнери, подружжя, сім'я - будь-які двоє.",
  "c.fee": "Супервізія для колег - умови під час запису. Відповідаю особисто протягом години.",
  "ab.stub": "Портрет Ірини",
  "ab.stub2": "фото незабаром",
  "alt.portrait": "Ірина Сиром'ятникова, гештальт-терапевт",
  "ab.kick": "Про мене",
  "ab.h": "Ірина Сиром'ятникова",
  "ab.lead": "Гештальт-терапевт. Навчалася у провідних українських та європейських гештальт-терапевтів. Працюю російською та українською мовами з дорослими, підлітками та парами.",
  "ab.st1": "консультацій",
  "ab.st2": "початок практики",
  "ab.st3": "років із найдавнішим клієнтом",
  "ab.f1": "Дбайливо і без осуду: безпечний простір для складного",
  "ab.f2": "Не даю порад - допомагаю знайти власні рішення та опору",
  "ab.f3": "Працюю зі складними емоційними станами та кризами",
  "ab.ig": "Більше про практику в Instagram",
  "d.kick": "Освіта",
  "d.h": "Дипломи та сертифікати",
  "d.lb": "Документ",
  "d.prev": "Попередній документ",
  "d.next": "Наступний документ",
  "d.close": "Закрити",
  "dc1.t": "Магістр психології, диплом з відзнакою",
  "dc1.o": "ХНУ імені Каразіна · 2024",
  "dc2.t": "Бакалавр психології",
  "dc2.o": "ХНУ імені Каразіна · 2023",
  "dc3.t": "Теорія і практика гештальт-терапії, 744 години",
  "dc3.o": "Інститут гештальту Погодіна · 2021-2025",
  "dc4.t": "Підготовка супервізора в гештальт-підході, 432 години",
  "dc4.o": "Інститут гештальту Погодіна · 2024-2026",
  "dc5.t": "Клінічний підхід у гештальт-терапії, 180 годин",
  "dc5.o": "НАГТУ · 2023-2024",
  "dc6.t": "Гештальт-підхід у роботі з парами, 180 годин",
  "dc6.o": "НАГТУ · 2023-2024",
  "dc7.t": "Робота із сексуальною тематикою, 180 годин",
  "dc7.o": "НАГТУ · 2022-2023",
  "dc8.t": "Діалогова модель гештальт-терапії, 180 годин",
  "dc8.o": "Інститут гештальту Погодіна · 2021-2022",
  "k.kick": "Як це відбувається",
  "k.h": "Чотири кроки до першої зустрічі",
  "k1.h": "Заявка",
  "k1.p": "WhatsApp, Telegram або форма. Відповідаю особисто протягом години.",
  "k2.h": "Перша зустріч",
  "k2.p": "50 хвилин: ваш запит і мої запитання. Вирішуємо, чи підходимо одне одному.",
  "k3.h": "Контракт",
  "k3.p": "Формат, частота, конфіденційність - фіксуємо домовленості.",
  "k4.h": "Робота",
  "k4.p": "Раз на тиждень, онлайн або в Кракові. Короткостроково або в тривалому форматі.",
  "f.kick": "Питання",
  "f.h": "Що запитують перед першою зустріччю",
  "f1.q": "Онлайн - це працює?",
  "f1.a": "Так. Відеодзвінок у зручному месенджері, 50 хвилин, з будь-якої точки світу. Потрібні тихе місце й навушники.",
  "f2.q": "Це конфіденційно?",
  "f2.a": "Так. Зміст сесій не передається третім особам, я дотримуюся етичного кодексу гештальт-терапевта. Докладніше - у політиці конфіденційності.",
  "f3.q": "Скільки потрібно зустрічей?",
  "f3.a": "Короткостроковий формат - до 10 зустрічей з конкретним запитом. Тривала терапія - у вашому ритмі, зазвичай раз на тиждень.",
  "f4.q": "Якою мовою проходять сесії?",
  "f4.a": "Російською або українською - як вам зручніше.",
  "f5.q": "Чи можна прийти вдвох?",
  "f5.a": "Так. Парна сесія - 1 година 20 хвилин, 90 €. Партнери, подружжя, один із батьків і дитина.",
  "f6.q": "Що робити, якщо допомога потрібна терміново?",
  "f6.a": "Психотерапія - не екстрена служба. Якщо є загроза життю, зверніться до служби екстреної допомоги вашої країни (у Польщі - 112).",
  "y.kick": "Запис",
  "y.h": "Залиште заявку",
  "y.lead": "Відповім особисто протягом години у WhatsApp. Можна без подробиць - двох слів про запит достатньо.",
  "y.f1": "Перша зустріч - 50 хвилин, 50 €",
  "y.f2": "Пн-пт 9:00-20:00, вихідні за домовленістю",
  "y.f3": "Зручніше месенджер - WhatsApp або Telegram",
  "y.name": "Ім'я",
  "y.namep": "Як до вас звертатися",
  "y.phone": "Телефон (WhatsApp)",
  "y.fmt": "Формат",
  "y.fmt1": "Онлайн",
  "y.fmt2": "Очно в Кракові",
  "y.svc": "Тема",
  "y.s1": "Індивідуальна сесія",
  "y.s2": "Короткострокове консультування",
  "y.s3": "Тривала психотерапія",
  "y.s4": "Підліток",
  "y.s5": "Пара або сім'я",
  "y.s6": "Супервізія",
  "y.msg": "Про ситуацію (необов'язково)",
  "y.msgp": "Кілька слів про те, що відбувається",
  "y.b": "Надіслати у WhatsApp",
  "y.ok": "Дякую! Відкриваю WhatsApp з вашою заявкою.",
  "y.err": "Вкажіть ім'я та номер телефону.",
  "y.note": "Натискаючи кнопку, ви погоджуєтеся з <a href=\"privacy.html\">політикою конфіденційності</a>. Дані потрібні лише для запису.",
  "kt.kick": "Контакти",
  "kt.h": "Напишіть або зателефонуйте",
  "kt.l1": "Краків, центр міста. Адреса кабінету - після запису.",
  "kt.l2": "Онлайн - по всьому світу. Російська та українська.",
  "kt.l3": "Пн-пт 9:00-20:00, вихідні - за домовленістю.",
  "alt.krakow": "Ірина Сиром'ятникова на балконі в центрі Кракова",
  "kt.cap": "Очно в центрі Кракова",
  "ft.priv": "Політика конфіденційності",
  "ft.disc": "Психотерапія не замінює екстреної допомоги та медичного лікування. Зміст сесій конфіденційний.",
  "ft.copy": "Ірина Сиром'ятникова. Гештальт-терапевт, Краків і онлайн."
};
var EN = {
  "t.title": "Gestalt therapist Iryna Syromiatnykova - psychotherapy online and in Kraków",
  "t.desc": "Gestalt therapist Iryna Syromiatnykova: individual therapy, short-term counselling, teenagers, couples, supervision. In person in central Kraków and online worldwide. 2000+ sessions. 50-minute session - €50. Russian and Ukrainian.",
  "t.ogt": "Gestalt therapist Iryna Syromiatnykova - online and in Kraków",
  "t.ogd": "Individual therapy, couples, teenagers, supervision. 2000+ sessions. 50-minute session - €50. In Kraków and online.",
  "a.home": "Iryna Syromiatnykova, Gestalt therapist - home", "a.nav": "Sections", "a.call": "Call +380 97 528 05 00", "a.lang": "Site language",
  "a.menu": "Menu", "a.hero": "Main screen", "a.bar": "Quick contact", "a.call2": "Call",
  "lg1": "Iryna Syromiatnykova", "lg2": "Gestalt therapist",
  "n1": "Services", "n2": "Requests", "n3": "Prices", "n4": "About", "n5": "FAQ", "n6": "Contacts",
  "m1": "Short-term counselling", "m2": "Long-term psychotherapy", "m3": "Therapy for teenagers", "m4": "Couples and family counselling",
  "m5": "Supervision", "m6": "What people come with", "m7": "Prices", "m8": "About me", "m9": "FAQ", "m10": "Contacts",
  "h.kick": "Kraków · online worldwide",
  "h.big": "Gestalt therapist", "h.name": "Iryna Syromiatnykova",
  "h.lead": "Individual therapy, couples, teenagers, supervision. 2000+ sessions. In person in central Kraków and online. 50-minute session - €50.",
  "h.b1": "Book via WhatsApp", "h.b2": "Services and prices", "h.ig": "Thoughts and practice on Instagram",
  "alt.hero": "A quiet lake at dawn, mist over mirror-still water",
  "b.wa": "Book via WhatsApp", "b.tg": "Message on Telegram", "b.tg2": "Telegram", "b.write": "Write", "b.wa2": "Message on WhatsApp", "b.book": "Book a session", "b.pack": "Get a package",
  "s1.kick": "Short-term counselling", "s1.h": "Up to 10 meetings around one request",
  "s1.lead": "Anxiety, a crisis, a hard decision, relationships, boundaries. A clear goal and a clear timeframe.",
  "s1.fig": "meetings · €50 per 50 minutes",
  "s1.c1": "online or in Kraków", "s1.c2": "10-session package -10%", "s1.c3": "Russian and Ukrainian",
  "alt.s1": "Iryna Syromiatnykova in a white T-shirt at a café table in Kraków",
  "s2.kick": "Long-term psychotherapy", "s2.h": "Deeper than the symptom: therapy at your own pace",
  "s2.lead": "Repeating patterns, guilt and shame, consequences of trauma, emotional swings. Once a week, under a contract.",
  "s2.fig": "50-minute session",
  "s2.c1": "individual", "s2.c2": "Gestalt approach", "s2.c3": "online or in Kraków",
  "alt.s2": "Bookshelves in sunlight from a window",
  "s3.kick": "Therapy for teenagers", "s3.h": "A safe space of their own for a teenager",
  "s3.lead": "Anxiety, self-esteem, conflicts at home and at school, moving to another country. A meeting with parents - by agreement.",
  "s3.fig": "session · €50",
  "s3.c1": "from age 12", "s3.c2": "no judgement, no pressure", "s3.c3": "online or in Kraków",
  "alt.s3": "Iryna Syromiatnykova in a denim suit sitting on the floor by a knitted throw",
  "s4.kick": "Couples and family counselling", "s4.h": "Two people in one conversation",
  "s4.lead": "Partners, spouses, mother and daughter - any two people who find it hard to hear each other.",
  "s4.fig": "session of 1 hour 20 minutes",
  "s4.c1": "couples and families", "s4.c2": "10-session package -10%", "s4.c3": "online or in Kraków",
  "alt.s4": "Two boats side by side at a wooden pier",
  "z.kick": "Requests", "z.h": "What people come to me with",
  "z.lead": "Anxiety out of nowhere, tiredness after a holiday, snapping at loved ones - this is not «just pull yourself together». It can be worked through.",
  "z1.h": "Anxiety and panic attacks", "z1.p": "Tension without a reason, overthinking before sleep, fear that something will happen.", "z1.q": "how to stop overthinking before sleep",
  "z2.h": "Depressive states", "z2.p": "Nothing brings joy, no energy, loneliness, tiredness that stays even after rest.", "z2.q": "what to do when nothing brings joy",
  "z3.h": "Consequences of trauma", "z3.p": "A past that keeps running the present. A difficult childhood experience.", "z3.q": "how to stop being afraid",
  "z4.h": "Crises and divorce", "z4.p": "Break-up, relocation, loss - when the usual support is gone.", "z4.q": "how to go on after a divorce",
  "z5.h": "Relationships and sexuality", "z13.q": "why do we keep arguing", "z13.h": "Relationship difficulties", "z13.p": "Frequent arguments, misunderstanding, jealousy, loss of closeness, trust issues, resentment, different views on life, difficulty expressing feelings and needs, relationship crises and break-ups.", "z5.p": "Closeness, trust, desire, the same arguments again and again. Isolation and being unable to talk.", "z5.q": "how to fix my relationship with my partner",
  "z6.h": "LGBT and orientation", "z6.p": "Self-acceptance, coming out, family conflicts, personal boundaries.", "z6.q": "how to accept myself",
  "z7.h": "Self-esteem and boundaries", "z7.p": "Dependence on others' opinions, comparing yourself to others, not being able to say «no».", "z7.q": "how to stop depending on what others think",
  "z8.h": "Repeating patterns", "z8.p": "The same people, conflicts and dead ends - in different settings.", "z8.q": "why do I keep choosing the wrong people",
  "z9.h": "Guilt, shame, irritability", "z9.p": "I snap at loved ones, then blame myself. Round and round.", "z9.q": "how to stop snapping at loved ones",
  "z10.h": "Burnout and procrastination", "z10.p": "I put off even the things I want. I can't make myself start.", "z10.q": "how to tell laziness from burnout",
  "z11.h": "Support for parents", "z11.p": "Parent-child relationships, adolescence, parenting children with special needs, your own exhaustion.", "z11.q": "how to stop shouting at my child",
  "z12.h": "Your own topic", "z12.p": "If you don't see yourself on the list - describe it in two words. We'll sort it out at the first meeting.",
  "u.kick": "If you recognise yourself", "u.h": "Phrases people come with",
  "u1": "«I overthink before sleep»", "u2": "«I feel anxious for no reason»", "u3": "«I put off even what I want»", "u4": "«I'm tired even after rest»",
  "u5": "«I snap at the people I love»", "u6": "«I compare myself to others»", "u7": "«I can't make myself start»",
  "u.p": "One conversation to understand what is going on is already work. You don't have to phrase it «correctly».", "u.b": "Message Iryna",
  "alt.ten": "A wooden pier on a lake in the morning",
  "p.kick": "For colleagues", "p.h": "Supervision for psychologists and psychotherapists",
  "p.lead": "Review of client cases, professional difficulties and the processes that arise in a therapist's work. A space to explore the contact with the client, find new perspectives and build professional grounding.",
  "p.fig": "hours of supervisor training, Pogodin Gestalt Institute",
  "p.c1": "Gestalt approach", "p.c2": "Russian and Ukrainian", "p.c3": "terms on request",
  "p.b": "Book supervision", "alt.sup": "Iryna Syromiatnykova with a coffee on a Kraków street",
  "c.kick": "Prices", "c.h": "Clear terms",
  "c.lead": "One price for therapy and counselling, online and in person. We work under a contract: format and frequency are agreed at the first session.",
  "c1.k": "Individual session", "c1.d": "50 minutes. Therapy or counselling, online or in Kraków.",
  "c2.k": "Session packages", "c2.s": "-5% / -10%", "c2.d": "Individual: 5 sessions - 5% off, 10 sessions - 10% off. Couples: 10 sessions - 10% off.",
  "c3.k": "Couples session", "c3.d": "1 hour 20 minutes. Partners, spouses, family - any two people.",
  "c.fee": "Supervision for colleagues - terms on request. I answer personally within an hour.",
  "ab.stub": "Portrait of Iryna", "ab.stub2": "photo coming soon", "alt.portrait": "Iryna Syromiatnykova, Gestalt therapist",
  "ab.kick": "About me", "ab.h": "Iryna Syromiatnykova",
  "ab.lead": "Gestalt therapist. Trained with leading Ukrainian and European Gestalt therapists. I work in Russian and Ukrainian with adults, teenagers and couples.",
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
  "f5.q": "Can we come as a couple?", "f5.a": "Yes. A couples session is 1 hour 20 minutes, €90. Partners, spouses, parent and child.",
  "f6.q": "What if I need help urgently?", "f6.a": "Psychotherapy is not an emergency service. If there is a threat to life, contact the emergency service of your country (in Poland - 112).",
  "y.kick": "Booking", "y.h": "Leave a request", "y.lead": "I answer personally within an hour on WhatsApp. No details needed - two words about your request are enough.",
  "y.f1": "First meeting - 50 minutes, €50", "y.f2": "Mon-Fri 9:00-20:00, weekends by agreement", "y.f3": "Prefer a messenger - WhatsApp or Telegram",
  "y.name": "Name", "y.namep": "How should I address you", "y.phone": "Phone (WhatsApp)", "y.fmt": "Format", "y.fmt1": "Online", "y.fmt2": "In person in Kraków",
  "y.svc": "Topic", "y.s1": "Individual session", "y.s2": "Short-term counselling", "y.s3": "Long-term psychotherapy", "y.s4": "Teenager", "y.s5": "Couple or family", "y.s6": "Supervision",
  "y.msg": "About the situation (optional)", "y.msgp": "A few words about what is going on", "y.b": "Send via WhatsApp",
  "y.ok": "Thank you! Opening WhatsApp with your request.", "y.err": "Please enter your name and phone number.",
  "y.note": "By clicking the button you agree to the <a href=\"privacy.html\">privacy policy</a>. The data is used only for booking.",
  "kt.kick": "Contacts", "kt.h": "Write or call",
  "kt.l1": "Kraków, city centre. Office address - after booking.", "kt.l2": "Online - worldwide. Russian and Ukrainian.", "kt.l3": "Mon-Fri 9:00-20:00, weekends - by agreement.",
  "alt.krakow": "Iryna Syromiatnykova on a balcony in central Kraków", "kt.cap": "In person in central Kraków",
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
var LANGS = ["uk", "ru", "en"];
/* язык по умолчанию - украинский (просьба Ирины 13.10.2026) */
function normLang(l){ return LANGS.indexOf(l) > -1 ? l : "uk"; }
function curLang(){ return normLang(root.lang); }
function pick(key, lang){ var d = lang === "en" ? EN : (lang === "uk" ? UK : RU); var v = d[key]; return v === undefined ? RU[key] : v; }
function applyLang(lang){
  lang = normLang(lang);
  root.setAttribute("lang", lang);
  document.querySelectorAll("[data-i]").forEach(function(el){ var v = pick(el.dataset.i, lang); if (v !== undefined) el.innerHTML = v; });
  document.querySelectorAll("[data-i-alt]").forEach(function(el){ var v = pick(el.dataset.iAlt, lang); if (v !== undefined) el.alt = v; });
  document.querySelectorAll("[data-i-aria]").forEach(function(el){ var v = pick(el.dataset.iAria, lang); if (v !== undefined) el.setAttribute("aria-label", v); });
  document.querySelectorAll("[data-i-c]").forEach(function(el){ var v = pick(el.dataset.iC, lang); if (v !== undefined) el.setAttribute("content", v); });
  document.querySelectorAll("[data-i-ph]").forEach(function(el){ var v = pick(el.dataset.iPh, lang); if (v !== undefined) el.setAttribute("placeholder", v); });
  var t = document.querySelector("title[data-i-t]");
  if (t) { var tv = pick(t.dataset.iT, lang); if (tv !== undefined) t.textContent = tv; }
  document.querySelectorAll(".lang button").forEach(function(b){
    var on = b.getAttribute("data-lang") === lang;
    b.classList.toggle("is-active", on);
    b.setAttribute("aria-pressed", on ? "true" : "false");
  });
  try { localStorage.setItem("is-lang2", lang); } catch(e){}
  setWa(lang);
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
  /* шапка прозрачная только над небом героя: дальше под ней вода */
  var overHero = hero ? scrollY < hero.offsetHeight * 0.2 : false;
  hdr.classList.toggle("over", overHero);
  hdr.classList.toggle("solid", !overHero);
  var onKont = kont && kont.getBoundingClientRect().top < H * 0.6;
  if (bar) bar.classList.toggle("show", scrollY > H * 0.55 && !onKont && !document.body.classList.contains("menu-open"));
}

/* ---------------- ГЕРОЙ: камера плывёт к горизонту ----------------
   p 0..1 пока герой уходит вверх: кадр приближается к точке схода, текст растворяется в небе.
   Пишем transform/opacity прямо в элементы (только композитор), высоту героя кэшируем -
   без чтения раскладки в каждом кадре скролла. За пределами героя не пишем ничего. */
(function(){
  if (!hero || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var img = hero.querySelector(".hero-bg img"), txt = hero.querySelector(".hero-txt");
  var hh = hero.offsetHeight || 1, ticking = false, lastP = -1;
  function upd(){
    ticking = false;
    var p = scrollY / hh;
    p = p < 0 ? 0 : (p > 1 ? 1 : p);
    if (Math.abs(p - lastP) < 0.0005) return;
    lastP = p;
    if (img) img.style.transform = "scale(" + (1 + p * 0.16).toFixed(4) + ")";
    if (txt) { txt.style.opacity = Math.max(0, 1 - p * 3).toFixed(3); txt.style.transform = "translate3d(0," + (p * -90).toFixed(1) + "px,0)"; }
  }
  addEventListener("scroll", function(){ if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, {passive:true});
  addEventListener("resize", function(){ hh = hero.offsetHeight || 1; lastP = -1; upd(); });
  upd();
})();

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
  /* 12.10.2026: раскрытие одноразовое по входу в экран, а не по ходу прокрутки -
     иначе на остановке скролла фото висит полосатым, как битая картинка */
  pws.forEach(function(pw){
    if (!isNaN(dbgOpen)) { setVar(pw, "--open", dbgOpen); return; }
    if (pw.classList.contains("on")) return;
    var r = pw.getBoundingClientRect();
    if (r.top < H * 0.78 && r.bottom > 0) {
      pw.classList.add("on");
      setTimeout(function(){ pw.classList.add("open"); }, 1400);
    }
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
  /* на десктопе плиты - обычные секции по высоте содержимого, проверка не нужна */
  if ((innerWidth || root.clientWidth) > 760) { root.classList.remove("no-stack"); return; }
  var H = innerHeight || root.clientHeight, over = false;
  root.classList.remove("no-stack");
  document.querySelectorAll(".plate").forEach(function(p){ if (p.scrollHeight > H + 2) over = true; });
  root.classList.toggle("no-stack", over);
}
var rsTimer, rsW = innerWidth;
addEventListener("resize", function(){
  /* на телефоне адресная строка прячется при прокрутке и шлёт resize - ширина та же,
     полная перекладка (stackCheck, fitText) в этот момент давала рывок; пересчитываем только при смене ширины */
  if (innerWidth === rsW) { update(); return; }
  rsW = innerWidth;
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
  var L = curLang(), F = FORM_TXT[L];
  var t = HI[L] + " " + F[0] + "\n" + F[1] + ": " + name + "\n" + F[2] + ": " + phone + "\n" + F[3] + ": " + svc + "\n" + F[4] + ": " + fmt + (msg ? "\n" + F[5] + ": " + msg : "");
  ok.hidden = false;
  conv("lead");
  window.open(waUrl(t), "_blank", "noopener");
});

/* ---------------- СТАРТ ----------------
   ?lang= в URL сильнее localStorage: русское объявление не должно открыть английскую версию. */
(function initLang(){
  var url = new URLSearchParams(location.search).get("lang");
  var saved = null;
  try { saved = localStorage.getItem("is-lang2"); } catch(e){}
  var lang = LANGS.indexOf(url) > -1 ? url : normLang(saved);
  applyLang(lang);
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
