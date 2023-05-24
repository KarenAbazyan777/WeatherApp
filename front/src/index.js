import ReactDOM from 'react-dom/client';
import App from './App';
import { createContext } from 'react';
import PlaceStore from './state/placeStore';
import Weather from './state/Weather';
import { configure } from 'mobx';
import UserInfo from './state/UserInfo';

configure ({
    useProxies:'never'
})

const  Context = createContext(null);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
 
    <Context.Provider value={{
        placeStore:new PlaceStore(),
        currentWeather:new Weather(),
        userinfo:new UserInfo()
    }}>
        <App />
    </Context.Provider>
  
);

export default Context

