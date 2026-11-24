import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
    <main className='notfound'>
        <section className='card'>
            <div className='notfound-code'>404</div>
            <h1 className='section-title'>We couldn't find that</h1>
            <p>The page or city you're looking for doesn't exist. Check the spelling and try again.</p>
            <Link to='/now/london,UK' className='btn btn-primary'>Back to weather</Link>
        </section>
    </main>
);

export default NotFound;
