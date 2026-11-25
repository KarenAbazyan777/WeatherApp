import React from 'react';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useT } from '../../i18n';

const NotFound = observer(() => {
    const { t } = useT();
    return (
        <main className='notfound'>
            <section className='card'>
                <div className='notfound-code'>404</div>
                <h1 className='section-title'>{t('notFound.title')}</h1>
                <p>{t('notFound.text')}</p>
                <Link to='/now/london,UK' className='btn btn-primary'>{t('notFound.back')}</Link>
            </section>
        </main>
    );
});

export default NotFound;
