import { useContext } from 'react';
import Context from '../context';
import en from './en';
import ru from './ru';
import hy from './hy';

const dictionaries = { en, ru, hy };

// Shown in the language picker
export const LANGUAGES = [
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'ru', label: 'RU', name: 'Русский' },
    { code: 'hy', label: 'ՀՅ', name: 'Հայերեն' },
];

// For dates: Intl uses these to write month and weekday names in each language
export const LOCALES = { en: 'en-US', ru: 'ru-RU', hy: 'hy-AM' };

// First visit: use the browser's language if we have it, otherwise English
export const detectLanguage = () => {
    const browser = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return dictionaries[browser] ? browser : 'en';
};

// translate('ru', 'weather.feels', { temp: '5°' }) -> "Ощущ. 5°"
// A missing key falls back to English, and finally to the key itself,
// so a forgotten translation never breaks the page.
export const translate = (lang, key, vars = {}) => {
    const find = (dict) => key.split('.').reduce((obj, part) => (obj ? obj[part] : undefined), dict);
    const text = find(dictionaries[lang]) ?? find(en) ?? key;
    return text.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? vars[name] : match));
};

// The hook components use. Call it inside observer() components,
// so they re-render when the user picks another language.
export const useT = () => {
    const { settings } = useContext(Context);
    const lang = settings.lang;
    return {
        t: (key, vars) => translate(lang, key, vars),
        lang,
        locale: LOCALES[lang],
    };
};

// ---------------------------------------------------------------------------
// Weather condition texts ("Light rain", "Partially cloudy", "overcast clouds")
// come from the weather APIs in English only for Armenian, so we translate them
// ourselves: find the weather type, then how strong it is.
// ---------------------------------------------------------------------------
const CONDITIONS = {
    // English is not listed: the API's own English text is shown as it is
    thunder:       { ru: 'Гроза',                    hy: 'Ամպրոպ' },
    sleet:         { ru: 'Мокрый снег',              hy: 'Թաց ձյուն' },
    snow:          { ru: 'Снег',                     hy: 'Ձյուն' },
    lightSnow:     { ru: 'Небольшой снег',           hy: 'Թույլ ձյուն' },
    heavySnow:     { ru: 'Сильный снег',             hy: 'Առատ ձյուն' },
    drizzle:       { ru: 'Морось',                   hy: 'Մաղող անձրև' },
    rain:          { ru: 'Дождь',                    hy: 'Անձրև' },
    lightRain:     { ru: 'Небольшой дождь',          hy: 'Թույլ անձրև' },
    heavyRain:     { ru: 'Сильный дождь',            hy: 'Հորդառատ անձրև' },
    showers:       { ru: 'Ливень',                   hy: 'Տեղատարափ' },
    fog:           { ru: 'Туман',                    hy: 'Մառախուղ' },
    mist:          { ru: 'Дымка',                    hy: 'Մշուշ' },
    overcast:      { ru: 'Пасмурно',                 hy: 'Ամպամած' },
    cloudy:        { ru: 'Облачно',                  hy: 'Ամպամած' },
    partlyCloudy:  { ru: 'Переменная облачность',    hy: 'Մասամբ ամպամած' },
    sunny:         { ru: 'Солнечно',                 hy: 'Արևոտ' },
    clear:         { ru: 'Ясно',                     hy: 'Պարզ' },
    windy:         { ru: 'Ветрено',                  hy: 'Քամոտ' },
};

// English text -> one of the CONDITIONS keys (order matters: most specific first)
const conditionType = (text) => {
    const s = text.toLowerCase();
    const light = /light|patchy|slight|few/.test(s);
    const heavy = /heavy|torrential|moderate or heavy|violent/.test(s);

    if (/thunder/.test(s)) return 'thunder';
    if (/sleet|ice pellets|freezing|rain and snow|rain, snow|snow, rain/.test(s)) return 'sleet';
    if (/snow|blizzard/.test(s)) return heavy ? 'heavySnow' : light ? 'lightSnow' : 'snow';
    if (/drizzle/.test(s)) return 'drizzle';
    if (/shower/.test(s)) return 'showers';
    if (/rain/.test(s)) return heavy ? 'heavyRain' : light ? 'lightRain' : 'rain';
    if (/fog/.test(s)) return 'fog';
    if (/mist|haze|smoke|dust/.test(s)) return 'mist';
    if (/overcast/.test(s)) return 'overcast';
    if (/partly|partially|few clouds|scattered/.test(s)) return 'partlyCloudy';
    if (/cloud/.test(s)) return 'cloudy';
    if (/sunny/.test(s)) return 'sunny';
    if (/clear/.test(s)) return 'clear';
    if (/wind/.test(s)) return 'windy';
    return null;
};

// "Light rain shower" + "hy" -> "Տեղատարափ";  English stays as the API wrote it.
export const translateCondition = (text = '', lang = 'en') => {
    if (lang === 'en' || !text) return text;
    const type = conditionType(text);
    return type ? CONDITIONS[type][lang] : text;
};
