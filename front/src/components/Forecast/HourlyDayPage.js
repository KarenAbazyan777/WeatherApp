import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import Context from '../../context';
import WeatherPage from '../WeatherPage/WeatherPage';
import { HourlyForecast } from './Forecast';
import { usePlace, useWeather } from '../../helpers/hooks/weatherHooks';
import { weatherUrls } from '../../helpers/constants/api';
import { absoluteUrl, formatDay, getSky, useTemp } from '../../helpers/format';

// Today and Tomorrow pages: same request (2 days, shared via cache),
// they only differ in which day they show.
const HourlyDayPage = observer(({ dayIndex, path, label }) => {
    const { placeStore } = useContext(Context);
    const navigate = useNavigate();
    const place = usePlace();
    const t = useTemp();
    const { isLoading, data: item } = useWeather(weatherUrls.forecast(place, 2));

    const navigetion = () => navigate(`/${path}/${placeStore.weather}`);

    if (isLoading) {
        return <WeatherPage navigetion={navigetion} isLoading />;
    }

    const day = item && item.forecast && item.forecast.forecastday[dayIndex];
    if (!day) {
        return null;
    }

    // every 3rd hour: 00:00, 03:00, ... 21:00
    const hours = day.hour
        .filter((_, index) => index % 3 === 0)
        .map((h) => ({
            time: h.time.slice(11),
            icon: absoluteUrl(h.condition.icon),
            text: h.condition.text,
            temp: h.temp_c,
            feels: h.feelslike_c,
            wind: h.wind_kph,
        }));

    const { location } = item;

    return (
        <WeatherPage navigetion={navigetion} sky={getSky(day.day.condition.text)}>
            <section className='card'>
                <div className='section-head'>
                    <h1 className='section-title'>{label} in {location.name}</h1>
                    <p className='muted'>
                        {location.region ? `${location.region}, ` : ''}{location.country} · {formatDay(day.date).long}
                    </p>
                </div>
                <div className='summary'>
                    <span className='pill'>{day.day.condition.text}</span>
                    <span className='pill'>High {t(day.day.maxtemp_c)} · Low {t(day.day.mintemp_c)}</span>
                    <span className='pill'>Rain chance {day.day.daily_chance_of_rain}%</span>
                </div>
                <HourlyForecast hours={hours} />
            </section>
        </WeatherPage>
    );
});

export default HourlyDayPage;
