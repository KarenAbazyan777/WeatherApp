import React, { useContext } from 'react';
import {NavLink, useNavigate} from 'react-router-dom'
import image from '../../helpers/images/home.png'
import './Header.css'
import Context from '../..';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';

const Header = observer(() => {

    const {userinfo} = useContext(Context); 
    const navigate = useNavigate();

    return (
        <div className='header'>   
            <div className='linkhome'>
                <NavLink to={'/'} className="LinkHome"> <img src={image}/></NavLink>
            </div>
            <div className='menubar'>
               {!toJS(userinfo.isAuth || localStorage.getItem('email'))  ? 
               <div className='menu'>
                     <div className='signup'>
                        <NavLink to={'/signin'} className="LinkSignUp">SIGNIN</NavLink>
                     </div>
                    <div className='signup'>
                        <NavLink to={'/signup'} className="LinkSignUp">SIGNUP</NavLink>
                    </div>
               </div> :
               <div className='menu'>
                     <div className='signup'>
                        <NavLink to={'/myaccount'} className="LinkSignUp">MYACCOUNT</NavLink>
                     </div>
                    <div className='signup'>
                        <button style={{cursor:'pointer'}}
                         onClick={()=> {
                            localStorage.removeItem('email');
                            localStorage.removeItem('token');
                            userinfo.setIsAuth(false);
                            navigate('/')
                            }
                            } 
                        className="logout">LOGOUT</button>
                    </div>
               </div>}
            </div>
        </div>
    );
})

export default Header;