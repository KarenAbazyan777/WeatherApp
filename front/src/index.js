import ReactDOM from 'react-dom/client';
import { configure } from 'mobx';
import './index.css';
import App from './App';
import Context from './context';
import PlaceStore from './state/placeStore';
import Weather from './state/Weather';
import UserInfo from './state/UserInfo';
import Settings from './state/Settings';
import { wakeUpBackend } from './helpers/constants/api';

configure({
    useProxies: 'never',
});

// Created once, before the first render, so the saved theme is applied
// immediately (no flash of the light theme on dark-mode visits).
const stores = {
    placeStore: new PlaceStore(),
    currentWeather: new Weather(),
    userinfo: new UserInfo(),
    settings: new Settings(),
};

// Start waking the backend now, while the user is still looking at the weather.
wakeUpBackend();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Context.Provider value={stores}>
        <App />
    </Context.Provider>
);
