import React, { useContext, useEffect } from 'react';
import Context from '../..';
import { observer } from 'mobx-react-lite';
import Loading from '../Loading/Loading';
import { toJS } from 'mobx';
import './ShowCurrentWeather.css'
import Search from '../Search/Search'
import {useNavigate} from 'react-router-dom';
import { dateBuilder } from '../../helpers/constants/timezone';

const ShowCurrentWeather = observer(() => {
    
    const {currentWeather} = useContext(Context);
    const {placeStore} = useContext(Context);
    const navigate = useNavigate();

    
    useEffect(()=>{
        currentWeather.setError('');
        currentWeather.setIsLoading(true);
        fetch(`http://api.openweathermap.org/data/2.5/weather?q=${placeStore.weather}&units=metric&appid=6a9d75be766ef0d5f67b263d9ec169f4`)
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
            
            navigate(`/now/${placeStore.weather}`);
        }
    }

   
   
    if(toJS(currentWeather.currentWeather.length !== 0 && 'coord' in toJS(currentWeather.currentWeather[toJS(currentWeather.currentWeather.length) - 1]))){ 
        
        const item = toJS(currentWeather.currentWeather[toJS(currentWeather.currentWeather.length) - 1]);
        return(
            <div className='appnow'>
                <Search navigetion={navigetion}/>
            <div className='item'>
                <div className='placename'>
                    <h1>Weather in {item.name},</h1>
                    <h1>{item.sys.country}</h1>
                </div>
                <div  className='maininformation'>
                    <img src={` https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}/>
                    <h2>{item.main.temp} C</h2> 
                </div>
                <div className='weathertext'>
                    <h1>{item.weather[0].description}</h1>
                    <h3>Updated as of  AM {dateBuilder(item.timezone)}</h3>
                </div>
                <div className='otherinformation'>
                    <h3>Feels Like {item.main.feels_like} C,      Wind {item.wind.speed} km/h,   Wind degree {item.wind.deg}</h3>
                </div>
                <div className='airinformation'>
                    <h3>Humidity {item.main.humidity}%,   pressure {item.main.pressure} hHa,    Visibility {item.visibility} m</h3>
                </div>
            </div> 
            </div>
        )
        
    }
})

export default ShowCurrentWeather;