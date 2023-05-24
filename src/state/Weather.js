import { action, makeObservable, observable } from 'mobx';
import React, { Component } from 'react';

class Weather extends Component {
    constructor(){
        super();
        this.isLoading = false;
        this.error = '';
        this.currentWeather = [];
        makeObservable(this,{
            isLoading:observable,
            currentWeather:observable,
            error:observable,
            
            setIsLoading:action,
            setError:action,
            setCurrentWeather:action
        },{deep:true});
    }
    setIsLoading(bool){
        this.isLoading = bool;
    }

    getIsLoading(){
        return this.isLoading;
    }

    setError(error){
        this.error = error;
    }

    getError(){
        return this.error;
    }

    setCurrentWeather(weather){
        this.currentWeather.push(weather);
    }

    getCurrentWeather(){
        return this.currentWeather;
    }

    
}

export default Weather;