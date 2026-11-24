import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Loading from '../Loading/Loading';
import { API_URL, jsonHeaders } from '../../helpers/constants/api';

// Opened from the link in the confirmation email: /verify/<token>
const VerifyEmail = () => {
    const { token } = useParams();
    const [state, setState] = useState({ status: 'loading', message: '' });
    const sent = useRef(false);

    useEffect(() => {
        // The link works only once, so make sure we send it only once
        // (React may run effects twice in development).
        if (sent.current) return;
        sent.current = true;

        fetch(`${API_URL}/verifyemail`, {
            method: 'POST',
            headers: jsonHeaders,
            body: JSON.stringify({ token }),
        })
            .then(async (res) => {
                const body = await res.json().catch(() => ({}));
                setState({
                    status: res.ok ? 'success' : 'error',
                    message: body.message || (res.ok ? 'Email confirmed' : 'Something went wrong'),
                });
            })
            .catch(() => setState({ status: 'error', message: 'Could not reach the server, try again later' }));
    }, [token]);

    if (state.status === 'loading') {
        return <Loading />;
    }

    const ok = state.status === 'success';

    return (
        <main className='notfound'>
            <section className='card'>
                <div className={`verify-icon ${ok ? 'ok' : 'fail'}`} aria-hidden='true'>{ok ? '✓' : '!'}</div>
                <h1 className='section-title'>{ok ? 'Email confirmed' : 'Link not valid'}</h1>
                <p>
                    {ok
                        ? 'Your account is ready. Sign in to save your favourite places.'
                        : `${state.message}. Sign in with your email and password to get a new link.`}
                </p>
                <Link to='/signin' className='btn btn-primary'>Go to sign in</Link>
            </section>
        </main>
    );
};

export default VerifyEmail;
