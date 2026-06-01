// Lightweight i18n applier for privacy.html + terms.html.
// Reads the same `feedpal_docs_lang` localStorage key the main page sets.
// No language picker UI — the user picks language on the main page.
(function () {
    if (typeof T !== 'object' || !T.en) return;

    const LS_KEY = 'feedpal_docs_lang';

    function detectNavLang() {
        const navLang = navigator.language || 'en';
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

    const lang = effectiveLang(pickInitialSelection());
    const dict = T[lang] || T.en;
    for (const el of document.querySelectorAll('[data-i18n]')) {
        const key = el.dataset.i18n;
        if (dict[key]) el.textContent = dict[key];
    }
    for (const el of document.querySelectorAll('[data-i18n-html]')) {
        const key = el.dataset.i18nHtml;
        if (dict[key]) el.innerHTML = dict[key];
    }
    const baseLang = lang.split('_')[0].split('-')[0];
    document.documentElement.lang = baseLang;
    const RTL = new Set(['ar', 'he', 'fa', 'ur', 'yi']);
    document.documentElement.dir = RTL.has(baseLang) ? 'rtl' : 'ltr';
})();
