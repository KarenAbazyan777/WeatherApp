import React from 'react';

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
        if (!this.state.hasError) {
            return this.props.children;
        }
        return (
            <main className='notfound'>
                <section className='card'>
                    <div className='verify-icon fail' aria-hidden='true'>!</div>
                    <h1 className='section-title'>Something went wrong</h1>
                    <p>Sorry, this page stopped working. Reloading usually fixes it.</p>
                    <div className='modal-actions'>
                        <button type='button' className='btn btn-primary' onClick={() => window.location.reload()}>
                            Reload
                        </button>
                        <a href='/' className='btn btn-ghost'>Home</a>
                    </div>
                </section>
            </main>
        );
    }
}

export default ErrorBoundary;
