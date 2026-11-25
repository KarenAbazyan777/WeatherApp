import { useContext } from 'react';
import Context from '../context';

export const round = (n) => Math.round(n);

// All APIs return °C; convert only for display.
export const formatTemp = (celsius, unit) =>
    `${Math.round(unit === 'F' ? celsius * 9 / 5 + 32 : celsius)}°`;

// Returns t(celsius) -> "21°" in the unit the user picked.
// Use it inside observer() components so they re-render when the unit changes.
export const useTemp = () => {
    const { settings } = useContext(Context);
    const unit = settings.unit;
    return (celsius) => formatTemp(celsius, unit);
};

// Turns any API's weather text into one of the background skies:
// "clear" | "night" | "clouds" | "rain" | "snow" | "fog".
// Works with openweathermap ("light rain"), weatherapi ("Patchy rain nearby")
// and visualcrossing icon names ("partly-cloudy-night").
export const getSky = (text = '', isNight = false) => {
    const t = text.toLowerCase();
    if (/snow|sleet|blizzard|ice/.test(t)) return 'snow';
    if (/rain|drizzle|shower|thunder|hail/.test(t)) return 'rain';
    if (/fog|mist|haze|smoke|dust/.test(t)) return 'fog';
    if (isNight || t.includes('night')) return 'night';
    if (/partly|few|scattered/.test(t)) return 'clear';
    if (/cloud|overcast/.test(t)) return 'clouds';
    return 'clear';
};

// Armenian month and weekday names. Browsers like Chrome ship without Armenian
// date data (Intl falls back to English), so for "hy-AM" we format dates ourselves.
export const HY = {
    weekdays: ['կիրակի', 'երկուշաբթի', 'երեքշաբթի', 'չորեքշաբթի', 'հինգշաբթի', 'ուրբաթ', 'շաբաթ'],
    weekdaysShort: ['կիր', 'երկ', 'երք', 'չրք', 'հնգ', 'ուրբ', 'շբթ'],
    // genitive form, as used in dates: "նոյեմբերի 25"
    months: ['հունվարի', 'փետրվարի', 'մարտի', 'ապրիլի', 'մայիսի', 'հունիսի',
        'հուլիսի', 'օգոստոսի', 'սեպտեմբերի', 'հոկտեմբերի', 'նոյեմբերի', 'դեկտեմբերի'],
    monthsShort: ['հնվ', 'փտվ', 'մրտ', 'ապր', 'մյս', 'հնս', 'հլս', 'օգս', 'սպտ', 'հկտ', 'նյմ', 'դկտ'],
};

// "2026-11-24" -> { weekday: "Tue", short: "Nov 24", long: "Tuesday, November 24" }
// locale ("en-US", "ru-RU", "hy-AM") decides the language of month and weekday names.
// Noon is used so the date never shifts to the day before in any time zone.
export const formatDay = (isoDate, locale = 'en-US') => {
    const d = new Date(`${isoDate}T12:00:00`);
    if (locale.startsWith('hy')) {
        return {
            weekday: HY.weekdaysShort[d.getDay()],
            short: `${d.getDate()} ${HY.monthsShort[d.getMonth()]}`,
            long: `${HY.weekdays[d.getDay()]}, ${HY.months[d.getMonth()]} ${d.getDate()}`,
        };
    }
    return {
        weekday: d.toLocaleDateString(locale, { weekday: 'short' }),
        short: d.toLocaleDateString(locale, { month: 'short', day: 'numeric' }),
        long: d.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' }),
    };
};

// Wind direction in degrees -> compass point (0 = N, 90 = E, ...).
// names: the 8 directions in the current language, e.g. t('weather.dirs') = "N,NE,E,..."
export const windDirection = (deg, names = 'N,NE,E,SE,S,SW,W,NW') =>
    names.split(',')[Math.round(deg / 45) % 8];

// weatherapi returns icons as "//cdn.weatherapi.com/..."
export const absoluteUrl = (url) => (url.startsWith('//') ? `https:${url}` : url);
