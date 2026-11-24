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

// "2026-11-24" -> { weekday: "Tue", short: "Nov 24", long: "Tuesday, November 24" }
// Noon is used so the date never shifts to the day before in any time zone.
export const formatDay = (isoDate) => {
    const d = new Date(`${isoDate}T12:00:00`);
    return {
        weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
        short: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        long: d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    };
};

// Wind direction in degrees -> compass point (0 = N, 90 = E, ...)
export const windDirection = (deg) =>
    ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(deg / 45) % 8];

// weatherapi returns icons as "//cdn.weatherapi.com/..."
export const absoluteUrl = (url) => (url.startsWith('//') ? `https:${url}` : url);
