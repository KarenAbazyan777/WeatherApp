import { useEffect, useState } from 'react';
import { weatherUrls } from '../constants/api';

const MIN_LENGTH = 2;   // start suggesting after 2 letters
const DEBOUNCE_MS = 250; // wait until the user stops typing for a moment
const cache = new Map(); // "yer" -> [...results], so typing back and forth is instant

// Open-Meteo result -> what the dropdown needs
const toSuggestion = (r) => ({
    id: r.id,
    name: r.name,
    details: [r.admin1, r.country].filter(Boolean).join(', '),
    country: (r.country_code || '').toUpperCase(), // shown as a small badge, e.g. AM
    // "Yerevan,AM": a format all three weather APIs understand
    place: `${r.name},${r.country_code}`,
});

// Returns city suggestions for the text typed in the search box.
export const useCitySuggestions = (query) => {
    const [suggestions, setSuggestions] = useState([]);
    const text = query.trim().toLowerCase();

    useEffect(() => {
        if (text.length < MIN_LENGTH) {
            setSuggestions([]);
            return undefined;
        }
        if (cache.has(text)) {
            setSuggestions(cache.get(text));
            return undefined;
        }

        const controller = new AbortController();
        const timer = setTimeout(() => {
            fetch(weatherUrls.citySearch(text), { signal: controller.signal })
                .then((res) => res.json())
                .then((data) => {
                    // drop exact duplicates (same name, region and country)
                    const seen = new Set();
                    const list = (data.results || [])
                        // only cities, towns and villages (feature codes PPL...), not airports or countries
                        .filter((r) => !r.feature_code || r.feature_code.startsWith('PPL'))
                        .map(toSuggestion)
                        .filter((s) => {
                            const key = `${s.name}|${s.details}`;
                            if (seen.has(key)) return false;
                            seen.add(key);
                            return true;
                        });
                    cache.set(text, list);
                    setSuggestions(list);
                })
                .catch(() => {
                    // aborted because the user kept typing, or offline: just show nothing
                });
        }, DEBOUNCE_MS);

        // a newer keystroke cancels this one (both the wait and the request)
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [text]);

    return suggestions;
};
