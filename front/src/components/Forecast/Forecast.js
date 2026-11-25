import React from 'react';
import { NavLink } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { weatherIcon } from '../../helpers/constants/api';
import { formatDay, round, useTemp } from '../../helpers/format';
import { translateCondition, useT } from '../../i18n';

// A horizontal, scrollable row of hour cards.
// hours: [{ time: "15:00", icon: url, text: "Sunny", temp, feels, wind }]  (temps in °C, wind in km/h)
// observer(): re-renders when the user switches °C / °F or the language.
export const HourlyForecast = observer(({ hours }) => {
    const temp = useTemp();
    const { t, lang } = useT();
    return (
        <div className='hours'>
            {hours.map((h) => {
                const text = translateCondition(h.text, lang);
                return (
                    <div className='hour-card' key={h.time}>
                        <span className='hour-time'>{h.time}</span>
                        <img src={h.icon} alt={text || 'weather icon'} title={text} loading='lazy' />
                        <span className='hour-temp'>{temp(h.temp)}</span>
                        <span className='meta'>{t('weather.feels', { temp: temp(h.feels) })}</span>
                        <span className='meta'>{t('weather.windSpeed', { speed: round(h.wind), unit: t('weather.units.kmh') })}</span>
                    </div>
                );
            })}
        </div>
    );
});

// One day of the visualcrossing forecast; clicking opens its hourly page.
export const DayCard = observer(({ day, to }) => {
    const temp = useTemp();
    const { t, lang, locale } = useT();
    const { weekday, short } = formatDay(day.datetime, locale);
    const text = translateCondition(day.conditions, lang);
    return (
        <NavLink to={to} className='day-card'>
            <span className='day-name'>{weekday}</span>
            <span className='day-date'>{short}</span>
            <img src={weatherIcon(day.icon)} alt={text} title={text} loading='lazy' />
            <span className='day-temps'>
                <strong>{temp(day.tempmax)}</strong>
                <span>{temp(day.tempmin)}</span>
            </span>
            <span className='meta'>{t('weather.windSpeed', { speed: round(day.windspeed), unit: t('weather.units.kmh') })}</span>
        </NavLink>
    );
});
