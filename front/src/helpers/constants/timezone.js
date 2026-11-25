import { HY } from '../format';

// Formats a moment in the city's local time.
// timezoneOffset: city's shift from UTC in seconds (openweathermap `timezone`)
// unixSeconds:    the moment to show, in seconds (openweathermap `dt`), default = now
// locale:         language of the result, e.g. "en-US", "ru-RU", "hy-AM"
export const dateBuilder = (timezoneOffset, unixSeconds = Date.now() / 1000, locale = 'en-US') => {
    // Shift the moment by the city's offset, then print it as UTC:
    // the result is the clock time people see in that city.
    const cityTime = new Date((unixSeconds + timezoneOffset) * 1000);

    // Armenian: browsers have no Armenian date data, so build it by hand
    // -> "չորեքշաբթի, նոյեմբերի 25, 2026, 15:23"
    if (locale.startsWith('hy')) {
        const hh = String(cityTime.getUTCHours()).padStart(2, '0');
        const mm = String(cityTime.getUTCMinutes()).padStart(2, '0');
        return `${HY.weekdays[cityTime.getUTCDay()]}, ${HY.months[cityTime.getUTCMonth()]} `
            + `${cityTime.getUTCDate()}, ${cityTime.getUTCFullYear()}, ${hh}:${mm}`;
    }

    return cityTime.toLocaleString(locale, {
        timeZone: 'UTC',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};
