import React, { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { NavLink } from 'react-router-dom';
import Context from '../../context';
import { API_URL, authHeaders, weatherUrls } from '../../helpers/constants/api';
import { isLoggedIn, logout, rejectWithStatus } from '../../helpers/auth';
import { useCitySuggestions } from '../../helpers/hooks/useCitySuggestions';
import { useT } from '../../i18n';

// Tabs under the search box: URL part + translation key of the text on the button.
const LINKS = [
    { path: 'now', label: 'search.tabs.now' },
    { path: 'today', label: 'search.tabs.today' },
    { path: 'tommorow', label: 'search.tabs.tomorrow' },
    { path: 'weekly', label: 'search.tabs.weekly' },
    { path: 'days-15', label: 'search.tabs.days15' },
];

const Search = observer(({ navigetion }) => {
    const { placeStore, userinfo } = useContext(Context);
    const { t } = useT();
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
    // The highlighted suggestion, or null. `active` can briefly point past the end
    // of the list (e.g. right after picking a city the list becomes empty), so
    // never read suggestions[active] without this check.
    const activeItem = showList && active >= 0 && active < suggestions.length ? suggestions[active] : null;

    // New results -> nothing highlighted yet
    useEffect(() => setActive(-1), [suggestions]);

    const goTo = (place) => {
        setOpen(false);
        setActive(-1);
        placeStore.setWeather(place);
        navigetion();
        placeStore.setPlace('');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // Enter on a highlighted suggestion opens that city
        if (activeItem) {
            goTo(activeItem.place);
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
            return setMessage(t('search.noGeo'));
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
                    ? t('search.geoBlocked')
                    : t('search.geoFailed'));
            },
            { timeout: 10000, maximumAge: 10 * 60 * 1000 }
        );
    };

    const addPlace = () => {
        if (!(userinfo.isAuth || isLoggedIn())) {
            return setMessage(t('search.signInToSave'));
        }
        fetch(`${API_URL}/places`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ place: placeStore.weather.toUpperCase() }),
        })
            .then((res) => (res.ok ? res.json() : rejectWithStatus(res)))
            .then(() => setMessage(t('search.added')))
            .catch((error) => {
                if (error.status === 401) {
                    logout(userinfo);
                    return setMessage(t('search.sessionExpired'));
                }
                setMessage(error.status === 409 ? t('search.added') : t('common.somethingWrong'));
            });
    };

    return (
        <section className='card search-card'>
            <form className='search-form' role='search' onSubmit={handleSearch}>
                <div className='search-box'>
                    <input
                        type='search'
                        role='combobox'
                        aria-label={t('search.city')}
                        aria-autocomplete='list'
                        aria-expanded={showList}
                        aria-controls='city-suggestions'
                        aria-activedescendant={activeItem ? `city-${activeItem.id}` : undefined}
                        autoComplete='off'
                        value={placeStore.place}
                        onChange={(e) => {
                            placeStore.setPlace(e.target.value);
                            setOpen(true);
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setOpen(true)}
                        onBlur={() => setOpen(false)}
                        placeholder={t('search.placeholder')}
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
                    {t('search.search')}
                </button>
                <button
                    type='button'
                    className='btn btn-ghost'
                    onClick={locateMe}
                    disabled={locating}
                    title={t('search.locationTitle')}
                    aria-label={t('search.locationTitle')}
                >
                    📍 <span className='hide-mobile'>{locating ? t('search.locating') : t('search.myLocation')}</span>
                </button>
            </form>

            <div className='search-bottom'>
                <nav className='tabs' aria-label={t('search.rangeLabel')}>
                    {LINKS.map(({ path, label }) => (
                        // NavLink adds class "active" to the tab of the current page
                        <NavLink key={path} to={`/${path}/${placeStore.weather}`} className='tab'>
                            {t(label)}
                        </NavLink>
                    ))}
                </nav>
                <button type='button' className='btn btn-ghost' onClick={addPlace}>
                    {t('search.savePlace')}
                </button>
            </div>

            {message && <p className='search-message' role='status'>{message}</p>}
        </section>
    );
});

export default Search;
