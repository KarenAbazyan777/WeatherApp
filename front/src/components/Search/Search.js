import React, { useContext, useMemo, useState } from 'react';
import './Search.css'
import Context from '../..';
import {observer} from 'mobx-react-lite'
import {NavLink, useNavigate} from 'react-router-dom';
import { toJS } from 'mobx';

 
const Search = observer(({navigetion}) => {
    const {placeStore} = useContext(Context);
    const {userinfo} = useContext(Context);
    const [pleaseSignIn,setPleaseSignIn] = useState(false);
    
    const handleInput = (e)=>{
        placeStore.setPlace(e.target.value)
    }

    const handleButton = ()=>{
        placeStore.setWeather(placeStore.place);
        navigetion();
        placeStore.setPlace('');

    }

    const showSignIn = ()=>{
            const toRef = setTimeout(() => {
              setPleaseSignIn(false);
              clearTimeout(toRef);
            }, 4000);
          
    }

    const disableSearch = useMemo(()=>{
        const shortname = placeStore.place.split("").reverse().join("");
        return (!placeStore.place.includes(',') || !(shortname[2] === ',' || shortname[3] === ',') || !placeStore.place.length > 0); 
    },[placeStore.place])

    const addPlace = ()=>{
        if(!toJS(userinfo.isAuth || localStorage.getItem('email'))){
            setPleaseSignIn(true);
            return showSignIn()
        }
        const foo = {useremail:localStorage.getItem('email'), place:placeStore.weather.toUpperCase()};    
        fetch("http://localhost:3000/auth/places",{
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
           
           console.log(result);
        }).catch(error=>{
          
        })
    }

    return (
       <div className='headers'>
            <div className='search'>
                <input type='text' onChange={handleInput} value={placeStore.place} placeholder='Please enter a vaild place name example london,UK' ></input>
                <button disabled={disableSearch} onClick={handleButton}>SEARCH</button>
            </div>
            <div className='links'>
                <NavLink  
                     style=
                     {({ isActive }) => ({
                        color: isActive ? '#fff' : '#545e6f',
                        background: isActive ? '#0039a6' : '#f0f0f0',
                    })} 
                    to={`/now/${placeStore.weather}` } 
                    className='Link'>Now</NavLink>
                <NavLink 
                    style=
                    {({ isActive }) => ({
                        color: isActive ? '#fff' : '#545e6f',
                        background: isActive ? '#0039a6' : '#f0f0f0',
                    })} 
                    to={`/today/${placeStore.weather}`} 
                    className='Link'>Today</NavLink>
                <NavLink 
                    style=
                    {({ isActive }) => ({
                        color: isActive ? '#fff' : '#545e6f',
                        background: isActive ? '#0039a6' : '#f0f0f0',
                    })} 
                    to={`/tommorow/${placeStore.weather}`} 
                    className='Link'>Tommorow</NavLink>
                <NavLink 
                    style=
                    {({ isActive }) => ({
                        color: isActive ? '#fff' : '#545e6f',
                        background: isActive ? '#0039a6' : '#f0f0f0',
                    })} 
                    to={`/weekly/${placeStore.weather}`} 
                    className='Link'>Weekly</NavLink>
                <NavLink 
                    style=
                    {({ isActive }) => ({
                        color: isActive ? '#fff' : '#545e6f',
                        background: isActive ? '#0039a6' : '#f0f0f0',
                    })} 
                    to={`/days-15/${placeStore.weather}`} 
                    className='Link'>15Days</NavLink>                
            </div>
            {pleaseSignIn && <div><h1>PLEASE SIGN IN</h1></div>}
            <button className='addplace' onClick={addPlace}>ADD TO MY PLACES +</button>
       </div>

    );
})

export default Search;