import React from 'react';
import './Home.css'
import { NavLink } from 'react-router-dom';

const Home = () => {
    return (
        <div className='home'>
            <h2>Hi. This is my weather web application. Which this app you can see weather in any place of our planet for current time, today ,tomorrow, weekly and 15days. In this project i use react as a framework and  mobx as a state managments</h2>
            <NavLink className="LinkWeather" to={'/now/london,UK'}>Open Weather--{'>'}</NavLink>
        </div>
    );
};

export default Home;