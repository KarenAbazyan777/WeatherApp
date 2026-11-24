import { useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Context from '../../context';

const CACHE_TTL_MS = 10 * 60 * 1000; // weather data stays fresh for 10 minutes
const CACHE_MAX_ENTRIES = 30;
const cache = new Map(); // url -> { time, data, promise }

// Returns a cache entry for `url`. The same url is requested only once:
// pages asking for it at the same time share one request (entry.promise),
// and later visits get the saved answer right away (entry.data).
const loadJson = (url) => {
    const hit = cache.get(url);
    if (hit && Date.now() - hit.time < CACHE_TTL_MS) {
        return hit;
    }

    const entry = { time: Date.now(), data: null, promise: null };
    entry.promise = fetch(url)
        .then((res) => {
            if (!res.ok) throw new Error('Place not found');
            return res.json();
        })
        .then((data) => {
            entry.data = data;
            return data;
        })
        .catch((error) => {
            cache.delete(url); // do not remember failures, allow a retry
            throw error;
        });

    cache.delete(url);
    cache.set(url, entry);
    if (cache.size > CACHE_MAX_ENTRIES) {
        cache.delete(cache.keys().next().value); // drop the oldest entry
    }
    return entry;
};

// Loads weather data from `url` into the shared store.
// Returns { isLoading, data } where data is the latest response (or null).
export const useWeather = (url) => {
    const { currentWeather } = useContext(Context);
    useRedirectOnError();

    useEffect(() => {
        const entry = loadJson(url);
        currentWeather.setError('');

        // Cached: show it immediately, no spinner, no request.
        if (entry.data) {
            currentWeather.setIsLoading(false);
            return;
        }

        let cancelled = false;
        currentWeather.setIsLoading(true);

        entry.promise
            .catch((error) => {
                if (!cancelled) currentWeather.setError(error);
            })
            .finally(() => {
                if (!cancelled) currentWeather.setIsLoading(false);
            });

        // A newer request replaces this one: ignore its late answer.
        return () => { cancelled = true; };
    }, [url, currentWeather]);

    // Data for exactly this url comes from the cache, so a page never shows
    // the previous city's data for a moment. Reading currentWeather.isLoading
    // makes the observer component re-render when the request finishes.
    const hit = cache.get(url);
    const data = hit && hit.data ? hit.data : null;

    return {
        isLoading: currentWeather.isLoading || !data,
        data,
    };
};

// The city comes from the URL (/now/:placeName), so refresh and Back work.
// The store is kept in sync because Search and the menu links read it.
export const usePlace = () => {
    const { placeName } = useParams();
    const { placeStore } = useContext(Context);

    useEffect(() => {
        if (placeName && placeName !== placeStore.weather) {
            placeStore.setWeather(placeName);
        }
    }, [placeName, placeStore]);

    return placeName || placeStore.weather;
};

// When a city is not found, go to the NotFound page.
// Runs in an effect, because navigating during render is not allowed.
export const useRedirectOnError = () => {
    const { currentWeather, placeStore } = useContext(Context);
    const navigate = useNavigate();
    const error = currentWeather.error;

    useEffect(() => {
        if (error) {
            currentWeather.setError('');
            placeStore.setWeather('london,UK');
            navigate('/NotFound');
        }
    }, [error, currentWeather, placeStore, navigate]);
};
