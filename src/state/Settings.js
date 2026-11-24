import { autorun, makeAutoObservable } from 'mobx';

const prefersDark = () =>
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

// User preferences, remembered in localStorage between visits.
class Settings {
    unit = localStorage.getItem('unit') === 'F' ? 'F' : 'C';
    theme = localStorage.getItem('theme') || (prefersDark() ? 'dark' : 'light');

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });

        // Whenever `theme` changes, put it on <html data-theme="...">;
        // the CSS switches colors based on that attribute.
        autorun(() => {
            document.documentElement.dataset.theme = this.theme;
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
}

export default Settings;
