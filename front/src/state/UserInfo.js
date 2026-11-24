import { makeAutoObservable } from 'mobx';

class UserInfo {
    user = { username: '', userlname: '', useremail: '', userpassword: '' }; // sign-up form
    loginuser = { useremail: '', userpassword: '' };                         // sign-in form
    isAuth = false;
    accountInfo = '';      // data from /myaccount
    iscreated = false;     // shows "user is created" after sign-up
    loginError = '';
    signupError = false;

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    setUser(field, value) {
        this.user[field] = value;
    }

    setLoginUser(field, value) {
        this.loginuser[field] = value;
    }

    setIsAuth(bool) {
        this.isAuth = bool;
    }

    setIsCreated(bool) {
        this.iscreated = bool;
    }

    setLoginError(err) {
        this.loginError = err;
    }

    setAccountInfo(info) {
        this.accountInfo = info;
    }

    setPlaces(places) {
        if (this.accountInfo) {
            this.accountInfo.places = places;
        }
    }

    setSignUpError(bool) {
        this.signupError = bool;
    }
}

export default UserInfo;
