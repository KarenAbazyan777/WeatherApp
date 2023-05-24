import React, { useContext, useEffect } from 'react';
import Context from '../..';
import { observer } from 'mobx-react-lite';
import Loading from '../Loading/Loading';
import { toJS } from 'mobx';
import './ShowWeeklyWeather.css'
import Search from '../Search/Search'
import {NavLink, useNavigate} from 'react-router-dom';


const ShowWeeklyWeather = observer(() => {
    
    const {currentWeather} = useContext(Context);
    const {placeStore} = useContext(Context);
    const navigate = useNavigate();

    useEffect(()=>{
        currentWeather.setError('');
        currentWeather.setIsLoading(true);
        fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/iconSet=icons1&${placeStore.weather}?key=KFF7D9WYZGS7DT7PR3XRCB49M&unitGroup=metric `)
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
            
            navigate(`/weekly/${placeStore.weather}`);
        }
    }

  

    if(toJS(currentWeather.currentWeather.length !== 0 && 'days' in toJS(currentWeather.currentWeather[toJS(currentWeather.currentWeather.length) - 1]))){ 
       
        const item = toJS(currentWeather.currentWeather[toJS(currentWeather.currentWeather.length) - 1]);
        if(item.days.length === 15){
            
            const days = item.days;
           
        return(
            <div className='appweekly'>
                <Search navigetion={navigetion}/>
                <div className='item'>
                <div className='placename'>
                    <h4>Weather in {item.resolvedAddress}</h4>  
                </div>
                <div className='weathertime'>
                    <div className='maininformation'>
                        {days.map((piece,index)=>{
                            if(index <= 6)  
                            return  (
                                
                                    <NavLink to={`/daily/${placeStore.weather}/${piece.datetime}`} className='Link' key={piece.datetime.substring(5,10)}>
                                        <h6 className='qqq'>{piece.datetime.substring(5,10)}</h6>
                                        <img src={require(`../../helpers/images/${piece.icon}.png`)}/> 
                                        <h6 className='qqq'>MAX {piece.tempmax} C</h6>
                                        <h6 className='qqq'>MIN {piece.tempmin} C</h6>
                                        <h6 className='qqq'>WIND{ piece.windspeed} Mph</h6>
                                    </NavLink>

                                    )
                        }
                        )}
                    </div>
                </div>
                </div> 
            </div>
        )
        } 
    }
})

export default ShowWeeklyWeather;