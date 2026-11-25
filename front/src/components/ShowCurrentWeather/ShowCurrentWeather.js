import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import Context from '../../context';
import WeatherPage from '../WeatherPage/WeatherPage';
import { usePlace, useWeather } from '../../helpers/hooks/weatherHooks';
import { weatherUrls } from '../../helpers/constants/api';
import { dateBuilder } from '../../helpers/constants/timezone';
import { getSky, useTemp, windDirection } from '../../helpers/format';
import { translateCondition, useT } from '../../i18n';

const ShowCurrentWeather = observer(() => {
    const { placeStore } = useContext(Context);
    const navigate = useNavigate();
    const place = usePlace();
    const temp = useTemp();
    const { t, lang, locale } = useT();
    const { isLoading, data: item } = useWeather(weatherUrls.current(place));

    const navigetion = () => navigate(`/now/${placeStore.weather}`);

    if (isLoading) {
        return <WeatherPage navigetion={navigetion} isLoading />;
    }

    if (!item || !item.main) {
        return null;
    }

    const weather = item.weather[0];
    // "broken clouds" -> "Broken clouds" (first letter only: right for every language)
    const description = translateCondition(weather.description, lang);
    const descriptionText = description.charAt(0).toUpperCase() + description.slice(1);
    const units = (u) => t(`weather.units.${u}`);

    // openweathermap with units=metric: temperature °C, wind m/s, visibility m
    const stats = [
        { label: t('weather.feelsLike'), value: temp(item.main.feels_like) },
        { label: t('weather.lowHigh'), value: `${temp(item.main.temp_min)} / ${temp(item.main.temp_max)}` },
        { label: t('weather.humidity'), value: `${item.main.humidity}%` },
        { label: t('weather.wind'), value: `${item.wind.speed} ${units('ms')} ${windDirection(item.wind.deg, t('weather.dirs'))}` },
        { label: t('weather.pressure'), value: `${item.main.pressure} ${units('hpa')}` },
        { label: t('weather.visibility'), value: item.visibility != null ? `${(item.visibility / 1000).toFixed(1)} ${units('km')}` : '—' },
    ];

    return (
        // getSky gets the English text: the background works the same in every language
        <WeatherPage navigetion={navigetion} sky={getSky(weather.description, weather.icon.endsWith('n'))}>
            <section className='card'>
                <div className='hero-main'>
                    <div>
                        <h1 className='hero-city'>{item.name}, {item.sys.country}</h1>
                        <p className='muted'>{t('weather.updated', { date: dateBuilder(item.timezone, item.dt, locale) })}</p>
                    </div>
                    <div className='hero-temp'>
                        <img
                            src={`https://openweathermap.org/img/wn/${weather.icon}@4x.png`}
                            alt={descriptionText}
                        />
                        <span className='temp-big'>{temp(item.main.temp)}</span>
                    </div>
                    <p className='hero-desc'>{descriptionText}</p>
                </div>

                <div className='stats'>
                    {stats.map((s) => (
                        <div className='stat' key={s.label}>
                            <span className='stat-label'>{s.label}</span>
                            <span className='stat-value'>{s.value}</span>
                        </div>
                    ))}
                </div>
            </section>
        </WeatherPage>
    );
});

export default ShowCurrentWeather;
