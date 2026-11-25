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
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../helpers/theme';
import { isValidEmail, isValidName, isValidPassword } from '../../helpers/validation';
import Context from '../../context'
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n';
import { API_URL, jsonHeaders } from '../../helpers/constants/api';



const SignUp = observer(() =>{

  
  const navigate = useNavigate();
  const {userinfo} = useContext(Context);
  const { t } = useT();

  const {username,userlname,useremail,userpassword} = userinfo.user;
  const isDisabled = useMemo(() => {
    return !isValidPassword(userpassword) || !isValidEmail(useremail) || !isValidName(username) || !isValidName(userlname);
  },[username,userlname,useremail,userpassword]);

  const handleInput = (e)=>{
      userinfo.setUser(e.target.name,e.target.value);
  }

  const signupError = userinfo.signupError;
  useEffect(() => {
    if (signupError) {
      const toRef = setTimeout(() => {
        userinfo.setSignUpError(false);
        clearTimeout(toRef);
      }, 4000);
    }
  }, [signupError, userinfo]);

  const handleSignUp = (e)=>{  
   
   
    fetch(`${API_URL}/signup`,{
       method:"POST",
       headers: jsonHeaders,
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
      <div className='auth-page'>
        {userinfo.signupError && <div className='alert alert-error' role='alert'>{t('auth.emailTaken')}</div>}
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
            {t('auth.signUpTitle')}
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
                  label={t('auth.firstName')}
                  autoFocus
                  onChange={handleInput}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastname"
                  label={t('auth.lastName')}
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
                  label={t('auth.email')}
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
                  label={t('auth.password')}
                  helperText={t('auth.passwordHint')}
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  onChange={handleInput}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel disableTypography
                  control={<Checkbox value="allowExtraEmails" color="primary" />}
                  label={t('auth.marketing')}
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
              {t('auth.signUpButton')}
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href={`/signin`} variant="body2">
                  {t('auth.haveAccount')}
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