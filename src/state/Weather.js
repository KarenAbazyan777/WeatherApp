import { makeAutoObservable } from 'mobx';

// Loading / error state shared by the weather pages.
// The weather data itself lives in the cache in helpers/hooks/weatherHooks.js.
class Weather {
    isLoading = false;
    error = '';

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    setIsLoading(bool) {
        this.isLoading = bool;
    }

    setError(error) {
        this.error = error;
    }
}

export default Weather;
