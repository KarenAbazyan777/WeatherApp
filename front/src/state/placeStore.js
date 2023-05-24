import {action, makeObservable, observable} from 'mobx'
import React from 'react';

class PlaceStore extends React.Component {
    
    constructor(){
        super();
        this.place = '';
        this.weather = 'london,UK';
        makeObservable(this,{
            place:observable,
            weather:observable,
            
            setPlace:action,
            setWeather:action
        },{deep:true});
    }

    setPlace(place){
        this.place = place;
    }

    getPlace(){
        return this.place;
    }

     setWeather(weather){
        this.weather = weather;
    }

    getWeather(){
        return this.weather;
    } 
}

export default PlaceStore;