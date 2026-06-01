/* Shared language picker for docs/index.html, docs/privacy.html, docs/terms.html.
 * Each page loads its own translations-<page>.js (or translations.js for index)
 * that defines a global `T` keyed by locale code. This file builds the dropdown,
 * applies translations, and persists the user's choice. */
(function () {
    if (typeof T !== 'object' || !T.en) return;  // translations file not loaded
    const LS_KEY = 'amt-lang';

    // [code, native endonym, flag iso2]. `auto` first, picks via navigator.language.
    const LANGS = [
        { code: 'auto',    native: 'Default',                flag: null },
        { code: 'en',      native: 'English',                flag: 'us' },
        { code: 'ar',      native: 'العربية',                flag: 'sa' },
        { code: 'cs',      native: 'Čeština',                flag: 'cz' },
        { code: 'da',      native: 'Dansk',                  flag: 'dk' },
        { code: 'de',      native: 'Deutsch',                flag: 'de' },
        { code: 'el',      native: 'Ελληνικά',               flag: 'gr' },
        { code: 'es',      native: 'Español',                flag: 'es' },
        { code: 'es-MX',   native: 'Español (México)',       flag: 'mx' },
        { code: 'fi',      native: 'Suomi',                  flag: 'fi' },
        { code: 'fr',      native: 'Français',               flag: 'fr' },
        { code: 'he',      native: 'עברית',                  flag: 'il' },
        { code: 'hi',      native: 'हिन्दी',                 flag: 'in' },
        { code: 'hu',      native: 'Magyar',                 flag: 'hu' },
        { code: 'id',      native: 'Bahasa Indonesia',       flag: 'id' },
        { code: 'it',      native: 'Italiano',               flag: 'it' },
        { code: 'ja',      native: '日本語',                  flag: 'jp' },
        { code: 'ko',      native: '한국어',                 flag: 'kr' },
        { code: 'ms',      native: 'Bahasa Melayu',          flag: 'my' },
        { code: 'nb',      native: 'Norsk bokmål',           flag: 'no' },
        { code: 'nl',      native: 'Nederlands',             flag: 'nl' },
        { code: 'pl',      native: 'Polski',                 flag: 'pl' },
        { code: 'pt-BR',   native: 'Português (Brasil)',     flag: 'br' },
        { code: 'pt-PT',   native: 'Português (Portugal)',   flag: 'pt' },
        { code: 'ro',      native: 'Română',                 flag: 'ro' },
        { code: 'ru',      native: 'Русский',                flag: 'ru' },
        { code: 'sk',      native: 'Slovenčina',             flag: 'sk' },
        { code: 'sv',      native: 'Svenska',                flag: 'se' },
        { code: 'th',      native: 'ไทย',                    flag: 'th' },
        { code: 'tr',      native: 'Türkçe',                 flag: 'tr' },
        { code: 'uk',      native: 'Українська',             flag: 'ua' },
        { code: 'vi',      native: 'Tiếng Việt',             flag: 'vn' },
        { code: 'zh-Hans', native: '简体中文',                flag: 'cn' },
        { code: 'zh-Hant', native: '繁體中文',                flag: 'tw' },
    ];

    function detectNavLang() {
        const navLang = (navigator.language || 'en');
        if (T[navLang]) return navLang;
        const base = navLang.split('-')[0];
        if (T[base]) return base;
        return 'en';
    }
    function effectiveLang(selection) {
        if (!selection || selection === 'auto') return detectNavLang();
        return T[selection] ? selection : 'en';
    }
    function pickInitialSelection() {
        const url = new URL(location.href);
        const fromQuery = url.searchParams.get('lang');
        if (fromQuery && (fromQuery === 'auto' || T[fromQuery])) return fromQuery;
        const stored = localStorage.getItem(LS_KEY);
        if (stored && (stored === 'auto' || T[stored])) return stored;
        return 'auto';
    }
    function renderChip(container, lang, isTrigger) {
        container.innerHTML = '';
        if (isTrigger) {
            // Trigger button: the selected language's flag + its name. For the
            // auto/Default state there is no single flag, so we show just the
            // name. The 文A glyph sits beside the button (in HTML) as the
            // language indicator, so the trigger never shows a globe.
            if (lang.code !== 'auto') {
                const img = document.createElement('img');
                img.className = 'lang-flag';
                img.src = 'flags/' + lang.flag + '.svg';
                img.width = 18; img.height = 13; img.alt = '';
                container.appendChild(img);
            }
            const cur = document.createElement('span');
            cur.className = 'lang-current';
            cur.textContent = lang.native;
            container.appendChild(cur);
            return;
        }
        if (lang.code === 'auto') {
            const g = document.createElement('span');
            g.className = 'lang-auto-glyph';
            g.setAttribute('aria-hidden', 'true');
            g.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
            container.appendChild(g);
        } else {
            const img = document.createElement('img');
            img.className = 'lang-flag';
            img.src = 'flags/' + lang.flag + '.svg';
            img.width = 18; img.height = 13; img.alt = '';
            container.appendChild(img);
        }
        const span = document.createElement('span');
        span.className = 'lang-name';
        span.textContent = lang.native;
        container.appendChild(span);
    }
    function applyLang(selection) {
        const lang = effectiveLang(selection);
        const dict = T[lang] || T.en;
        for (const el of document.querySelectorAll('[data-i18n]')) {
            const key = el.dataset.i18n;
            if (dict[key]) el.innerHTML = dict[key];
        }
        for (const el of document.querySelectorAll('[data-i18n-html]')) {
            const key = el.dataset.i18nHtml;
            if (dict[key]) el.innerHTML = dict[key];
        }
        const baseLang = lang.split('_')[0].split('-')[0];
        document.documentElement.lang = baseLang;
        const RTL = new Set(['ar', 'he', 'fa', 'ur', 'yi']);
        document.documentElement.dir = RTL.has(baseLang) ? 'rtl' : 'ltr';

        const btn = document.getElementById('langBtn');
        const menu = document.getElementById('langMenu');
        const selEntry = LANGS.find(l => l.code === selection) || LANGS[0];
        if (btn) renderChip(btn, selEntry, true);
        if (menu) {
            for (const b of menu.querySelectorAll('button[data-lang]')) {
                b.classList.toggle('active', b.dataset.lang === selection);
            }
        }
    }
    function buildMenu() {
        const menu = document.getElementById('langMenu');
        if (!menu) return;
        menu.innerHTML = '';

        // Sticky search input
        const sw = document.createElement('div');
        sw.className = 'lang-search-wrap';
        const inp = document.createElement('input');
        inp.type = 'text';
        inp.className = 'lang-search';
        inp.placeholder = 'Search…';
        inp.setAttribute('aria-label', 'Search languages');
        sw.appendChild(inp);
        menu.appendChild(sw);

        const list = document.createElement('div');
        list.className = 'lang-list';
        menu.appendChild(list);

        for (const lang of LANGS) {
            const b = document.createElement('button');
            b.dataset.lang = lang.code;
            if (lang.code === 'auto') b.classList.add('lang-default');
            b.dataset.searchKey = (lang.native + ' ' + lang.code).toLowerCase();
            renderChip(b, lang);
            list.appendChild(b);
        }

        const empty = document.createElement('div');
        empty.className = 'lang-empty';
        empty.textContent = 'No matches';
        list.appendChild(empty);

        inp.addEventListener('input', () => {
            const q = inp.value.trim().toLowerCase();
            let visible = 0;
            for (const b of list.querySelectorAll('button[data-lang]')) {
                const match = !q || b.dataset.searchKey.includes(q);
                b.style.display = match ? '' : 'none';
                if (match) visible++;
            }
            empty.classList.toggle('visible', visible === 0);
        });
        inp.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (inp.value) { inp.value = ''; inp.dispatchEvent(new Event('input')); }
                else { menu.classList.remove('open'); }
            } else if (e.key === 'Enter') {
                const first = list.querySelector('button[data-lang]:not([style*="display: none"])');
                if (first) first.click();
            }
        });
    }

    buildMenu();
    const initial = pickInitialSelection();
    applyLang(initial);

    const wrap = document.getElementById('langWrap');
    const btn  = document.getElementById('langBtn');
    const menu = document.getElementById('langMenu');
    if (btn && menu && wrap) {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const willOpen = !menu.classList.contains('open');
            menu.classList.toggle('open');
            if (willOpen) {
                const search = menu.querySelector('.lang-search');
                if (search) {
                    search.value = '';
                    search.dispatchEvent(new Event('input'));
                    setTimeout(() => search.focus(), 0);
                }
                const active = menu.querySelector('button.active');
                if (active) active.scrollIntoView({ block: 'nearest' });
            }
        });
        document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) menu.classList.remove('open'); });
        menu.addEventListener('click', (e) => {
            const b = e.target.closest('button[data-lang]');
            if (!b) return;
            const selection = b.dataset.lang;
            if (selection === 'auto') { localStorage.removeItem(LS_KEY); }
            else { localStorage.setItem(LS_KEY, selection); }
            applyLang(selection);
            menu.classList.remove('open');
        });
    }
})();
