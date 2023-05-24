import React, { useContext, useEffect, useMemo } from 'react';
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
import Context from '../../index'
import { observer } from 'mobx-react-lite';
import './SignUp.css'
import { toJS } from 'mobx';
import { useNavigate } from 'react-router-dom';


const theme = createTheme();

const SignUp = observer(() =>{

  
  const navigate = useNavigate();
  const {userinfo} = useContext(Context);

  const isDisabled = useMemo(() => {
    const {username,userlname,useremail,userpassword} = userinfo.user
    const regexemail = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
    const regexname = /^[a-z ,.'-]+$/i;
    const regexpassword = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/;
    return  !regexpassword.test(userpassword) || !regexemail.test(useremail) || !regexname.test(username) || !regexname.test(userlname);
  },[userinfo.user.username,userinfo.user.userlname,userinfo.user.useremail,
    userinfo.user.userpassword]);

  const handleInput = (e)=>{
      userinfo.setUser(e.target.name,e.target.value);
  }

  useEffect(() => {
    if (toJS(userinfo.signupError)) {
      const toRef = setTimeout(() => {
        userinfo.setSignUpError(false);
        clearTimeout(toRef);
      }, 4000);
    }
  }, [toJS(userinfo.signupError)]);

  const handleSignUp = (e)=>{  
   
   
    fetch("http://localhost:3000/auth/signup",{
       method:"POST",
       headers: {
        "Accept": 'application/json',
        "Access-Control-Allow-Origin" : "*", 
        "Access-Control-Allow-Credentials" : true ,
        "Content-Type": "application/json;  charset=utf-8"
       },
       body:JSON.stringify(toJS(userinfo.user))
    }).then((res)=>{
      if(!res.ok){
        return res.json().then(err => Promise.reject(err));
      }
      return res.json()})
    .then((response)=>{
     
      userinfo.setIsCreated(true);
      navigate('/signin')}
      )
    .catch((e)=>{

      userinfo.setSignUpError(true);
      console.log(userinfo.signupError);
    });
}
  return (
      <div className='register'>
        {userinfo.signupError && <div className='wronginputs'>USER WITH  THIS EMAIL ALREADY EXISTS</div>}
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
            Sign up
          </Typography>
          <Box component="form" noValidate sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="username"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                  onChange={handleInput}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastname"
                  label="Last Name"
                  name="userlname"
                  autoComplete="family-name"
                  onChange={handleInput}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="useremail"
                  autoComplete="email"
                  onChange={handleInput}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="userpassword"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  onChange={handleInput}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel disableTypography
                  control={<Checkbox value="allowExtraEmails" color="primary" />}
                  label="I want to receive inspiration, marketing promotions and updates via email."
                />
              </Grid>
            </Grid>
            <Button
              onClick={handleSignUp}
              fullWidth
              variant="contained"
              disabled={isDisabled}
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href={`/signin`} variant="body2">
                  Already have an account? Sign in
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

export default SignUp