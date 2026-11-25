import React from 'react';
import DaysPage from '../Forecast/DaysPage';

const ShowWeeklyWeather = () => <DaysPage count={7} path='weekly' titleKey='weather.next7' />;

export default ShowWeeklyWeather;
