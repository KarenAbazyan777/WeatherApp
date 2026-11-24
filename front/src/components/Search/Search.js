import React, { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { NavLink } from 'react-router-dom';
import Context from '../../context';
import { API_URL, authHeaders, weatherUrls } from '../../helpers/constants/api';
import { isLoggedIn, logout, rejectWithStatus } from '../../helpers/auth';

// Tabs under the search box: URL part + text on the button.
const LINKS = [
    { path: 'now', label: 'Now' },
    { path: 'today', label: 'Today' },
    { path: 'tommorow', label: 'Tomorrow' },
    { path: 'weekly', label: 'Weekly' },
    { path: 'days-15', label: '15 Days' },
];

const Search = observer(({ navigetion }) => {
    const { placeStore, userinfo } = useContext(Context);
    const [message, setMessage] = useState('');
    const [locating, setLocating] = useState(false);

    // Hide the message after 4 seconds (and cancel the timer if we leave the page).
    useEffect(() => {
        if (!message) return undefined;
        const timer = setTimeout(() => setMessage(''), 4000);
        return () => clearTimeout(timer);
    }, [message]);

    const query = placeStore.place.trim();
    const disableSearch = query.length < 2;

    const handleSearch = (e) => {
        e.preventDefault();
        if (disableSearch) return;
        placeStore.setWeather(query);
        navigetion();
        placeStore.setPlace('');
    };

    // "My location": browser coordinates -> city name -> that city's weather
    const locateMe = () => {
        if (!navigator.geolocation) {
            return setMessage('Your browser cannot share its location');
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                const lat = coords.latitude.toFixed(4);
                const lon = coords.longitude.toFixed(4);
                let place = `${lat},${lon}`; // fallback if the name lookup fails
                try {
                    const res = await fetch(weatherUrls.reverseGeocode(lat, lon));
                    const [hit] = await res.json();
                    if (hit) place = `${hit.name},${hit.country}`;
                } catch (e) {
                    // keep the coordinates
                }
                setLocating(false);
                placeStore.setWeather(place);
                navigetion();
            },
            (error) => {
                setLocating(false);
                setMessage(error.code === error.PERMISSION_DENIED
                    ? 'Location access was blocked. Allow it in the browser to use this.'
                    : 'Could not get your location, try again');
            },
            { timeout: 10000, maximumAge: 10 * 60 * 1000 }
        );
    };

    const addPlace = () => {
        if (!(userinfo.isAuth || isLoggedIn())) {
            return setMessage('Sign in to save places');
        }
        fetch(`${API_URL}/places`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ place: placeStore.weather.toUpperCase() }),
        })
            .then((res) => (res.ok ? res.json() : rejectWithStatus(res)))
            .then(() => setMessage('Added to your places ✓'))
            .catch((error) => {
                if (error.status === 401) {
                    logout(userinfo);
                    return setMessage('Session expired, please sign in again');
                }
                setMessage(error.message || 'Something went wrong');
            });
    };

    return (
        <section className='card'>
            <form className='search-form' role='search' onSubmit={handleSearch}>
                <input
                    type='search'
                    aria-label='City'
                    value={placeStore.place}
                    onChange={(e) => placeStore.setPlace(e.target.value)}
                    placeholder='Search a city, e.g. Yerevan or London,UK'
                />
                <button type='submit' className='btn btn-primary' disabled={disableSearch}>
                    Search
                </button>
                <button
                    type='button'
                    className='btn btn-ghost'
                    onClick={locateMe}
                    disabled={locating}
                    title='Weather at my location'
                    aria-label='Weather at my location'
                >
                    📍 <span className='hide-mobile'>{locating ? 'Locating…' : 'My location'}</span>
                </button>
            </form>

            <div className='search-bottom'>
                <nav className='tabs' aria-label='Forecast range'>
                    {LINKS.map(({ path, label }) => (
                        // NavLink adds class "active" to the tab of the current page
                        <NavLink key={path} to={`/${path}/${placeStore.weather}`} className='tab'>
                            {label}
                        </NavLink>
                    ))}
                </nav>
                <button type='button' className='btn btn-ghost' onClick={addPlace}>
                    ☆ Save place
                </button>
            </div>

            {message && <p className='search-message' role='status'>{message}</p>}
        </section>
    );
});

export default Search;
