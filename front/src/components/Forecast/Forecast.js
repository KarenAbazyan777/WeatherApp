import React from 'react';
import { NavLink } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { weatherIcon } from '../../helpers/constants/api';
import { formatDay, round, useTemp } from '../../helpers/format';

// A horizontal, scrollable row of hour cards.
// hours: [{ time: "15:00", icon: url, text: "Sunny", temp, feels, wind }]  (temps in °C)
// observer(): re-renders when the user switches °C / °F.
export const HourlyForecast = observer(({ hours }) => {
    const t = useTemp();
    return (
        <div className='hours'>
            {hours.map((h) => (
                <div className='hour-card' key={h.time}>
                    <span className='hour-time'>{h.time}</span>
                    <img src={h.icon} alt={h.text || 'weather icon'} title={h.text} loading='lazy' />
                    <span className='hour-temp'>{t(h.temp)}</span>
                    <span className='meta'>Feels {t(h.feels)}</span>
                    <span className='meta'>Wind {round(h.wind)} km/h</span>
                </div>
            ))}
        </div>
    );
});

// One day of the visualcrossing forecast; clicking opens its hourly page.
export const DayCard = observer(({ day, to }) => {
    const t = useTemp();
    const { weekday, short } = formatDay(day.datetime);
    return (
        <NavLink to={to} className='day-card'>
            <span className='day-name'>{weekday}</span>
            <span className='day-date'>{short}</span>
            <img src={weatherIcon(day.icon)} alt={day.conditions} title={day.conditions} loading='lazy' />
            <span className='day-temps'>
                <strong>{t(day.tempmax)}</strong>
                <span>{t(day.tempmin)}</span>
            </span>
            <span className='meta'>Wind {round(day.windspeed)} km/h</span>
        </NavLink>
    );
});
