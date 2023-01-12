const catchAsync = require('../utils/catchAsync');
const Admin = require('./../models/adminModel');
const AppError = require('../utils/appError');
const validator = require('validator');
const sendEmail = require('./../utils/email');
const shortLink = require('./../utils/link');
const crypto = require('crypto');

exports.getAdmin = catchAsync(async (req, res, next) => {
    const admin = await Admin.findById(req.admin._id);
    res.status(200).json({
        status: 'success',
        data: {
            admin,
        },
    });
});

exports.getConfirmationToken = catchAsync(async (req, res, next) => {
    const admin = await Admin.findById(req.admin._id);
    if (admin.confirmed === true) return next(new AppError('Account already confirmed', 409));
    const token = admin.createConfirmationToken();
    let link = process.env.HOME_URL + token;
    const shortenLink = await shortLink(link);
    if (shortenLink.data.shortLink) link = shortenLink.data.shortLink;
    let message = `<h1>Confirm your account</h1>Here is your confirmation link ${link}`;
    try {
        await admin.save({ validateBeforeSave: false });
        await sendEmail({
            email: admin.email,
            subject: 'Confirm your account',
            message,
        });

        res.status(200).json({
            status: 'success',
            message: 'Confirmation link sent to email!',
        });
    } catch (err) {
        console.log(err);
        return next(new AppError('There was an error sending the email. Try again later!'), 500);
    }
});

exports.confirmAccount = catchAsync(async (req, res, next) => {
    // 1) Get admin based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const admin = await Admin.findOne({
        confirmationToken: hashedToken,
    });

    // 2) If token has not expired, confirm account
    if (!admin) {
        return next(new AppError('Token is invalid or account is already confirmed', 400));
    }

    admin.confirmationToken = undefined;
    admin.confirmed = true;
    await admin.save({ validateBeforeSave: false });
    res.status(200).json({
        status: 'success',
        message: 'Account has been confirmed!',
    });
});

exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password updates.', 400));
    }
    // 3) Update user document
    const updatedAdmin = await Admin.findById(req.admin._id);

    if (req.body.email) {
        if (!validator.isEmail(req.body.email)) return next(new AppError('Email is invalid'), 400);

        updatedAdmin.email = req.body.email;
    }
    if (req.body.name) {
        updatedAdmin.name = req.body.name;
    }
    if (req.body.department) {
        updatedAdmin.department = req.body.department;
    }
    await updatedAdmin.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedAdmin,
        },
    });
});
