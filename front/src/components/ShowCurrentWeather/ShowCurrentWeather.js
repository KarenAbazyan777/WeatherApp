import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import Context from '../../context';
import WeatherPage from '../WeatherPage/WeatherPage';
import { usePlace, useWeather } from '../../helpers/hooks/weatherHooks';
import { weatherUrls } from '../../helpers/constants/api';
import { dateBuilder } from '../../helpers/constants/timezone';
import { getSky, useTemp, windDirection } from '../../helpers/format';

const ShowCurrentWeather = observer(() => {
    const { placeStore } = useContext(Context);
    const navigate = useNavigate();
    const place = usePlace();
    const t = useTemp();
    const { isLoading, data: item } = useWeather(weatherUrls.current(place));

    const navigetion = () => navigate(`/now/${placeStore.weather}`);

    if (isLoading) {
        return <WeatherPage navigetion={navigetion} isLoading />;
    }

    if (!item || !item.main) {
        return null;
    }

    const weather = item.weather[0];

    // openweathermap with units=metric: temperature °C, wind m/s, visibility m
    const stats = [
        { label: 'Feels like', value: t(item.main.feels_like) },
        { label: 'Low / High', value: `${t(item.main.temp_min)} / ${t(item.main.temp_max)}` },
        { label: 'Humidity', value: `${item.main.humidity}%` },
        { label: 'Wind', value: `${item.wind.speed} m/s ${windDirection(item.wind.deg)}` },
        { label: 'Pressure', value: `${item.main.pressure} hPa` },
        { label: 'Visibility', value: item.visibility != null ? `${(item.visibility / 1000).toFixed(1)} km` : '—' },
    ];

    return (
        <WeatherPage navigetion={navigetion} sky={getSky(weather.description, weather.icon.endsWith('n'))}>
            <section className='card'>
                <div className='hero-main'>
                    <div>
                        <h1 className='hero-city'>{item.name}, {item.sys.country}</h1>
                        <p className='muted'>Updated {dateBuilder(item.timezone, item.dt)}</p>
                    </div>
                    <div className='hero-temp'>
                        <img
                            src={`https://openweathermap.org/img/wn/${weather.icon}@4x.png`}
                            alt={weather.description}
                        />
                        <span className='temp-big'>{t(item.main.temp)}</span>
                    </div>
                    <p className='hero-desc'>{weather.description}</p>
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
