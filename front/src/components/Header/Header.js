import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import logo from '../../helpers/images/home.png';
import Context from '../../context';
import { isLoggedIn, logout } from '../../helpers/auth';

const Header = observer(() => {
    const { userinfo, settings } = useContext(Context);
    const navigate = useNavigate();
    const loggedIn = userinfo.isAuth || isLoggedIn();

    const handleLogout = () => {
        logout(userinfo);
        navigate('/');
    };

    return (
        <header className='app-header'>
            <NavLink to='/' className='brand'>
                <img src={logo} alt='' />
                <span>Weather</span>
            </NavLink>

            <nav className='nav'>
                {/* °C | °F switch: the active unit is highlighted */}
                <button
                    type='button'
                    className='unit-toggle'
                    onClick={settings.toggleUnit}
                    aria-label={`Show temperatures in ${settings.unit === 'C' ? 'Fahrenheit' : 'Celsius'}`}
                >
                    <span className={settings.unit === 'C' ? 'on' : ''}>°C</span>
                    <span className={settings.unit === 'F' ? 'on' : ''}>°F</span>
                </button>

                <button
                    type='button'
                    className='btn btn-ghost icon-btn'
                    onClick={settings.toggleTheme}
                    aria-label={settings.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    title={settings.theme === 'dark' ? 'Light mode' : 'Dark mode'}
                >
                    {settings.theme === 'dark' ? '☀️' : '🌙'}
                </button>

                {loggedIn ? (
                    <>
                        <NavLink to='/myaccount' className='btn btn-ghost'>My account</NavLink>
                        <button type='button' className='btn btn-primary' onClick={handleLogout}>Log out</button>
                    </>
                ) : (
                    <>
                        <NavLink to='/signin' className='btn btn-ghost'>Sign in</NavLink>
                        <NavLink to='/signup' className='btn btn-primary'>Sign up</NavLink>
                    </>
                )}
            </nav>
        </header>
    );
});

export default Header;
