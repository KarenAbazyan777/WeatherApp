import React from 'react';
import DaysPage from '../Forecast/DaysPage';

const ShowWeeklyWeather = () => <DaysPage count={7} path='weekly' label='Next 7 days' />;

export default ShowWeeklyWeather;
