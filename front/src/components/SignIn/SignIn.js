import React, { useContext, useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../helpers/theme';
import {toJS } from 'mobx';
import Context from '../../context';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { API_URL, jsonHeaders } from '../../helpers/constants/api';
import { rejectWithStatus } from '../../helpers/auth';
import { useT } from '../../i18n';

// HTTP status from the server -> translation key of the message to show
const SIGNIN_ERRORS = { 400: 'auth.invalidLogin', 401: 'auth.invalidLogin', 429: 'common.tooMany' };




const  SignIn = observer(()=>{

  const navigate = useNavigate();

  const {userinfo} = useContext(Context);
  const { t } = useT();

  const handleInput = (e)=>{
    userinfo.setLoginUser(e.target.name,e.target.value);
}

// translation keys (e.g. 'auth.invalidLogin'), translated when shown
const loginError = userinfo.loginError;

// Signed in with a correct password, but the email is not confirmed yet
const [needsVerify, setNeedsVerify] = useState(false);
const [resendMessage, setResendMessage] = useState('');

const resendEmail = ()=>{
  setResendMessage('auth.sending');
  fetch(`${API_URL}/resendverification`,{
     method:"POST",
     headers: jsonHeaders,
     body:JSON.stringify({useremail: userinfo.loginuser.useremail})
  })
  .then((res)=>setResendMessage(res.ok ? 'auth.resendDone' : res.status === 429 ? 'common.tooMany' : 'common.emailFailed'))
  .catch(()=>setResendMessage('common.emailFailed'));
}

useEffect(() => {
  if (loginError) {
    const toRef = setTimeout(() => {
      userinfo.setLoginError("");
      clearTimeout(toRef);
    }, 4000);
  }
}, [loginError, userinfo]);

  const handleSignIn = (e)=>{
    fetch(`${API_URL}/signin`,{
       method:"POST",
       headers: jsonHeaders,
       body:JSON.stringify(toJS(userinfo.loginuser))
    }).then((res)=> res.ok ? res.json() : rejectWithStatus(res))
    .then((response)=>{
      localStorage.setItem('token',response.token);
      localStorage.setItem('email',response.useremail);
      userinfo.setIsAuth(true);
      userinfo.setIsCreated(false);
      navigate('/');
    })
    .catch((e)=>{
      if(e.code === 'EMAIL_NOT_VERIFIED'){
        setNeedsVerify(true);
        setResendMessage('');
        return;
      }
      setNeedsVerify(false);
      userinfo.setLoginError(SIGNIN_ERRORS[e.status] || 'common.somethingWrong');
    });
}

  return (
        <div className='auth-page'>
        {loginError && <div className='alert alert-error' role='alert'>{t(loginError)}</div>}
        {userinfo.iscreated && !needsVerify && (
          <div className='alert alert-success' role='status'>
            {t('auth.created')}
          </div>
        )}
        {needsVerify && (
          <div className='alert alert-warning' role='alert'>
            <p>{t('auth.confirmFirst')}</p>
            {resendMessage
              ? <p className='alert-note'>{t(resendMessage)}</p>
              : <button type='button' className='btn btn-primary' onClick={resendEmail}>{t('auth.sendAgain')}</button>}
          </div>
        )}
      <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            {t('auth.signInTitle')}
          </Typography>
          <Box component="form"  noValidate sx={{ mt: 1 }}>
            <TextField  
              margin="normal"
              required
              fullWidth
              id="email"
              label={t('auth.email')}
              name="useremail"
              autoComplete="email"
              autoFocus
              onChange={handleInput}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="userpassword"
              label={t('auth.password')}
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={handleInput}
            />
            <Button
              onClick={handleSignIn }
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              {t('auth.signInButton')}
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href={'/forgotpassword'} variant="body2">
                  {t('auth.forgot')}
                </Link>
              </Grid>
              <Grid item>
                <Link href={`/signup`} variant="body2">
                  {t('auth.noAccount')}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
        </div>
  );
})

export default SignIn;