import React, { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { NavLink } from 'react-router-dom';
import Context from '../../context';
import { API_URL, authHeaders, weatherUrls } from '../../helpers/constants/api';
import { isLoggedIn, logout, rejectWithStatus } from '../../helpers/auth';
import { useCitySuggestions } from '../../helpers/hooks/useCitySuggestions';

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

    // City suggestions under the input
    const suggestions = useCitySuggestions(placeStore.place);
    const [open, setOpen] = useState(false);       // is the list shown
    const [active, setActive] = useState(-1);      // highlighted row (keyboard), -1 = none
    const showList = open && suggestions.length > 0;

    // New results -> nothing highlighted yet
    useEffect(() => setActive(-1), [suggestions]);

    const goTo = (place) => {
        setOpen(false);
        placeStore.setWeather(place);
        navigetion();
        placeStore.setPlace('');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // Enter on a highlighted suggestion opens that city
        if (showList && active >= 0) {
            goTo(suggestions[active].place);
            return;
        }
        if (disableSearch) return;
        goTo(query);
    };

    // ↓ ↑ move through the list, Esc closes it (Enter is handled by the form)
    const handleKeyDown = (e) => {
        if (!showList) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((i) => (i + 1) % suggestions.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
        } else if (e.key === 'Escape') {
            setOpen(false);
        }
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
        <section className='card search-card'>
            <form className='search-form' role='search' onSubmit={handleSearch}>
                <div className='search-box'>
                    <input
                        type='search'
                        role='combobox'
                        aria-label='City'
                        aria-autocomplete='list'
                        aria-expanded={showList}
                        aria-controls='city-suggestions'
                        aria-activedescendant={active >= 0 ? `city-${suggestions[active].id}` : undefined}
                        autoComplete='off'
                        value={placeStore.place}
                        onChange={(e) => {
                            placeStore.setPlace(e.target.value);
                            setOpen(true);
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setOpen(true)}
                        onBlur={() => setOpen(false)}
                        placeholder='Search a city, e.g. Yerevan or London,UK'
                    />

                    {showList && (
                        <ul className='suggestions' id='city-suggestions' role='listbox'>
                            {suggestions.map((s, i) => (
                                <li
                                    key={s.id}
                                    id={`city-${s.id}`}
                                    role='option'
                                    aria-selected={i === active}
                                    className={i === active ? 'active' : ''}
                                    // mousedown (not click): fires before the input loses focus and closes the list
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        goTo(s.place);
                                    }}
                                    onMouseEnter={() => setActive(i)}
                                >
                                    <span className='suggestion-country' aria-hidden='true'>{s.country}</span>
                                    <span className='suggestion-text'>
                                        <strong>{s.name}</strong>
                                        <span className='muted'>{s.details}</span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
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
