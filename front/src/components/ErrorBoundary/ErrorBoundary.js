import React from 'react';
import { observer } from 'mobx-react-lite';
import { useT } from '../../i18n';

// The message itself is a small function component, so it can use the
// translation hook (hooks don't work inside class components).
const CrashMessage = observer(() => {
    const { t } = useT();
    return (
        <main className='notfound'>
            <section className='card'>
                <div className='verify-icon fail' aria-hidden='true'>!</div>
                <h1 className='section-title'>{t('crash.title')}</h1>
                <p>{t('crash.text')}</p>
                <div className='modal-actions'>
                    <button type='button' className='btn btn-primary' onClick={() => window.location.reload()}>
                        {t('common.reload')}
                    </button>
                    <a href='/' className='btn btn-ghost'>{t('common.home')}</a>
                </div>
            </section>
        </main>
    );
});

// If any page crashes while rendering, React would normally remove the whole
// app and leave a blank screen. This catches the error and shows a message
// instead, so the header stays and the user can reload or go home.
// (Error boundaries must be class components: there is no hook for this.)
class ErrorBoundary extends React.Component {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error('Page crashed:', error, info.componentStack);
    }

    render() {
        return this.state.hasError ? <CrashMessage /> : this.props.children;
    }
}

export default ErrorBoundary;
