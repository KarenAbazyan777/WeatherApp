import React, { useContext, useEffect } from 'react';
import Context from '../..';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import '../../helpers/UI/ShowDailyWeather.css'
import Search from '../Search/Search'
import {useNavigate, useParams} from 'react-router-dom';
import Loading from '../Loading/Loading';

const ShowDailyWeather = observer(() => {
    
    const {currentWeather} = useContext(Context);
    const {placeStore} = useContext(Context);
    const params = useParams();
    const navigate = useNavigate();

    useEffect(()=>{
        currentWeather.setError('');
        currentWeather.setIsLoading(true);
        fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/iconSet=icons1&${placeStore.weather}/${params.date}?key=KFF7D9WYZGS7DT7PR3XRCB49M&unitGroup=metric `)
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
            navigate(`/daily/${placeStore.weather}/${params.date}`);
        }
    }


    if(params.date && toJS(currentWeather.currentWeather.length !== 0)){
        const item = toJS(currentWeather.currentWeather[toJS(currentWeather.currentWeather.length) - 1]);
        const days = item.days
        return (
            <div className='appdaily'>
                <Search navigetion={navigetion}></Search>
                <div className='item'>
                        <div className='placename'>
                            <h4>Weather in {item.resolvedAddress} 2023-{params.date}</h4>
                        </div>
                        <div className='weathertime'>
                            <div className='maininformation'>
                                {item.days[0].hours.map((piece,index)=>{
                                if(index % 3 === 0){
                                    return  (
                                           
                                            <div key={piece.datetime.substring(0,5)} className='unique'>
                                                <h4>{piece.datetime.substring(0,5)}</h4>
                                                <img src={require(`../../helpers/images/${piece.icon}.png`)}/>
                                                <h4>Temp {piece.temp} C</h4> 
                                                <h4>Wind {piece.windspeed} Mph</h4>
                                                <h4>feels {piece.feelslike} Mph</h4>
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

export default ShowDailyWeather;


