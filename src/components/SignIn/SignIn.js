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




const  SignIn = observer(()=>{

  const navigate = useNavigate();

  const {userinfo} = useContext(Context);

  const handleInput = (e)=>{
    userinfo.setLoginUser(e.target.name,e.target.value);
}

const loginError = userinfo.loginError;

// Signed in with a correct password, but the email is not confirmed yet
const [needsVerify, setNeedsVerify] = useState(false);
const [resendMessage, setResendMessage] = useState('');

const resendEmail = ()=>{
  setResendMessage('Sending…');
  fetch(`${API_URL}/resendverification`,{
     method:"POST",
     headers: jsonHeaders,
     body:JSON.stringify({useremail: userinfo.loginuser.useremail})
  })
  .then((res)=>res.json())
  .then((result)=>setResendMessage(result.message || 'Done'))
  .catch(()=>setResendMessage('Could not send the email, try again'));
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
    }).then((res)=>{
      if(!res.ok){
        return res.json().then(err => Promise.reject(err));
      }
      return res.json();
    })
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
      userinfo.setLoginError(e.message);
    });
}

  return (
        <div className='auth-page'>
        {loginError && <div className='alert alert-error' role='alert'>{loginError}</div>}
        {userinfo.iscreated && !needsVerify && (
          <div className='alert alert-success' role='status'>
            Account created! We sent a confirmation link to your email. Open it, then sign in here.
          </div>
        )}
        {needsVerify && (
          <div className='alert alert-warning' role='alert'>
            <p>Please confirm your email first. Check your inbox (and spam folder) for the link.</p>
            {resendMessage
              ? <p className='alert-note'>{resendMessage}</p>
              : <button type='button' className='btn btn-primary' onClick={resendEmail}>Send the link again</button>}
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
            Sign in
          </Typography>
          <Box component="form"  noValidate sx={{ mt: 1 }}>
            <TextField  
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
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
              label="Password"
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
              Sign In
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href={'/forgotpassword'} variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href={`/signup`} variant="body2">
                  {"Don't have an account? Sign Up"}
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