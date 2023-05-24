import React from 'react';
import './NotFound.css'
import { Link } from 'react-router-dom';


const NotFound = () => {
    return (
        <div className='NotFound'>
        <h1 className='NotFound-title'>Oops ! page not found</h1>
        <Link to='/now/london,UK' className='NotFound-link'>Go to homepage</Link>
    </div>
    );
};

export default NotFound;