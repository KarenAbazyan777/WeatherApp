import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from './components/Header/Header';
import Home from './components/Home/Home';
import Loading from './components/Loading/Loading';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

// Every page below is downloaded only when the user opens it.
// The form pages carry MUI (the biggest library), so visitors who only
// check the weather never download it.
const ShowCurrentWeather = lazy(() => import('./components/ShowCurrentWeather/ShowCurrentWeather'));
const ShowTodayWeather = lazy(() => import('./components/ShowTodayWeather/ShowTodayWeather'));
const ShowTommorowWeather = lazy(() => import('./components/ShowTommorowWeather/ShowTommorowWeather'));
const ShowWeeklyWeather = lazy(() => import('./components/ShowWeeklyWeather/ShowWeeklyWeather'));
const Show15DaysWeather = lazy(() => import('./components/Show15DaysWeather/Show15daysWeather'));
const ShowDailyWeather = lazy(() => import('./components/ShowDailyWeather/ShowDailyWeather'));
const SignIn = lazy(() => import('./components/SignIn/SignIn'));
const SignUp = lazy(() => import('./components/SignUp/SignUp'));
const MyAccount = lazy(() => import('./components/MyAccount/MyAccount'));
const ForgotPassword = lazy(() => import('./components/resetpassword/ForgotPassword'));
const Resetpassword = lazy(() => import('./components/resetpassword/resetpassword'));
const VerifyEmail = lazy(() => import('./components/VerifyEmail/VerifyEmail'));
const NotFound = lazy(() => import('./components/NotFound/NotFound'));

const App = () => (
    <BrowserRouter>
        <Header />
        <div>
            {/* A crash in a page shows a message instead of a blank screen */}
            <ErrorBoundary>
            {/* Shown for the moment a page's file is downloading */}
            <Suspense fallback={<Loading />}>
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/now/:placeName' element={<ShowCurrentWeather />} />
                    <Route path='/today/:placeName' element={<ShowTodayWeather />} />
                    <Route path='/tommorow/:placeName' element={<ShowTommorowWeather />} />
                    <Route path='/weekly/:placeName' element={<ShowWeeklyWeather />} />
                    <Route path='/days-15/:placeName' element={<Show15DaysWeather />} />
                    <Route path='/daily/:placeName/:date' element={<ShowDailyWeather />} />
                    <Route path='/signin' element={<SignIn />} />
                    <Route path='/signup' element={<SignUp />} />
                    <Route path='/myaccount' element={<MyAccount />} />
                    <Route path='/forgotpassword' element={<ForgotPassword />} />
                    <Route path='/resetpassword/:token' element={<Resetpassword />} />
                    <Route path='/verify/:token' element={<VerifyEmail />} />
                    <Route path='/NotFound' element={<NotFound />} />
                    <Route path='*' element={<NotFound />} />
                </Routes>
            </Suspense>
            </ErrorBoundary>
        </div>
    </BrowserRouter>
);

export default App;
