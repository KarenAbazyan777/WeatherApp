import React, { useContext, useEffect, useState } from 'react';
import Context from '../../context';
import { observer } from 'mobx-react-lite';
import Loading from '../Loading/Loading';
import { useNavigate } from 'react-router-dom';
import { toJS } from 'mobx';
import { API_URL, authHeaders } from '../../helpers/constants/api';
import { isLoggedIn, logout, rejectWithStatus } from '../../helpers/auth';


const MyAccount = observer(() => {    

    const navigate = useNavigate();
    const {userinfo} = useContext(Context);
    const {placeStore} = useContext(Context);
    const [showPopup,setShowPopup] = useState(false);

    const [error,setError] = useState('');
    // This page's own loading state (not shared with the weather pages)
    const [loading,setLoading] = useState(true);
    // true after a few seconds of waiting: explain that the server is waking up
    const [slow,setSlow] = useState(false);
    // "Try again" increases this, which runs the loading effect again
    const [attempt,setAttempt] = useState(0);

    const handleError = (err)=>{
        if(err.status === 401){
            logout(userinfo);
            navigate('/signin');
            return;
        }
        setError(err.message || 'Something went wrong');
    }

    useEffect (()=>{
        if(!isLoggedIn()){
            navigate('/signin');
            return undefined;
        }
        setError('');
        setLoading(true);
        setSlow(false);

        const controller = new AbortController();
        let timedOut = false;
        // After 4 s tell the user why it takes long; after 75 s stop waiting.
        const slowTimer = setTimeout(()=> setSlow(true), 4000);
        const timeoutTimer = setTimeout(()=>{
            timedOut = true;
            controller.abort();
        }, 75000);

        fetch(`${API_URL}/myaccount`,{
            method:"GET",
            headers: authHeaders(),
            signal: controller.signal,
        })
        .then(res=> res.ok ? res.json() : rejectWithStatus(res))
        .then(result=>{
            userinfo.setAccountInfo(result);
        })
        .catch(err=>{
            if(err.name === 'AbortError'){
                // aborted by the 75 s timeout -> show an error; aborted because we left the page -> nothing
                if(timedOut) setError('The server did not answer in time');
                return;
            }
            if(err.status === 401){
                logout(userinfo);
                navigate('/signin');
                return;
            }
            setError(err.message || 'Something went wrong');
        })
        .finally(()=>{
            clearTimeout(slowTimer);
            clearTimeout(timeoutTimer);
            setLoading(false);
        });

        // Leaving the page cancels the request and both timers
        return ()=>{
            clearTimeout(slowTimer);
            clearTimeout(timeoutTimer);
            controller.abort();
        };
   },[userinfo, navigate, attempt])

   const deletePlace = (place)=>{
    // Remove it from the screen right away; undo if the server says no.
    const previous = toJS(userinfo.accountInfo.places);
    userinfo.setPlaces(previous.filter((p)=> p !== place));
    setError('');

    fetch(`${API_URL}/deleteplaces`,{
            method:"POST",
            headers: authHeaders(),
            body:JSON.stringify({place})
        })
        .then(res=> res.ok ? res.json() : rejectWithStatus(res))
        .then((updatedPlaces)=> userinfo.setPlaces(updatedPlaces))
        .catch((err)=>{
            userinfo.setPlaces(previous);
            handleError(err);
        })
   }

    const deleteAccount = ()=>{
    fetch(`${API_URL}/deleteaccount`,{
            method:"POST",
            headers: authHeaders(),
        })
        .then(res=> res.ok ? res.json() : rejectWithStatus(res))
        .then(()=>{
            logout(userinfo);
            navigate('/');
        })
        .catch(handleError)
   }


    if(loading){
        return (
            <main className='page'>
                <Loading />
                {slow && (
                    <p className='waking-note' role='status'>
                        Waking up the server… On the free hosting plan this can take up to a minute
                        after a quiet period. Thanks for waiting!
                    </p>
                )}
            </main>
        );
    }

    if(error && !userinfo.accountInfo){
        return (
            <main className='page'>
                <section className='card account'>
                    <p className='error-text'>{error}</p>
                    <button type='button' className='btn btn-primary' onClick={()=>setAttempt((n)=>n+1)}>
                        Try again
                    </button>
                </section>
            </main>
        );
    }

    if(!userinfo.accountInfo){
        return null;
    }

    const info = userinfo.accountInfo;
    const initials = `${info.username[0] || ''}${info.userlname[0] || ''}`.toUpperCase();

    const openPlace = (place)=>{
        placeStore.setWeather(place);
        navigate(`/now/${place}`);
    }

    return(
        <main className='page'>
            <section className='card account'>
                <div className='account-head'>
                    <div className='avatar' aria-hidden='true'>{initials}</div>
                    <div>
                        <h1 className='account-name'>{info.username} {info.userlname}</h1>
                        <p className='muted'>{info.useremail}</p>
                    </div>
                </div>

                {error && <p className='error-text'>{error}</p>}

                <h2>My places</h2>
                {info.places.length > 0 ? (
                    <div className='chips'>
                        {info.places.map((place)=>(
                            <span className='chip' key={place}>
                                <button type='button' className='chip-link' onClick={()=>openPlace(place)}>
                                    {place}
                                </button>
                                <button type='button' className='chip-remove' aria-label={`Remove ${place}`} onClick={()=>deletePlace(place)}>
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className='muted'>No saved places yet. Search a city and press “☆ Save place”.</p>
                )}

                <div className='danger-zone'>
                    <p className='muted'>Deleting your account removes all your data.</p>
                    <button type='button' className='btn btn-danger' onClick={()=>setShowPopup(true)}>
                        Delete account
                    </button>
                </div>
            </section>

            {showPopup && (
                <div className='modal-backdrop' onClick={()=>setShowPopup(false)}>
                    <div className='card modal' role='dialog' aria-modal='true' onClick={(e)=>e.stopPropagation()}>
                        <h2>Delete your account?</h2>
                        <p className='muted'>This can't be undone.</p>
                        <div className='modal-actions'>
                            <button type='button' className='btn btn-ghost' onClick={()=>setShowPopup(false)}>Cancel</button>
                            <button type='button' className='btn btn-danger-solid' onClick={deleteAccount}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
});

export default MyAccount;
