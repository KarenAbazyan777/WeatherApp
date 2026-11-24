import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../../helpers/images/home.png';

// "What I used" section: group title + [technology, what it does here]
const STACK = [
    {
        title: 'Frontend',
        items: [
            ['React 18', 'components, hooks, lazy-loaded pages'],
            ['React Router 6', 'pages and shareable URLs like /now/Yerevan'],
            ['MobX', 'app state: search, loading, signed-in user'],
            ['Material UI', 'sign-in, sign-up and password forms'],
        ],
    },
    {
        title: 'Backend',
        items: [
            ['Node.js + Express', 'REST API for accounts and saved places'],
            ['MongoDB + Mongoose', 'users and their favourite places'],
            ['JWT + bcrypt', 'login tokens and hashed passwords'],
            ['Nodemailer', 'password reset links by email'],
        ],
    },
    {
        title: 'Weather data',
        items: [
            ['OpenWeatherMap', 'current weather'],
            ['WeatherAPI', 'hourly forecast for today and tomorrow'],
            ['Visual Crossing', '7 and 15-day forecast'],
        ],
    },
    {
        title: 'Under the hood',
        items: [
            ['Request caching', 'fewer API calls, instant tab switching'],
            ['Code splitting', 'about 58% smaller first download'],
            ['Helmet + rate limiting', 'security headers, brute-force protection'],
            ['Responsive CSS', 'one stylesheet, works on phones'],
        ],
    },
];

const Home = () => (
    <main className='home'>
        <section className='card home-card'>
            <img src={logo} alt='' />
            <h1 className='home-title'>Weather, anywhere.</h1>
            <p className='home-text'>
                Hi! I built this full-stack weather app to practise React and Node.js.
                Search any city to see the weather right now, hour by hour for today
                and tomorrow, or a forecast for the next 15 days. Create an account
                to save your favourite places.
            </p>
            <NavLink className='btn btn-primary' to='/now/london,UK'>
                Open weather →
            </NavLink>
        </section>

        <section className='card stack-card'>
            <h2 className='stack-title'>What I used</h2>
            <div className='stack'>
                {STACK.map((group) => (
                    <div className='stack-group' key={group.title}>
                        <h3>{group.title}</h3>
                        <ul>
                            {group.items.map(([name, purpose]) => (
                                <li key={name}>
                                    <strong>{name}</strong>
                                    <span>{purpose}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    </main>
);

export default Home;
