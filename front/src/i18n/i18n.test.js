import en from './en';
import ru from './ru';
import hy from './hy';
import { translate, translateCondition } from './index';

// All keys of a nested object as "a.b.c" paths
const keys = (obj, prefix = '') => Object.entries(obj).flatMap(([k, v]) =>
    (typeof v === 'object' ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]));

test('Russian and Armenian have exactly the same texts as English (nothing missing, nothing extra)', () => {
    expect(keys(ru).sort()).toEqual(keys(en).sort());
    expect(keys(hy).sort()).toEqual(keys(en).sort());
});

test('every {placeholder} in English exists in the translations too', () => {
    const placeholders = (text) => (text.match(/\{\w+\}/g) || []).sort();
    for (const key of keys(en)) {
        const expected = placeholders(translate('en', key));
        expect([key, placeholders(translate('ru', key))]).toEqual([key, expected]);
        expect([key, placeholders(translate('hy', key))]).toEqual([key, expected]);
    }
});

test('translate fills placeholders and falls back to English, then to the key', () => {
    expect(translate('ru', 'weather.feels', { temp: '5°' })).toBe('Ощущ. 5°');
    expect(translate('hy', 'weather.rainChance', { percent: 40 })).toBe('Անձրևի հավանականություն 40%');
    expect(translate('xx', 'common.signIn')).toBe('Sign in');
    expect(translate('ru', 'no.such.key')).toBe('no.such.key');
});

test('weather texts from the APIs are translated', () => {
    const cases = [
        // text from an API          Russian                   Armenian
        ['Light rain',               'Небольшой дождь',        'Թույլ անձրև'],
        ['Light rain shower',        'Ливень',                 'Տեղատարափ'],
        ['Patchy rain nearby',       'Небольшой дождь',        'Թույլ անձրև'],
        ['Moderate or heavy snow',   'Сильный снег',           'Առատ ձյուն'],
        ['Thundery outbreaks',       'Гроза',                  'Ամպրոպ'],
        ['Partially cloudy',         'Переменная облачность',  'Մասամբ ամպամած'],
        ['broken clouds',            'Облачно',                'Ամպամած'],
        ['overcast clouds',          'Пасмурно',               'Ամպամած'],
        ['Overcast',                 'Пасмурно',               'Ամպամած'],
        ['clear sky',                'Ясно',                   'Պարզ'],
        ['Sunny',                    'Солнечно',               'Արևոտ'],
        ['mist',                     'Дымка',                  'Մշուշ'],
        ['Freezing fog',             'Мокрый снег',            'Թաց ձյուն'],
        ['Rain, Partially cloudy',   'Дождь',                  'Անձրև'],
    ];
    for (const [text, ruText, hyText] of cases) {
        expect([text, translateCondition(text, 'ru')]).toEqual([text, ruText]);
        expect([text, translateCondition(text, 'hy')]).toEqual([text, hyText]);
        expect(translateCondition(text, 'en')).toBe(text);
    }
});

test('Armenian dates are written by hand (browsers have no Armenian date data)', () => {
    // eslint-disable-next-line global-require
    const { formatDay } = require('../helpers/format');
    // eslint-disable-next-line global-require
    const { dateBuilder } = require('../helpers/constants/timezone');
    expect(formatDay('2026-11-25', 'hy-AM')).toEqual({
        weekday: 'չրք',
        short: '25 նյմ',
        long: 'չորեքշաբթի, նոյեմբերի 25',
    });
    // 2026-11-25 11:23 UTC in Yerevan (UTC+4 = 14400 s) is 15:23
    const utc = Date.UTC(2026, 10, 25, 11, 23) / 1000;
    expect(dateBuilder(14400, utc, 'hy-AM')).toBe('չորեքշաբթի, նոյեմբերի 25, 2026, 15:23');
});
