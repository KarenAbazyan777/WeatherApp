import React from "react"
import ShowCurrentWeather from './components/ShowCurrentWeather/ShowCurrentWeather';
import {BrowserRouter,Route,Routes} from 'react-router-dom'
import NotFound from './components/NotFound/NotFound';
import ShowTodayWeather from './components/ShowTodayWeather/ShowTodayWeather';
import ShowMonthWeather from './components/Show15DaysWeather/Show15daysWeather';
import ShowTommorowWeather from './components/ShowTommorowWeather/ShowTommorowWeather';
import ShowWeeklyWeather from './components/ShowWeeklyWeather/ShowWeeklyWeather.js';
import ShowDailyWeather from "./components/ShowDailyWeather/ShowDailyWeather";
import Home from "./components/Home/Home";
import Header from "./components/Header/Header";
import SignUp from "./components/SignUp/SignUp";
import SignIn from "./components/SignIn/SignIn";
import MyAccount from "./components/MyAccount/MyAccount";
import Resetpassword from "./components/resetpassword/resetpassword";

const  App = ()=> {

  return (
      <BrowserRouter>
         <Header></Header>
         <div >
            <Routes>
                <Route exact path ={'/myaccount'} element={ <MyAccount />}/>  
                <Route exact path ={'/signin'} element={ <SignIn/>}/>  
                <Route exact path ={'/signup'} element={ <SignUp/>}/>  
                <Route exact path ={'/'} element={ <Home />}/>
                <Route exact path ={'/now/:placeName'} element={ <ShowCurrentWeather />}/>
                <Route exact path ={'/today/:placeName'} element={ <ShowTodayWeather />}/>
                <Route exact path ={'/tommorow/:placeName'} element={ <ShowTommorowWeather />}/>
                <Route exact path ={'/weekly/:placeName'} element={ <ShowWeeklyWeather />}/>
                <Route exact path ={'/days-15/:placeName'} element={ <ShowMonthWeather />}/>
                <Route exact path ={'/daily/:placeName/:date'} element={ <ShowDailyWeather />}/>
                <Route exact path = {'/NotFound'} element={<NotFound/>}/>
                <Route exact path = '*' element={<NotFound/>}/>
                <Route exact path = {'/resetpassword'} element={<Resetpassword/>}/>
            </Routes>
        </div>
      </BrowserRouter>
  );
}

export default App;
