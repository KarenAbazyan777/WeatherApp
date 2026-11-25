import { autorun, makeAutoObservable } from 'mobx';
import { detectLanguage } from '../i18n';

const prefersDark = () =>
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

const LANGS = ['en', 'ru', 'hy'];

// User preferences, remembered in localStorage between visits.
class Settings {
    unit = localStorage.getItem('unit') === 'F' ? 'F' : 'C';
    theme = localStorage.getItem('theme') || (prefersDark() ? 'dark' : 'light');
    lang = LANGS.includes(localStorage.getItem('lang')) ? localStorage.getItem('lang') : detectLanguage();

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });

        // Whenever theme or language changes, put them on <html data-theme="..." lang="...">:
        // the CSS switches colors by data-theme; lang helps screen readers and fonts.
        autorun(() => {
            document.documentElement.dataset.theme = this.theme;
            document.documentElement.lang = this.lang;
        });
    }

    toggleUnit() {
        this.unit = this.unit === 'C' ? 'F' : 'C';
        localStorage.setItem('unit', this.unit);
    }

    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', this.theme);
    }

    setLang(lang) {
        if (!LANGS.includes(lang)) return;
        this.lang = lang;
        localStorage.setItem('lang', lang);
    }
}

export default Settings;
