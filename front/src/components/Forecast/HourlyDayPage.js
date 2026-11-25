import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import Context from '../../context';
import WeatherPage from '../WeatherPage/WeatherPage';
import { HourlyForecast } from './Forecast';
import { usePlace, useWeather } from '../../helpers/hooks/weatherHooks';
import { weatherUrls } from '../../helpers/constants/api';
import { absoluteUrl, formatDay, getSky, useTemp } from '../../helpers/format';
import { translateCondition, useT } from '../../i18n';

// Today and Tomorrow pages: same request (2 days, shared via cache),
// they only differ in which day they show.
// titleKey: 'weather.todayIn' or 'weather.tomorrowIn'
const HourlyDayPage = observer(({ dayIndex, path, titleKey }) => {
    const { placeStore } = useContext(Context);
    const navigate = useNavigate();
    const place = usePlace();
    const temp = useTemp();
    const { t, lang, locale } = useT();
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
        // getSky gets the English text: the background works the same in every language
        <WeatherPage navigetion={navigetion} sky={getSky(day.day.condition.text)}>
            <section className='card'>
                <div className='section-head'>
                    <h1 className='section-title'>{t(titleKey, { city: location.name })}</h1>
                    <p className='muted'>
                        {location.region ? `${location.region}, ` : ''}{location.country} · {formatDay(day.date, locale).long}
                    </p>
                </div>
                <div className='summary'>
                    <span className='pill'>{translateCondition(day.day.condition.text, lang)}</span>
                    <span className='pill'>{t('weather.highLow', { high: temp(day.day.maxtemp_c), low: temp(day.day.mintemp_c) })}</span>
                    <span className='pill'>{t('weather.rainChance', { percent: day.day.daily_chance_of_rain })}</span>
                </div>
                <HourlyForecast hours={hours} />
            </section>
        </WeatherPage>
    );
});

export default HourlyDayPage;
