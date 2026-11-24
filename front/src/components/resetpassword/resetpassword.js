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
import { isValidPassword } from '../../helpers/validation';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL, jsonHeaders } from '../../helpers/constants/api';
import { rejectWithStatus } from '../../helpers/auth';


const Resetpassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [userpassword, setPassword] = useState('');
    const [confirmpassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [sending, setSending] = useState(false);

    const isDisabled = sending || userpassword !== confirmpassword || !isValidPassword(userpassword);

    const changePassword = (e) => {
        e.preventDefault();
        if (isDisabled) return;
        setSending(true);
        setError('');
        fetch(`${API_URL}/resetpassword`, {
            method: 'POST',
            headers: jsonHeaders,
            body: JSON.stringify({ token, userpassword }),
        })
            .then((res) => (res.ok ? res.json() : rejectWithStatus(res)))
            .then(() => navigate('/signin'))
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
                            Set a new password
                        </Typography>
                        <Box component="form" noValidate sx={{ mt: 1 }} onSubmit={changePassword}>
                            <TextField
                                value={userpassword}
                                margin="normal"
                                required
                                fullWidth
                                label="New password"
                                type="password"
                                id="password"
                                autoComplete="new-password"
                                autoFocus
                                helperText="At least 6 characters, mix of letters and numbers or cases"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <TextField
                                value={confirmpassword}
                                margin="normal"
                                required
                                fullWidth
                                label="Confirm password"
                                type="password"
                                id="confirmpassword"
                                autoComplete="new-password"
                                error={confirmpassword.length > 0 && confirmpassword !== userpassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            {error && <Typography color="error">{error}</Typography>}
                            <Button type="submit" disabled={isDisabled} fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                                {sending ? 'Saving...' : 'Change password'}
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </ThemeProvider>
        </div>
    );
};

export default Resetpassword;
