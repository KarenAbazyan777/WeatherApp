import { action, makeObservable, observable } from 'mobx';
import React, { Component } from 'react';

class UserInfo extends Component {
    constructor(){
        super();
        this.user = {username:'',userlname:'', useremail:'',userpassword:''};
        this.loginuser = {useremail:'',userpassword:''};
        this.isAuth = false;
        this.accountInfo = '';
        this.iscreated = false;
        this.loginError = '';
        this.signupError = false;
        makeObservable(this,{
            signupError:observable,
            accountInfo:observable,
            isAuth:observable,
            loginError:observable,
            iscreated:observable,
            user:observable,
            loginuser:observable,

            setUser:action,
            setLoginUser:action,
            setIsAuth:action,
            setIsCreated:action,
            setLoginError:action,
            setAccountInfo:action,
            setSignUpError:action,
           
        },{deep:true});
    }
    setUser(arg,value){
        this.user[arg] = value;
    }

    getUser(){
        return this.user
    }

    setLoginUser(arg,value){
        this.loginuser[arg] = value;
    }

    getLoginUser(){
        return this.loginuser;
    }

    setIsAuth(bool){
        this.isAuth = bool; 
    }
    getisAuth(bool){
        return this.isAuth;
    }

    setIsCreated(bool){
        this.iscreated = bool;
    }

    getisCreated(){
        return this.iscreated;
    }

    setLoginError(err){
        this.loginError = err;
    }

    getLoginError(){
        return this.loginError;
    }

    setAccountInfo(info){
        this.accountInfo = info; 
    }

    getAccountInfo(){
        return this.accountInfo
    }

    setSignUpError(bool){
        this.signupError = bool 
    }

    getSignUpError(){
        return this.signupError;
    }

    

    
}

export default UserInfo;