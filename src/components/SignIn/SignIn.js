import React, { useContext, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import './SignIn.css'
import {toJS } from 'mobx';
import Context from '../..';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';



const theme = createTheme();

const  SignIn = observer(()=>{

  const navigate = useNavigate();

  const {userinfo} = useContext(Context);

  const handleInput = (e)=>{
    userinfo.setLoginUser(e.target.name,e.target.value);
}

useEffect(() => {
  if (toJS(userinfo.iscreated)) {
    const toRef = setTimeout(() => {
      userinfo.setIsCreated(false);
      clearTimeout(toRef);
    }, 4000);
  }
}, [toJS(userinfo.iscreated)]);

useEffect(() => {
  if (toJS(userinfo.loginError)) {
    const toRef = setTimeout(() => {
      userinfo.setLoginError("");
      clearTimeout(toRef);
    }, 4000);
  }
}, [toJS(userinfo.loginError)]);

  const handleSignIn = (e)=>{
    fetch("http://localhost:3000/auth/signin",{ 
       method:"POST",
       headers: {
        "Accept": 'application/json',
        "Access-Control-Allow-Origin" : "*", 
        "Access-Control-Allow-Credentials" : true ,
        "Content-Type": "application/json;  charset=utf-8"
       },
       body:JSON.stringify(toJS(userinfo.loginuser))
    }).then((res)=>{
      if(!res.ok){
        return res.json().then(err => Promise.reject(err));
      }
      return res.json();
    })
    .then((response)=>{
      userinfo.setIsAuth(true);
      navigate('/');
      localStorage.setItem('token',response.token);
      localStorage.setItem('email',response.useremail);
    })
    .catch((e)=>userinfo.setLoginError(e.message));
}
  
  return (
        <div className='login'>
        {toJS(userinfo.loginError) && <div className='wronginputs'> {userinfo.loginError}</div>}
       {toJS(userinfo.iscreated) && <div className='created'>user is created successfully</div>}
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
                <Link href={'/resetpassword'} variant="body2">
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