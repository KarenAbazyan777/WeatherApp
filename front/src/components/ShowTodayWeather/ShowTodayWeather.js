import React, { useContext, useEffect } from 'react';
import Context from '../..';
import { observer } from 'mobx-react-lite';
import Loading from '../Loading/Loading';
import { toJS } from 'mobx';
import '../../helpers/UI/ShowDailyWeather.css'
import Search from '../Search/Search'
import {useNavigate} from 'react-router-dom';

const ShowTodayWeather = observer(() => {
    
    const {currentWeather} = useContext(Context);
    const {placeStore} = useContext(Context);
    const navigate = useNavigate();

    useEffect(()=>{
        currentWeather.setError('');
        currentWeather.setIsLoading(true);
        fetch(` http://api.weatherapi.com/v1/forecast.json?key=1eea7f8c85344cf1862213549232004&q=${placeStore.weather}&days=1`)
        .then(res=>{
            if(!res.ok){
                throw new Error();
            }
            return res.json();
        }).then(result=>{
            currentWeather.setIsLoading(false);
            currentWeather.setCurrentWeather(result);
        }).catch(error=>{
           
            currentWeather.setIsLoading(false);
            currentWeather.setError(error);
        })
        
    },[placeStore.weather])


    if(currentWeather.error){
        placeStore.setWeather('london,UK');
        navigate('/NotFound');
    }

    if(currentWeather.isLoading){
        return (
                <Loading>

                </Loading>
                )
    }

   
    const navigetion = ()=>{
        if(!currentWeather.error){
            
            navigate(`/today/${placeStore.weather}`);
        }
    }

   
   
    if(toJS(currentWeather.currentWeather.length !== 0 && 'forecast' in toJS(currentWeather.currentWeather[toJS(currentWeather.currentWeather.length) - 1]))){ 
        const item = toJS(currentWeather.currentWeather[toJS(currentWeather.currentWeather.length) - 1]);
        const hour = item.forecast.forecastday[0].hour;
      
        return(
            <div className='appdaily'>
                <Search navigetion={navigetion}/>
                <div className='item'>
                    <div className='placename'>
                        <h4>Weather in {item.location.name},</h4>
                        <h4>{item.location.region},</h4>
                        <h4>{item.location.country} today {item.forecast.forecastday[0].date}</h4>
                    </div>
                    <div className='weathertime'>
                        <div className='maininformation'>
                            {hour.map((piece,index)=>{
                            if(index % 3 === 0){
                                return  (
                                       
                                        <div key={piece.time.substring(11)} className='unique'>
                                            <h4>{piece.time.substring(11)}</h4>
                                            <img src={`${piece.condition.icon}`}/>
                                            <h4>Temp {piece.temp_c} C</h4> 
                                            <h4>Wind {piece.wind_mph} Mph</h4>
                                            <h4>feels {piece.feelslike_c} C</h4>
                                        </div>
                                    
                                        )
                            }
                            })}
                        </div>
                    </div>
                </div> 
            </div>
        )
        
    }
})

export default ShowTodayWeather;


