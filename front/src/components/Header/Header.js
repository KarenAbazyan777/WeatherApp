import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import logo from '../../helpers/images/home.png';
import Context from '../../context';
import { isLoggedIn, logout } from '../../helpers/auth';
import { LANGUAGES, useT } from '../../i18n';

const Header = observer(() => {
    const { userinfo, settings } = useContext(Context);
    const { t } = useT();
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
                {/* Language picker: EN / RU / ՀՅ */}
                <select
                    className='lang-select'
                    value={settings.lang}
                    onChange={(e) => settings.setLang(e.target.value)}
                    aria-label={t('header.language')}
                    title={t('header.language')}
                >
                    {LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code} title={l.name}>{l.label}</option>
                    ))}
                </select>

                {/* °C | °F switch: the active unit is highlighted */}
                <button
                    type='button'
                    className='unit-toggle'
                    onClick={settings.toggleUnit}
                    aria-label={settings.unit === 'C' ? t('header.toFahrenheit') : t('header.toCelsius')}
                >
                    <span className={settings.unit === 'C' ? 'on' : ''}>°C</span>
                    <span className={settings.unit === 'F' ? 'on' : ''}>°F</span>
                </button>

                <button
                    type='button'
                    className='btn btn-ghost icon-btn'
                    onClick={settings.toggleTheme}
                    aria-label={settings.theme === 'dark' ? t('header.toLight') : t('header.toDark')}
                    title={settings.theme === 'dark' ? t('header.toLight') : t('header.toDark')}
                >
                    {settings.theme === 'dark' ? '☀️' : '🌙'}
                </button>

                {/* On phones only one account button fits: Sign up is reachable from the
                    Sign in page, and Log out is also on the My account page. */}
                {loggedIn ? (
                    <>
                        <NavLink to='/myaccount' className='btn btn-ghost'>{t('common.myAccount')}</NavLink>
                        <button type='button' className='btn btn-primary hide-mobile' onClick={handleLogout}>{t('common.logOut')}</button>
                    </>
                ) : (
                    <>
                        <NavLink to='/signin' className='btn btn-ghost'>{t('common.signIn')}</NavLink>
                        <NavLink to='/signup' className='btn btn-primary hide-mobile'>{t('common.signUp')}</NavLink>
                    </>
                )}
            </nav>
        </header>
    );
});

export default Header;
