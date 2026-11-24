import { createContext } from 'react';

// Holds the MobX stores ({ placeStore, currentWeather, userinfo }).
// Lives in its own file so components don't import index.js (which imports them).
const Context = createContext(null);

export default Context;
