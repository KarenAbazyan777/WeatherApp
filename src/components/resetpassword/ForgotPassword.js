import React, { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../helpers/theme';
import { isValidEmail } from '../../helpers/validation';
import { API_URL, jsonHeaders } from '../../helpers/constants/api';
import { rejectWithStatus } from '../../helpers/auth';


const ForgotPassword = () => {
    const [useremail, setUserEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [sending, setSending] = useState(false);

    const isDisabled = sending || !isValidEmail(useremail);

    const sendLink = (e) => {
        e.preventDefault();
        if (isDisabled) return;
        setSending(true);
        setError('');
        fetch(`${API_URL}/forgotpassword`, {
            method: 'POST',
            headers: jsonHeaders,
            body: JSON.stringify({ useremail: useremail.trim() }),
        })
            .then((res) => (res.ok ? res.json() : rejectWithStatus(res)))
            .then((result) => setMessage(result.message))
            .catch((err) => setError(err.message || 'Something went wrong'))
            .finally(() => setSending(false));
    };

    return (
        <div className='auth-page'>
            <ThemeProvider theme={theme}>
                <Container component="main" maxWidth="xs">
                    <CssBaseline />
                    <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Forgot password
                        </Typography>

                        {message ? (
                            <Typography sx={{ mt: 3, textAlign: 'center' }}>
                                {message}. Check your inbox.
                            </Typography>
                        ) : (
                            <Box component="form" noValidate sx={{ mt: 1 }} onSubmit={sendLink}>
                                <TextField
                                    value={useremail}
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    autoComplete="email"
                                    autoFocus
                                    onChange={(e) => setUserEmail(e.target.value)}
                                />
                                {error && <Typography color="error">{error}</Typography>}
                                <Button type="submit" disabled={isDisabled} fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                                    {sending ? 'Sending...' : 'Send reset link'}
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Container>
            </ThemeProvider>
        </div>
    );
};

export default ForgotPassword;
