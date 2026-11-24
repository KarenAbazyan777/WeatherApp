const express = require('express');
const router = express.Router();
const userController = require('../controller/UserController');
const auth = require('../middleware/auth');
const { signinLimiter, signupLimiter, forgotLimiter, resetLimiter, verifyLimiter, resendLimiter } = require('../middleware/rateLimits');


router.post('/signin', signinLimiter, userController.signin);
router.post('/signup', signupLimiter, userController.signup);
router.post('/forgotpassword', forgotLimiter, userController.forgotpassword);
router.post('/resetpassword', resetLimiter, userController.resetpassword);
router.post('/verifyemail', verifyLimiter, userController.verifyemail);
router.post('/resendverification', resendLimiter, userController.resendverification);

router.get('/myaccount', auth, userController.myAccount);
router.post('/places', auth, userController.addPlaces);
router.post('/deleteplaces', auth, userController.deletePlace);
router.post('/deleteaccount', auth, userController.deleteAccount);

module.exports = router;
