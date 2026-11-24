export const isLoggedIn = () => Boolean(localStorage.getItem('token'));

export const logout = (userinfo) => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    userinfo.setIsAuth(false);
    userinfo.setAccountInfo('');
};

// Turns a failed fetch response into an error that keeps the HTTP status.
export const rejectWithStatus = (res) =>
    res.json()
        .catch(() => ({}))
        .then((body) => Promise.reject({ ...body, status: res.status }));
