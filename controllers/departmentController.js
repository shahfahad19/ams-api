const catchAsync = require('../utils/catchAsync');
const crypto = require('crypto');
const User = require('./../models/userModel');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('../utils/appError');
const { sendEmailToDepartment } = require('../utils/email');

exports.getAllDepartments = catchAsync(async (req, res) => {
    const features = new APIFeatures(User.find({ role: 'admin' }), req.query).filter().sort().limit().paginate();
    const departments = await features.query;

    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        results: departments.length,
        data: {
            departments,
        },
    });
});

exports.createDepartment = catchAsync(async (req, res) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let rndPass = '';

    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        rndPass += characters.charAt(randomIndex);
    }

    const userData = {
        name: req.body.name,
        email: req.body.email,
        role: 'admin',
        department: req.body.department,
        password: rndPass,
        passwordConfirm: rndPass,
        confirmed: true,
        approved: false,
        createdAt: Date.now(),
    };

    const user = await User.create(userData);

    // SENDING EMAIL
    try {
        await sendEmailToDepartment({
            email: user.email,
            subject: 'Confirm your account',
            name: user.name,
            links: {
                email: req.body.email,
                department: req.body.department,
                password: req.body.password,
            },
        });
    } catch (err) {}
    await user.save({ validateBeforeSave: false });
});
