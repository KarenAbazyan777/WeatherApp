export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/auth';

export const jsonHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json; charset=utf-8',
};

export const authHeaders = () => ({
    ...jsonHeaders,
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

const OPENWEATHER_KEY = process.env.REACT_APP_OPENWEATHER_KEY;
const WEATHERAPI_KEY = process.env.REACT_APP_WEATHERAPI_KEY;
const VISUALCROSSING_KEY = process.env.REACT_APP_VISUALCROSSING_KEY;

export const weatherUrls = {
    // openweathermap: coordinates -> nearest city name ("My location" button)
    reverseGeocode: (lat, lon) =>
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OPENWEATHER_KEY}`,

    // openweathermap: weather right now
    current: (place) =>
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(place)}&units=metric&appid=${OPENWEATHER_KEY}`,

    // weatherapi: hourly forecast for 1 (today) or 2 (tomorrow) days
    forecast: (place, days) =>
        `https://api.weatherapi.com/v1/forecast.json?key=${WEATHERAPI_KEY}&q=${encodeURIComponent(place)}&days=${days}`,

    // visualcrossing: 15 days, or one specific date
    timeline: (place, date) =>
        `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(place)}${date ? `/${date}` : ''}?key=${VISUALCROSSING_KEY}&unitGroup=metric&iconSet=icons1`,
};

// Weather icons live in public/icons, so the browser downloads only the ones
// a page shows (and caches them), instead of all of them inside the JS bundle.
export const weatherIcon = (name) => `${process.env.PUBLIC_URL}/icons/${name}.png`;
