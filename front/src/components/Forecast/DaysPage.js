import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import Context from '../../context';
import WeatherPage from '../WeatherPage/WeatherPage';
import { DayCard } from './Forecast';
import { usePlace, useWeather } from '../../helpers/hooks/weatherHooks';
import { weatherUrls } from '../../helpers/constants/api';
import { getSky } from '../../helpers/format';
import { useT } from '../../i18n';

// Weekly and 15 Days pages: same request (shared via cache),
// they only differ in how many days they show.
// titleKey: 'weather.next7' or 'weather.next15'
const DaysPage = observer(({ count, path, titleKey }) => {
    const { placeStore } = useContext(Context);
    const navigate = useNavigate();
    const place = usePlace();
    const { t } = useT();
    const { isLoading, data: item } = useWeather(weatherUrls.timeline(place));

    const navigetion = () => navigate(`/${path}/${placeStore.weather}`);

    if (isLoading) {
        return <WeatherPage navigetion={navigetion} isLoading />;
    }

    if (!item || !item.days) {
        return null;
    }

    return (
        <WeatherPage navigetion={navigetion} sky={getSky((item.currentConditions || item.days[0]).icon)}>
            <section className='card'>
                <div className='section-head'>
                    <h1 className='section-title'>{t(titleKey)}</h1>
                    <p className='muted'>{item.resolvedAddress}</p>
                </div>
                <div className='days'>
                    {item.days.slice(0, count).map((day) => (
                        <DayCard
                            key={day.datetime}
                            day={day}
                            to={`/daily/${placeStore.weather}/${day.datetime}`}
                        />
                    ))}
                </div>
            </section>
        </WeatherPage>
    );
});

export default DaysPage;
