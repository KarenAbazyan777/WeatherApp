import React from 'react';
import { NavLink } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import logo from '../../helpers/images/home.png';
import { useT } from '../../i18n';

// "What I used" section: group key + [technology name, key of its purpose text].
// Technology names stay in English (they are product names); purposes are translated.
const STACK = [
    {
        group: 'frontend',
        items: [['React 18', 'react'], ['React Router 6', 'router'], ['MobX', 'mobx'], ['Material UI', 'mui']],
    },
    {
        group: 'backend',
        items: [['Node.js + Express', 'express'], ['MongoDB + Mongoose', 'mongo'], ['JWT + bcrypt', 'jwt'], ['Nodemailer + Brevo', 'mail']],
    },
    {
        group: 'data',
        items: [['OpenWeatherMap', 'owm'], ['WeatherAPI', 'weatherapi'], ['Visual Crossing', 'vc']],
    },
    {
        group: 'hood',
        items: [['home.techCache', 'cache'], ['home.techSplit', 'split'], ['home.techSecurity', 'security'], ['home.techI18n', 'i18n']],
    },
];

const Home = observer(() => {
    const { t } = useT();
    // Names that start with "home." are translation keys, the rest are product names
    const name = (n) => (n.startsWith('home.') ? t(n) : n);

    return (
        <main className='home'>
            <section className='card home-card'>
                <img src={logo} alt='' />
                <h1 className='home-title'>{t('home.title')}</h1>
                <p className='home-text'>{t('home.text')}</p>
                <NavLink className='btn btn-primary' to='/now/london,UK'>
                    {t('home.open')}
                </NavLink>
            </section>

            <section className='card stack-card'>
                <h2 className='stack-title'>{t('home.whatIUsed')}</h2>
                <div className='stack'>
                    {STACK.map(({ group, items }) => (
                        <div className='stack-group' key={group}>
                            <h3>{t(`home.groups.${group}`)}</h3>
                            <ul>
                                {items.map(([tech, purpose]) => (
                                    <li key={tech}>
                                        <strong>{name(tech)}</strong>
                                        <span>{t(`home.purpose.${purpose}`)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
});

export default Home;
