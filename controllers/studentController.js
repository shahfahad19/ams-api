const catchAsync = require('../utils/catchAsync');
const shortLink = require('../utils/link');
const Student = require('./../models/studentModel');
const APIFeatures = require('./../utils/apiFeatures');
const crypto = require('crypto');
const { getStudentAttendance } = require('./attendanceController');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

exports.getAllStudents = catchAsync(async (req, res) => {
    const features = new APIFeatures(Student.find(), req.query).filter().sort().limit().paginate();
    const students = await features.query;
    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        results: students.length,
        data: {
            students,
        },
    });
});

exports.getStudent = catchAsync(async (req, res) => {
    const student = await Student.findById(req.params.id);

    res.status(200).json({
        status: 'success',
        data: {
            student,
        },
    });
});

exports.createStudent = catchAsync(async (req, res) => {
    const newStudent = await Student.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            Student: newStudent,
        },
    });
});

exports.updateStudent = catchAsync(async (req, res) => {
    const filteredObj = filterObj(req.body, 'rollNo', 'name');
    const student = await Student.findByIdAndUpdate(req.params.id, filteredObj, {
        new: true,
    });

    res.status(200).json({
        status: 'success',
        data: {
            student,
        },
    });
});

exports.deleteStudent = catchAsync(async (req, res) => {
    await Student.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

exports.getConfirmationToken = catchAsync(async (req, res, next) => {
    const student = await Student.findById(req.student._id);
    if (student.confirmed === true) return next(new AppError('Account already confirmed', 409));
    const token = student.createConfirmationToken();
    let link = process.env.HOME_URL + token;
    const shortenLink = await shortLink(link);
    if (shortenLink.data.shortLink) link = shortenLink.data.shortLink;
    let message = `<h1>Confirm your account</h1>Here is your confirmation link ${link}`;
    try {
        await student.save({ validateBeforeSave: false });
        await sendEmail({
            email: student.email,
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
    // 1) Get student based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const student = await Student.findOne({
        confirmationToken: hashedToken,
    });

    // 2) If token has not expired, confirm account
    if (!student) {
        return next(new AppError('Token is invalid or account is already confirmed', 400));
    }

    student.confirmationToken = undefined;
    student.confirmed = true;
    await student.save({ validateBeforeSave: false });
    res.status(200).json({
        status: 'success',
        message: 'Account has been confirmed!',
    });
});

exports.deleteNonConfirmedAccount = catchAsync(async (req, res, next) => {
    // 1) Get student based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const student = await Student.findOne({
        confirmationToken: hashedToken,
    });

    // 2) If token has not expired, confirm account
    if (!student) {
        return next(new AppError('Token is invalid or account is already confirmed', 400));
    }

    await student.delete();
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
    const updatedStudent = await Student.findById(req.student._id);

    if (req.body.email) {
        if (!validator.isEmail(req.body.email)) return next(new AppError('Email is invalid'), 400);

        updatedStudent.email = req.body.email;
    }
    if (req.body.name) {
        updatedStudent.name = req.body.name;
    }
    await updatedStudent.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedStudent,
        },
    });
});
