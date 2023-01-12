const catchAsync = require('../utils/catchAsync');
const shortLink = require('../utils/link');
const Teacher = require('./../models/teacherModel');
const APIFeatures = require('./../utils/apiFeatures');
const crypto = require('crypto');

exports.getAllTeachers = catchAsync(async (req, res) => {
    const features = new APIFeatures(Teacher.find(), req.query).filter().sort().limit().paginate();
    const teachers = await features.query;
    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        results: teachers.length,
        data: {
            teachers,
        },
    });
});

exports.getTeacher = catchAsync(async (req, res) => {
    const teacher = await Teacher.findById(req.params.id);

    res.status(200).json({
        status: 'success',
        data: {
            teacher,
        },
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await Teacher.findByIdAndDelete(req.teacher._id);

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

exports.getConfirmationToken = catchAsync(async (req, res, next) => {
    const teacher = await Teacher.findById(req.teacher._id);
    if (teacher.confirmed === true) return next(new AppError('Account already confirmed', 409));
    const token = teacher.createConfirmationToken();
    let link = process.env.HOME_URL + '/admin/confirmAccount/' + token;
    const shortenLink = await shortLink(link);
    if (shortenLink.data.shortLink) link = shortenLink.data.shortLink;
    let message = `<h1>Confirm your account</h1>Here is your confirmation link ${link}`;
    try {
        await teacher.save({ validateBeforeSave: false });
        await sendEmail({
            email: teacher.email,
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
    // 1) Get teacher based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const teacher = await Teacher.findOne({
        confirmationToken: hashedToken,
    });

    // 2) If token has not expired, confirm account
    if (!teacher) {
        return next(new AppError('Token is invalid or account is already confirmed', 400));
    }

    teacher.confirmationToken = undefined;
    teacher.confirmed = true;
    await teacher.save({ validateBeforeSave: false });
    res.status(200).json({
        status: 'success',
        message: 'Account has been confirmed!',
    });
});

exports.deleteNonConfirmedAccount = catchAsync(async (req, res, next) => {
    // 1) Get teacher based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const teacher = await Teacher.findOne({
        confirmationToken: hashedToken,
    });

    // 2) If token has not expired, confirm account
    if (!teacher) {
        return next(new AppError('Token is invalid or account is already confirmed', 400));
    }

    await teacher.delete();
    res.status(204).json({
        status: 'success',
        data: null,
    });
});

exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password updates.', 400));
    }
    // 3) Update user document
    const updatedTeacher = await Teacher.findById(req.teacher._id);

    if (req.body.email) {
        if (!validator.isEmail(req.body.email)) return next(new AppError('Email is invalid'), 400);

        updatedTeacher.email = req.body.email;
    }
    if (req.body.name) {
        updatedTeacher.name = req.body.name;
    }
    await updatedTeacher.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedTeacher,
        },
    });
});
