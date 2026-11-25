import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import Loading from '../Loading/Loading';
import { API_URL, jsonHeaders } from '../../helpers/constants/api';
import { useT } from '../../i18n';

// Opened from the link in the confirmation email: /verify/<token>
const VerifyEmail = observer(() => {
    const { token } = useParams();
    const { t } = useT();
    const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
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
            .then((res) => setStatus(res.ok ? 'success' : 'error'))
            .catch(() => setStatus('error'));
    }, [token]);

    if (status === 'loading') {
        return <Loading />;
    }

    const ok = status === 'success';

    return (
        <main className='notfound'>
            <section className='card'>
                <div className={`verify-icon ${ok ? 'ok' : 'fail'}`} aria-hidden='true'>{ok ? '✓' : '!'}</div>
                <h1 className='section-title'>{ok ? t('verify.okTitle') : t('verify.failTitle')}</h1>
                <p>{ok ? t('verify.okText') : t('verify.failText')}</p>
                <Link to='/signin' className='btn btn-primary'>{t('verify.goSignIn')}</Link>
            </section>
        </main>
    );
});

export default VerifyEmail;
