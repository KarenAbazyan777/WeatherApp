import { makeAutoObservable } from 'mobx';

class PlaceStore {
    place = '';            // text typed in the search box
    weather = 'london,UK'; // city whose weather is shown

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    setPlace(place) {
        this.place = place;
    }

    setWeather(weather) {
        this.weather = weather;
    }
}

export default PlaceStore;
