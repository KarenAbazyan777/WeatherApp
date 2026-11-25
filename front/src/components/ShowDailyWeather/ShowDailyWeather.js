import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import Context from '../../context';
import WeatherPage from '../WeatherPage/WeatherPage';
import { HourlyForecast } from '../Forecast/Forecast';
import { usePlace, useWeather } from '../../helpers/hooks/weatherHooks';
import { weatherUrls, weatherIcon } from '../../helpers/constants/api';
import { formatDay, getSky, round, useTemp } from '../../helpers/format';
import { translateCondition, useT } from '../../i18n';

const ShowDailyWeather = observer(() => {
    const { placeStore } = useContext(Context);
    const { date } = useParams();
    const navigate = useNavigate();
    const place = usePlace();
    const temp = useTemp();
    const { t, lang, locale } = useT();

    // Same request as Weekly / 15 Days: the day is picked from that data.
    const { isLoading, data: item } = useWeather(weatherUrls.timeline(place));

    const navigetion = () => navigate(`/daily/${placeStore.weather}/${date}`);

    if (isLoading) {
        return <WeatherPage navigetion={navigetion} isLoading />;
    }

    if (!item || !item.days) {
        return null;
    }

    const day = item.days.find((d) => d.datetime === date);
    const back = (
        <NavLink to={`/days-15/${placeStore.weather}`} className='btn btn-ghost back-link'>
            {t('weather.allDays')}
        </NavLink>
    );

    if (!day) {
        return (
            <WeatherPage navigetion={navigetion}>
                {back}
                <section className='card'>
                    <h1 className='section-title'>{t('weather.noForecast', { date })}</h1>
                    <p className='muted'>{t('weather.pickDay')}</p>
                </section>
            </WeatherPage>
        );
    }

    // every 3rd hour; visualcrossing with unitGroup=metric: °C and km/h
    const hours = day.hours
        .filter((_, index) => index % 3 === 0)
        .map((h) => ({
            time: h.datetime.slice(0, 5),
            icon: weatherIcon(h.icon),
            text: h.conditions,
            temp: h.temp,
            feels: h.feelslike,
            wind: h.windspeed,
        }));

    return (
        <WeatherPage navigetion={navigetion} sky={getSky(day.icon)}>
            {back}
            <section className='card'>
                <div className='section-head'>
                    <h1 className='section-title'>{formatDay(day.datetime, locale).long}</h1>
                    <p className='muted'>{item.resolvedAddress}</p>
                </div>
                <div className='summary'>
                    <span className='pill'>{translateCondition(day.conditions, lang)}</span>
                    <span className='pill'>{t('weather.highLow', { high: temp(day.tempmax), low: temp(day.tempmin) })}</span>
                    <span className='pill'>{t('weather.rainChance', { percent: round(day.precipprob || 0) })}</span>
                </div>
                <HourlyForecast hours={hours} />
            </section>
        </WeatherPage>
    );
});

export default ShowDailyWeather;
