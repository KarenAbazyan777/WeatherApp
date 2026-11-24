import React, { useEffect } from 'react';
import Search from '../Search/Search';
import Loading from '../Loading/Loading';

// Common frame of every weather page: search card on top,
// then either the spinner or the page's own content.
// `sky` ("rain", "night", ...) switches the page background to match the weather.
const WeatherPage = ({ navigetion, isLoading, sky, children }) => {
    // Keep the last sky while the next city loads (no flash), update when it arrives.
    useEffect(() => {
        if (sky) document.body.dataset.sky = sky;
    }, [sky]);

    // Leaving the weather pages (Home, forms, account): back to the default sky.
    useEffect(() => () => {
        delete document.body.dataset.sky;
    }, []);

    return (
        <main className='page'>
            <Search navigetion={navigetion} />
            {isLoading ? <Loading /> : children}
        </main>
    );
};

export default WeatherPage;
