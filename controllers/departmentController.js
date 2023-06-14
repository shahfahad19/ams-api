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

exports.createDepartment = catchAsync(async (req, res, next) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let rndPass = '';

    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        rndPass += characters.charAt(randomIndex);
    }
    const userData = {
        name: 'Not Set Yet',
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
            email: req.body.email,
            subject: 'Approve your account at AMS',
            department: req.body.department,
            password: rndPass,
        });
    } catch (err) {
        console.log(err);
    }
    user.confirmed = true;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        message: 'Department added successfully!',
    });
});

exports.getDepartment = catchAsync(async (req, res) => {
    const department = await User.findById(req.params.id);
    res.status(200).json({
        status: 'success',
        data: {
            department,
        },
    });
});
