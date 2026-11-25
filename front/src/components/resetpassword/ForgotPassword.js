import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
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
import { useT } from '../../i18n';


const ForgotPassword = observer(() => {
    const { t } = useT();
    const [useremail, setUserEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [error, setError] = useState(''); // translation key, translated when shown
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
            .then(() => setSent(true))
            .catch((err) => setError(err.status === 429 ? 'common.tooMany' : err.status === 503 ? 'common.emailFailed' : 'common.somethingWrong'))
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
                            {t('auth.forgotTitle')}
                        </Typography>

                        {sent ? (
                            <Typography sx={{ mt: 3, textAlign: 'center' }}>
                                {t('auth.linkSent')}
                            </Typography>
                        ) : (
                            <Box component="form" noValidate sx={{ mt: 1 }} onSubmit={sendLink}>
                                <TextField
                                    value={useremail}
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="email"
                                    label={t('auth.email')}
                                    autoComplete="email"
                                    autoFocus
                                    onChange={(e) => setUserEmail(e.target.value)}
                                />
                                {error && <Typography color="error">{t(error)}</Typography>}
                                <Button type="submit" disabled={isDisabled} fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                                    {sending ? t('auth.sending') : t('auth.sendLink')}
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Container>
            </ThemeProvider>
        </div>
    );
});

export default ForgotPassword;
