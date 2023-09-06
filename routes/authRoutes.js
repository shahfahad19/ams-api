const express = require('express');
const auth = require('../controllers/authController');
const userController = require('./../controllers/userController');
const { upload } = require('../utils/imageUpload');

const router = express.Router();

// Account Controls
router.get('/', auth.protect, userController.getUser);
router.post('/signup', auth.verifyCaptcha, auth.signup);
router.post('/login', auth.verifyCaptcha, auth.login);
router.get('/logout', auth.verifyCaptcha, auth.logout);

router.post('/forgotPassword', auth.verifyCaptcha, auth.forgotPassword);
router.get('/checkResetToken/:token', auth.checkResetPasswordLink);
router.patch('/resetPassword/:token', auth.resetPassword);
router.get(
    '/getConfirmationToken',
    auth.verifyCaptcha,
    auth.ignoreConfirmation,
    auth.protect,
    userController.getConfirmationToken
);

router.get('/confirmAccount/:token', userController.confirmAccount);

router.get('/deleteAccount/:token', userController.deleteNonConfirmedAccount);

router.patch('/updatePassword', auth.protect, auth.updatePassword);

router.patch('/updateProfile', auth.protect, userController.updateMe);

router.post('/updatePhoto', auth.protect, upload.single('image'), userController.updateImage);

router.post('/completeProfile', auth.protect, auth.restrictTo('admin', 'teacher'), userController.completeSignup);

router.get('/confirmEmail/:token', auth.protect, userController.completeSignup);
router.get('/removeEmail/:token', auth.protect, userController.completeSignup);

module.exports = router;
