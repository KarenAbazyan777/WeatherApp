import React, { useMemo, useState } from 'react';
import './resetpassword.css'
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';





const theme = createTheme();

const Resetpassword = () => {

    const [userpassword,setPassword] = useState('');
    const [confirmpassword,setConfirmPassword] = useState('');
    const [useremail,setUserEmail] = useState('');
    const navigate = useNavigate();

    const isDisabled = useMemo(()=>{
        const regexpassword = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/;
        const regexemail = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
        
        return !(userpassword === confirmpassword) || !userpassword.length > 0 ||  !regexpassword.test(userpassword) || !regexemail.test(useremail);
    })

    const changePassword = ()=>{
        const foo = {useremail,userpassword}
        {
            fetch("http://localhost:3000/auth/resetpassword",{ 
               method:"POST",
               headers: {
                "Accept": 'application/json',
                "Access-Control-Allow-Origin" : "*", 
                "Access-Control-Allow-Credentials" : true ,
                "Content-Type": "application/json;  charset=utf-8"
               },
               body:JSON.stringify(foo)
            }).then((res)=>{
              if(!res.ok){
                return res.json().then(err => Promise.reject(err));
              }
              return res.json();
            })
            .then((response)=>{
             
              navigate('/signin');
             
            })
            .catch((e)=>console.log(e));
        }
    }

    return (
        <div className='reset'>
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
            Reset account password
          </Typography>
          <Box component="form"  noValidate sx={{ mt: 1 }}>
          <TextField 
              value={useremail} 
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="useremail"
              autoComplete="email"
              autoFocus
              onChange={(e)=>setUserEmail(e.target.value)}
            
            />
            <TextField  
              value={userpassword}
              margin="normal"
              required
              fullWidth
              label="New password"
              type="password"
              id="password"
              autoComplete="current-password"
              autoFocus
              onChange={(e)=>setPassword(e.target.value)}
            />
            <TextField
              value={confirmpassword}
              margin="normal"
              required
              fullWidth
              label="Confirm password"
              type="password"
              id="confirmpassword"
              autoComplete="current-password"
              autoFocus
              onChange={(e)=>setConfirmPassword(e.target.value)}
            />
        
            <Button
              onClick={changePassword}
              disabled={isDisabled}
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
             enter
            </Button>

          </Box>
        </Box>
      </Container>
    </ThemeProvider>
        </div>
    );
};

export default Resetpassword;