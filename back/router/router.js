const Router = require('express');
const router = new Router();
const userController = require('../controller/UserController');


router.post('/signin',userController.signin);
router.post('/signup',userController.signup);
router.post('/myaccount',userController.myAccount);
router.post('/places',userController.addPlaces);
router.post('/deleteplaces',userController.deletePlace);
router.post('/deleteaccount',userController.deleteAccount);
router.post('/resetpassword',userController.resetpassword);

module.exports = router;