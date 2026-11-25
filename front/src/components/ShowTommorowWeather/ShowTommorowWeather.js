import React from 'react';
import HourlyDayPage from '../Forecast/HourlyDayPage';

const ShowTommorowWeather = () => <HourlyDayPage dayIndex={1} path='tommorow' titleKey='weather.tomorrowIn' />;

export default ShowTommorowWeather;
