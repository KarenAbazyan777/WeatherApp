import React, { useContext, useEffect, useState } from 'react';
import './MyAccount.css'
import Context from '../..';
import { observer } from 'mobx-react-lite';
import Loading from '../Loading/Loading';
import { useNavigate } from 'react-router-dom';
import { toJS } from 'mobx';


const MyAccount = observer(() => {    

    const navigate = useNavigate();
    const {userinfo} = useContext(Context);
    const {currentWeather} = useContext(Context);
    const {placeStore} = useContext(Context);
    const [places,setPlaces] = useState([]);
    const [showPopup,setShowPopup] = useState(false);

    useEffect (()=>{
        const foo = {useremail:localStorage.getItem('email')};
        
        currentWeather.setError('');
        currentWeather.setIsLoading(true);
        fetch("http://localhost:3000/auth/myaccount",{
            method:"POST",
            headers: {
             "Accept": 'application/json',
             "Access-Control-Allow-Origin" : "*", 
             "Access-Control-Allow-Credentials" : true ,
             "Content-Type": "application/json;  charset=utf-8"
            },  
            body:JSON.stringify(foo)
        })
        .then(res=>{
            
            if(!res.ok){
                return res.json().then(err => Promise.reject(err));
              }
            return res.json();
        }).then(result=>{
          
            currentWeather.setIsLoading(false);
            userinfo.setAccountInfo(result);
           
        }).catch(error=>{
            console.log(error);
           currentWeather.setIsLoading(false);
            currentWeather.setError(error);
        })
        
    
   },[places])

   const deletePlace = (d,place)=>{
    
    const foo = {useremail:localStorage.getItem('email'),place};

    fetch("http://localhost:3000/auth/deletePlaces",{
            method:"POST",
            headers: {
             "Accept": 'application/json',
             "Access-Control-Allow-Origin" : "*", 
             "Access-Control-Allow-Credentials" : true ,
             "Content-Type": "application/json;  charset=utf-8"
            },  
            body:JSON.stringify(foo)
        })
        .then(res=>{
            
            if(!res.ok){
                return res.json().then(err => Promise.reject(err));
              }
            return res.json();
        }).then(result=>{
                setPlaces(Date.now()); 
        }).catch(error=>{
        
        })

   }
   
   
    const deleteAccount = ()=>{
    const foo = {useremail:localStorage.getItem('email')};

    fetch("http://localhost:3000/auth/deleteaccount",{
            method:"POST",
            headers: {
             "Accept": 'application/json',
             "Access-Control-Allow-Origin" : "*", 
             "Access-Control-Allow-Credentials" : true ,
             "Content-Type": "application/json;  charset=utf-8"
            },  
            body:JSON.stringify(foo)
        })
        .then(res=>{
            if(!res.ok){
                return res.json().then(err => Promise.reject(err));
              }
            return res.json();
        }).then(result=>{
            
            userinfo.setIsAuth(false);
            localStorage.removeItem('email');
            localStorage.removeItem('token');
            navigate('/')
        }).catch(error=>{
           
        })

   }

   console.log(userinfo);

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

   
    if(userinfo.accountInfo){
        const info =  userinfo.accountInfo;
        return(
            <div className='myaccount'>
                <div className='userinfo'>
                    <h1>MY ACCOUNT</h1>
                    <h4>NAME: {info.username}</h4>
                    <h4>LASTNAME: {info.userlname}</h4>
                    <h4>EMAIL: {info.useremail}</h4>
                    <h4>ID: {info._id}</h4> 
                    <h4>PLACES</h4>
                    {toJS(info.places.length) >=1 && <div className='placename'>
                        {toJS(info.places.map((place)=>{
                        return (
                            <div className='place'
                            key={place} 
                        >
                                <h6  onClick=
                            {()=>{
                                placeStore.setWeather(place);
                                navigate(`/now/${placeStore.weather}`);
                            }}>{place}</h6>
                                <button  onClick={(e)=>deletePlace(e,place)} className='deleteplace'>X</button>
                            </div>
                            )
                        }))}
                    </div>}
                    <button className='deleteaccount' onClick={()=>setShowPopup(true)}>DELETE ACCOUNT</button>
                    {showPopup && <div id="popup1" className="overlay">
	                                <div className="popup">
		                            <h2>ARE YOU SURE?</h2>
                                    <button onClick={deleteAccount}>YES</button>
                                    <button onClick={()=>setShowPopup(false)} className=''>NO</button>
	                                </div>
                    </div>}
                </div>
            </div>
        )
    }
});

export default MyAccount;